"""
Chunk Models

Pydantic models for chunk data operations.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime


class ChunkCreateModel(BaseModel):
    """Model for creating a new chunk"""
    source_id: str = Field(..., description="Source ID")
    bot_id: str = Field(..., description="Bot ID")
    chunk_index: int = Field(..., description="Order within source (0-based)")
    excerpt: str = Field(..., description="The actual text chunk")
    heading: Optional[str] = Field(None, description="Heading/title if available")
    publish_date: Optional[datetime] = Field(None, description="Publish date for web sources")
    char_range: Optional[Dict[str, int]] = Field(None, description="Character range {start: int, end: int}")
    tokens_estimate: int = Field(..., description="Estimated token count")

    model_config = {"use_enum_values": True}


class ChunkResponseModel(BaseModel):
    """Response model for chunk data"""
    id: str = Field(..., description="Chunk ID")
    source_id: str = Field(..., description="Source ID")
    bot_id: str = Field(..., description="Bot ID")
    chunk_index: int = Field(..., description="Order within source")
    excerpt: str = Field(..., description="The actual text chunk")
    heading: Optional[str] = Field(None, description="Heading/title if available")
    publish_date: Optional[str] = Field(None, description="Publish date for web sources")
    char_range: Optional[Dict[str, int]] = Field(None, description="Character range")
    tokens_estimate: int = Field(..., description="Estimated token count")
    embedding: Optional[list[float]] = Field(None, description="Vector embedding (Phase 6)")
    created_at: str = Field(..., description="Creation timestamp")

    model_config = {"from_attributes": True}


class ChunkListResponseModel(BaseModel):
    """Response model for chunk list"""
    status: str = Field(default="success", description="Response status")
    data: list[ChunkResponseModel] = Field(..., description="List of chunks")
    message: Optional[str] = Field(None, description="Response message")


class ChunkResponse(BaseModel):
    """Single chunk response"""
    status: str = Field(default="success", description="Response status")
    data: ChunkResponseModel = Field(..., description="Chunk data")
    message: Optional[str] = Field(None, description="Response message")

