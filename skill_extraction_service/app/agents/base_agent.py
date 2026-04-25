"""Base Agent class for all specialized agents in the Multi-Agent Intelligence Layer."""

from abc import ABC, abstractmethod
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Abstract base class for all agents in the Multi-Agent Intelligence Layer.
    
    Each agent:
    - Has a specific role
    - Operates independently
    - Contributes to shared output
    """
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"Agent:{name}")
    
    @abstractmethod
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's logic.
        
        Args:
            data: Input data dictionary
            
        Returns:
            Processed data dictionary with agent-specific output
        """
        pass
    
    def log_execution(self, input_keys: list, output_keys: list):
        """Log agent execution."""
        self.logger.info(f"Agent {self.name} - Input: {input_keys}, Output: {output_keys}")
    
    def validate_input(self, data: Dict[str, Any], required_keys: list) -> bool:
        """Validate required keys exist in input data."""
        for key in required_keys:
            if key not in data:
                self.logger.error(f"Missing required key: {key}")
                return False
        return True
