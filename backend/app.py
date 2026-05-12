from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.ingestion_routes import router as ingestion_router
from api.routes.skill_extractor_routes import router as skill_extractor_router
from api.routes.validation_routes import router as validation_router
from api.routes.orchestrator_routes import router as orchestrator_router
from api.routes.scoring_routes import router as scoring_router
from api.routes.job_routes import router as job_router
from auth.routes import router as auth_router
from database import init_db

app = FastAPI(
    title="TrueSkill AI API",
    description="Complete API for skill extraction, validation, and candidate scoring.",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router, tags=["authentication"])
app.include_router(ingestion_router)
app.include_router(skill_extractor_router)
app.include_router(orchestrator_router, prefix="/orchestrator", tags=["orchestrator"])
app.include_router(scoring_router, prefix="/scoring", tags=["scoring"])
app.include_router(job_router, prefix="/jobs", tags=["jobs"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    try:
        init_db()
        print("✅ Database initialized successfully")
        
        # Initialize auth tables and default roles
        from database import get_session
        from auth.utils import create_default_roles
        
        db = get_session()
        create_default_roles(db)
        db.close()
        print("✅ Auth system initialized")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")


@app.get("/")
async def root():
    return {
        "service": "TrueSkill AI API",
        "version": "2.0.0",
        "endpoints": [
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/me",
            "/api/auth/add-role",
            "/api/auth/logout",
            "/api/auth/roles",
            "/api/auth/validate-token",
            "/ingestion/cp",
            "/ingestion/github", 
            "/ingestion/kaggle",
            "/ingestion/research",
            "/ingestion/resume",
            "/ingestion/document",
            "/ingestion/normalize/item",
            "/ingestion/normalize/user",
            "/extract",
            "/extract/quick",
            "/preprocess",
            "/normalize",
            "/metadata",
            "/extract-llm",
            "/fuse",
            "/score",
            "/validation/validate",
            "/api/match-score",
            "/api/interest-score",
            "/api/candidate/{id}/scores",
            "/api/job/{id}/candidates",
            "/health",
            "/agents",
        ],
    }
