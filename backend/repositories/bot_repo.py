from typing import Dict, Any, Optional, List
import logging
from config.supabasedb import get_supabase_client
from core.exceptions import DatabaseError, NotFoundError

logger = logging.getLogger(__name__)


class BotRepository:
    """Repository for bot database operations"""

    def __init__(self, access_token: Optional[str] = None):
        self.supabase = get_supabase_client(access_token=access_token)

    def create_bot(self, bot_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new bot"""
        try:
            result = self.supabase.table("bots").insert(bot_data).execute()
            
            if not result.data or len(result.data) == 0:
                raise DatabaseError("Failed to create bot")
            
            logger.info(f"Bot created successfully: {result.data[0].get('id')}")
            return result.data[0]
            
        except Exception as e:
            logger.error(f"Bot creation failed: {str(e)}")
            if isinstance(e, DatabaseError):
                raise
            raise DatabaseError(f"Failed to create bot: {str(e)}")

    def get_bot_by_id(self, bot_id: str) -> Optional[Dict[str, Any]]:
        """Get bot by ID"""
        try:
            result = (
                self.supabase.table("bots")
                .select("*")
                .eq("id", bot_id)
                .single()
                .execute()
            )
            return result.data if result.data else None
        except Exception as e:
            logger.error(f"Failed to get bot {bot_id}: {str(e)}")
            return None

    def get_bots_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all bots created by a user"""
        try:
            result = (
                self.supabase.table("bots")
                .select("*")
                .eq("created_by", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Failed to get bots for user {user_id}: {str(e)}")
            return []

    def update_bot(self, bot_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update bot"""
        try:
            # Remove None values from update_data
            update_data = {k: v for k, v in update_data.items() if v is not None}
            
            if not update_data:
                raise ValueError("No fields to update")

            result = (
                self.supabase.table("bots")
                .update(update_data)
                .eq("id", bot_id)
                .execute()
            )

            if not result.data or len(result.data) == 0:
                raise NotFoundError("Bot", bot_id)

            logger.info(f"Bot updated successfully: {bot_id}")
            return result.data[0]
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to update bot {bot_id}: {str(e)}")
            raise DatabaseError(f"Failed to update bot: {str(e)}")

    def delete_bot(self, bot_id: str) -> bool:
        """Delete bot"""
        try:
            result = (
                self.supabase.table("bots")
                .delete()
                .eq("id", bot_id)
                .execute()
            )

            # Check if any rows were deleted
            deleted_count = len(result.data) if result.data else 0
            
            if deleted_count == 0:
                raise NotFoundError("Bot", bot_id)

            logger.info(f"Bot deleted successfully: {bot_id}")
            return True
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to delete bot {bot_id}: {str(e)}")
            raise DatabaseError(f"Failed to delete bot: {str(e)}")

    def bot_exists(self, bot_id: str) -> bool:
        """Check if bot exists"""
        try:
            bot = self.get_bot_by_id(bot_id)
            return bot is not None
        except Exception:
            return False

