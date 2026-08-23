import os
import re
import json
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId
from fastapi import HTTPException
from app.core.config import settings

def parse_dates(doc):
    if isinstance(doc, dict):
        for k, v in doc.items():
            if isinstance(v, str):
                if k in ["created_at", "updated_at", "registered_at", "joined_at", "date_earned", "timestamp", "registration_start", "registration_end", "tournament_start", "tournament_end"]:
                    try:
                        doc[k] = datetime.fromisoformat(v.replace("Z", "+00:00"))
                    except Exception:
                        pass
            else:
                parse_dates(v)
    elif isinstance(doc, list):
        for item in doc:
            parse_dates(item)
    return doc

def match_filter(doc, filter_dict) -> bool:
    if not filter_dict:
        return True
    for k, v in filter_dict.items():
        if k == "$or":
            if not any(match_filter(doc, sub) for sub in v):
                return False
        elif k == "$and":
            if not all(match_filter(doc, sub) for sub in v):
                return False
        else:
            doc_val = doc.get(k)
            if isinstance(v, dict):
                for op, op_val in v.items():
                    if op == "$regex":
                        options = v.get("$options", "")
                        flags = re.IGNORECASE if "i" in options else 0
                        if doc_val is None or not re.search(str(op_val), str(doc_val), flags):
                            return False
                    elif op == "$options":
                        continue
                    elif op == "$ne":
                        if str(doc_val) == str(op_val):
                            return False
                    elif op == "$gte":
                        if doc_val is None or doc_val < op_val:
                            return False
                    elif op == "$lte":
                        if doc_val is None or doc_val > op_val:
                            return False
                    elif op == "$in":
                        if doc_val not in op_val:
                            return False
            else:
                if str(doc_val) != str(v):
                    return False
    return True

class FileCursor:
    def __init__(self, docs):
        self.docs = docs

    def __iter__(self):
        return iter(self.docs)

    def limit(self, count: int):
        self.docs = self.docs[:count]
        return self

    def sort(self, key_or_list, direction=None):
        if isinstance(key_or_list, list):
            def sort_key(d):
                keys = []
                for k, r in key_or_list:
                    val = d.get(k)
                    if val is None:
                        val = ""
                    keys.append(val)
                return tuple(keys)
            self.docs.sort(key=sort_key, reverse=False)
        else:
            reverse = (direction == -1) if direction is not None else False
            self.docs.sort(key=lambda d: d.get(key_or_list) if d.get(key_or_list) is not None else "", reverse=reverse)
        return self

