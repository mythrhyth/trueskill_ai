"""
Ingestion models for TrueSkill AI database.

These models store raw ingested data from various sources (GitHub, Kaggle, CP, etc.).
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base


class IngestionData(Base):
    """
    Stores raw ingested profile data from external sources.
    """
    __tablename__ = "ingestion_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    source = Column(String(50), nullable=False, index=True)  # 'github', 'kaggle', 'cp', etc.
    content = Column(Text, nullable=False)  # Stored as JSON string or raw text
    url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<IngestionData(id={self.id}, user_id='{self.user_id}', source='{self.source}')>"
