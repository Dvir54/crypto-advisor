from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.routers import auth, user, content, vote
from app.database import engine
from app.models.base import Base
# Import models to ensure they're registered with SQLAlchemy
from app.models import User, Preferences, Vote  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup: Verify database connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection established")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
    
    yield
    
    # Shutdown: Clean up resources
    engine.dispose()
    print("✓ Database connections closed")


app = FastAPI(
    title="AI Crypto Advisor",
    description="Personalized crypto insights powered by AI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(vote.router, prefix="/api", tags=["Voting"])


@app.get("/")
async def root():
    return {"message": "Welcome to AI Crypto Advisor API"}


@app.get("/health")
async def health_check():
    """Health check endpoint to verify API and database status."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "unhealthy", "database": "disconnected"}