class FileCollection:
    def __init__(self, db_file, name):
        self.db_file = db_file
        self.name = name

    def _load_data(self):
        if not os.path.exists(self.db_file):
            return []
        try:
            with open(self.db_file, "r") as f:
                data = json.load(f)
                docs = data.get(self.name, [])
                for d in docs:
                    if "_id" in d:
                        d["_id"] = ObjectId(d["_id"])
                    parse_dates(d)
                return docs
        except Exception:
            return []

    def _save_data(self, docs):
        all_data = {}
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, "r") as f:
                    all_data = json.load(f)
            except Exception:
                pass
        
        serialized_docs = []
        for d in docs:
            d_copy = dict(d)
            if "_id" in d_copy:
                d_copy["_id"] = str(d_copy["_id"])
            for k, v in list(d_copy.items()):
                if isinstance(v, datetime):
                    d_copy[k] = v.isoformat()
                elif isinstance(v, ObjectId):
                    d_copy[k] = str(v)
            serialized_docs.append(d_copy)
            
        all_data[self.name] = serialized_docs
        os.makedirs(os.path.dirname(self.db_file), exist_ok=True)
        with open(self.db_file, "w") as f:
            json.dump(all_data, f, default=str)

    def find_one(self, filter_dict=None, projection=None):
        docs = self._load_data()
        for d in docs:
            if match_filter(d, filter_dict):
                return d
        return None

    def find(self, filter_dict=None, projection=None):
        docs = self._load_data()
        matched = [d for d in docs if match_filter(d, filter_dict)]
        return FileCursor(matched)

    def insert_one(self, doc):
        docs = self._load_data()
        doc = dict(doc)
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        if self.name == "users" and doc.get("email"):
            for d in docs:
                if d.get("email") == doc["email"]:
                    raise Exception("Duplicate key error: email already exists")
        docs.append(doc)
        self._save_data(docs)
        class InsertOneResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertOneResult(doc["_id"])

    def insert_many(self, documents):
        docs = self._load_data()
        inserted_ids = []
        for doc in documents:
            doc = dict(doc)
            if "_id" not in doc:
                doc["_id"] = ObjectId()
            docs.append(doc)
            inserted_ids.append(doc["_id"])
        self._save_data(docs)
        class InsertManyResult:
            def __init__(self, inserted_ids):
                self.inserted_ids = inserted_ids
        return InsertManyResult(inserted_ids)

    def update_one(self, filter_dict, update_dict):
        docs = self._load_data()
        updated_count = 0
        for d in docs:
            if match_filter(d, filter_dict):
                set_fields = update_dict.get("$set", {})
                for k, v in set_fields.items():
                    d[k] = v
                updated_count = 1
                break
        if updated_count > 0:
            self._save_data(docs)
        class UpdateResult:
            def __init__(self, matched_count, modified_count):
                self.matched_count = matched_count
                self.modified_count = modified_count
        return UpdateResult(updated_count, updated_count)

    def update_many(self, filter_dict, update_dict):
        docs = self._load_data()
        updated_count = 0
        for d in docs:
            if match_filter(d, filter_dict):
                set_fields = update_dict.get("$set", {})
                for k, v in set_fields.items():
                    d[k] = v
                updated_count += 1
        if updated_count > 0:
            self._save_data(docs)
        class UpdateResult:
            def __init__(self, matched_count, modified_count):
                self.matched_count = matched_count
                self.modified_count = modified_count
        return UpdateResult(updated_count, updated_count)

    def delete_one(self, filter_dict):
        docs = self._load_data()
        deleted_count = 0
        for idx, d in enumerate(docs):
            if match_filter(d, filter_dict):
                docs.pop(idx)
                deleted_count = 1
                break
        if deleted_count > 0:
            self._save_data(docs)
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count
        return DeleteResult(deleted_count)

    def delete_many(self, filter_dict):
        docs = self._load_data()
        initial_len = len(docs)
        docs = [d for d in docs if not match_filter(d, filter_dict)]
        deleted_count = initial_len - len(docs)
        if deleted_count > 0:
            self._save_data(docs)
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count
        return DeleteResult(deleted_count)

    def count_documents(self, filter_dict):
        docs = self._load_data()
        return sum(1 for d in docs if match_filter(d, filter_dict))

    def create_index(self, keys, unique=False):
        return None

class FileMongoClient:
    def __init__(self, db_file):
        self.db_file = db_file
    
    def __getitem__(self, name):
        class FileDatabase:
            def __init__(self, db_file):
                self.db_file = db_file
                self.collections = {}

            def __getattr__(self, col_name):
                if col_name not in self.collections:
                    self.collections[col_name] = FileCollection(self.db_file, col_name)
                return self.collections[col_name]
                
            def __getitem__(self, col_name):
                return getattr(self, col_name)
        return FileDatabase(self.db_file)

# Attempt connection to real MongoDB first
try:
    print("Testing connection to MongoDB...")
    real_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
    real_client.admin.command('ping')
    print("Connected to MongoDB successfully.")
    client = real_client
    db = client[settings.MONGODB_DB]
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print(f"MongoDB not available ({e}). Falling back to local persistent JSON DB...")
    db_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "athletex_db.json"))
    client = FileMongoClient(db_file_path)
    db = client[settings.MONGODB_DB]

def get_db():
    """
    Yields the database instance.
    """
    try:
        yield db
    finally:
        pass

def to_object_id(id_val) -> ObjectId:
    if not id_val:
        raise HTTPException(status_code=400, detail="Missing ID value")
    if isinstance(id_val, ObjectId):
        return id_val
    try:
        return ObjectId(str(id_val))
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid ObjectId format: {id_val}")

def serialize_doc(doc):
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    for k, v in list(doc.items()):
        if isinstance(v, ObjectId):
            doc[k] = str(v)
        elif isinstance(v, dict):
            doc[k] = serialize_doc(v)
        elif isinstance(v, list):
            doc[k] = [serialize_doc(item) if isinstance(item, (dict, ObjectId)) else (str(item) if isinstance(item, ObjectId) else item) for item in v]
    return doc

def serialize_docs(docs):
    if not docs:
        return []
    return [serialize_doc(d) for d in docs]
