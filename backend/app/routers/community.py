from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.core.database import get_db, to_object_id, serialize_doc, serialize_docs
from app.routers.auth import get_current_user
from app.models.models import User, CommunityPost
from app.schemas.schemas import CommunityPostCreate, CommunityPostResponse

router = APIRouter(prefix="/community", tags=["Community Posts & Social Feed"])

@router.get("/", response_model=List[CommunityPostResponse])
def get_community_feed(
    category: Optional[str] = None,
    db = Depends(get_db)
):
    query = {}
    if category and category != "All" and category != "General":
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
        
    posts = list(db.posts.find(query).sort("created_at", -1))
    return serialize_docs(posts)

@router.post("/create", response_model=CommunityPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_in: CommunityPostCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    post_doc = {
        "author_id": current_user.id,
        "title": post_in.title,
        "content": post_in.content,
        "image_url": post_in.image_url or "",
        "category": post_in.category or "General",
        "likes": 0,
        "created_at": datetime.utcnow()
    }
    res = db.posts.insert_one(post_doc)
    post_doc["_id"] = res.inserted_id
    return serialize_doc(post_doc)

@router.put("/{post_id}", response_model=CommunityPostResponse)
def edit_post(
    post_id: str,
    post_in: CommunityPostCreate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    p_oid = to_object_id(post_id)
    post = db.posts.find_one({"_id": p_oid})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.get("author_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to edit this post")
        
    db.posts.update_one(
        {"_id": p_oid},
        {
            "$set": {
                "title": post_in.title,
                "content": post_in.content,
                "image_url": post_in.image_url or post.get("image_url"),
                "category": post_in.category or post.get("category")
            }
        }
    )
    
    updated = db.posts.find_one({"_id": p_oid})
    return serialize_doc(updated)

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    p_oid = to_object_id(post_id)
    post = db.posts.find_one({"_id": p_oid})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if post.get("author_id") != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You do not have permission to delete this post")
        
    db.posts.delete_one({"_id": p_oid})
    # Clean up associated likes and comments
    db.post_likes.delete_many({"post_id": str(post_id)})
    db.comments.delete_many({"post_id": str(post_id)})
    return None

@router.post("/{post_id}/like", response_model=dict)
def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    p_oid = to_object_id(post_id)
    post = db.posts.find_one({"_id": p_oid})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    # Check if already liked
    existing_like = db.post_likes.find_one({
        "post_id": str(post_id),
        "user_id": current_user.id
    })
    
    likes_count = post.get("likes", 0)
    if not existing_like:
        db.post_likes.insert_one({
            "post_id": str(post_id),
            "user_id": current_user.id,
            "created_at": datetime.utcnow()
        })
        likes_count += 1
        db.posts.update_one({"_id": p_oid}, {"$set": {"likes": likes_count}})
        
    return {"status": "success", "likes": likes_count}

@router.post("/{post_id}/unlike", response_model=dict)
def unlike_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    p_oid = to_object_id(post_id)
    post = db.posts.find_one({"_id": p_oid})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    existing_like = db.post_likes.find_one({
        "post_id": str(post_id),
        "user_id": current_user.id
    })
    
    likes_count = post.get("likes", 0)
    if existing_like:
        db.post_likes.delete_one({"_id": existing_like["_id"]})
        likes_count = max(0, likes_count - 1)
        db.posts.update_one({"_id": p_oid}, {"$set": {"likes": likes_count}})
        
    return {"status": "success", "likes": likes_count}

@router.post("/{post_id}/comment", response_model=dict)
def add_comment(
    post_id: str,
    content: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    p_oid = to_object_id(post_id)
    post = db.posts.find_one({"_id": p_oid})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    db.comments.insert_one({
        "post_id": str(post_id),
        "user_id": current_user.id,
        "content": content,
        "created_at": datetime.utcnow()
    })
    return {"status": "success", "comment": content, "user": current_user.name}
