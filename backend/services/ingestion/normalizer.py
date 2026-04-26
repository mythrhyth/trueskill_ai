import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Union

from schema.user_schema import Attributes, Content, Item, Links, Metrics, Timestamps, UserSchema


def _to_int(value: Any) -> Optional[int]:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        cleaned = re.sub(r'[^0-9]', '', value)
        return int(cleaned) if cleaned else None
    return None


def _normalize_string(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        return value.strip()
    return str(value)


def _normalize_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [item.strip() for item in re.split(r'[;,\n]+', value) if item.strip()]
    return [value]


def _normalize_dict(value: Any) -> Dict[str, Any]:
    if isinstance(value, dict):
        return value
    return {}


def normalize_item(raw: Dict[str, Any]) -> Item:
    content = Content(**_normalize_dict(raw.get('content')))
    attributes_dict = raw.get('attributes', {}) or {}
    attributes = Attributes(**{
        'tech_stack': _normalize_list(attributes_dict.get('tech_stack')),
        'tags': _normalize_list(attributes_dict.get('tags')),
        'skills': _normalize_list(attributes_dict.get('skills')),
        'projects': attributes_dict.get('projects') or [],
        'skills_covered': _normalize_list(attributes_dict.get('skills_covered')),
        'extra': _normalize_dict(attributes_dict.get('extra')),
    })
    metrics_raw = raw.get('metrics', {}) or {}
    metrics = Metrics(**{
        'stars': _to_int(metrics_raw.get('stars')),
        'forks': _to_int(metrics_raw.get('forks')),
        'watchers': _to_int(metrics_raw.get('watchers')),
        'commits': _to_int(metrics_raw.get('commits')),
        'contributors': _to_int(metrics_raw.get('contributors')),
        'languages': metrics_raw.get('languages') if isinstance(metrics_raw.get('languages'), dict) else None,
        'issues': _to_int(metrics_raw.get('issues')),
        'pull_requests': _to_int(metrics_raw.get('pull_requests')),
        'repo_size_kb': _to_int(metrics_raw.get('repo_size_kb')),
        'pull_requests_opened': _to_int(metrics_raw.get('pull_requests_opened')),
        'pull_requests_merged': _to_int(metrics_raw.get('pull_requests_merged')),
        'issues_opened': _to_int(metrics_raw.get('issues_opened')),
        'issues_closed': _to_int(metrics_raw.get('issues_closed')),
        'lines_added': _to_int(metrics_raw.get('lines_added')),
        'lines_deleted': _to_int(metrics_raw.get('lines_deleted')),
        'review_comments': _to_int(metrics_raw.get('review_comments')),
        'acceptance_rate': metrics_raw.get('acceptance_rate'),
        'total_solved': _to_int(metrics_raw.get('total_solved')),
        'difficulty_breakdown': metrics_raw.get('difficulty_breakdown') if isinstance(metrics_raw.get('difficulty_breakdown'), dict) else None,
        'contest_rating': _to_int(metrics_raw.get('contest_rating')),
        'ranking': _to_int(metrics_raw.get('ranking')),
        'streak_days': _to_int(metrics_raw.get('streak_days')),
        'languages_used': _normalize_list(metrics_raw.get('languages_used')),
        'competitions': _to_int(metrics_raw.get('competitions')),
        'best_rank': _to_int(metrics_raw.get('best_rank')),
        'medals': metrics_raw.get('medals') if isinstance(metrics_raw.get('medals'), dict) else None,
        'notebooks': _to_int(metrics_raw.get('notebooks')),
        'datasets': _to_int(metrics_raw.get('datasets')),
        'followers': _to_int(metrics_raw.get('followers')),
        'citations': _to_int(metrics_raw.get('citations')),
        'authors_count': _to_int(metrics_raw.get('authors_count')),
        'published': metrics_raw.get('published'),
        'ocr_confidence': metrics_raw.get('ocr_confidence'),
        'classification_confidence': metrics_raw.get('classification_confidence'),
        'extra': _normalize_dict(metrics_raw.get('extra')),
    })
    links_raw = raw.get('links', {}) or {}
    links = Links(**{
        'repo_url': _normalize_string(links_raw.get('repo_url')),
        'profile_url': _normalize_string(links_raw.get('profile_url')),
        'paper_url': _normalize_string(links_raw.get('paper_url')),
        'url': _normalize_string(links_raw.get('url')),
        'extra': _normalize_dict(links_raw.get('extra')),
    })
    timestamps_raw = raw.get('timestamps', {}) or {}
    timestamps = Timestamps(**{
        'created_at': _normalize_string(timestamps_raw.get('created_at')),
        'updated_at': _normalize_string(timestamps_raw.get('updated_at')),
        'uploaded_at': _normalize_string(timestamps_raw.get('uploaded_at')),
    })
    item_id = raw.get('id') or str(uuid.uuid4())
    if not raw.get('source') or not raw.get('type'):
        raise ValueError('A normalized item requires source and type')
    return Item(
        id=item_id,
        source=_normalize_string(raw['source']) or 'unknown',
        type=_normalize_string(raw['type']) or 'unknown',
        content=content,
        attributes=attributes,
        metrics=metrics,
        links=links,
        timestamps=timestamps,
        extra=_normalize_dict(raw.get('extra')),
        ingestion_confidence=float(raw.get('ingestion_confidence', 1.0)),
    )


def normalize_user_schema(user_id: str, items: Iterable[Union[Dict[str, Any], Item]], timestamp: Optional[str] = None) -> UserSchema:
    normalized_items = [normalize_item(item if isinstance(item, dict) else item.model_dump()) for item in items]
    return UserSchema(
        user_id=user_id,
        timestamp=timestamp or datetime.now(timezone.utc).isoformat(),
        items=normalized_items,
    )
