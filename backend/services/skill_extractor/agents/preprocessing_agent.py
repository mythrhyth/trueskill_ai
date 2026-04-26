"""Preprocessing Agent - Cleans raw data and text."""

import re
import logging
import html
import unicodedata
from bs4 import BeautifulSoup
from langdetect import detect, DetectorFactory
from .base_agent import BaseAgent
from backend.utils import llm_service

# Set seed for consistent language detection
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)


class PreprocessingAgent(BaseAgent):
    """Cleans and prepares raw data for skill extraction."""
    
    def __init__(self):
        super().__init__("PreprocessingAgent")
    
    def run(self, data):
        """
        Clean raw input data.
        
        Expected input:
        {
            "user_id": str,
            "data": [{"content": str, ...}, ...]
        }
        
        Returns:
        {
            "user_id": str,
            "clean_text": str,
            "original_data": list
        }
        """
        if not self.validate_input(data, ["user_id", "data"]):
            return {"error": "Invalid input"}
        
        user_id = data["user_id"]
        combined_text = ""
        
        # Combine all content from data items
        for item in data.get("data", []):
            content = item.get("content", "")
            if content:
                combined_text += " " + str(content)
        
        # Detect language and handle non-English content
        language_info = self._detect_language(combined_text)
        
        # Clean text
        cleaned_text = self._clean_text(combined_text)

        if not cleaned_text.strip() and combined_text.strip():
            try:
                prompt = (
                    "Clean and normalize the following raw text. Remove noise, fix spacing, "
                    "and return a readable single paragraph with only the cleaned text.\n\n"
                    f"{combined_text}"
                )
                cleaned_text = llm_service.run_agent_fallback(prompt).strip()
            except Exception as e:
                self.logger.warning(f"LLM preprocessing fallback failed: {e}")
        
        self.logger.info(f"Preprocessed {len(data.get('data', []))} items, {len(cleaned_text)} chars")
        
        return {
            "user_id": user_id,
            "clean_text": cleaned_text,
            "original_data": data.get("data", []),
            "language_info": language_info
        }
    
    def _clean_text(self, text: str) -> str:
        """Apply comprehensive cleaning transformations."""
        # Normalize Unicode characters
        text = unicodedata.normalize('NFKC', str(text))
        
        # Decode HTML entities
        text = html.unescape(text)
        
        # Strip HTML tags
        text = self._strip_html(text)
        
        # Normalize encoding issues
        text = self._normalize_encoding(text)
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs, emails, phone numbers
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', ' ', text)
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', ' ', text)
        text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', ' ', text)
        
        # Remove special characters but keep spaces and basic punctuation
        text = re.sub(r"[^a-z0-9\s\.\-_]", " ", text)
        
        # Replace multiple spaces with single space
        text = re.sub(r"\s+", " ", text).strip()
        
        return text
    
    def _strip_html(self, text: str) -> str:
        """Strip HTML tags and extract meaningful text."""
        try:
            # Parse HTML and extract text
            soup = BeautifulSoup(text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text content
            text = soup.get_text()
            
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
        except Exception as e:
            # Fallback to regex-based HTML stripping if BeautifulSoup fails
            text = re.sub(r'<[^>]+>', ' ', text)
            self.logger.warning(f"HTML stripping fallback used: {e}")
        
        return text
    
    def _normalize_encoding(self, text: str) -> str:
        """Normalize common encoding issues."""
        # Fix common encoding problems
        encoding_fixes = {
            'â€™': "'",      # Apostrophe
            'â€œ': '"',      # Opening quote
            'â€': '"',       # Closing quote
            'â€"': '-',      # En dash
            'â€"': '—',      # Em dash
            'Â': '',         # Non-breaking space artifact
            'â€¦': '...',    # Ellipsis
        }
        
        for wrong, correct in encoding_fixes.items():
            text = text.replace(wrong, correct)
        
        return text
    
    def _detect_language(self, text: str) -> dict:
        """Detect language and provide routing information."""
        language_info = {
            "detected_language": "unknown",
            "confidence": 0.0,
            "is_english": True,
            "requires_translation": False,
            "processing_notes": []
        }
        
        if not text or len(text.strip()) < 10:
            language_info["processing_notes"].append("Text too short for reliable language detection")
            return language_info
        
        try:
            # Detect language
            detected = detect(text)
            language_info["detected_language"] = detected
            language_info["is_english"] = detected == "en"
            language_info["requires_translation"] = detected != "en"
            
            # Add processing notes based on language
            if detected == "en":
                language_info["confidence"] = 0.9
                language_info["processing_notes"].append("English text detected - normal processing")
            elif detected in ["es", "fr", "de", "it", "pt", "nl"]:  # Major European languages
                language_info["confidence"] = 0.7
                language_info["processing_notes"].append(f"Romance/Germanic language detected ({detected}) - may have English tech terms")
            elif detected in ["zh", "ja", "ko", "ar", "hi", "th"]:  # Non-Latin scripts
                language_info["confidence"] = 0.8
                language_info["processing_notes"].append(f"Non-Latin script language detected ({detected}) - translation recommended")
            else:
                language_info["confidence"] = 0.6
                language_info["processing_notes"].append(f"Other language detected ({detected}) - processing may be limited")
            
            self.logger.info(f"Language detected: {detected} (confidence: {language_info['confidence']})")
            
        except Exception as e:
            language_info["processing_notes"].append(f"Language detection failed: {str(e)}")
            self.logger.warning(f"Language detection failed: {e}")
        
        return language_info


# Singleton instance
_preprocessing_agent = PreprocessingAgent()


def run(data):
    """Execute preprocessing agent."""
    return _preprocessing_agent.run(data)
