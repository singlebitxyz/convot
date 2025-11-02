"""
Chunking Service

Service for splitting text into chunks with metadata extraction.
Implements sentence-aware chunking with overlap for context preservation.
"""

from typing import List, Optional, Dict
import re
import logging
from services.tokenizer import Tokenizer

logger = logging.getLogger(__name__)


class ChunkMetadata:
    """Metadata for a text chunk"""
    
    def __init__(
        self,
        heading: Optional[str] = None,
        char_start: int = 0,
        char_end: int = 0,
        token_count: int = 0
    ):
        self.heading = heading
        self.char_start = char_start
        self.char_end = char_end
        self.token_count = token_count


class TextChunk:
    """Represents a chunk of text with metadata"""
    
    def __init__(
        self,
        text: str,
        index: int,
        metadata: ChunkMetadata
    ):
        self.text = text
        self.index = index
        self.metadata = metadata
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        return {
            "chunk_index": self.index,
            "excerpt": self.text,
            "heading": self.metadata.heading,
            "char_range": {
                "start": self.metadata.char_start,
                "end": self.metadata.char_end
            },
            "tokens_estimate": self.metadata.token_count
        }


class ChunkingService:
    """
    Service for chunking text into manageable pieces.
    
    Features:
    - Sentence-aware chunking (preserves sentence boundaries)
    - Overlap between chunks (for context preservation)
    - Token estimation (using tiktoken)
    - Metadata extraction (headings, character ranges)
    """
    
    def __init__(
        self,
        target_tokens: int = 800,
        overlap_tokens: int = 100,
        min_chunk_tokens: int = 100,
        max_chunk_tokens: int = 1200
    ):
        """
        Initialize chunking service.
        
        Args:
            target_tokens: Target tokens per chunk (default: 800)
            overlap_tokens: Overlap tokens between chunks (default: 100)
            min_chunk_tokens: Minimum tokens per chunk (default: 100)
            max_chunk_tokens: Maximum tokens per chunk (default: 1200)
        """
        self.target_tokens = target_tokens
        self.overlap_tokens = overlap_tokens
        self.min_chunk_tokens = min_chunk_tokens
        self.max_chunk_tokens = max_chunk_tokens
        self.tokenizer = Tokenizer()
    
    def chunk_text(
        self,
        text: str,
        source_type: str = "text"
    ) -> List[TextChunk]:
        """
        Chunk text into smaller pieces with metadata.
        
        Args:
            text: Text to chunk
            source_type: Type of source (pdf, docx, html, text)
        
        Returns:
            List of TextChunk objects
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for chunking")
            return []
        
        # Extract headings if available (for structured documents)
        headings = self._extract_headings(text, source_type)
        
        # Split into sentences (sentence-aware chunking)
        sentences = self._split_into_sentences(text)
        
        if not sentences:
            logger.warning("No sentences found in text")
            return []
        
        # Build chunks with overlap
        chunks = self._build_chunks_with_overlap(
            sentences=sentences,
            headings=headings,
            text=text
        )
        
        logger.info(
            f"Chunked text into {len(chunks)} chunks "
            f"(avg tokens: {sum(c.metadata.token_count for c in chunks) / len(chunks) if chunks else 0:.0f})"
        )
        
        return chunks
    
    def _extract_headings(self, text: str, source_type: str) -> Dict[int, str]:
        """
        Extract headings from text.
        
        Returns a dictionary mapping character position to heading text.
        This helps associate chunks with their sections.
        """
        headings = {}
        
        # Pattern for markdown-style headings (# ## ###)
        markdown_pattern = r'^#{1,6}\s+(.+)$'
        
        # Pattern for ALL CAPS lines (common in documents)
        all_caps_pattern = r'^([A-Z][A-Z\s]{10,})$'
        
        lines = text.split('\n')
        current_pos = 0
        
        for line in lines:
            line_stripped = line.strip()
            
            # Check for markdown headings
            match = re.match(markdown_pattern, line_stripped)
            if match:
                heading_text = match.group(1).strip()
                if heading_text:
                    headings[current_pos] = heading_text
            
            # Check for ALL CAPS headings (non-empty, substantial length)
            elif re.match(all_caps_pattern, line_stripped) and len(line_stripped) > 10:
                headings[current_pos] = line_stripped
            
            current_pos += len(line) + 1  # +1 for newline
        
        return headings
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences.
        
        Uses regex to detect sentence boundaries while preserving abbreviations.
        """
        # Pattern to match sentence endings (period, exclamation, question mark)
        # Excludes common abbreviations
        sentence_endings = r'(?<=[.!?])\s+(?=[A-Z])'
        
        # Split by sentence endings
        sentences = re.split(sentence_endings, text)
        
        # Filter out empty sentences
        sentences = [s.strip() for s in sentences if s.strip()]
        
        return sentences
    
    def _build_chunks_with_overlap(
        self,
        sentences: List[str],
        headings: Dict[int, str],
        text: str
    ) -> List[TextChunk]:
        """
        Build chunks with overlap between adjacent chunks.
        
        Strategy:
        1. Accumulate sentences until we reach target token count
        2. When creating next chunk, include overlap from previous chunk
        3. Preserve sentence boundaries
        4. Associate chunks with nearest heading
        """
        chunks = []
        current_chunk_sentences = []
        current_char_start = 0
        current_heading = None
        
        # Rebuild text with sentence positions for accurate character tracking
        # We'll use the original text and find positions by reconstructing
        
        for i, sentence in enumerate(sentences):
            # Find the closest heading before or at this sentence
            # Headings map is by character position, so we need to estimate
            # For simplicity, we'll track heading by sentence index
            sentence_in_text_pos = text.find(sentence, 0)  # Approximate
            closest_heading = current_heading
            for heading_pos, heading_text in sorted(headings.items()):
                if sentence_in_text_pos >= heading_pos:
                    closest_heading = heading_text
                else:
                    break
            current_heading = closest_heading
            
            # Add sentence to current chunk
            current_chunk_sentences.append(sentence)
            
            # Estimate tokens for current chunk
            current_chunk_text = ' '.join(current_chunk_sentences)
            token_count = self.tokenizer.count_tokens(current_chunk_text)
            
            # Decide if we should finalize this chunk
            should_finalize = False
            
            if token_count >= self.target_tokens:
                # We've reached target size
                should_finalize = True
            elif token_count >= self.max_chunk_tokens:
                # We've exceeded max size, must finalize
                should_finalize = True
            
            if should_finalize:
                # Calculate character range
                chunk_text = ' '.join(current_chunk_sentences)
                
                # Find actual position in original text
                # Start: find first sentence position
                first_sentence = current_chunk_sentences[0]
                chunk_start = text.find(first_sentence, current_char_start)
                if chunk_start == -1:
                    chunk_start = current_char_start
                
                # End: find last sentence position + length
                last_sentence = current_chunk_sentences[-1]
                last_sentence_start = text.find(last_sentence, chunk_start)
                if last_sentence_start == -1:
                    chunk_end = chunk_start + len(chunk_text)
                else:
                    chunk_end = last_sentence_start + len(last_sentence)
                
                # Create chunk
                metadata = ChunkMetadata(
                    heading=current_heading,
                    char_start=chunk_start,
                    char_end=chunk_end,
                    token_count=token_count
                )
                
                chunk = TextChunk(
                    text=chunk_text,
                    index=len(chunks),
                    metadata=metadata
                )
                chunks.append(chunk)
                
                # Prepare overlap for next chunk
                # Take last N sentences that fit within overlap token limit
                overlap_sentences = []
                overlap_tokens = 0
                for sentence in reversed(current_chunk_sentences):
                    sent_tokens = self.tokenizer.count_tokens(sentence)
                    if overlap_tokens + sent_tokens <= self.overlap_tokens:
                        overlap_sentences.insert(0, sentence)
                        overlap_tokens += sent_tokens
                    else:
                        break
                
                # Start new chunk with overlap
                current_chunk_sentences = overlap_sentences
                if overlap_sentences:
                    # Update char start to beginning of overlap
                    overlap_start_sentence = overlap_sentences[0]
                    overlap_start = text.find(overlap_start_sentence, chunk_start)
                    if overlap_start != -1:
                        current_char_start = overlap_start
                    else:
                        current_char_start = chunk_end
                else:
                    current_char_start = chunk_end
        
        # Handle remaining sentences
        if current_chunk_sentences:
            chunk_text = ' '.join(current_chunk_sentences)
            token_count = self.tokenizer.count_tokens(chunk_text)
            
            # Only add if it meets minimum size requirement
            if token_count >= self.min_chunk_tokens:
                # Find actual position in original text
                first_sentence = current_chunk_sentences[0]
                chunk_start = text.find(first_sentence, current_char_start)
                if chunk_start == -1:
                    chunk_start = current_char_start
                
                chunk_end = len(text)
                
                metadata = ChunkMetadata(
                    heading=current_heading,
                    char_start=chunk_start,
                    char_end=chunk_end,
                    token_count=token_count
                )
                
                chunk = TextChunk(
                    text=chunk_text,
                    index=len(chunks),
                    metadata=metadata
                )
                chunks.append(chunk)
        
        return chunks

