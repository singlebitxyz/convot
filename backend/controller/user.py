from fastapi import APIRouter, Request
from typing import Dict, Any
import logging
from middleware.auth_guard import auth_guard

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/check-user")
@auth_guard
async def check_user(request: Request):
    """
    Check if user is authenticated via Supabase cookie.
    Uses auth guard to validate authentication and inject user data into request state.
    """
    # User data is now available in request.state.user from the auth guard
    user_data = request.state.user
    
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
