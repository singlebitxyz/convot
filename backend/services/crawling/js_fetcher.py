from typing import Dict


class PlaywrightFetcher:
    def __init__(self, timeout_ms: int = 20000):
        self.timeout_ms = timeout_ms

    def fetch(self, url: str) -> Dict:
        try:
            from playwright.sync_api import sync_playwright
        except Exception as e:
            raise RuntimeError(
                "Playwright is not installed. Install with `pip install playwright` and run `playwright install`."
            ) from e

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            # Use a realistic desktop user-agent for Next.js sites
            ua = (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
            context = browser.new_context(user_agent=ua, viewport={"width": 1366, "height": 900})
            page = context.new_page()
            page.set_default_timeout(self.timeout_ms)
            try:
                # Step 1: initial load
                page.goto(url, wait_until="domcontentloaded")
                # Step 2: wait for network to be idle (hydration, data fetching)
                page.wait_for_load_state("networkidle")
                # Step 3: ensure body is visible
                page.wait_for_selector("body", state="visible")
                # Small post-hydration delay for late scripts/components
                page.wait_for_timeout(1200)
                # Optionally scroll to trigger lazy content
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(400)
                content = page.content()
                body_text = page.evaluate("document.body.innerText") or ""
                final_url = page.url
            finally:
                browser.close()

            headers = {"Content-Type": "text/html; charset=utf-8"}
            return {
                "status": 200,
                "headers": headers,
                "content": content,
                "body_text": body_text,
                "final_url": final_url,
            }


