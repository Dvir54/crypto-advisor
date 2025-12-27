from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.vote import Vote
from app.schemas.vote import VoteCreate, VoteResponse

router = APIRouter()


@router.post("/vote", response_model=VoteResponse, status_code=status.HTTP_201_CREATED)
async def submit_vote(
    vote_data: VoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a vote for content.
    
    If the user has already voted on this content, the vote will be updated.
    If not, a new vote will be created.
    """
    # Check if user already voted on this content
    existing_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.content_type == vote_data.content_type,
        Vote.content_id == vote_data.content_id
    ).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.is_upvote = vote_data.is_upvote
        db.commit()
        db.refresh(existing_vote)
        return existing_vote
    
    # Create new vote
    new_vote = Vote(
        user_id=current_user.id,
        content_type=vote_data.content_type,
        content_id=vote_data.content_id,
        is_upvote=vote_data.is_upvote
    )
    
    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)
    
    return new_vote


@router.get("/votes", response_model=List[VoteResponse])
async def get_votes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all votes for the current authenticated user.
    
    Returns a list of all votes the user has submitted, ordered by creation date (newest first).
    """
    votes = db.query(Vote).filter(
        Vote.user_id == current_user.id
    ).order_by(Vote.created_at.desc()).all()
    
    return votes

