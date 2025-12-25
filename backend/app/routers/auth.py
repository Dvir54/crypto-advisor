from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/signup")
async def signup():
    """Register a new user"""
    # TODO: Implement in Phase 2
    pass


@router.post("/login")
async def login():
    """Login and return JWT token"""
    # TODO: Implement in Phase 2
    pass


@router.get("/me")
async def get_current_user():
    """Get current authenticated user"""
    # TODO: Implement in Phase 2
    pass

