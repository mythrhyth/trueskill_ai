# Multi-Agent Skill Extraction Core (CORE)

A sophisticated **Multi-Agent Intelligence Layer** for intelligent skill extraction, validation, and profiling.

## 🎯 Architecture Overview

The system uses 8 specialized, independent agents organized in a multi-stage pipeline:

```
Input Data (user content + metadata)
    ↓
[1] Preprocessing Agent → Cleans raw data
    ↓
[2] Normalization Agent → Standardizes terminology
    ↓
[3a] Metadata Agent ──┐
[3b] Extractor Agent ─┼→ Extract skills from multiple sources
    ↓
[4] Fusion Agent → Combine and deduplicate signals
    ↓
[6] Scoring Agent → Assign credibility scores
    ↓
Output: Structured Skill Profile
```

## 🤖 Agents

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| **Preprocessing** | Clean and normalize raw text | Raw content | Cleaned text |
| **Normalization** | Standardize tech terminology | Cleaned text | Normalized hints |
| **Metadata** | Extract from structured metrics | Metrics (LeetCode, GitHub, Kaggle) | Skills from metrics |
| **Extractor** | LLM-based skill inference | Cleaned text + hints | Extracted skills |
| **Fusion** | Combine multiple signals | All extracted skills | Deduplicated unified skills |
| **Scoring** | Calculate credibility | Validated skills | Skills with scores |


## 📊 Skill Profile Output

```json
{
  "user_id": "user123",
  "skills": [
    {
      "name": "Python",
      "category": "language",
      "level": "advanced",
      "confidence": 0.88,
      "score": 0.87,
      "evidence": [
        "Used in ML project",
        "Found in GitHub repositories"
      ],
      "reasoning": "Multiple sources confirm expertise",
      "signals": [...],
      "validated": true
    }
  ],
  "explanations": [
    {
      "skill": "Python",
      "score": 0.87,
      "explanation": [
        "Python detected with high credibility (87%)",
        "Proficiency level: extensive expertise",
        "Evidence (2 items): ...",
        "Sources detected: github, leetcode"
      ],
      "level": "advanced",
      "category": "language"
    }
  ],
  "summary": {
    "total_skills": 15,
    "average_score": 0.82,
    "top_skills": ["Python", "React", "JavaScript"],
    "narrative": "Analysis detected 15 skills with..."
  }
}
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Set optional LLM provider configuration for enhanced extraction
export LLM_PROVIDER="auto"
export OPENAI_API_KEY="your-key-here"
export OPENAI_MODEL="gpt-3.5-turbo"
export GEMINI_API_KEY="your-gemini-api-key"
export GEMINI_MODEL="gemini-2.5-flash"
```

### Running the Service

```bash
# Start the FastAPI server
python main.py

# Server runs at http://localhost:8000
```

### API Endpoints

#### Full Pipeline (Recommended)
```bash
POST /extract
Content-Type: application/json

{
  "user_id": "user123",
  "data": [
    {
      "content": "I have 5 years of Python experience, built ML models with TensorFlow...",
      "source": "resume"
    },
    {
      "source": "github",
      "metrics": {
        "repo_count": 25,
        "languages": {"Python": 60, "JavaScript": 40}
      }
    },
    {
      "source": "leetcode",
      "metrics": {
        "dp_problems": 150,
        "graph_problems": 75,
        "total_problems": 450
      }
    }
  ]
}
```

#### Quick Pipeline (No Validation)
```bash
POST /extract/quick
```

#### Individual Agents
```bash
# Stage 1: Preprocess
POST /preprocess

# Stage 2: Normalize
POST /normalize

# Stage 3: Extract from metadata
POST /metadata

# Stage 3: LLM-based extraction
POST /extract-llm

# Stage 4: Fuse skills
POST /fuse

# Stage 5: Validate
POST /validate

# Stage 6: Score
POST /score

# Stage 7: Generate explanations
POST /explain
```

#### Info Endpoints
```bash
# Health check
GET /health

# List all agents
GET /agents

# API info
GET /
```

## 🔧 Key Features

### 1. **Multi-Source Intelligence**
- Text-based extraction (content analysis)
- Metadata-based extraction (metrics from platforms)
- LLM-powered reasoning (GPT-3.5 with fallback)

### 2. **Signal Fusion**
- Combines evidence from multiple sources
- Boosts confidence for cross-source agreement
- Intelligent level inference

