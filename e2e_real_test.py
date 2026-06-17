"""
End-to-end real pipeline test using a real GitHub profile.
Tests every step the frontend actually calls.
"""
import requests, json, time

BASE = "http://localhost:8000"
GITHUB_URL = "https://github.com/tiangolo"  # FastAPI creator - real profile

print("=" * 60)
print("TRUESKILLFORGE — REAL DATA PIPELINE TEST")
print("=" * 60)

# ── STEP 1: GitHub Ingestion ──────────────────────────────
print("\n[1/5] GitHub Ingestion...")
r = requests.post(BASE + "/ingestion/github", json={"url": GITHUB_URL}, timeout=30)
print(f"  Status: {r.status_code}")
if r.status_code != 200:
    print(f"  ERROR: {r.text[:300]}")
    exit(1)

ingestion = r.json()
user_id = ingestion.get("user_id", "test_user_001")
items = ingestion.get("items", [ingestion])
print(f"  user_id: {user_id}")
print(f"  items count: {len(items)}")
print(f"  keys: {list(ingestion.keys())[:8]}")
if items:
    first = items[0]
    print(f"  first item type: {first.get('type','?')} | source: {first.get('source','?')}")
    content = first.get("content", {})
    print(f"  name: {content.get('name','?')}")
    print(f"  repos: {len(content.get('repositories', []))}")

# ── STEP 2: Skill Extraction ──────────────────────────────
print("\n[2/5] Skill Extraction...")
r = requests.post(BASE + "/skill_extractor/extract",
    json={"user_id": user_id, "data": items},
    timeout=30)
print(f"  Status: {r.status_code}")
if r.status_code != 200:
    print(f"  ERROR: {r.text[:300]}")
    exit(1)

extract_res = r.json()
skills = extract_res.get("skills", [])
print(f"  Skills found: {len(skills)}")
for s in skills[:5]:
    print(f"    - {s.get('name')} | level: {s.get('level')} | conf: {s.get('confidence')}")

# ── STEP 3: Validation ────────────────────────────────────
print("\n[3/5] Skill Validation...")
raw_evidence = ingestion if ingestion else {"items": items}
r = requests.post(BASE + "/validation/validate",
    json={
        "extracted_skills": extract_res,
        "raw_evidence": raw_evidence,
        "debug": False
    },
    timeout=20)
print(f"  Status: {r.status_code}")
if r.status_code != 200:
    print(f"  ERROR: {r.text[:300]}")
    exit(1)

validate_res = r.json()
validated_skills = validate_res.get("validated_skills", [])
print(f"  Validated skills: {len(validated_skills)}")

# ── STEP 4: Score ─────────────────────────────────────────
print("\n[4/5] Calculate Score...")
r = requests.post(BASE + "/matching/calculate-score",
    json={"user_id": user_id, "validated_skills": validated_skills},
    timeout=15)
print(f"  Status: {r.status_code}")
if r.status_code == 200:
    score_res = r.json()
    print(f"  Score: {score_res.get('final_score', score_res.get('score', '?'))}")
else:
    print(f"  ERROR: {r.text[:200]}")

# ── STEP 5: Profile Analysis ──────────────────────────────
print("\n[5/5] Profile Analysis...")
r = requests.post(BASE + "/matching/profile-analysis",
    json={
        "user_id": user_id,
        "validated_skills": validated_skills,
        "name": "Test User",
        "email": "test@example.com"
    },
    timeout=20)
print(f"  Status: {r.status_code}")
if r.status_code == 200:
    analysis_res = r.json()
    print(f"  Matched roles: {len(analysis_res.get('matched_roles', []))}")
    score_info = analysis_res.get("score", {})
    print(f"  Final score: {score_info.get('final_score', '?')}")
    expl = analysis_res.get("explanations", {})
    print(f"  Strengths: {expl.get('strengths', [])[:2]}")
else:
    print(f"  ERROR: {r.text[:300]}")

# ── CHECK DB ──────────────────────────────────────────────
print("\n[DB] Checking saved candidates...")
r = requests.get(BASE + "/recruiter/candidates", timeout=10)
candidates = r.json()
print(f"  Total in DB: {len(candidates)}")
for c in candidates[:3]:
    print(f"    - {c.get('name')} | score: {c.get('score')} | skills: {len(c.get('top_skills', []))}")

print("\n" + "=" * 60)
print("PIPELINE TEST COMPLETE")
print("=" * 60)
