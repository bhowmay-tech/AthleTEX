import json
import logging
import urllib.request
import urllib.error
from app.core.config import settings

logger = logging.getLogger(__name__)

class AICoachService:
    @classmethod
    def _call_ollama(cls, prompt: str, system_prompt: str, model: str = None) -> str:
        """Call local Ollama instance for 100% private and offline inference."""
        ollama_model = model or getattr(settings, "OLLAMA_MODEL", "llama3.2")
        base_url = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
        url = f"{base_url}/api/chat"
        
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "AthleTEX-Backend/1.0"
        }
        body = {
            "model": ollama_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": False
        }
        req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("message", {}).get("content", "") or data.get("response", "")

    @classmethod
    def _call_groq(cls, prompt: str, system_prompt: str) -> str:
        """Call Groq Llama 3.3 70B API for sub-second sports intelligence."""
        if not settings.GROQ_API_KEY:
            raise ValueError("No GROQ_API_KEY configured")
            
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "User-Agent": "AthleTEX-Backend/1.0"
        }
        body = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1024
        }
        req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]

    @classmethod
    def _call_gemini(cls, prompt: str, system_prompt: str) -> str:
        """Call Google Gemini 2.0 Flash Generative Language API."""
        if not settings.GEMINI_API_KEY:
            raise ValueError("No GEMINI_API_KEY configured")
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "AthleTEX-Backend/1.0"
        }
        body = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024}
        }
        req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]

    @classmethod
    def _fallback_response(cls, msg: str, athlete_name: str, sport: str) -> str:
        """Rule-based fallback response when external APIs are unreachable."""
        msg_lower = msg.lower()
        if "drill" in msg_lower or "train" in msg_lower or "exercise" in msg_lower:
            return (
                f"Hey {athlete_name}, based on your {sport} profile, here are targeted drill routines:\n"
                f"• **L-Run Shuttle Cut** (5 sets x 4 reps) — Accelerate 10m, lateral cut 5m, reverse cut back.\n"
                f"• **Dynamic Speed Ladder** (4 sets x 6 reps) — In-out high knee sequence to minimize ground contact time.\n"
                f"• **Reactive Ball Taps** (3 sets x 30s) — Rapid color response to enhance split-second decision making."
            )
        elif "eat" in msg_lower or "diet" in msg_lower or "food" in msg_lower or "nutrition" in msg_lower:
            return (
                f"Here is your personalized fueling protocol for {sport}:\n"
                f"• **Pre-Workout (2h prior)**: Oatmeal + sliced banana + 25g whey protein.\n"
                f"• **Intra-Workout**: Isotonic electrolyte solution with BCAAs.\n"
                f"• **Post-Workout (within 45m)**: Grilled chicken/paneer, brown rice, steamed greens.\n"
                f"• **Daily Macro Goals**: Carbs 4.5g/kg | Protein 1.8g/kg | Healthy Fats 1.0g/kg."
            )
        elif "injur" in msg_lower or "hurt" in msg_lower or "sore" in msg_lower or "pain" in msg_lower:
            return (
                f"Safety first, {athlete_name}! If feeling sharp pain, stop immediately and seek medical evaluation.\n"
                f"For general soreness and recovery:\n"
                f"• Foam roll calves, quads, and thoracic spine for 10 minutes.\n"
                f"• Perform low-impact mobility flow (cat-cow, hip openers).\n"
                f"• Follow with a contrast shower (1 min cold, 2 min warm x 3 rounds)."
            )
        return (
            f"What's up, {athlete_name}! I'm your AthleTEX AI coach for {sport}. "
            f"I can help program workouts, analyze nutrition, build drill routines, and boost match performance. "
            f"What would you like to work on today?"
        )

    @classmethod
    def get_coach_response(cls, user_message: str, user_profile: dict = None, preferred_engine: str = None) -> dict:
        """
        Main entry point for AI Coach queries.
        Supports preferred_engine ('ollama', 'groq', 'gemini') with cascading fallbacks.
        """
        athlete_name = user_profile.get("name", "Athlete") if user_profile else "Athlete"
        sport = user_profile.get("sport", "Cricket") if user_profile else "Cricket"
        rating = user_profile.get("overall_rating", 75) if user_profile else 75

        system_prompt = (
            f"You are the AthleTEX AI Coach for {athlete_name}, an athlete playing {sport} "
            f"with a rating of {rating}/100 based in Hyderabad, India. "
            "Provide elite, actionable, and encouraging sports conditioning, tactics, drills, and nutrition advice. "
            "Format cleanly with bold headings, bullet points, and emojis. Keep it punchy and practical."
        )

        response_text = ""
        engine_used = "Rule Engine"

        # Check if Ollama requested explicitly
        if preferred_engine == "ollama":
            try:
                response_text = cls._call_ollama(user_message, system_prompt)
                return {
                    "coach_response": response_text,
                    "engine": f"🦙 Ollama ({getattr(settings, 'OLLAMA_MODEL', 'llama3.2')})",
                    "athlete": athlete_name,
                    "sport": sport
                }
            except Exception as e_ollama:
                logger.warning(f"Ollama local inference failed: {e_ollama}. Falling back to Groq.")

        # 1. Try Groq (Llama 3.3 70B)
        try:
            response_text = cls._call_groq(user_message, system_prompt)
            engine_used = "⚡ Groq (Llama 3.3 70B)"
        except Exception as e_groq:
            logger.warning(f"Groq API call failed: {e_groq}. Trying Gemini fallback.")
            # 2. Try Gemini (Google Gemini 2.0 Flash)
            try:
                response_text = cls._call_gemini(user_message, system_prompt)
                engine_used = "✦ Google Gemini 2.0 Flash"
            except Exception as e_gemini:
                logger.warning(f"Gemini API call failed: {e_gemini}. Trying local Ollama fallback.")
                # 3. Try Ollama (Local)
                try:
                    response_text = cls._call_ollama(user_message, system_prompt)
                    engine_used = f"🦙 Ollama ({getattr(settings, 'OLLAMA_MODEL', 'llama3.2')})"
                except Exception as e_ollama2:
                    logger.warning(f"Ollama fallback failed: {e_ollama2}. Using heuristic fallback.")
                    # 4. Fallback Rule Engine
                    response_text = cls._fallback_response(user_message, athlete_name, sport)
                    engine_used = "AthleTEX Rule Engine"

        return {
            "coach_response": response_text,
            "engine": engine_used,
            "athlete": athlete_name,
            "sport": sport
        }
