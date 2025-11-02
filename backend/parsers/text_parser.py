"""
Text Parser

Extracts text from plain text files (TXT).
Handles various text encodings (UTF-8, ASCII, etc.).
"""

from typing import Optional
import logging
from parsers.base import BaseParser, ParseResult

logger = logging.getLogger(__name__)


class TextParser(BaseParser):
    """Parser for plain text documents"""
    
    def __init__(self):
        super().__init__()
    
    def parse(self, file_content: bytes, file_path: Optional[str] = None) -> ParseResult:
        """
        Extract text from plain text file.
        
        Args:
            file_content: Text file content as bytes
            file_path: Optional file path for error messages
        
        Returns:
            ParseResult with extracted text
        """
        try:
            # Try UTF-8 first (most common)
            encodings = ["utf-8", "utf-8-sig", "latin-1", "ascii", "cp1252"]
            
            text = None
            used_encoding = None
            
            for encoding in encodings:
                try:
                    text = file_content.decode(encoding)
                    used_encoding = encoding
                    break
                except UnicodeDecodeError:
                    continue
            
            if text is None:
                return ParseResult(
                    text="",
                    metadata={},
                    success=False,
                    error_message="Unable to decode text file. Unknown encoding."
                )
            
            # Clean up text
            text = text.strip()
            
            if not text:
                return ParseResult(
                    text="",
                    metadata={"encoding": used_encoding},
                    success=False,
                    error_message="Text file is empty."
                )
            
            metadata = {
                "encoding": used_encoding,
                "total_chars": len(text),
                "total_lines": len(text.splitlines()),
            }
            
            self.logger.info(
                f"Successfully parsed text file: {metadata['total_lines']} lines, "
                f"{metadata['total_chars']} characters (encoding: {used_encoding})"
            )
            
            return ParseResult(
                text=text,
                metadata=metadata
            )
            
        except Exception as e:
            error_msg = f"Failed to parse text file: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            return ParseResult(
                text="",
                metadata={},
                success=False,
                error_message=error_msg
            )
    
    def can_parse(self, mime_type: str, file_extension: Optional[str] = None) -> bool:
        """Check if this parser can handle text files"""
        text_mimes = ["text/plain", "text/txt"]
        text_extensions = [".txt", ".text"]
        
        return (
            mime_type.lower() in text_mimes or
            (file_extension and file_extension.lower() in text_extensions)
        )
    
    def get_supported_types(self) -> list[str]:
        """Get supported MIME types"""
        return ["text/plain", "text/txt"]

