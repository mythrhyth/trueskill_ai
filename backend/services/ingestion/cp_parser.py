import json
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
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


def _json_from_script(soup: BeautifulSoup, marker: str = '__NEXT_DATA__') -> Optional[dict]:
    element = soup.find('script', {'id': marker})
    if not element or not element.string:
        return None
    try:
        return json.loads(element.string)
    except json.JSONDecodeError:
        return None


def _extract_leetcode_data(soup: BeautifulSoup) -> Dict[str, Any]:
    data = {'total_solved': None, 'difficulty_breakdown': {}, 'ranking': None, 'languages_used': []}
    script_data = _json_from_script(soup)
    if script_data:
        profile = script_data.get('props', {}).get('pageProps', {}).get('profile', {})
        stat = profile.get('submitStats', {})
        data['total_solved'] = _parse_int(str(stat.get('acTotal', '')))
        if 'difficultyCount' in stat:
            breakdown = {
                'easy': _parse_int(str(stat['difficultyCount'].get('easy', 0))),
                'medium': _parse_int(str(stat['difficultyCount'].get('medium', 0))),
                'hard': _parse_int(str(stat['difficultyCount'].get('hard', 0))),
            }
            data['difficulty_breakdown'] = {k: v for k, v in breakdown.items() if v is not None}
        ranking = profile.get('ranking') or profile.get('profile', {}).get('ranking')
        data['ranking'] = _parse_int(str(ranking))
        lang_stats = profile.get('languageProblemCount', {})
        if isinstance(lang_stats, dict):
            data['languages_used'] = [lang for lang, count in lang_stats.items() if count]
    text = soup.get_text(separator=' ')
    if data['total_solved'] is None:
        total_match = re.search(r'(\d+[\,\d]*)\s+problems?\s+(solved|solved total)', text, re.I)
        if total_match:
            data['total_solved'] = _parse_int(total_match.group(1))
    return data

def parse_leetcode_profile(url: str) -> Dict[str, Any]:
    username = urlparse(url).path.strip('/').split('/')[-1]

    try:
        data = fetch_leetcode_graphql(username)

        user = data.get("data", {}).get("matchedUser", {})
        stats = user.get("submitStats", {}).get("acSubmissionNum", [])

        breakdown = {item["difficulty"].lower(): item["count"] for item in stats}

        total_solved = sum(breakdown.values())

        return {
            'id': f'leetcode:{username}',
            'source': 'competitive_programming',
            'type': 'leetcode_profile',

            'content': {
                'title': username,
                'description': 'LeetCode public profile',
                'raw_text': f"Solved {total_solved} problems"
            },

            'attributes': {
                'skills': [],
                'extra': {}
            },

            'metrics': {
                'total_solved': total_solved,
                'difficulty_breakdown': breakdown,
                'ranking': user.get("profile", {}).get("ranking")
            },

            'links': {
                'profile_url': url,
                'url': url
            },

            'timestamps': {
                'updated_at': datetime.now(timezone.utc).isoformat()
            },

            'extra': {
                'verification': {
                    'method': 'graphql',
                    'confidence': 0.9
                }
            },

            'ingestion_confidence': 0.9
        }

    except Exception:
        # fallback to scraping if needed
        return {
            'id': f'leetcode:{username}',
            'source': 'competitive_programming',
            'type': 'leetcode_profile',

            'content': {
                'title': username,
                'description': 'LeetCode profile (fallback)',
                'raw_text': ''
            },

            'metrics': {},

            'links': {'profile_url': url},

            'timestamps': {
                'updated_at': datetime.now(timezone.utc).isoformat()
            },

            'extra': {
                'verification': {
                    'method': 'fallback',
                    'confidence': 0.5
                }
            },

            'ingestion_confidence': 0.5
        }
