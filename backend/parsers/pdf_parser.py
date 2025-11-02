"""
PDF Parser

Extracts text from PDF documents using pdfplumber.
Handles encrypted, corrupted, and multi-page PDFs.
"""

from typing import Optional
import io
import logging
from parsers.base import BaseParser, ParseResult

logger = logging.getLogger(__name__)


class PDFParser(BaseParser):
    """Parser for PDF documents"""
    
    def __init__(self):
        super().__init__()
        self._pdfplumber = None
    
    def _get_pdfplumber(self):
        """Lazy load pdfplumber to avoid import errors if not installed"""
        if self._pdfplumber is None:
            try:
                import pdfplumber
                self._pdfplumber = pdfplumber
            except ImportError:
                raise ImportError(
                    "pdfplumber is required for PDF parsing. "
                    "Install it with: pip install pdfplumber"
                )
        return self._pdfplumber
    
    def parse(self, file_content: bytes, file_path: Optional[str] = None) -> ParseResult:
        """
        Extract text from PDF file.
        
        Args:
            file_content: PDF file content as bytes
            file_path: Optional file path for error messages
        
        Returns:
            ParseResult with extracted text
        """
        try:
            pdfplumber = self._get_pdfplumber()
            
            # Create file-like object from bytes
            pdf_file = io.BytesIO(file_content)
            
            text_parts = []
            metadata = {
                "page_count": 0,
                "total_chars": 0,
            }
            
            # Extract text from each page
            with pdfplumber.open(pdf_file) as pdf:
                metadata["page_count"] = len(pdf.pages)
                
                for page_num, page in enumerate(pdf.pages, 1):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text_parts.append(page_text)
                            metadata["total_chars"] += len(page_text)
                    except Exception as e:
                        self.logger.warning(
                            f"Failed to extract text from page {page_num}: {str(e)}"
                        )
                        continue
            
            full_text = "\n\n".join(text_parts)
            
            if not full_text.strip():
                return ParseResult(
                    text="",
                    metadata=metadata,
                    success=False,
                    error_message="PDF contains no extractable text. It may be image-based or encrypted."
                )
            
            metadata["extracted_chars"] = len(full_text)
            
            self.logger.info(
                f"Successfully parsed PDF: {metadata['page_count']} pages, "
                f"{metadata['extracted_chars']} characters"
            )
            
            return ParseResult(
                text=full_text,
                metadata=metadata
            )
            
        except Exception as e:
            error_msg = f"Failed to parse PDF: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            return ParseResult(
                text="",
                metadata={},
                success=False,
                error_message=error_msg
            )
    
    def can_parse(self, mime_type: str, file_extension: Optional[str] = None) -> bool:
        """Check if this parser can handle PDF files"""
        return (
            mime_type == "application/pdf" or
            (file_extension and file_extension.lower() == ".pdf")
        )
    
    def get_supported_types(self) -> list[str]:
        """Get supported MIME types"""
        return ["application/pdf"]

