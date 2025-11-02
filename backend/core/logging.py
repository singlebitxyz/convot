import logging
import sys
from typing import Dict, Any
from config.settings import settings


def setup_logging() -> None:
    """Setup comprehensive logging configuration"""
    
    # Setup root logger
    root_logger = logging.getLogger()
    
    # Check if our custom file handler already exists
    # Look for a FileHandler that writes to app.log
    has_our_file_handler = False
    for handler in root_logger.handlers:
        if isinstance(handler, logging.FileHandler):
            # Check if it's our app.log file handler
            if hasattr(handler, 'baseFilename') and 'app.log' in handler.baseFilename:
                has_our_file_handler = True
                break
    
    # If we already have our file handler, we're good
    # But we still need to ensure console handler exists
    if not has_our_file_handler:
        # Remove any existing handlers that might interfere
        # (e.g., from basicConfig calls in other modules)
        for handler in root_logger.handlers[:]:
            # Only remove if it's not our handler
            if isinstance(handler, logging.FileHandler):
                if not (hasattr(handler, 'baseFilename') and 'app.log' in handler.baseFilename):
                    root_logger.removeHandler(handler)
            elif isinstance(handler, logging.StreamHandler):
                # Remove default StreamHandler if it exists (we'll add our own)
                root_logger.removeHandler(handler)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    root_logger.setLevel(getattr(logging, settings.log_level))
    
    # Console handler - add if doesn't exist
    has_console = any(isinstance(h, logging.StreamHandler) for h in root_logger.handlers)
    if not has_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
    
    # File handler - always enabled for all environments
    # This helps with debugging and keeps logs persistent
    # Only add if we don't already have one
    if not has_our_file_handler:
        try:
            file_handler = logging.FileHandler("app.log", mode='a')  # Append mode
            file_handler.setFormatter(formatter)
            root_logger.addHandler(file_handler)
        except Exception as e:
            # If file logging fails (e.g., permission issues), log to console only
            # Use root_logger since we can't use logger here (not defined yet)
            root_logger.warning(f"Failed to setup file logging: {str(e)}")
    
    # Suppress noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


class APILogger:
    """Custom logger for API operations"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def log_request(self, method: str, path: str, user_id: str = None) -> None:
        """Log API request"""
        user_info = f" (user: {user_id})" if user_id else ""
        self.logger.info(f"API Request: {method} {path}{user_info}")
    
    def log_response(self, method: str, path: str, status_code: int, user_id: str = None) -> None:
        """Log API response"""
        user_info = f" (user: {user_id})" if user_id else ""
        self.logger.info(f"API Response: {method} {path} -> {status_code}{user_info}")
    
    def log_error(self, error: Exception, context: Dict[str, Any] = None) -> None:
        """Log error with context"""
        context_str = f" Context: {context}" if context else ""
        self.logger.error(f"Error: {str(error)}{context_str}")
    
    def log_auth_event(self, event: str, user_id: str = None, success: bool = True) -> None:
        """Log authentication events"""
        status = "success" if success else "failed"
        user_info = f" (user: {user_id})" if user_id else ""
        self.logger.info(f"Auth Event: {event} - {status}{user_info}")


# Note: setup_logging() is called in main.py
# Don't call it here at module import time to avoid duplicate handlers 