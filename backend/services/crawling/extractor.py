from bs4 import BeautifulSoup
from services.crawling.base import ContentExtractor, CrawlResult

try:
    from readability import Document  # readability-lxml
except Exception:
    Document = None


class ReadabilityExtractor(ContentExtractor):
    def extract(self, url: str, html: str) -> CrawlResult:
        try:
            text = ""
            page_title = None
            if Document is not None:
                doc = Document(html)
                # Short title is typically cleaner than raw <title>
                page_title = doc.short_title()
                cleaned_html = doc.summary(html_partial=True)
                soup = BeautifulSoup(cleaned_html, "lxml")
                text = soup.get_text("\n", strip=True)
            else:
                soup = BeautifulSoup(html, "lxml")
                # Try to drop script/style
                for tag in soup(["script", "style", "noscript"]):
                    tag.decompose()
                # Title fallback
                t = soup.title.string if soup.title and soup.title.string else None
                page_title = t.strip() if t else None
                text = soup.get_text("\n", strip=True)

            metadata = {}
            if page_title:
                metadata["title"] = page_title

            # canonical_url is determined by fetcher final_url; leave None here
            return CrawlResult(True, url=url, canonical_url=None, text=text, metadata=metadata)
        except Exception as e:
            return CrawlResult(False, url=url, text="", metadata={}, error=str(e))


