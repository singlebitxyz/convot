"""
Chunk API Controller

Handles HTTP requests for chunk management.
"""

from fastapi import APIRouter, Request, HTTPException, status
from typing import Optional
from uuid import UUID
import logging

from models.chunk_model import (
    ChunkResponseModel,
    ChunkResponse,
    ChunkListResponseModel,
)
from services.chunk_service import ChunkService
from middleware.auth_guard import auth_guard
from middleware.auth import get_access_token_from_request
from starlette.concurrency import run_in_threadpool
from core.exceptions import (
    ValidationError,
    NotFoundError,
    AuthorizationError,
    DatabaseError,
)

logger = logging.getLogger(__name__)

chunk_router = APIRouter()


@chunk_router.get("/bots/{bot_id}/sources/{source_id}/chunks")
@auth_guard
async def list_chunks(
    request: Request,
    bot_id: UUID,
    source_id: UUID,
):
    """
    Get all chunks for a source.
    
    Returns list of chunks for the specified source.
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
        
        chunk_service = ChunkService(access_token=access_token)
        chunks = await run_in_threadpool(
            chunk_service.get_chunks_by_source,
            source_id,
            bot_id,
            UUID(user_id)
        )
        
        chunk_models = [ChunkResponseModel(**chunk) for chunk in chunks]
        
        return ChunkListResponseModel(
            status="success",
            data=chunk_models,
            message=f"Found {len(chunk_models)} chunks"
        )
        
    except NotFoundError as e:
        logger.error(f"Chunks not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    except AuthorizationError as e:
        logger.error(f"Authorization error listing chunks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access these chunks"
        )
    except DatabaseError as e:
        logger.error(f"Database error listing chunks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch chunks"
        )
    except Exception as e:
        logger.error(f"Unexpected error listing chunks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@chunk_router.get("/bots/{bot_id}/chunks")
@auth_guard
async def list_bot_chunks(
    request: Request,
    bot_id: UUID,
    limit: Optional[int] = None,
):
    """
    Get chunks for a bot.
    
    Returns list of chunks for the specified bot.
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
        
        chunk_service = ChunkService(access_token=access_token)
        chunks = await run_in_threadpool(
            chunk_service.get_chunks_by_bot,
            bot_id,
            UUID(user_id),
            limit
        )
        
        chunk_models = [ChunkResponseModel(**chunk) for chunk in chunks]
        
        return ChunkListResponseModel(
            status="success",
            data=chunk_models,
            message=f"Found {len(chunk_models)} chunks"
        )
        
    except AuthorizationError as e:
        logger.error(f"Authorization error listing chunks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access these chunks"
        )
    except DatabaseError as e:
        logger.error(f"Database error listing chunks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch chunks"
        )
    except Exception as e:
        logger.error(f"Unexpected error listing chunks: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )


@chunk_router.get("/bots/{bot_id}/chunks/{chunk_id}")
@auth_guard
async def get_chunk(
    request: Request,
    bot_id: UUID,
    chunk_id: UUID,
):
    """
    Get a single chunk by ID.
    
    Returns chunk details.
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
        
        chunk_service = ChunkService(access_token=access_token)
        chunk = await run_in_threadpool(
            chunk_service.get_chunk,
            chunk_id,
            bot_id,
            UUID(user_id)
        )
        
        chunk_model = ChunkResponseModel(**chunk)
        
        return ChunkResponse(
            status="success",
            data=chunk_model,
            message="Chunk retrieved successfully"
        )
        
    except NotFoundError as e:
        logger.error(f"Chunk not found: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chunk not found"
        )
    except AuthorizationError as e:
        logger.error(f"Authorization error getting chunk: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this chunk"
        )
    except DatabaseError as e:
        logger.error(f"Database error getting chunk: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch chunk"
        )
    except Exception as e:
        logger.error(f"Unexpected error getting chunk: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

