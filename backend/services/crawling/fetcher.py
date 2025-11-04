import requests
from typing import Dict


class RequestsFetcher:
    def __init__(self, timeout: int = 15):
        self.timeout = timeout
        self.headers = {
            "User-Agent": "GulpCrawler/1.0 (+https://example.com)"
        }

    def fetch(self, url: str) -> Dict:
        resp = requests.get(url, headers=self.headers, timeout=self.timeout, allow_redirects=True)
        content_type = resp.headers.get("Content-Type", "")
        text = resp.text if "text/html" in content_type or content_type.startswith("text/") else ""
        return {
            "status": resp.status_code,
            "headers": dict(resp.headers),
            "content": text,
            "final_url": str(resp.url),
        }


