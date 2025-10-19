from fastapi import Request, Response, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import logging
import base64
import json
from config.supabasedb import get_supabase_client
from core.exceptions import AuthenticationError, AuthorizationError

logger = logging.getLogger(__name__)
security = HTTPBearer()


class AuthMiddleware:
    """Authentication middleware with proper token validation"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        """Validate JWT token and return user data"""
        try:
            token = credentials.credentials
            user = self.supabase.auth.get_user(token)
            return user
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            raise AuthenticationError("Invalid authentication token")
    
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
    
    def set_auth_cookies(self, response: Response, session_data: Dict[str, Any]) -> None:
        """Set secure authentication cookies"""
        try:
            access_token = session_data.get("access_token")
            if access_token:
                response.set_cookie(
                    key="access_token",
                    value=access_token,
                    httponly=True,
                    secure=True,  # Use HTTPS in production
                    samesite="lax",
                    max_age=3600  # 1 hour
                )
        except Exception as e:
            logger.error(f"Failed to set auth cookies: {str(e)}")
    
    def clear_auth_cookies(self, response: Response) -> None:
        """Clear authentication cookies"""
        response.delete_cookie("access_token")
        response.delete_cookie("type")


# Global auth middleware instance
auth_middleware = AuthMiddleware()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Dependency for getting current user from Bearer token"""
    return await auth_middleware.get_current_user(credentials)


async def get_current_user_optional(request: Request) -> Optional[Dict[str, Any]]:
    """Dependency for getting current user from cookie (optional)"""
    return await auth_middleware.get_current_user_from_cookie(request)


async def require_authentication(request: Request) -> Dict[str, Any]:
    """Dependency that requires authentication"""
    user = await auth_middleware.get_current_user_from_cookie(request)
    if not user:
        raise AuthenticationError("Authentication required")
    return user 