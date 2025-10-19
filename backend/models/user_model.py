from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class UserResponseModel(BaseModel):
    """User response model for authentication check"""
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    created_at: str = Field(..., description="User creation timestamp")
    updated_at: str = Field(..., description="User last update timestamp")


class AuthCheckResponseModel(BaseModel):
    """Authentication check response model"""
    status: str = Field(..., description="Response status (success/error)")
    data: Dict[str, Any] = Field(..., description="Response data containing authentication status and user info")
    message: str = Field(..., description="Response message")
