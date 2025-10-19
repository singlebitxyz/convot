from fastapi import APIRouter, Request
from typing import Dict, Any
import logging
from middleware.auth import get_current_user_optional
from core.exceptions import AuthenticationError

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/check-user")
async def check_user(request: Request):
    """
    Check if user is authenticated via Supabase cookie.
    Validates the access_token cookie and returns user information if authenticated.
    """
    try:
        user = await get_current_user_optional(request)
        
        if user and hasattr(user, 'user') and user.user:
            user_data = user.user
            return {
                "status": "success",
                "data": {
                    "authenticated": True,
                    "user": {
                        "id": getattr(user_data, 'id', 'unknown'),
                        "email": getattr(user_data, 'email', 'unknown'),
                        "created_at": getattr(user_data, 'created_at', 'unknown'),
                        "updated_at": getattr(user_data, 'updated_at', 'unknown')
                    }
                },
                "message": "User is authenticated"
            }
        else:
            return {
                "status": "error",
                "data": {
                    "authenticated": False,
                    "user": None
                },
                "message": "User is not authenticated"
            }
            
    except Exception as e:
        logger.error(f"Error during user check: {str(e)}")
        return {
            "status": "error",
            "data": {
                "authenticated": False,
                "user": None
            },
            "message": "Internal server error"
        }
