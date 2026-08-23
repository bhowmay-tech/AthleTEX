from app.models.models import AthleteProfile
from typing import Dict, Any

class AIMatchService:
    @staticmethod
    def calculate_compatibility(profile1: AthleteProfile, profile2: AthleteProfile) -> Dict[str, Any]:
        """
        Calculate a deterministic compatibility score between two athletes.
        Returns the overall compatibility percentage and a breakdown.
        """
        # 1. Sport alignment (30% weight)
        sport_score = 0.0
        if profile1.sport.lower() == profile2.sport.lower():
            sport_score = 100.0
            
        # 2. Location proximity (20% weight)
        loc1 = profile1.location.lower()
        loc2 = profile2.location.lower()
        if loc1 == loc2:
            location_score = 100.0
        elif ("hyderabad" in loc1 and "hyderabad" in loc2) or \
             (any(x in loc1 for x in ["kukatpally", "madhapur", "gachibowli", "secunderabad", "miyapur", "ameerpet"]) and \
              any(x in loc2 for x in ["kukatpally", "madhapur", "gachibowli", "secunderabad", "miyapur", "ameerpet"])):
            # Same metro area
            location_score = 90.0
        else:
            location_score = 30.0
            
        # 3. Skill alignment (20% weight)
        # Compare physical ratings differences
        r1 = profile1.skill_rating
        r2 = profile2.skill_rating
        diff = abs(r1 - r2)
        if diff <= 5:
            skill_score = 100.0
        elif diff <= 10:
            skill_score = 90.0
        elif diff <= 20:
            skill_score = 70.0
        elif diff <= 30:
            skill_score = 50.0
        else:
            skill_score = 25.0
            
        # 4. Availability overlap (15% weight)
        avail1 = profile1.availability or {}
        avail2 = profile2.availability or {}
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        overlap_count = 0
        total_active_days = 0
        for d in days:
            val1 = avail1.get(d, False)
            val2 = avail2.get(d, False)
            if val1 or val2:
                total_active_days += 1
                if val1 and val2:
                    overlap_count += 1
        
        if total_active_days > 0:
            avail_score = (overlap_count / total_active_days) * 100.0
        else:
            avail_score = 100.0 # both default to fully available if empty
            
        # 5. Rating compatibility (15% weight)
        # Based on detailed attributes overlap
        attr_diffs = [
            abs(profile1.pace - profile2.pace),
            abs(profile1.shooting - profile2.shooting),
            abs(profile1.passing - profile2.passing),
            abs(profile1.dribbling - profile2.dribbling),
            abs(profile1.defense - profile2.defense),
            abs(profile1.physical - profile2.physical)
        ]
        avg_attr_diff = sum(attr_diffs) / len(attr_diffs)
        rating_score = max(0.0, 100.0 - (avg_attr_diff * 2.0))
        
        # Calculate weighted compatibility
        overall_score = (
            (sport_score * 0.30) +
            (location_score * 0.20) +
            (skill_score * 0.20) +
            (avail_score * 0.15) +
            (rating_score * 0.15)
        )
        
        return {
            "overall": round(overall_score, 1),
            "breakdown": {
                "sport": round(sport_score, 0),
                "location": round(location_score, 0),
                "skill": round(skill_score, 0),
                "availability": round(avail_score, 0),
                "rating": round(rating_score, 0)
            }
        }
