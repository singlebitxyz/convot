import urllib.robotparser as robotparser
from urllib.parse import urljoin, urlparse

from services.crawling.base import RobotsPolicy


class SimpleRobots(RobotsPolicy):
    def __init__(self, start_url: str):
        parsed = urlparse(start_url)
        robots_url = urljoin(f"{parsed.scheme}://{parsed.netloc}", "/robots.txt")
        self.rp = robotparser.RobotFileParser()
        try:
            self.rp.set_url(robots_url)
            self.rp.read()
        except Exception:
            # If robots can't be fetched, default allow
            self.rp = None

    def allowed(self, url: str, user_agent: str = "*") -> bool:
        if not self.rp:
            return True
        try:
            return self.rp.can_fetch(user_agent, url)
        except Exception:
            return True


