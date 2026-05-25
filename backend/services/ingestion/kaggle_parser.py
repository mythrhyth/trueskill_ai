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


def _parse_int(value: Optional[str]) -> Optional[int]:
    if value is None:
        return None
    cleaned = re.sub(r'[^0-9]', '', value)
    return int(cleaned) if cleaned else None


def _extract_count(text: str, label: str) -> Optional[int]:
    match = re.search(rf'([0-9,]+)\s*{label}', text, re.I)
    return _parse_int(match.group(1)) if match else None


def _extract_medals(text: str) -> Dict[str, int]:
    medals = {}
    for medal in ['gold', 'silver', 'bronze']:
        match = re.search(rf'({medal})\s*([0-9,]+)', text, re.I)
        if match:
            medals[medal] = _parse_int(match.group(2))
    return medals


def parse_kaggle_profile(url: str) -> Dict[str, Any]:
    soup = _fetch(url)
    text = soup.get_text(separator=' ')
    username = urlparse(url).path.strip('/').split('/')[-1]
    return {
        'id': f'kaggle:{username}',
        'source': 'kaggle',
        'type': 'kaggle_profile',
        'content': {
            'title': username,
            'description': 'Kaggle user profile',
            'raw_text': text,
        },
        'attributes': {
            'skills': [],
            'extra': {},
        },
        'metrics': {
            'competitions': _extract_count(text, 'Competitions|competitions'),
            'notebooks': _extract_count(text, 'Notebooks|notebooks'),
            'datasets': _extract_count(text, 'Datasets|datasets'),
            'followers': _extract_count(text, 'Followers|followers'),
            'best_rank': _extract_count(text, 'Best Rank|best rank|Rank|rank'),
            'medals': _extract_medals(text),
        },
        'links': {
            'profile_url': url,
            'url': url,
        },
        'timestamps': {
            'updated_at': datetime.now(timezone.utc).isoformat()
        },
        'extra': {},
        'ingestion_confidence': 0.75,
    }


def parse_kaggle(url: str) -> Dict[str, Any]:
    return parse_kaggle_profile(url)
