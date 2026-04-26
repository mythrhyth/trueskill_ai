import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional


def _safe_import(name: str):
    try:
        return __import__(name)
    except ImportError:
        return None


PyPDF2 = _safe_import('PyPDF2')
python_docx = _safe_import('docx')


def _parse_phone(text: str) -> Optional[str]:
    match = re.search(r'\+?\d[\d \-()]{6,}\d', text)
    return match.group(0).strip() if match else None


def _parse_email(text: str) -> Optional[str]:
    match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    return match.group(0).strip() if match else None


def extract_text_from_pdf(path: str) -> str:
    if not PyPDF2:
        raise ImportError('PyPDF2 is required to parse PDF resumes. Install with pip install PyPDF2')
    reader = PyPDF2.PdfReader(path)
    lines = []
    for page in reader.pages:
        text = page.extract_text() or ''
        lines.append(text)
    return '\n'.join(lines)


def extract_text_from_docx(path: str) -> str:
    if not python_docx:
        raise ImportError('python-docx is required to parse DOCX resumes. Install with pip install python-docx')
    document = python_docx.Document(path)
    return '\n'.join(paragraph.text for paragraph in document.paragraphs)


def extract_resume_text(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(path)
    if ext == '.docx':
        return extract_text_from_docx(path)
    if ext in {'.txt', '.md'}:
        with open(path, 'r', encoding='utf-8', errors='ignore') as fh:
            return fh.read()
    raise ValueError(f'Unsupported resume file format: {ext}')


def parse_resume(path: str) -> Dict[str, Any]:
    text = extract_resume_text(path)
    email = _parse_email(text)
    phone = _parse_phone(text)
    skills = []
    keywords = [
        'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'sql', 'react', 'django',
        'flask', 'tensorflow', 'pytorch', 'aws', 'azure', 'docker', 'kubernetes', 'linux'
    ]
    lower_text = text.lower()
    for keyword in keywords:
        if keyword in lower_text:
            skills.append(keyword)
    return {
        'id': f'resume:{os.path.basename(path)}',
        'source': 'resume',
        'type': 'resume_document',
        'content': {
            'title': os.path.basename(path),
            'description': 'Resume extracted text',
            'raw_text': text,
        },
        'attributes': {
            'skills': sorted(set(skills)),
            'extra': {'email': email, 'phone': phone},
        },
        'metrics': {},
        'links': {'url': path},
        'timestamps': {'uploaded_at': datetime.now(timezone.utc).isoformat()},
        'extra': {},
        'ingestion_confidence': 0.9,
    }
