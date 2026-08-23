import sys
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId

# Add root folder to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings
from app.core.security import get_password_hash
from app.core.database import db

def seed_db():
    print("Initializing MongoDB seeding...")
    
    try:
        # Wipe collections
        db.users.delete_many({})
        db.user_settings.delete_many({})
        db.athlete_profiles.delete_many({})
        db.mentor_profiles.delete_many({})
        db.athlete_sports.delete_many({})
        db.achievements.delete_many({})
        db.matches.delete_many({})
        db.match_participants.delete_many({})
        db.tournaments.delete_many({})
        db.tournament_participants.delete_many({})
        db.tournament_matches.delete_many({})
        db.teams.delete_many({})
        db.team_members.delete_many({})
        db.events.delete_many({})
        db.event_participants.delete_many({})
        db.posts.delete_many({})
        db.post_likes.delete_many({})
        db.comments.delete_many({})
        db.messages.delete_many({})
        db.notifications.delete_many({})
        db.connections.delete_many({})
        
        print("Existing MongoDB collections wiped.")
        
        hashed_password = get_password_hash("password123")
        
        # 1. Seed Users
        users = [
            {"email": "darshini@athletex.app", "hashed_password": hashed_password, "name": "Darshini Reddy", "role": "athlete", "created_at": datetime.utcnow(), "is_active": True},
            {"email": "arjun@athletex.app", "hashed_password": hashed_password, "name": "Arjun Reddy", "role": "athlete", "created_at": datetime.utcnow(), "is_active": True},
            {"email": "rahul@athletex.app", "hashed_password": hashed_password, "name": "Rahul Sharma", "role": "athlete", "created_at": datetime.utcnow(), "is_active": True},
            {"email": "sneha@athletex.app", "hashed_password": hashed_password, "name": "Sneha Patil", "role": "athlete", "created_at": datetime.utcnow(), "is_active": True},
            {"email": "vijay@athletex.app", "hashed_password": hashed_password, "name": "Vijay Rao", "role": "athlete", "created_at": datetime.utcnow(), "is_active": True},
            {"email": "kiran@athletex.app", "hashed_password": hashed_password, "name": "Kiran Kumar", "role": "athlete", "created_at": datetime.utcnow(), "is_active": True},
            {"email": "vikram@athletex.app", "hashed_password": hashed_password, "name": "Vikram Rao", "role": "mentor", "created_at": datetime.utcnow(), "is_active": True},
            {"email": "admin@athletex.app", "hashed_password": hashed_password, "name": "System Admin", "role": "admin", "created_at": datetime.utcnow(), "is_active": True}
        ]
        
        users_ids = {}
        for u in users:
            res = db.users.insert_one(u)
            users_ids[u["email"]] = str(res.inserted_id)
            
        arjun_id = users_ids["arjun@athletex.app"]
        darshini_id = users_ids["darshini@athletex.app"]
        rahul_id = users_ids["rahul@athletex.app"]
        sneha_id = users_ids["sneha@athletex.app"]
        vijay_id = users_ids["vijay@athletex.app"]
        kiran_id = users_ids["kiran@athletex.app"]
        vikram_id = users_ids["vikram@athletex.app"]
        admin_id = users_ids["admin@athletex.app"]
        
        print("Demo users seeded.")
        
        # 2. Seed User Settings
        for email, u_id in users_ids.items():
            db.user_settings.insert_one({
                "user_id": u_id,
                "profile_visibility": "Public",
                "show_location": True,
                "show_rating": True,
                "match_notifications": True,
                "event_notifications": True,
                "message_notifications": True,
                "ai_coach_updates": True,
                "reduced_motion": False
            })
            
        # 3. Seed Profiles
        # Athlete: Arjun
        ap_arjun = db.athlete_profiles.insert_one({
            "user_id": arjun_id, "sport": "Cricket", "age": 24, "height": 180.0, "weight": 75.0,
            "location": "Kukatpally, Hyderabad", "bio": "All-rounder cricketer and weekend footballer. Playing competitively for 8 years.",
            "skill_rating": 91, "pace": 88, "shooting": 79, "passing": 85, "dribbling": 80, "defense": 75, "physical": 82,
            "verified": True, "qr_code": "ATH-0001", "avatar_url": "", "shareable_url": f"/public/profile/{arjun_id}",
            "availability": {"Mon": True, "Tue": True, "Wed": True, "Thu": True, "Fri": True, "Sat": True, "Sun": True}
        })
        arjun_prof_id = str(ap_arjun.inserted_id)
        
        # Athlete: Darshini
        ap_darshini = db.athlete_profiles.insert_one({
            "user_id": darshini_id, "sport": "Cricket", "age": 23, "height": 172.0, "weight": 63.0,
            "location": "Kukatpally, Hyderabad", "bio": "Batting specialist and badminton enthusiast.",
            "skill_rating": 94, "pace": 92, "shooting": 85, "passing": 90, "dribbling": 92, "defense": 65, "physical": 78,
            "verified": True, "qr_code": "ATH-0002", "avatar_url": "", "shareable_url": f"/public/profile/{darshini_id}",
            "availability": {"Mon": True, "Tue": True, "Wed": True, "Thu": True, "Fri": True, "Sat": True, "Sun": True}
        })
        darshini_prof_id = str(ap_darshini.inserted_id)
        
        # Athlete: Rahul
        ap_rahul = db.athlete_profiles.insert_one({
            "user_id": rahul_id, "sport": "Cricket", "age": 25, "height": 178.0, "weight": 72.0,
            "location": "Madhapur, Hyderabad", "bio": "Fast bowler looking for weeknight nets practice.",
            "skill_rating": 91, "pace": 94, "shooting": 70, "passing": 80, "dribbling": 75, "defense": 88, "physical": 85,
            "verified": True, "qr_code": "ATH-0003", "avatar_url": "", "shareable_url": f"/public/profile/{rahul_id}",
            "availability": {"Mon": True, "Tue": True, "Wed": True, "Thu": True, "Fri": True, "Sat": True, "Sun": True}
        })
        rahul_prof_id = str(ap_rahul.inserted_id)
        
        # Athlete: Sneha
        ap_sneha = db.athlete_profiles.insert_one({
            "user_id": sneha_id, "sport": "Badminton", "age": 22, "height": 165.0, "weight": 54.0,
            "location": "Gachibowli, Hyderabad", "bio": "Doubles specialist. Badminton is life.",
            "skill_rating": 88, "pace": 86, "shooting": 80, "passing": 85, "dribbling": 88, "defense": 70, "physical": 72,
            "verified": True, "qr_code": "ATH-0004", "avatar_url": "", "shareable_url": f"/public/profile/{sneha_id}",
            "availability": {"Mon": True, "Tue": True, "Wed": True, "Thu": True, "Fri": True, "Sat": True, "Sun": True}
        })
        sneha_prof_id = str(ap_sneha.inserted_id)
        
        # Athlete: Vijay
        ap_vijay = db.athlete_profiles.insert_one({
            "user_id": vijay_id, "sport": "Football", "age": 21, "height": 175.0, "weight": 68.0,
            "location": "Gachibowli, Hyderabad", "bio": "Winger. Speed is my weapon.",
            "skill_rating": 87, "pace": 95, "shooting": 84, "passing": 78, "dribbling": 89, "defense": 45, "physical": 70,
            "verified": False, "qr_code": "ATH-0005", "avatar_url": "", "shareable_url": f"/public/profile/{vijay_id}",
            "availability": {"Mon": True, "Tue": True, "Wed": True, "Thu": True, "Fri": True, "Sat": True, "Sun": True}
        })
        vijay_prof_id = str(ap_vijay.inserted_id)
        
        # Athlete: Kiran
        ap_kiran = db.athlete_profiles.insert_one({
            "user_id": kiran_id, "sport": "Football", "age": 26, "height": 182.0, "weight": 80.0,
            "location": "Secunderabad, Hyderabad", "bio": "Goalkeeper. Rock solid defense.",
            "skill_rating": 85, "pace": 70, "shooting": 50, "passing": 75, "dribbling": 60, "defense": 90, "physical": 88,
            "verified": True, "qr_code": "ATH-0006", "avatar_url": "", "shareable_url": f"/public/profile/{kiran_id}",
            "availability": {"Mon": True, "Tue": True, "Wed": True, "Thu": True, "Fri": True, "Sat": True, "Sun": True}
        })
        kiran_prof_id = str(ap_kiran.inserted_id)
        
        # Mentor/Recruiter
        db.mentor_profiles.insert_one({
            "user_id": vikram_id, "specialty": "Cricket Coaching & Conditioning",
            "credentials": "BCCI Level 2 Coach, 15 yrs Exp", "company": "Hyderabad Cricket Academy",
            "location": "Gachibowli, Hyderabad", "bio": "Coached state level players. Focus on batting technique and biomechanics analysis.",
            "avatar_url": ""
        })
        
        print("Profiles seeded.")
        
        # 4. Seed Athlete Sports
        db.athlete_sports.insert_many([
            {"athlete_id": arjun_prof_id, "sport_name": "Cricket", "skill_level": "Advanced", "rating": 91, "is_primary": True, "stats": {"Matches": 142, "Wins": 87, "Runs": 3420, "Wickets": 64, "Batting Average": 38.5, "Strike Rate": 135.2}},
            {"athlete_id": arjun_prof_id, "sport_name": "Football", "skill_level": "Intermediate", "rating": 84, "is_primary": False, "stats": {"Matches": 64, "Goals": 38, "Assists": 27, "Pass Accuracy": "81%"}},
            {"athlete_id": arjun_prof_id, "sport_name": "Badminton", "skill_level": "Intermediate", "rating": 79, "is_primary": False, "stats": {"Matches": 38, "Wins": 26, "Win Rate": "68%"}},
            {"athlete_id": darshini_prof_id, "sport_name": "Cricket", "skill_level": "Advanced", "rating": 94, "is_primary": True, "stats": {"Matches": 96, "Wins": 72, "Runs": 4120, "Batting Average": 51.5}},
            {"athlete_id": darshini_prof_id, "sport_name": "Badminton", "skill_level": "Advanced", "rating": 90, "is_primary": False, "stats": {"Matches": 93, "Wins": 80, "Win Rate": "86%"}},
            {"athlete_id": rahul_prof_id, "sport_name": "Cricket", "skill_level": "Advanced", "rating": 91, "is_primary": True, "stats": {"Matches": 92, "Wins": 58, "Wickets": 140, "Bowling Average": 18.4}},
            {"athlete_id": sneha_prof_id, "sport_name": "Badminton", "skill_level": "Advanced", "rating": 88, "is_primary": True, "stats": {"Matches": 90, "Wins": 75, "Win Rate": "83%"}},
            {"athlete_id": vijay_prof_id, "sport_name": "Football", "skill_level": "Intermediate", "rating": 87, "is_primary": True, "stats": {"Matches": 84, "Goals": 42, "Assists": 35}},
            {"athlete_id": kiran_prof_id, "sport_name": "Football", "skill_level": "Intermediate", "rating": 85, "is_primary": True, "stats": {"Matches": 81, "Clean Sheets": 34}}
        ])
        
        print("Athlete sports seeded.")
        
        # 5. Seed Achievements
        db.achievements.insert_many([
            {"athlete_id": arjun_id, "title": "Tournament Winner", "organization": "Kukatpalli Open 2025", "sport": "Cricket", "achievement_type": "Trophy", "date_earned": datetime.utcnow() - timedelta(days=10), "certificate_url": ""},
            {"athlete_id": arjun_id, "title": "10 Match Win Streak", "organization": "AthleTEX Local Board", "sport": "Cricket", "achievement_type": "Medal", "date_earned": datetime.utcnow() - timedelta(days=5), "certificate_url": ""},
            {"athlete_id": arjun_id, "title": "Century vs Madhapur Falcons", "organization": "Hyderabad Club Cricket", "sport": "Cricket", "achievement_type": "Award", "date_earned": datetime.utcnow() - timedelta(days=1), "certificate_url": ""}
        ])
        
        # 6. Seed Matches
        m1 = {
            "title": "Sunday Turf Cricket Match", "sport": "Cricket", "organizer_id": arjun_id,
            "location": "Kukatpally, Hyderabad", "venue": "Kukatpally Turf Ground",
            "date": "2026-08-30", "start_time": "17:00", "end_time": "19:00",
            "skill_level": "Intermediate", "max_players": 11, "status": "Open",
            "description": "Friendly Sunday turf cricket match. Looking for good all-rounders.",
            "score": "", "winner_id": None, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
        }
        m2 = {
            "title": "Weeknight 5-a-side Football", "sport": "Football", "organizer_id": vijay_id,
            "location": "Gachibowli, Hyderabad", "venue": "Gachibowli Stadium Turf",
            "date": "2026-08-26", "start_time": "19:30", "end_time": "20:30",
            "skill_level": "Intermediate", "max_players": 10, "status": "Open",
            "description": "Fast paced 5v5 weeknight football session. Bring your boots.",
            "score": "", "winner_id": None, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
        }
        m3 = {
            "title": "Doubles Badminton Night", "sport": "Badminton", "organizer_id": sneha_id,
            "location": "Madhapur, Hyderabad", "venue": "Madhapur Indoor Club",
            "date": "2026-08-28", "start_time": "20:00", "end_time": "21:30",
            "skill_level": "Advanced", "max_players": 4, "status": "Open",
            "description": "Competitive doubles matches. Feathers shuttle will be provided.",
            "score": "", "winner_id": None, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
        }
        
        m1_id = str(db.matches.insert_one(m1).inserted_id)
        m2_id = str(db.matches.insert_one(m2).inserted_id)
        m3_id = str(db.matches.insert_one(m3).inserted_id)
        
        # Seed match participants
        db.match_participants.insert_many([
            {"match_id": m1_id, "user_id": arjun_id, "joined_at": datetime.utcnow(), "status": "accepted"},
            {"match_id": m1_id, "user_id": darshini_id, "joined_at": datetime.utcnow(), "status": "accepted"},
            {"match_id": m1_id, "user_id": rahul_id, "joined_at": datetime.utcnow(), "status": "accepted"},
            {"match_id": m2_id, "user_id": vijay_id, "joined_at": datetime.utcnow(), "status": "accepted"},
            {"match_id": m2_id, "user_id": arjun_id, "joined_at": datetime.utcnow(), "status": "accepted"},
            {"match_id": m3_id, "user_id": sneha_id, "joined_at": datetime.utcnow(), "status": "accepted"}
        ])
        
        print("Matches seeded.")
        
        # 7. Seed Teams
        t1 = {
            "name": "Hyderabad Strikers", "sport": "Cricket", "description": "Elite cricket team based in Hyderabad.",
            "location": "Kukatpally, Hyderabad", "captain_id": arjun_id, "logo": "", "created_at": datetime.utcnow()
        }
        t2 = {
            "name": "Madhapur Falcons FC", "sport": "Football", "description": "Competitive football club based in Madhapur.",
            "location": "Madhapur, Hyderabad", "captain_id": vijay_id, "logo": "", "created_at": datetime.utcnow()
        }
        
        t1_id = str(db.teams.insert_one(t1).inserted_id)
        t2_id = str(db.teams.insert_one(t2).inserted_id)
        
        db.team_members.insert_many([
            {"team_id": t1_id, "user_id": arjun_id, "role": "Captain", "status": "Approved", "joined_at": datetime.utcnow()},
            {"team_id": t1_id, "user_id": darshini_id, "role": "Vice Captain", "status": "Approved", "joined_at": datetime.utcnow()},
            {"team_id": t1_id, "user_id": rahul_id, "role": "Player", "status": "Approved", "joined_at": datetime.utcnow()},
            {"team_id": t2_id, "user_id": vijay_id, "role": "Captain", "status": "Approved", "joined_at": datetime.utcnow()},
            {"team_id": t2_id, "user_id": kiran_id, "role": "Player", "status": "Approved", "joined_at": datetime.utcnow()}
        ])
        
        print("Teams seeded.")
        
        # 8. Seed Tournaments
        tour1 = {
            "name": "Hyderabad Premier Cricket League", "sport": "Cricket", "description": "A premium 8-team cricket tournament in Hyderabad Gachibowli Stadium.",
            "organizer_id": admin_id, "location": "Gachibowli, Hyderabad", "venue": "Gachibowli Stadium",
            "registration_start": datetime.utcnow() - timedelta(days=10),
            "registration_end": datetime.utcnow() + timedelta(days=5),
            "tournament_start": datetime.utcnow() + timedelta(days=10),
            "tournament_end": datetime.utcnow() + timedelta(days=15),
            "max_participants": 8, "entry_fee": 1000.0, "prize_pool": "₹1,00,000 + Trophy",
            "format": "Single elimination", "status": "Registration Open", "image": "", "created_at": datetime.utcnow()
        }
        tour2 = {
            "name": "Kukatpally Open 2026", "sport": "Badminton", "description": "Singles and Doubles Badminton Tournament at Kukatpalli Indoor Arena.",
            "organizer_id": vikram_id, "location": "Kukatpally, Hyderabad", "venue": "Kukatpalli Indoor Arena",
            "registration_start": datetime.utcnow() - timedelta(days=5),
            "registration_end": datetime.utcnow() + timedelta(days=2),
            "tournament_start": datetime.utcnow() + timedelta(days=5),
            "tournament_end": datetime.utcnow() + timedelta(days=7),
            "max_participants": 4, "entry_fee": 250.0, "prize_pool": "₹25,000",
            "format": "Single elimination", "status": "Registration Open", "image": "", "created_at": datetime.utcnow()
        }
        
        tour1_id = str(db.tournaments.insert_one(tour1).inserted_id)
        tour2_id = str(db.tournaments.insert_one(tour2).inserted_id)
        
        db.tournament_participants.insert_many([
            {"tournament_id": tour2_id, "user_id": arjun_id, "status": "Approved", "registered_at": datetime.utcnow()},
            {"tournament_id": tour2_id, "user_id": darshini_id, "status": "Approved", "registered_at": datetime.utcnow()},
            {"tournament_id": tour2_id, "user_id": rahul_id, "status": "Approved", "registered_at": datetime.utcnow()},
            {"tournament_id": tour2_id, "user_id": sneha_id, "status": "Approved", "registered_at": datetime.utcnow()}
        ])
        
        print("Tournaments seeded.")
        
        # 9. Seed Events
        e1 = {
            "name": "Hyderabad Sports Meetup", "sport": "All Sports", "description": "General community sports gathering to network and play casual games.",
            "date": "2026-09-05", "venue": "Madhapur Sports Complex", "location": "Madhapur, Hyderabad",
            "max_participants": 100, "prize": "Free Entry", "created_at": datetime.utcnow()
        }
        e1_id = str(db.events.insert_one(e1).inserted_id)
        
        db.event_participants.insert_many([
            {"event_id": e1_id, "user_id": arjun_id, "registered_at": datetime.utcnow()},
            {"event_id": e1_id, "user_id": darshini_id, "registered_at": datetime.utcnow()}
        ])
        
        print("Events seeded.")
        
        # 10. Seed Community Feed
        db.posts.insert_many([
            {
                "author_id": arjun_id, "title": "Hit my first century of the season!",
                "content": "Played an amazing game yesterday at Madhapur Turf. Scored 104 off 62 balls. Special thanks to Darshini for the support from the other end!",
                "category": "Achievement", "likes": 18, "created_at": datetime.utcnow() - timedelta(hours=5), "image_url": ""
            },
            {
                "author_id": vikram_id, "title": "Tips for improving fast cuts and agility",
                "content": "Agility shuttle cuts are all about keeping your center of gravity low. Focus on deceleration control in the final stride before cut direction. Check out the L-Run drills in AI Coach for a structured routine.",
                "category": "Training", "likes": 12, "created_at": datetime.utcnow() - timedelta(days=1), "image_url": ""
            }
        ])
        
        print("Community feed seeded.")
        
        # 11. Seed Messages
        db.messages.insert_many([
            {"sender_id": rahul_id, "receiver_id": arjun_id, "content": "Hey Arjun, are you joining Sunday's match?", "is_read": True, "timestamp": datetime.utcnow() - timedelta(hours=3)},
            {"sender_id": arjun_id, "receiver_id": rahul_id, "content": "Yes! I'll be there.", "is_read": True, "timestamp": datetime.utcnow() - timedelta(hours=2.8)},
            {"sender_id": rahul_id, "receiver_id": arjun_id, "content": "Great, see you at the turf at 5.", "is_read": False, "timestamp": datetime.utcnow() - timedelta(hours=2.5)},
            {"sender_id": sneha_id, "receiver_id": arjun_id, "content": "Are you free for doubles this Friday?", "is_read": False, "timestamp": datetime.utcnow() - timedelta(days=1)}
        ])
        
        print("Messages seeded.")
        
        # 12. Seed Notifications
        db.notifications.insert_many([
            {"user_id": arjun_id, "icon": "🔔", "text": "Rahul Sharma accepted your match invitation.", "is_read": False, "created_at": datetime.utcnow() - timedelta(minutes=2)},
            {"user_id": arjun_id, "icon": "🏆", "text": "You moved to #2 in the Kukatpalli cricket leaderboard.", "is_read": False, "created_at": datetime.utcnow() - timedelta(hours=1)},
            {"user_id": arjun_id, "icon": "🤖", "text": "AI Coach updated your training plan.", "is_read": True, "created_at": datetime.utcnow() - timedelta(hours=3)},
            {"user_id": arjun_id, "icon": "✓", "text": "Your athlete profile has been verified.", "is_read": True, "created_at": datetime.utcnow() - timedelta(days=1)}
        ])
        
        print("Notifications seeded.")
        
        # 13. Seed Connections
        db.connections.insert_many([
            {"sender_id": rahul_id, "receiver_id": arjun_id, "status": "Accepted", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
            {"sender_id": sneha_id, "receiver_id": arjun_id, "status": "Accepted", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
            {"sender_id": darshini_id, "receiver_id": arjun_id, "status": "Accepted", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()},
            {"sender_id": vijay_id, "receiver_id": arjun_id, "status": "Requested", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()}
        ])
        
        print("Connections seeded.")
        print("MongoDB seeding completed successfully.")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        raise e
        
if __name__ == "__main__":
    seed_db()
