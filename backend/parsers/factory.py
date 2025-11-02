"""
Parser Factory

Factory pattern for selecting and creating appropriate parsers based on file type.
This centralizes parser selection logic and makes it easy to add new parsers.
"""

from typing import Optional
import logging
from parsers.base import BaseParser
from parsers.pdf_parser import PDFParser
from parsers.docx_parser import DOCXParser
from parsers.text_parser import TextParser

logger = logging.getLogger(__name__)


class ParserFactory:
    """
    Factory for creating document parsers based on file type.
    
    Usage:
        factory = ParserFactory()
        parser = factory.get_parser(mime_type="application/pdf")
        result = parser.parse(file_content)
    """
    
    def __init__(self):
        """Initialize factory with available parsers"""
        self._parsers: list[BaseParser] = [
            PDFParser(),
            DOCXParser(),
            TextParser(),
        ]
        self._parser_cache: dict[str, BaseParser] = {}
    
    def get_parser(
        self,
        mime_type: str,
        file_extension: Optional[str] = None
    ) -> Optional[BaseParser]:
        """
        Get appropriate parser for the given file type.
        
        Args:
            mime_type: MIME type of the file
            file_extension: Optional file extension (e.g., '.pdf')
        
        Returns:
            BaseParser instance that can handle this file type, or None if no parser found
        
        Raises:
            ValueError: If no parser is found for the file type
        """
        # Check cache first
        cache_key = f"{mime_type}_{file_extension or ''}"
        if cache_key in self._parser_cache:
            return self._parser_cache[cache_key]
        
        # Find matching parser
        for parser in self._parsers:
            if parser.can_parse(mime_type, file_extension):
                self._parser_cache[cache_key] = parser
                logger.debug(f"Selected parser: {parser.get_name()} for {mime_type}")
                return parser
        
        # No parser found
        logger.warning(
            f"No parser found for MIME type: {mime_type}, "
            f"extension: {file_extension}"
        )
        return None
    
    def get_all_supported_types(self) -> list[str]:
        """
        Get all MIME types supported by any parser.
        
        Returns:
            List of all supported MIME types
        """
        supported = set()
        for parser in self._parsers:
            supported.update(parser.get_supported_types())
        return sorted(list(supported))
    
    def register_parser(self, parser: BaseParser):
        """
        Register a new parser with the factory.
        
        Args:
            parser: Parser instance to register
        """
        if not isinstance(parser, BaseParser):
            raise TypeError("Parser must be an instance of BaseParser")
        
        self._parsers.append(parser)
        logger.info(f"Registered new parser: {parser.get_name()}")

