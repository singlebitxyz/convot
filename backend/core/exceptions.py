from fastapi import HTTPException, status
from typing import Any, Dict, Optional


class BaseAPIException(HTTPException):
    """Base exception for API errors"""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers) 