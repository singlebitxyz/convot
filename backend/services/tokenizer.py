"""
Tokenizer Service

Service for token counting using tiktoken.
Provides accurate token estimation for chunking decisions.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class Tokenizer:
    """
    Tokenizer for estimating token counts.
    
    Uses tiktoken for accurate token counting compatible with OpenAI models.
    Defaults to 'cl100k_base' encoding (used by GPT-4, GPT-3.5).
    """
    
    def __init__(self, encoding_name: str = "cl100k_base"):
        """
        Initialize tokenizer.
        
        Args:
            encoding_name: Tiktoken encoding name
                - "cl100k_base": GPT-4, GPT-3.5, text-embedding-3-*
                - "p50k_base": GPT-3, codex
                - "r50k_base": GPT-3 (legacy)
        """
        self.encoding_name = encoding_name
        self._encoding = None
    
    def _get_encoding(self):
        """Lazy load encoding to avoid import errors if not installed"""
        if self._encoding is None:
            try:
                import tiktoken
                self._encoding = tiktoken.get_encoding(self.encoding_name)
            except ImportError:
                raise ImportError(
                    "tiktoken is required for token counting. "
                    "Install it with: pip install tiktoken"
                )
            except Exception as e:
                logger.error(f"Failed to load tiktoken encoding {self.encoding_name}: {str(e)}")
                raise
        
        return self._encoding
    
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text.
        
        Args:
            text: Text to count tokens for
        
        Returns:
            Number of tokens
        """
        if not text:
            return 0
        
        try:
            encoding = self._get_encoding()
            tokens = encoding.encode(text)
            return len(tokens)
        except Exception as e:
            logger.error(f"Error counting tokens: {str(e)}")
            # Fallback: rough estimate (1 token ≈ 4 characters)
            return len(text) // 4
    
    def estimate_tokens(self, text: str) -> int:
        """
        Alias for count_tokens for backwards compatibility.
        """
        return self.count_tokens(text)

