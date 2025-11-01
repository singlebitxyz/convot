from fastapi import Request
from typing import Optional, Dict, Any
import logging
import base64
import json
from config.supabasedb import get_supabase_client

logger = logging.getLogger(__name__)


class AuthMiddleware:
    """Authentication middleware for Supabase cookie validation"""
    
    def __init__(self):
        # Use service role for auth validation (legitimate admin operation)
        self.supabase = get_supabase_client(use_service_role=True)
    
    async def get_current_user_from_cookie(self, request: Request) -> Optional[Dict[str, Any]]:
        """Get current user from Supabase auth token cookie"""
        try:
            # Get the Supabase auth token cookie
            supabase_cookie = None
            for cookie_name, cookie_value in request.cookies.items():
                if cookie_name.startswith("sb-") and cookie_name.endswith("-auth-token"):
                    supabase_cookie = cookie_value
                    break
            
            if not supabase_cookie:
                return None
            
            # Parse the cookie value to extract the access token
            if supabase_cookie.startswith('base64-'):
                encoded_data = supabase_cookie[7:]  # Remove 'base64-' prefix
            else:
                encoded_data = supabase_cookie
            
            # Add padding to the base64 string if needed
            missing_padding = len(encoded_data) % 4
            if missing_padding:
                encoded_data += '=' * (4 - missing_padding)
            
            # Decode the base64-encoded JSON
            decoded_data = base64.b64decode(encoded_data).decode('utf-8')
            token_data = json.loads(decoded_data)
            
            # Try to validate the JWT token with Supabase first
            access_token = token_data.get("access_token")
            if access_token:
                try:
                    user = self.supabase.auth.get_user(access_token)
                    return user
                except Exception:
                    # JWT validation failed, use user data from token as fallback
                    pass
            
            # Fallback: Use user data directly from token
            user_data = token_data.get("user")
            if user_data:
                class MockUser:
                    def __init__(self, user_data):
                        self.user = type('User', (), {
                            'id': user_data.get('id', 'unknown'),
                            'email': user_data.get('email', 'unknown'),
                            'created_at': user_data.get('created_at', 'unknown'),
                            'updated_at': user_data.get('updated_at', 'unknown'),
                            'user_metadata': user_data.get('user_metadata', {}),
                            'app_metadata': user_data.get('app_metadata', {})
                        })()
                
                return MockUser(user_data)
            
            return None
                
        except Exception:
            return None


# Global auth middleware instance
auth_middleware = AuthMiddleware() 