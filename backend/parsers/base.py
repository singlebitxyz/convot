"""
Base Parser Interface

Defines the abstract interface that all document parsers must implement.
This ensures consistency and allows for easy extension with new parsers.
"""

from abc import ABC, abstractmethod
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class ParseResult:
    """Result of parsing operation"""
    
    def __init__(
        self,
        text: str,
        metadata: Optional[dict] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ):
        self.text = text
        self.metadata = metadata or {}
        self.success = success
        self.error_message = error_message
    
    def __bool__(self):
        return self.success


class BaseParser(ABC):
    """
    Abstract base class for all document parsers.
    
    All parsers must implement:
    - parse(): Extract text from document
    - can_parse(): Check if parser can handle file type
    - get_supported_types(): Return list of supported MIME types
    """
    
    def __init__(self):
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
    
    @abstractmethod
    def parse(self, file_content: bytes, file_path: Optional[str] = None) -> ParseResult:
        """
        Parse document and extract text.
        
        Args:
            file_content: Raw file content as bytes
            file_path: Optional file path for context (e.g., for error messages)
        
        Returns:
            ParseResult with extracted text and metadata
        
        Raises:
            ParserError: If parsing fails
        """
        pass
    
    @abstractmethod
    def can_parse(self, mime_type: str, file_extension: Optional[str] = None) -> bool:
        """
        Check if this parser can handle the given file type.
        
        Args:
            mime_type: MIME type of the file
            file_extension: Optional file extension (e.g., '.pdf')
        
        Returns:
            True if parser can handle this file type
        """
        pass
    
    @abstractmethod
    def get_supported_types(self) -> list[str]:
        """
        Get list of MIME types supported by this parser.
        
        Returns:
            List of supported MIME type strings
        """
        pass
    
    def get_name(self) -> str:
        """Get parser name for logging/debugging"""
        return self.__class__.__name__

