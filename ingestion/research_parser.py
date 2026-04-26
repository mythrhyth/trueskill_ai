import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
}


def _fetch(url: str) -> BeautifulSoup:
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return BeautifulSoup(response.text, 'lxml')


def _clean_text(value: Optional[str]) -> Optional[str]:
    return value.strip() if value else None


def parse_arxiv(url: str, soup: BeautifulSoup) -> Dict[str, Any]:
    title_node = soup.find('h1', class_='title')
    title = title_node.get_text(strip=True).replace('Title:', '') if title_node else None
    authors = [a.get_text(strip=True) for a in soup.select('div.authors a')]
    abstract_node = soup.find('blockquote', class_='abstract')
    abstract = abstract_node.get_text(strip=True).replace('Abstract:', '') if abstract_node else None
    date_node = soup.find('div', class_='dateline')
    date = date_node.get_text(strip=True) if date_node else None
    return {
        'id': f'research:arxiv:{urlparse(url).path.strip("/").split("/")[-1]}',
        'source': 'research',
        'type': 'article',
        'content': {
            'title': _clean_text(title),
            'description': _clean_text(abstract),
            'raw_text': soup.get_text(separator=' '),
        },
        'attributes': {
            'tags': [],
            'extra': {'authors': authors},
        },
        'metrics': {
            'authors_count': len(authors) if authors else None,
            'published': bool(date),
        },
        'links': {
            'paper_url': url,
            'url': url,
        },
        'timestamps': {
            'created_at': date,
            'updated_at': datetime.now(timezone.utc).isoformat(),
        },
        'extra': {},
        'ingestion_confidence': 0.8,
    }


def parse_research(url: str) -> Dict[str, Any]:
    soup = _fetch(url)
    parsed = urlparse(url)
    if 'arxiv.org' in parsed.netloc:
        return parse_arxiv(url, soup)
    title = soup.title.string.strip() if soup.title and soup.title.string else None
    abstract = None
    abstract_element = soup.find('meta', {'name': 'description'}) or soup.find('meta', {'property': 'og:description'})
    if abstract_element:
        abstract = abstract_element.get('content')
    authors = []
    author_meta = soup.find('meta', {'name': 'citation_author'})
    if author_meta:
        authors = [author_meta.get('content')]
    return {
        'id': f'research:{parsed.netloc}:{re.sub(r"[^a-zA-Z0-9]+", "-", title or parsed.path)[:50] if title else parsed.path}',
        'source': 'research',
        'type': 'article',
        'content': {
            'title': _clean_text(title),
            'description': _clean_text(abstract),
            'raw_text': soup.get_text(separator=' '),
        },
        'attributes': {
            'tags': [],
            'extra': {'authors': authors},
        },
        'metrics': {
            'authors_count': len(authors) if authors else None,
            'published': bool(abstract or title),
        },
        'links': {
            'paper_url': url,
            'url': url,
        },
        'timestamps': {
            'updated_at': datetime.now(timezone.utc).isoformat(),
        },
        'extra': {},
        'ingestion_confidence': 0.75,
    }
