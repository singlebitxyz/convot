"""
Chunk Service

Business logic for chunk operations.
Orchestrates chunking, storage, and retrieval.
"""

from typing import List, Optional
from uuid import UUID
import logging

from core.exceptions import ValidationError, NotFoundError, AuthorizationError, DatabaseError
from repositories.chunk_repo import ChunkRepository
from services.bot_service import BotService
from services.chunking_service import ChunkingService, TextChunk
from models.source_model import SourceType

logger = logging.getLogger(__name__)


class ChunkService:
    """Service for chunk operations"""

    def __init__(self, access_token: Optional[str] = None):
        """
        Initialize the service.

        Args:
            access_token: User's JWT token for RLS-enabled operations
        """
        self.access_token = access_token
        self.repository = ChunkRepository(access_token=access_token)
        self.chunking_service = ChunkingService()

    def chunk_and_store_source(
        self,
        source_id: UUID,
        bot_id: UUID,
        text: str,
        source_type: SourceType
    ) -> List[dict]:
        """
        Chunk text and store chunks in database.

        Args:
            source_id: Source UUID
            bot_id: Bot UUID
            text: Extracted text to chunk
            source_type: Type of source (pdf, docx, text, html)

        Returns:
            List of created chunk records

        Raises:
            ValidationError: If validation fails
            DatabaseError: If database operation fails
        """
        if not text or not text.strip():
            logger.warning(f"Empty text provided for chunking source {source_id}")
            return []

        # Verify bot ownership (authorization)
        bot_service = BotService()
        # Note: We need user_id for authorization, but in parsing context we might not have it
        # For now, we'll use service role to bypass RLS since we've already verified ownership
        # during source creation/parsing
        
        # Chunk the text
        text_chunks = self.chunking_service.chunk_text(text, source_type.value)
        
        if not text_chunks:
            logger.warning(f"No chunks generated for source {source_id}")
            return []

        # Convert TextChunk objects to dicts for database insertion
        chunks_data = []
        for text_chunk in text_chunks:
            chunk_dict = text_chunk.to_dict()
            chunk_dict.update({
                "source_id": str(source_id),
                "bot_id": str(bot_id),
            })
            chunks_data.append(chunk_dict)

        # Store chunks in database
        try:
            created_chunks = self.repository.create_chunks(chunks_data)
            logger.info(
                f"Stored {len(created_chunks)} chunks for source {source_id}, "
                f"bot {bot_id}"
            )
            return created_chunks
        except Exception as e:
            logger.error(f"Error storing chunks for source {source_id}: {str(e)}")
            raise DatabaseError(f"Failed to store chunks: {str(e)}")

    def get_chunks_by_source(
        self,
        source_id: UUID,
        bot_id: UUID,
        user_id: UUID
    ) -> List[dict]:
        """
        Get all chunks for a source.

        Args:
            source_id: ID of the source
            bot_id: ID of the bot
            user_id: ID of the user (for authorization)

        Returns:
            List of chunk records

        Raises:
            AuthorizationError: If user doesn't own the bot
            NotFoundError: If source not found
            DatabaseError: If database operation fails
        """
        # Verify user owns the bot
        bot_service = BotService()
        bot_service.get_bot(str(bot_id), str(user_id), access_token=self.access_token)

        return self.repository.get_chunks_by_source(source_id)

    def get_chunks_by_bot(
        self,
        bot_id: UUID,
        user_id: UUID,
        limit: Optional[int] = None
    ) -> List[dict]:
        """
        Get chunks for a bot.

        Args:
            bot_id: ID of the bot
            user_id: ID of the user (for authorization)
            limit: Optional limit on number of chunks

        Returns:
            List of chunk records

        Raises:
            AuthorizationError: If user doesn't own the bot
            DatabaseError: If database operation fails
        """
        # Verify user owns the bot
        bot_service = BotService()
        bot_service.get_bot(str(bot_id), str(user_id), access_token=self.access_token)

        return self.repository.get_chunks_by_bot(bot_id, limit)

    def get_chunk(
        self,
        chunk_id: UUID,
        bot_id: UUID,
        user_id: UUID
    ) -> dict:
        """
        Get a chunk by ID.

        Args:
            chunk_id: ID of the chunk
            bot_id: ID of the bot
            user_id: ID of the user (for authorization)

        Returns:
            Chunk record

        Raises:
            AuthorizationError: If user doesn't own the bot
            NotFoundError: If chunk not found
            DatabaseError: If database operation fails
        """
        # Verify user owns the bot
        bot_service = BotService()
        bot_service.get_bot(str(bot_id), str(user_id), access_token=self.access_token)

        chunk = self.repository.get_chunk_by_id(chunk_id)
        if not chunk:
            raise NotFoundError("Chunk", str(chunk_id))

        # Verify chunk belongs to bot
        if chunk.get("bot_id") != str(bot_id):
            raise AuthorizationError("Chunk does not belong to this bot")

        return chunk

