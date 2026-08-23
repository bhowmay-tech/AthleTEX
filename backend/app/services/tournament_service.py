from pymongo import MongoClient
from datetime import datetime
import math
from bson import ObjectId
from app.core.database import to_object_id, serialize_doc, serialize_docs

class TournamentService:
    @staticmethod
    def generate_bracket(db, tournament_id: str):
        """
        Generate a single-elimination tournament bracket for approved participants.
        Creates TournamentMatch nodes in MongoDB and links them hierarchically.
        """
        t_oid = to_object_id(tournament_id)
        tournament = db.tournaments.find_one({"_id": t_oid})
        if not tournament:
            return None
            
        # Get all approved participants
        participants = list(db.tournament_participants.find({
            "tournament_id": str(tournament_id),
            "status": "Approved"
        }))
        
        P = len(participants)
        if P < 2:
            raise ValueError("At least 2 approved participants are required to generate a bracket.")
            
        # Determine bracket size (nearest power of 2 >= P)
        k = math.ceil(math.log2(P))
        M = 2 ** k  # Bracket size (e.g. 2, 4, 8, 16)
        
        # Delete existing matches for this tournament
        db.tournament_matches.delete_many({"tournament_id": str(tournament_id)})
        
        # Create all matches round-by-round and store their generated string IDs
        rounds_matches = {}
        for r in range(1, k + 1):
            num_matches_in_round = 2 ** (k - r)
            rounds_matches[r] = []
            for i in range(num_matches_in_round):
                match_doc = {
                    "tournament_id": str(tournament_id),
                    "round": r,
                    "match_index": i,
                    "status": "Scheduled",
                    "player1_id": None,
                    "player2_id": None,
                    "player1_team_id": None,
                    "player2_team_id": None,
                    "score1": None,
                    "score2": None,
                    "winner_id": None,
                    "winner_team_id": None,
                    "next_match_id": None,
                    "next_match_slot": None
                }
                res = db.tournament_matches.insert_one(match_doc)
                match_doc["id"] = str(res.inserted_id)
                rounds_matches[r].append(match_doc)
                
        # Link matches to their next match
        for r in range(1, k):
            for i in range(len(rounds_matches[r])):
                current_match = rounds_matches[r][i]
                # Next round match index is current index // 2
                next_match = rounds_matches[r + 1][i // 2]
                
                db.tournament_matches.update_one(
                    {"_id": ObjectId(current_match["id"])},
                    {
                        "$set": {
                            "next_match_id": next_match["id"],
                            "next_match_slot": 1 if i % 2 == 0 else 2
                        }
                    }
                )
                # Update local representation for subsequent logic
                current_match["next_match_id"] = next_match["id"]
                current_match["next_match_slot"] = 1 if i % 2 == 0 else 2
                
        # Populate Round 1 matches with participants
        round1_matches = rounds_matches[1]
        for idx, participant in enumerate(participants):
            match_idx = idx // 2
            slot = 1 if idx % 2 == 0 else 2
            match = round1_matches[match_idx]
            
            p_user_id = participant.get("user_id")
            p_team_id = participant.get("team_id")
            
            update_fields = {}
            if slot == 1:
                update_fields["player1_id"] = p_user_id
                update_fields["player1_team_id"] = p_team_id
                match["player1_id"] = p_user_id
                match["player1_team_id"] = p_team_id
            else:
                update_fields["player2_id"] = p_user_id
                update_fields["player2_team_id"] = p_team_id
                match["player2_id"] = p_user_id
                match["player2_team_id"] = p_team_id
                
            db.tournament_matches.update_one(
                {"_id": ObjectId(match["id"])},
                {"$set": update_fields}
            )
            
        # Handle BYE matches in Round 1
        for match in round1_matches:
            has_p1 = match.get("player1_id") is not None or match.get("player1_team_id") is not None
            has_p2 = match.get("player2_id") is not None or match.get("player2_team_id") is not None
            
            if has_p1 and not has_p2:
                # Bye for player 1
                winner_id = match.get("player1_id")
                winner_team_id = match.get("player1_team_id")
                
                db.tournament_matches.update_one(
                    {"_id": ObjectId(match["id"])},
                    {
                        "$set": {
                            "winner_id": winner_id,
                            "winner_team_id": winner_team_id,
                            "status": "Completed",
                            "score1": 1,
                            "score2": 0
                        }
                    }
                )
                match["winner_id"] = winner_id
                match["winner_team_id"] = winner_team_id
                match["status"] = "Completed"
                match["score1"] = 1
                match["score2"] = 0
                TournamentService._advance_winner_in_db(db, match["id"])
                
        # Set tournament status to Live
        db.tournaments.update_one(
            {"_id": t_oid},
            {"$set": {"status": "Live"}}
        )
        
        # Reload final matches list to return
        all_matches = list(db.tournament_matches.find({"tournament_id": str(tournament_id)}))
        # Format as list of rounds dict
        rounds_matches_res = {}
        for m in all_matches:
            m_ser = serialize_doc(m)
            r = m_ser["round"]
            if r not in rounds_matches_res:
                rounds_matches_res[r] = []
            rounds_matches_res[r].append(m_ser)
            
        return rounds_matches_res
        
    @staticmethod
    def _advance_winner_in_db(db, match_id: str):
        """
        Advance the winner of a match to the next match's appropriate slot.
        """
        match = db.tournament_matches.find_one({"_id": ObjectId(match_id)})
        if not match:
            return
            
        next_match_id = match.get("next_match_id")
        if not next_match_id:
            # Finals complete! Set tournament status to Completed
            tournament_id = match.get("tournament_id")
            db.tournaments.update_one(
                {"_id": ObjectId(tournament_id)},
                {"$set": {"status": "Completed"}}
            )
            
            tournament = db.tournaments.find_one({"_id": ObjectId(tournament_id)})
            winner_id = match.get("winner_id")
            if winner_id and tournament:
                # Send notification to winner
                db.notifications.insert_one({
                    "user_id": str(winner_id),
                    "icon": "🏆",
                    "text": f"Congratulations! You won the tournament '{tournament['name']}'!",
                    "is_read": False,
                    "created_at": datetime.utcnow()
                })
            return
            
        next_match = db.tournament_matches.find_one({"_id": ObjectId(next_match_id)})
        if not next_match:
            return
            
        slot = match.get("next_match_slot")
        winner_id = match.get("winner_id")
        winner_team_id = match.get("winner_team_id")
        
        update_fields = {}
        if slot == 1:
            update_fields["player1_id"] = winner_id
            update_fields["player1_team_id"] = winner_team_id
        else:
            update_fields["player2_id"] = winner_id
            update_fields["player2_team_id"] = winner_team_id
            
        db.tournament_matches.update_one(
            {"_id": ObjectId(next_match_id)},
            {"$set": update_fields}
        )
        
    @staticmethod
    def submit_match_score(db, match_id: str, score1: int, score2: int):
        """
        Record score for a tournament match, determine winner, and advance them.
        """
        m_oid = ObjectId(match_id)
        match = db.tournament_matches.find_one({"_id": m_oid})
        if not match:
            raise ValueError("Match not found")
            
        if match.get("status") == "Completed":
            raise ValueError("Match is already completed")
            
        p1_id = match.get("player1_id") or match.get("player1_team_id")
        p2_id = match.get("player2_id") or match.get("player2_team_id")
        
        if not p1_id:
            raise ValueError("Cannot submit score: Player 1 slot is empty")
        if not p2_id:
            raise ValueError("Cannot submit score: Player 2 slot is empty")
            
        # Determine winner
        winner_id = None
        winner_team_id = None
        
        if score1 > score2:
            winner_id = match.get("player1_id")
            winner_team_id = match.get("player1_team_id")
        elif score2 > score1:
            winner_id = match.get("player2_id")
            winner_team_id = match.get("player2_team_id")
        else:
            # Force player 1 winner on tie
            winner_id = match.get("player1_id")
            winner_team_id = match.get("player1_team_id")
            
        db.tournament_matches.update_one(
            {"_id": m_oid},
            {
                "$set": {
                    "score1": score1,
                    "score2": score2,
                    "winner_id": winner_id,
                    "winner_team_id": winner_team_id,
                    "status": "Completed"
                }
            }
        )
        
        # Advance winner
        TournamentService._advance_winner_in_db(db, match_id)
        
        # Get updated match
        updated = db.tournament_matches.find_one({"_id": m_oid})
        return serialize_doc(updated)
