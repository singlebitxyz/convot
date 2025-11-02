"""
Document Parsers Module

This module provides a modular parsing system for extracting text from various document formats.
Each parser is independent and implements a common interface, making it easy to add new parsers.

Architecture:
- BaseParser: Abstract base class defining the parser interface
- Individual parsers: PDFParser, DOCXParser, TextParser
- ParserFactory: Factory pattern for selecting appropriate parser
- All parsers are dependency-injected and can be easily swapped or extended
"""

from parsers.base import BaseParser, ParseResult
from parsers.pdf_parser import PDFParser
from parsers.docx_parser import DOCXParser
from parsers.text_parser import TextParser
from parsers.factory import ParserFactory
from parsers.exceptions import (
    ParserError,
    UnsupportedFileTypeError,
    ParsingFailedError,
    CorruptedFileError,
)

__all__ = [
    "BaseParser",
    "ParseResult",
    "PDFParser",
    "DOCXParser",
    "TextParser",
    "ParserFactory",
    "ParserError",
    "UnsupportedFileTypeError",
    "ParsingFailedError",
    "CorruptedFileError",
]

