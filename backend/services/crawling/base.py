from abc import ABC, abstractmethod
from typing import Optional, Dict


class CrawlResult:
    def __init__(self, success: bool, url: str, canonical_url: Optional[str] = None, text: str = "", metadata: Optional[Dict] = None, error: Optional[str] = None):
        self.success = success
        self.url = url
        self.canonical_url = canonical_url or url
        self.text = text
        self.metadata = metadata or {}
        self.error = error


class ContentExtractor(ABC):
    @abstractmethod
    def extract(self, url: str, html: str) -> CrawlResult:
        raise NotImplementedError


class HttpFetcher(ABC):
    @abstractmethod
    def fetch(self, url: str) -> Dict:
        """Return dict with: {status, headers, content(str), final_url}"""
        raise NotImplementedError


class RobotsPolicy(ABC):
    @abstractmethod
    def allowed(self, url: str, user_agent: str = "*") -> bool:
        raise NotImplementedError


