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


def _extract_counter(soup: BeautifulSoup, selector: str) -> Optional[int]:
    node = soup.select_one(selector)
    if not node:
        return None
    return _parse_int(node.get_text())


def parse_github_repo(url: str) -> Dict[str, Any]:
    soup = _fetch(url)
    path = urlparse(url).path.strip('/')
    owner_repo = path.replace('/', ':')
    languages = {}
    for lang in soup.select('span[itemprop="programmingLanguage"]'):
        languages[lang.get_text(strip=True)] = None
    for language in soup.select('li.d-inline'):
        lang_name = language.find('span', class_='color-fg-default text-bold mr-1')
        percent = language.find('span', class_='color-fg-muted text-bold mr-1')
        if lang_name and percent:
            try:
                languages[lang_name.get_text(strip=True)] = int(percent.get_text(strip=True).replace('%', '').strip())
            except ValueError:
                languages[lang_name.get_text(strip=True)] = None
    return {
        'id': f'github:{owner_repo}',
        'source': 'github',
        'type': 'github_repo',
        'content': {
            'title': owner_repo,
            'description': 'GitHub repository metadata',
            'raw_text': soup.get_text(separator=' '),
        },
        'attributes': {
            'tech_stack': [k for k in languages.keys() if k],
            'extra': {},
        },
        'metrics': {
            'stars': _extract_counter(soup, 'a[href$="/stargazers"]'),
            'forks': _extract_counter(soup, 'a[href$="/network/members"]'),
            'watchers': _extract_counter(soup, 'a[href$="/watchers"]'),
            'issues': _extract_counter(soup, 'a[href$="/issues"]'),
            'pull_requests': _extract_counter(soup, 'a[href$="/pulls"]'),
            'languages': {k: v for k, v in languages.items() if v is not None} or None,
        },
        'links': {
            'repo_url': url,
            'url': url,
        },
        'timestamps': {
            'updated_at': datetime.now(timezone.utc).isoformat()
        },
        'extra': {},
        'ingestion_confidence': 0.8,
    }


def parse_github_user(url: str) -> Dict[str, Any]:
    soup = _fetch(url)
    username = urlparse(url).path.strip('/')
    followers = _extract_counter(soup, f'a[href="/{username}?tab=followers"]')
    stars = None
    star_node = soup.select_one(f'a[href="/{username}?tab=stars"]')
    if star_node:
        stars = _parse_int(star_node.get_text())

    # Fetch and parse repositories
    repos_url = f'https://github.com/{username}?tab=repositories'
    repos_soup = _fetch(repos_url)
    projects = []

    # Parse repository list
    repo_items = repos_soup.select('div[data-hpc]')  # GitHub uses this for repo items
    for repo_item in repo_items[:10]:  # Limit to first 10 repos for performance
        repo_link = repo_item.select_one('a[itemprop="name codeRepository"]')
        if not repo_link:
            continue
        repo_name = repo_link.get_text(strip=True)
        repo_url = 'https://github.com' + repo_link['href']

        # Description
        desc_elem = repo_item.select_one('p[itemprop="description"]')
        description = desc_elem.get_text(strip=True) if desc_elem else None

        # Language
        lang_elem = repo_item.select_one('span[itemprop="programmingLanguage"]')
        language = lang_elem.get_text(strip=True) if lang_elem else None

        # Stars
        stars_elem = repo_item.select_one('a[href$="/stargazers"]')
        repo_stars = _parse_int(stars_elem.get_text()) if stars_elem else None

        # Forks
        forks_elem = repo_item.select_one('a[href$="/network/members"]')
        forks = _parse_int(forks_elem.get_text()) if forks_elem else None

        # Updated time
        time_elem = repo_item.select_one('relative-time')
        updated_at = time_elem['datetime'] if time_elem else None

        projects.append({
            'name': repo_name,
            'url': repo_url,
            'description': description,
            'language': language,
            'stars': repo_stars,
            'forks': forks,
            'updated_at': updated_at,
        })

    return {
        'id': f'github_user:{username}',
        'source': 'github',
        'type': 'github_profile',
        'content': {
            'title': username,
            'description': 'GitHub user profile',
            'raw_text': soup.get_text(separator=' '),
        },
        'attributes': {
            'projects': projects,
            'extra': {},
        },
        'metrics': {
            'followers': followers,
            'stars': stars,
        },
        'links': {
            'profile_url': url,
            'url': url,
        },
        'timestamps': {
            'updated_at': datetime.now(timezone.utc).isoformat()
        },
        'extra': {},
        'ingestion_confidence': 0.8,
    }


def parse_github(url: str) -> Dict[str, Any]:
    parsed = urlparse(url)
    path_parts = [part for part in parsed.path.split('/') if part]
    if len(path_parts) >= 2:
        return parse_github_repo(url)
    return parse_github_user(url)
