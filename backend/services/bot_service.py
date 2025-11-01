from typing import Dict, Any, Optional, List
import logging
from models.bot_model import BotCreateModel, BotUpdateModel
from repositories.bot_repo import BotRepository
from core.exceptions import ValidationError, NotFoundError, AuthorizationError

logger = logging.getLogger(__name__)


class BotService:
    """Service for bot business logic"""

    def __init__(self):
        # Don't initialize repository here - create it per request with access token
        pass

    def _get_repository(self, access_token: Optional[str] = None) -> BotRepository:
        """Get repository instance with optional access token for RLS"""
        return BotRepository(access_token=access_token)

    def create_bot(self, bot: BotCreateModel, user_id: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        """Create a new bot with validation"""
        try:
            # Get repository with user's access token for RLS
            repository = self._get_repository(access_token=access_token)
            
            # Prepare data for repository
            bot_data = {
                "name": bot.name,
                "description": bot.description,
                "system_prompt": bot.system_prompt,
                "llm_provider": bot.llm_provider,
                "llm_config": bot.llm_config.model_dump(),
                "retention_days": bot.retention_days,
                "created_by": user_id,
            }

            result = repository.create_bot(bot_data)
            logger.info(f"Bot service: Bot created for user {user_id}")
            return result
        except Exception as e:
            logger.error(f"Bot service: Bot creation failed for user {user_id}: {str(e)}")
            raise

    def get_bot(self, bot_id: str, user_id: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        """Get bot with authorization check"""
        try:
            repository = self._get_repository(access_token=access_token)
            bot = repository.get_bot_by_id(bot_id)
            
            if not bot:
                raise NotFoundError("Bot", bot_id)

            # Check ownership
            if bot.get("created_by") != user_id:
                raise AuthorizationError("You do not have access to this bot")

            logger.info(f"Bot service: Bot retrieved for user {user_id}")
            return bot
        except (NotFoundError, AuthorizationError):
            raise
        except Exception as e:
            logger.error(f"Bot service: Failed to get bot {bot_id}: {str(e)}")
            raise

    def get_user_bots(self, user_id: str, access_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all bots for a user"""
        try:
            repository = self._get_repository(access_token=access_token)
            bots = repository.get_bots_by_user(user_id)
            logger.info(f"Bot service: Listed {len(bots)} bots for user {user_id}")
            return bots
        except Exception as e:
            logger.error(f"Bot service: Failed to list bots for user {user_id}: {str(e)}")
            return []

    def update_bot(self, bot_id: str, bot: BotUpdateModel, user_id: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        """Update bot with authorization and validation"""
        try:
            repository = self._get_repository(access_token=access_token)
            
            # Check ownership first
            existing_bot = repository.get_bot_by_id(bot_id)
            if not existing_bot:
                raise NotFoundError("Bot", bot_id)

            if existing_bot.get("created_by") != user_id:
                raise AuthorizationError("You do not have permission to update this bot")

            # Prepare update data
            update_data = bot.model_dump(exclude_unset=True, exclude_none=True)
            
            # Handle llm_config separately if provided
            if "llm_config" in update_data and isinstance(update_data["llm_config"], dict):
                # Merge with existing config if needed
                existing_config = existing_bot.get("llm_config", {})
                if isinstance(existing_config, dict):
                    existing_config.update(update_data["llm_config"])
                    update_data["llm_config"] = existing_config

            result = repository.update_bot(bot_id, update_data)
            logger.info(f"Bot service: Bot updated for user {user_id}")
            return result
        except (NotFoundError, AuthorizationError):
            raise
        except Exception as e:
            logger.error(f"Bot service: Bot update failed for user {user_id}: {str(e)}")
            raise

    def delete_bot(self, bot_id: str, user_id: str, access_token: Optional[str] = None) -> bool:
        """Delete bot with authorization check"""
        try:
            repository = self._get_repository(access_token=access_token)
            
            # Check ownership first
            existing_bot = repository.get_bot_by_id(bot_id)
            if not existing_bot:
                raise NotFoundError("Bot", bot_id)

            if existing_bot.get("created_by") != user_id:
                raise AuthorizationError("You do not have permission to delete this bot")

            result = repository.delete_bot(bot_id)
            logger.info(f"Bot service: Bot deleted for user {user_id}")
            return result
        except (NotFoundError, AuthorizationError):
            raise
        except Exception as e:
            logger.error(f"Bot service: Bot deletion failed for user {user_id}: {str(e)}")
            raise

