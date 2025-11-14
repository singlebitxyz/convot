"""
Prompt Update Service

Business logic for system prompt updates and history management.
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
import logging

from repositories.prompt_update_repo import PromptUpdateRepository
from repositories.bot_repo import BotRepository
from services.bot_service import BotService
from core.exceptions import ValidationError, NotFoundError, AuthorizationError

logger = logging.getLogger(__name__)


class PromptUpdateService:
    """Service for prompt update operations"""

    def __init__(self, access_token: Optional[str] = None):
        """
        Initialize the prompt update service.

        Args:
            access_token: User's JWT token for RLS-enabled operations
        """
        self.access_token = access_token
        self.repository = PromptUpdateRepository(access_token=access_token)
        self.bot_repo = BotRepository(access_token=access_token)
        self.bot_service = BotService()

    def create_prompt_update(
        self,
        bot_id: UUID,
        user_id: str,
        new_prompt: str,
        reason: Optional[str] = None,
        auto_apply: bool = False,
    ) -> Dict[str, Any]:
        """
        Create a prompt update record.

        Args:
            bot_id: ID of the bot
            user_id: ID of the user creating the update
            new_prompt: New system prompt
            reason: Optional reason for the update
            auto_apply: Whether to automatically apply the update

        Returns:
            Created prompt update record

        Raises:
            AuthorizationError: If user doesn't own the bot
            ValidationError: If prompt is invalid
        """
        # Verify user owns the bot
        bot = self.bot_service.get_bot(str(bot_id), user_id, access_token=self.access_token)
        if not bot:
            raise NotFoundError("Bot", str(bot_id))

        old_prompt = bot.get("system_prompt", "")
        if not old_prompt:
            raise ValidationError("Bot has no existing system prompt")

        # Validate new prompt
        if not new_prompt or not new_prompt.strip():
            raise ValidationError("New prompt cannot be empty")

        if new_prompt == old_prompt:
            raise ValidationError("New prompt must be different from the current prompt")

        # Create update record
        update_record = self.repository.create_prompt_update(
            bot_id=bot_id,
            requested_by=user_id,
            old_prompt=old_prompt,
            new_prompt=new_prompt.strip(),
            reason=reason,
            auto_applied=auto_apply,
        )

        # If auto_apply is True, apply the update immediately
        if auto_apply:
            self.apply_prompt_update(bot_id, user_id, update_record["id"])

        logger.info(f"Prompt update created: bot_id={bot_id}, update_id={update_record['id']}, auto_applied={auto_apply}")
        return update_record

    def get_prompt_history(
        self,
        bot_id: UUID,
        user_id: str,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get prompt update history for a bot.

        Args:
            bot_id: ID of the bot
            user_id: ID of the user (for authorization)
            limit: Optional limit on number of records

        Returns:
            List of prompt update records

        Raises:
            AuthorizationError: If user doesn't own the bot
        """
        # Verify user owns the bot
        bot = self.bot_service.get_bot(str(bot_id), user_id, access_token=self.access_token)
        if not bot:
            raise NotFoundError("Bot", str(bot_id))

        updates = self.repository.get_prompt_updates_by_bot(bot_id, limit=limit)
        logger.debug(f"Retrieved {len(updates)} prompt updates for bot {bot_id}")
        return updates

    def apply_prompt_update(
        self,
        bot_id: UUID,
        user_id: str,
        update_id: UUID,
    ) -> Dict[str, Any]:
        """
        Apply a prompt update to the bot.

        Args:
            bot_id: ID of the bot
            user_id: ID of the user applying the update
            update_id: ID of the prompt update to apply

        Returns:
            Updated bot record

        Raises:
            AuthorizationError: If user doesn't own the bot
            NotFoundError: If update doesn't exist or doesn't belong to bot
        """
        # Verify user owns the bot
        bot = self.bot_service.get_bot(str(bot_id), user_id, access_token=self.access_token)
        if not bot:
            raise NotFoundError("Bot", str(bot_id))

        # Get the prompt update
        update = self.repository.get_prompt_update_by_id(update_id)
        if not update:
            raise NotFoundError("Prompt update", str(update_id))

        # Verify update belongs to this bot
        if str(update.get("bot_id")) != str(bot_id):
            raise ValidationError("Prompt update does not belong to this bot")

        # Apply the new prompt to the bot
        new_prompt = update.get("new_prompt")
        if not new_prompt:
            raise ValidationError("Prompt update has no new prompt")

        updated_bot = self.bot_repo.update_bot(
            bot_id,
            {"system_prompt": new_prompt}
        )

        logger.info(f"Prompt update applied: bot_id={bot_id}, update_id={update_id}, user_id={user_id}")
        return updated_bot

    def revert_to_prompt(
        self,
        bot_id: UUID,
        user_id: str,
        update_id: UUID,
    ) -> Dict[str, Any]:
        """
        Revert bot to a previous prompt version.

        Args:
            bot_id: ID of the bot
            user_id: ID of the user reverting
            update_id: ID of the prompt update to revert to (uses old_prompt from that update)

        Returns:
            Updated bot record

        Raises:
            AuthorizationError: If user doesn't own the bot
            NotFoundError: If update doesn't exist
        """
        # Verify user owns the bot
        bot = self.bot_service.get_bot(str(bot_id), user_id, access_token=self.access_token)
        if not bot:
            raise NotFoundError("Bot", str(bot_id))

        # Get the prompt update
        update = self.repository.get_prompt_update_by_id(update_id)
        if not update:
            raise NotFoundError("Prompt update", str(update_id))

        # Verify update belongs to this bot
        if str(update.get("bot_id")) != str(bot_id):
            raise ValidationError("Prompt update does not belong to this bot")

        # Revert to the old prompt from that update
        old_prompt = update.get("old_prompt")
        if not old_prompt:
            raise ValidationError("Prompt update has no old prompt")

        # Create a new update record for the revert action
        current_prompt = bot.get("system_prompt", "")
        revert_reason = f"Reverted to version from {update.get('created_at', 'previous version')}"

        self.repository.create_prompt_update(
            bot_id=bot_id,
            requested_by=user_id,
            old_prompt=current_prompt,
            new_prompt=old_prompt,
            reason=revert_reason,
            auto_applied=True,  # Auto-apply the revert
        )

        # Apply the revert
        updated_bot = self.bot_repo.update_bot(
            bot_id,
            {"system_prompt": old_prompt}
        )

        logger.info(f"Prompt reverted: bot_id={bot_id}, update_id={update_id}, user_id={user_id}")
        return updated_bot

