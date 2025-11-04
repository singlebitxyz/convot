from typing import Optional, Dict
import hashlib
import logging

from services.crawling.base import CrawlResult
from services.crawling.robots import SimpleRobots
from services.crawling.fetcher import RequestsFetcher
from services.crawling.extractor import ReadabilityExtractor
from services.crawling.url_utils import normalize_url
from services.crawling.js_fetcher import PlaywrightFetcher
from config.settings import settings

logger = logging.getLogger(__name__)


class CrawlerService:
    def __init__(self, max_depth: int = None, max_pages: int = None):
        self.max_depth = max_depth if max_depth is not None else settings.crawler_max_depth
        self.max_pages = max_pages if max_pages is not None else settings.crawler_max_pages
        self.fetcher = RequestsFetcher()
        self.js_fetcher = PlaywrightFetcher()
        self.extractor = ReadabilityExtractor()

    def crawl_single(self, url: str) -> CrawlResult:
        robots = SimpleRobots(url)
        if not robots.allowed(url):
            return CrawlResult(False, url=url, error="Blocked by robots.txt")

        resp = self.fetcher.fetch(url)
        if resp["status"] >= 400:
            return CrawlResult(False, url=url, error=f"HTTP {resp['status']}")

        html = resp.get("content", "")
        if not html.strip():
            # Try JS render if enabled
            if settings.crawler_render_js:
                try:
                    logger.info(f"Attempting JS render fetch for {url}")
                    js_resp = self.js_fetcher.fetch(url)
                    html = js_resp.get("content", "")
                    if not html.strip():
                        return CrawlResult(False, url=url, error="Empty or non-HTML content (even after JS)")
                    resp = js_resp
                except Exception as e:
                    logger.warning(f"JS render failed: {e}")
                    return CrawlResult(False, url=url, error="Empty or non-HTML content")

        final_url = resp.get("final_url", url)
        result = self.extractor.extract(final_url, html)
        if not result.success:
            return result

        # If extracted content is too small, attempt JS-rendered retry before failing
        if len(result.text) < settings.crawler_min_content_chars and settings.crawler_render_js:
            try:
                logger.info(f"Content below threshold ({len(result.text)} chars). Retrying with JS render for {url}")
                js_resp = self.js_fetcher.fetch(url)
                js_html = js_resp.get("content", "")
                js_text = js_resp.get("body_text", "")
                if js_html.strip():
                    retry_result = self.extractor.extract(js_resp.get("final_url", url), js_html)
                    if retry_result.success and len(retry_result.text) >= len(result.text):
                        result = retry_result
                        resp = js_resp
                        final_url = js_resp.get("final_url", url)
                # If extractor still yields little, but body_text is substantial, use it directly
                if len(result.text) < settings.crawler_min_content_chars and len(js_text) > len(result.text):
                    logger.info(
                        f"Using JS body_text fallback (len={len(js_text)}) for {url}"
                    )
                    result = CrawlResult(True, url=js_resp.get("final_url", url), text=js_text, metadata={})
                    resp = js_resp
                    final_url = js_resp.get("final_url", url)
                else:
                    if not js_html.strip() and not js_text.strip():
                        logger.warning("JS render returned empty content on retry")
            except Exception as e:
                logger.warning(f"JS render retry failed: {e}")

        # Ensure canonical_url is set to final_url
        result.canonical_url = final_url

        # Build metadata
        headers = resp.get("headers", {})
        etag = headers.get("ETag") or headers.get("Etag")
        last_modified = headers.get("Last-Modified")
        checksum = hashlib.sha256(result.text.encode("utf-8")).hexdigest()
        result.metadata.update({
            "etag": etag,
            "last_modified": last_modified,
            "page_checksum": checksum,
        })
        # Minimum content threshold after possible JS retry
        if len(result.text) < settings.crawler_min_content_chars:
            return CrawlResult(False, url=url, error=f"Extracted content too small ({len(result.text)} chars)")

        return result


