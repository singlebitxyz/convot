"""
Parser Exceptions

Custom exceptions for parser operations.
"""


class ParserError(Exception):
    """Base exception for parser errors"""
    pass


class UnsupportedFileTypeError(ParserError):
    """Raised when file type is not supported"""
    pass


class ParsingFailedError(ParserError):
    """Raised when parsing operation fails"""
    pass


class CorruptedFileError(ParserError):
    """Raised when file is corrupted or unreadable"""
    pass

