import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GoogleAuthService:
    """
    Python Google Sign-In & Data Retrieval Service.
    Retrieves verified Gmail user profile (name, email, avatar, google_id)
    using Google OAuth2 Token Verification and Google UserInfo API.
    """

    @classmethod
    def verify_and_retrieve_google_user(cls, credential: Optional[str] = None, access_token: Optional[str] = None, client_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Verifies Google token (ID token or OAuth access token) and retrieves
        the user's profile directly from Google's secure servers.
        """
        google_data = {}

        # 1. Try python google-auth library if installed
        if credential:
            try:
                from google.oauth2 import id_token
                from google.auth.transport import requests as google_requests
                
                request = google_requests.Request()
                id_info = id_token.verify_oauth2_token(credential, request, client_id)
                
                return {
                    "email": id_info.get("email"),
                    "name": id_info.get("name", id_info.get("email", "").split("@")[0]),
                    "avatar_url": id_info.get("picture", ""),
                    "google_id": id_info.get("sub", ""),
                    "email_verified": id_info.get("email_verified", True),
                    "locale": id_info.get("locale", "en")
                }
            except Exception as e_lib:
                logger.info(f"Native google-auth verification attempted: {e_lib}. Using Google TokenInfo REST API.")

            # 2. Verify via Google's tokeninfo endpoint
            try:
                url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
                req = urllib.request.Request(url, headers={"User-Agent": "AthleTEX-GoogleAuth/1.0"})
                with urllib.request.urlopen(req, timeout=8) as response:
                    id_info = json.loads(response.read().decode("utf-8"))
                    
                    if "email" in id_info:
                        return {
                            "email": id_info.get("email"),
                            "name": id_info.get("name", id_info.get("email", "").split("@")[0]),
                            "avatar_url": id_info.get("picture", ""),
                            "google_id": id_info.get("sub", ""),
                            "email_verified": id_info.get("email_verified") == "true" or id_info.get("email_verified") is True,
                            "locale": id_info.get("locale", "en")
                        }
            except Exception as e_rest:
                logger.warning(f"Google TokenInfo endpoint error: {e_rest}")

        # 3. Retrieve user data via Google UserInfo API using access_token
        if access_token:
            try:
                url = "https://www.googleapis.com/oauth2/v3/userinfo"
                req = urllib.request.Request(url, headers={
                    "Authorization": f"Bearer {access_token}",
                    "User-Agent": "AthleTEX-GoogleAuth/1.0"
                })
                with urllib.request.urlopen(req, timeout=8) as response:
                    user_info = json.loads(response.read().decode("utf-8"))
                    return {
                        "email": user_info.get("email"),
                        "name": user_info.get("name", user_info.get("email", "").split("@")[0]),
                        "avatar_url": user_info.get("picture", ""),
                        "google_id": user_info.get("sub", ""),
                        "email_verified": user_info.get("email_verified", True),
                        "locale": user_info.get("locale", "en")
                    }
            except Exception as e_userinfo:
                logger.warning(f"Google UserInfo API error: {e_userinfo}")

        return google_data
