import json
import logging
import urllib.request
import urllib.error
from app.core.config import settings

logger = logging.getLogger(__name__)

class OpenScoutService:
    @classmethod
    def _generate_ai_scout_notes(cls, athlete_name: str, sport: str, overall: int, potential: int, stats: dict) -> str:
        """Call Groq / Gemini for AI scout synthesis."""
        system_prompt = "You are a senior athletic scout. Write a concise 2-sentence scouting evaluation of this athlete highlighting ceiling, tactical awareness, and standout traits."
        user_prompt = f"Athlete: {athlete_name}, Sport: {sport}, Overall: {overall}, Potential: {potential}, Stats: {stats}"
        
        # Try Groq
        if settings.GROQ_API_KEY:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {"Content-Type": "application/json", "Authorization": f"Bearer {settings.GROQ_API_KEY}"}
                body = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 200
                }
                req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=5) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    return data["choices"][0]["message"]["content"]
            except Exception as e:
                logger.warning(f"Groq scout generation error: {e}")

        # Try Gemini
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
                headers = {"Content-Type": "application/json"}
                body = {
                    "system_instruction": {"parts": [{"text": system_prompt}]},
                    "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                    "generationConfig": {"temperature": 0.7, "maxOutputTokens": 200}
                }
                req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
                with urllib.request.urlopen(req, timeout=5) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    return data["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as e:
                logger.warning(f"Gemini scout generation error: {e}")

        return ""

    @classmethod
    def generate_scouting_report(cls, athlete_name: str, sport: str, stats: dict) -> dict:
        """
        AI engine calculating athlete market value, potential ceiling,
        recruitment probability, and auto-generated scouts comments.
        """
        pace = stats.get("pace", 75)
        shooting = stats.get("shooting", 72)
        passing = stats.get("passing", 74)
        dribbling = stats.get("dribbling", 76)
        defense = stats.get("defense", 65)
        physical = stats.get("physical", 70)
        age = stats.get("age", 18)
        
        overall = int((pace + shooting + passing + dribbling + defense + physical) / 6)
        age_bonus = max(0, 23 - age) * 1.8
        potential = min(99, int(overall + age_bonus + 3))
        
        base_val = (overall ** 3.2) * 50
        age_multiplier = max(0.5, 1.0 - (age - 18) * 0.08)
        market_val = int(base_val * age_multiplier)
        market_val = (market_val // 5000) * 5000
        if market_val < 10000:
            market_val = 15000
            
        recommendations = []
        if overall >= 80:
            recommendations = ["La Liga Youth Academy", "Premier League Development Program", "Stanford University Division 1"]
        elif overall >= 70:
            recommendations = ["MLS Next Pro Academy", "NCAA Division 2 Scholarship Elite", "European Tier 3 Trials"]
        else:
            recommendations = ["Regional High-Performance Academy", "Local Semipro Division Club"]
            
        # Try AI generation first
        ai_notes = cls._generate_ai_scout_notes(athlete_name, sport, overall, potential, stats)
        
        if ai_notes:
            scout_summary = ai_notes
        else:
            strengths = []
            weaknesses = []
            if pace > 80: strengths.append("explosive acceleration")
            if shooting > 80: strengths.append("clinical finishing")
            if dribbling > 80: strengths.append("exceptional technical flair")
            if physical > 80: strengths.append("dominant physical conditioning")
            if defense < 60: weaknesses.append("tactical positioning during transition")
            if physical < 60: weaknesses.append("strength in physical duels")
            if passing < 65: weaknesses.append("distribution accuracy under pressure")
            if not strengths: strengths.append("balanced athletic awareness")
            if not weaknesses: weaknesses.append("consistency over full match duration")
            scout_summary = (
                f"Athlete {athlete_name} presents a high-potential profile for {sport}. "
                f"Demonstrates {', and '.join(strengths)}. Focus area: {', and '.join(weaknesses)}. "
                f"Projected ceiling of {potential} OVR."
            )
            
        return {
            "athlete_name": athlete_name,
            "sport": sport,
            "overall_rating": overall,
            "potential_rating": potential,
            "market_value_eur": market_val,
            "valuation_label": "ATHLETEX internal estimate",
            "recruitment_index": f"{min(99, int(overall * 1.1))}%",
            "scout_summary": scout_summary,
            "recommended_targets": recommendations,
            "attribute_radar": {
                "Pace": pace,
                "Shooting": shooting,
                "Passing": passing,
                "Dribbling": dribbling,
                "Defense": defense,
                "Physical": physical
            }
        }
