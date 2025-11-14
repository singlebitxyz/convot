"""
Prompt Update Repository

Handles all database operations for system prompt updates and history.
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
import logging

from core.exceptions import DatabaseError, NotFoundError
from config.supabasedb import get_supabase_client

logger = logging.getLogger(__name__)


class PromptUpdateRepository:
    """Repository for prompt update operations"""

    def __init__(self, access_token: Optional[str] = None):
        """
        Initialize the repository with a Supabase client.
        
        Args:
            access_token: User's JWT token for RLS-enabled operations
        """
        self.client = get_supabase_client(access_token=access_token)
        self.access_token = access_token

    def create_prompt_update(
        self,
        bot_id: UUID,
        requested_by: str,
        old_prompt: str,
        new_prompt: str,
        reason: Optional[str] = None,
        auto_applied: bool = False,
    ) -> Dict[str, Any]:
        """
        Create a new prompt update record.

        Args:
            bot_id: ID of the bot
            requested_by: User ID who requested the update
            old_prompt: Previous system prompt
            new_prompt: New system prompt
            reason: Optional reason for the update
            auto_applied: Whether the update was automatically applied

        Returns:
            Created prompt update record

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            payload = {
                "bot_id": str(bot_id),
                "requested_by": requested_by,
                "old_prompt": old_prompt,
                "new_prompt": new_prompt,
                "reason": reason,
                "auto_applied": auto_applied,
            }

            response = self.client.table("system_prompt_updates").insert(payload).execute()

            if not response.data:
                raise DatabaseError("Failed to create prompt update")

            logger.debug(f"Prompt update created: bot_id={bot_id}, update_id={response.data[0].get('id')}")
            return response.data[0]

        except Exception as e:
            logger.error(f"Prompt update creation failed: bot_id={bot_id}, error={str(e)}")
            if isinstance(e, DatabaseError):
                raise
            raise DatabaseError(f"Failed to create prompt update: {str(e)}")

    def get_prompt_updates_by_bot(
        self,
        bot_id: UUID,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get all prompt updates for a bot, ordered by most recent first.

        Args:
            bot_id: ID of the bot
            limit: Optional limit on number of records to return

        Returns:
            List of prompt update records

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            query = (
                self.client.table("system_prompt_updates")
                .select("*")
                .eq("bot_id", str(bot_id))
                .order("created_at", desc=True)
            )

            if limit:
                query = query.limit(limit)

            response = query.execute()

            return response.data or []

        except Exception as e:
            logger.error(f"Failed to get prompt updates for bot {bot_id}: {str(e)}")
            raise DatabaseError(f"Failed to get prompt updates: {str(e)}")

    def get_prompt_update_by_id(self, update_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get a specific prompt update by ID.

        Args:
            update_id: ID of the prompt update

        Returns:
            Prompt update record or None if not found

        Raises:
            DatabaseError: If database operation fails
        """
        try:
            response = (
                self.client.table("system_prompt_updates")
                .select("*")
                .eq("id", str(update_id))
                .single()
                .execute()
            )

            return response.data if response.data else None

        except Exception as e:
            logger.error(f"Failed to get prompt update {update_id}: {str(e)}")
            return None

