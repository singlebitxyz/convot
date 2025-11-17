"""
Widget Token API Controller

Handles HTTP requests for widget token management.
"""

from fastapi import APIRouter, Request, HTTPException, status
from typing import List
from uuid import UUID
import logging

from models.widget_token_model import (
    WidgetTokenCreateModel,
    WidgetTokenResponseModel,
    WidgetTokenCreateResponseModel,
    WidgetTokenListResponseModel,
)
from services.widget_token_service import WidgetTokenService
from middleware.auth_guard import auth_guard
from middleware.auth import get_access_token_from_request
from core.exceptions import (
    ValidationError,
    NotFoundError,
    AuthorizationError,
    DatabaseError,
)

logger = logging.getLogger(__name__)

widget_token_router = APIRouter()


@widget_token_router.post("/bots/{bot_id}/widget-tokens", status_code=status.HTTP_201_CREATED)
@auth_guard
async def create_widget_token(
    request: Request,
    bot_id: UUID,
    token_data: WidgetTokenCreateModel,
):
    """
    Create a new widget token for a bot.
    
    Returns the token in plain text only once during creation.
    """
    try:
        user_data = request.state.user
        user_id = getattr(user_data, 'id', None)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        access_token = get_access_token_from_request(request)
        
        widget_token_service = WidgetTokenService(access_token=access_token)
        
        # Convert expires_at if provided
        expires_at = None
        if token_data.expires_at:
            expires_at = token_data.expires_at
        
        result = widget_token_service.create_token(
            bot_id=bot_id,
            user_id=UUID(user_id),
            allowed_domains=token_data.allowed_domains,
            name=token_data.name,
            expires_at=expires_at,
        )
        
        # Format response - exclude the plain token from response_data
        plain_token = result.pop("token", None)  # Extract and remove token from result
        response_data = WidgetTokenResponseModel(**result)
        
        return WidgetTokenCreateResponseModel(
            status="success",
            data=response_data,
            token=plain_token,
            message="Widget token created successfully. Save this token securely - it won't be shown again.",
        )
        
    except ValidationError as e:
        logger.error(f"Validation error creating widget token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except AuthorizationError as e:
        logger.error(f"Authorization error creating widget token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create tokens for this bot",
        )
    except DatabaseError as e:
        logger.error(f"Database error creating widget token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create widget token",
        )
    except Exception as e:
        logger.error(f"Unexpected error creating widget token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        )


@widget_token_router.get("/bots/{bot_id}/widget-tokens")
@auth_guard
async def list_widget_tokens(
    request: Request,
    bot_id: UUID,
):
    """List all widget tokens for a bot"""
    try:
        user_data = request.state.user
        user_id = getattr(user_data, 'id', None)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        access_token = get_access_token_from_request(request)
        
        widget_token_service = WidgetTokenService(access_token=access_token)
        
        tokens = widget_token_service.get_tokens_by_bot(
            bot_id=bot_id,
            user_id=UUID(user_id),
        )
        
        # Format response (without plain tokens)
        response_data = [WidgetTokenResponseModel(**token) for token in tokens]
        
        return WidgetTokenListResponseModel(
            status="success",
            data=response_data,
            message=f"Found {len(response_data)} widget token(s)",
        )
        
    except AuthorizationError as e:
        logger.error(f"Authorization error listing widget tokens: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view tokens for this bot",
        )
    except DatabaseError as e:
        logger.error(f"Database error listing widget tokens: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch widget tokens",
        )
    except Exception as e:
        logger.error(f"Unexpected error listing widget tokens: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        )


@widget_token_router.delete("/bots/{bot_id}/widget-tokens/{token_id}")
@auth_guard
async def revoke_widget_token(
    request: Request,
    bot_id: UUID,
    token_id: UUID,
):
    """Revoke (delete) a widget token"""
    try:
        user_data = request.state.user
        user_id = getattr(user_data, 'id', None)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token"
            )
        
        access_token = get_access_token_from_request(request)
        
        widget_token_service = WidgetTokenService(access_token=access_token)
        
        widget_token_service.revoke_token(
            token_id=token_id,
            bot_id=bot_id,
            user_id=UUID(user_id),
        )
        
        return {
            "status": "success",
            "message": "Widget token revoked successfully",
        }
        
    except NotFoundError as e:
        logger.error(f"Token not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Widget token not found",
        )
    except AuthorizationError as e:
        logger.error(f"Authorization error revoking widget token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to revoke this token",
        )
    except DatabaseError as e:
        logger.error(f"Database error revoking widget token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke widget token",
        )
    except Exception as e:
        logger.error(f"Unexpected error revoking widget token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred",
        )

