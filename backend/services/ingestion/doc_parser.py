import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


def _safe_import(name: str):
    try:
        return __import__(name)
    except ImportError:
        return None


PIL = _safe_import('PIL')
pytesseract = _safe_import('pytesseract')
PyPDF2 = _safe_import('PyPDF2')
python_docx = _safe_import('docx')


def _fetch_text_from_url(url: str) -> str:
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    if 'text/html' in response.headers.get('Content-Type', ''):
        soup = BeautifulSoup(response.text, 'lxml')
        return soup.get_text(separator=' ')
    return response.text


def _parse_plain_text(path: str) -> str:
    with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
        return fh.read()


def _extract_text_pdf(path: str) -> str:
    if not PyPDF2:
        raise ImportError('PyPDF2 is required for PDF parsing. Install with pip install PyPDF2')
    reader = PyPDF2.PdfReader(path)
    return '\n'.join(page.extract_text() or '' for page in reader.pages)


def _extract_text_docx(path: str) -> str:
    if not python_docx:
        raise ImportError('python-docx is required for DOCX parsing. Install with pip install python-docx')
    document = python_docx.Document(path)
    return '\n'.join(paragraph.text for paragraph in document.paragraphs)


def _extract_text_image(path: str) -> str:
    if not PIL or not pytesseract:
        raise ImportError('Pillow and pytesseract are required for image OCR. Install with pip install pillow pytesseract')
    image = PIL.Image.open(path)
    return pytesseract.image_to_string(image)


def parse_document(path_or_url: str) -> Dict[str, Any]:
    parsed = urlparse(path_or_url)
    if parsed.scheme in {'http', 'https'}:
        text = _fetch_text_from_url(path_or_url)
        source = 'remote_document'
        identifier = path_or_url
    else:
        ext = os.path.splitext(path_or_url)[1].lower()
        if ext in {'.txt', '.md', '.csv', '.json', '.log'}:
            text = _parse_plain_text(path_or_url)
        elif ext == '.pdf':
            text = _extract_text_pdf(path_or_url)
        elif ext == '.docx':
            text = _extract_text_docx(path_or_url)
        elif ext in {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif'}:
            text = _extract_text_image(path_or_url)
        else:
            raise ValueError(f'Unsupported document extension: {ext}')
        source = 'document'
        identifier = path_or_url
    return {
        'id': f'document:{identifier}',
        'source': source,
        'type': 'document',
        'content': {
            'title': os.path.basename(path_or_url),
            'description': 'Parsed document text',
            'raw_text': text,
        },
        'attributes': {
            'extra': {},
        },
        'metrics': {},
        'links': {
            'url': path_or_url,
        },
        'timestamps': {
            'uploaded_at': datetime.now(timezone.utc).isoformat(),
        },
        'extra': {},
        'ingestion_confidence': 0.85,
    }