# def parse_leetcode_profile(url: str) -> Dict[str, Any]:
#     soup = _fetch(url)
#     text = soup.get_text(separator=' ')
#     solved = _extract_leetcode_data(soup)
#     username = urlparse(url).path.strip('/').split('/')[0]
#     return {
#         'id': f'leetcode:{username}',
#         'source': 'competitive_programming',
#         'type': 'leetcode_profile',
#         'content': {
#             'title': username,
#             'description': 'LeetCode public profile',
#             'raw_text': text,
#         },
#         'attributes': {
#             'skills': [],
#             'extra': {},
#         },
#         'metrics': {
#             'total_solved': solved.get('total_solved'),
#             'difficulty_breakdown': solved.get('difficulty_breakdown'),
#             'ranking': solved.get('ranking'),
#             'languages_used': solved.get('languages_used'),
#         },
#         'links': {
#             'profile_url': url,
#             'url': url,
#         },
#         'timestamps': {
#             'updated_at': datetime.now(timezone.utc).isoformat()
#         },
#         'extra': {},
#         'ingestion_confidence': 0.8,
#     }

def parse_codeforces_profile(url: str) -> Dict[str, Any]:
    username = urlparse(url).path.strip('/').split('/')[-1]

    api_url = f"https://codeforces.com/api/user.info?handles={username}"

    response = requests.get(api_url, timeout=10)
    response.raise_for_status()

    data = response.json()["result"][0]

    return {
        'id': f'codeforces:{username}',
        'source': 'competitive_programming',
        'type': 'codeforces_profile',

        'content': {
            'title': username,
            'description': 'Codeforces profile',
            'raw_text': f"Rating: {data.get('rating')}"
        },

        'attributes': {
            'skills': [],
            'extra': {}
        },

        'metrics': {
            'contest_rating': data.get('rating'),
            'best_rank': data.get('maxRating'),
            'ranking': data.get('rank')
        },

        'links': {
            'profile_url': url
        },

        'timestamps': {
            'updated_at': datetime.now(timezone.utc).isoformat()
        },

        'extra': {
            'verification': {
                'method': 'official_api',
                'confidence': 0.95
            }
        },

        'ingestion_confidence': 0.95
    }
# def parse_codeforces_profile(url: str) -> Dict[str, Any]:
#     soup = _fetch(url)
#     text = soup.get_text(separator=' ')
#     username = urlparse(url).path.strip('/').split('/')[-1]
#     rating = None
#     max_rating = None
#     rank = None
#     solved = None
#     for li in soup.select('div.info > ul > li'):
#         text_line = li.get_text(separator=' ').strip()
#         if 'rating' in text_line.lower():
#             rating = _parse_int(text_line)
#         if 'max rating' in text_line.lower():
#             max_rating = _parse_int(text_line)
#         if 'rank' in text_line.lower():
#             rank = text_line.split()[-1]
#     solved_match = re.search(r'Problems? solved.*?(\d+[\,\d]*)', text, re.I)
#     if solved_match:
#         solved = _parse_int(solved_match.group(1))
#     if rating is None:
#         rating_match = re.search(r'(?i)(?:rating|current rating)\s*[:\-]?\s*(\d+)', text)
#         if rating_match:
#             rating = _parse_int(rating_match.group(1))
#     return {
#         'id': f'codeforces:{username}',
#         'source': 'competitive_programming',
#         'type': 'codeforces_profile',
#         'content': {
#             'title': username,
#             'description': 'Codeforces user profile',
#             'raw_text': text,
#         },
#         'attributes': {
#             'skills': [],
#             'extra': {},
#         },
#         'metrics': {
#             'contest_rating': rating,
#             'best_rank': max_rating,
#             'ranking': rank if rank else None,
#             'total_solved': solved,
#         },
#         'links': {
#             'profile_url': url,
#             'url': url,
#         },
#         'timestamps': {
#             'updated_at': datetime.now(timezone.utc).isoformat()
#         },
#         'extra': {},
#         'ingestion_confidence': 0.85,
#     }


def parse_cp_profile(url: str) -> Dict[str, Any]:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    if 'leetcode.com' in host:
        return parse_leetcode_profile(url)
    if 'codeforces.com' in host:
        return parse_codeforces_profile(url)
    raise ValueError(f'Unsupported competitive programming profile URL: {url}')
