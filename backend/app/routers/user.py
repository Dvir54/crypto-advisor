from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/preferences")
async def save_preferences():
    """Save user preferences from onboarding quiz"""
    # TODO: Implement in Phase 3
    pass


@router.get("/preferences")
async def get_preferences():
    """Get user preferences"""
    # TODO: Implement in Phase 3
    pass

