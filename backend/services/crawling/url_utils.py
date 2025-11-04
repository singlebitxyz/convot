from urllib.parse import urlparse, urljoin, urlunparse


def normalize_url(base: str, href: str) -> str:
    if not href:
        return base
    joined = urljoin(base, href)
    parsed = urlparse(joined)
    # drop fragments, normalize scheme/host
    cleaned = parsed._replace(fragment="")
    # optional: enforce https if present
    return urlunparse(cleaned)


def same_domain(u1: str, u2: str) -> bool:
    p1 = urlparse(u1)
    p2 = urlparse(u2)
    return p1.netloc.lower() == p2.netloc.lower()