### 3. **Validation Layer**
- Filters trivial/generic skills
- Verifies evidence quality
- Adjusts confidence based on validation

### 4. **Credibility Scoring**
Composite score (0-1) based on:
- Base confidence (40%)
- Level inference (15%)
- Evidence diversity (20%)
- Signal quality (15%)
- Source agreement (10%)

### 5. **Explainable AI (XAI)**
- Human-readable explanations
- Evidence-backed reasoning
- Category & level context
- Source attribution

## 📝 Input Data Format

```json
{
  "user_id": "unique_user_id",
  "data": [
    {
      "content": "Free-form text (resume, profile, etc.)",
      "source": "resume|linkedin|github|leetcode|kaggle|etc"
    },
    {
      "source": "leetcode",
      "metrics": {
        "dp_problems": 100,
        "graph_problems": 50,
        "total_problems": 300
      }
    },
    {
      "source": "github",
      "metrics": {
        "repo_count": 20,
        "languages": {"Python": 70, "JavaScript": 30},
        "contribution_score": 0.85
      }
    }
  ]
}
```

## 🔌 n8n Integration

For external orchestration with n8n:

1. **Create n8n workflow**
2. **Use HTTP Request nodes** to call individual agent endpoints
3. **Chain requests** using the pipeline flow
4. **Capture outputs** for visualization/storage

Example n8n flow:
```
[Trigger] → [Preprocess] → [Normalize] → [Metadata] 
    ↓           ↓              ↓              ↓
    └─→ [Extractor] → [Fusion] → [Validator] → [Scoring] → [XAI] → [Save Result]
```

## 🎨 Customization

### Add Custom Skills Detection

Edit `app/services/llm_service.py`:
```python
SKILL_KEYWORDS = {
    "Your Skill": ["keyword1", "keyword2", "alias"],
    ...
}
```

### Extend Normalization

Edit `app/agents/normalization_agent.py`:
```python
NORMALIZATION_MAP = {
    "abbreviation": "Full Name",
    ...
}
```

### Add New Data Source

Create handler in `app/agents/metadata_agent.py`:
```python
elif source == "new_source":
    skills = self._extract_new_source_skills(metrics)
```

## 🧪 Testing

```bash
# Run with sample data
python -m pytest tests/

# Manual test
curl -X POST "http://localhost:8000/extract" \
  -H "Content-Type: application/json" \
  -d @test_data.json
```

## 📊 Performance

- **Preprocessing**: <100ms
- **Normalization**: <50ms  
- **Metadata extraction**: <100ms
- **LLM extraction**: 1-3s (depends on OpenAI)
- **Fusion**: <100ms
- **Validation**: <50ms
- **Scoring**: <50ms
- **XAI**: <100ms
- **Total pipeline**: 2-5s (with LLM), <1s (without)

## 🛡️ Confidence Scoring

Factors considered:
- **Multiple evidence items** → Higher confidence
- **Multiple sources** → Confidence boost
- **Advanced level** → Credibility boost
- **High signal diversity** → Extra boost
- **Trivial skills** → Filtered out
- **Missing evidence** → Lower confidence

## 📚 Schema

Key data types (in `app/schema/skill_schema.py`):
- `Skill`: Individual skill with metadata
- `Signal`: Evidence signal from a source
- `SkillLevel`: beginner, intermediate, advanced, expert
- `SkillCategory`: language, framework, tool, platform, etc.
- `SkillProfile`: Complete user skill profile
- `ExplanationItem`: Human-readable explanation

## 🤝 Contributing

To add a new agent:

1. Create file in `app/agents/new_agent.py`
2. Inherit from `BaseAgent`
3. Implement `run(self, data)` method
4. Add to imports in agent `__init__.py`
5. Integrate into pipeline

## 📖 Example Usage

See `examples/` directory for:
- Full pipeline example
- Individual agent usage
- n8n integration patterns
- Custom configurations

## 🔐 Security

- No credentials stored in code
- Use environment variables for API keys
- Validate all input data
- Filter PII in logging

## 📄 License

[Your License Here]

## 📞 Support

For issues or questions:
1. Check the examples/
2. Review agent docstrings
3. Check schema definitions
4. Enable debug logging: `logging.basicConfig(level=logging.DEBUG)`
"# trueskill_ai" 
