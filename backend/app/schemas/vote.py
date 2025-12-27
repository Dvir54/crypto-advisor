"""Schemas for voting functionality."""
from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
from uuid import UUID


class VoteCreate(BaseModel):
    """Schema for creating a vote."""
    content_type: Literal["news", "price", "ai", "meme"] = Field(
        ...,
        description="Type of content being voted on"
    )
    content_id: str = Field(
        ...,
        description="Identifier for the specific content item"
    )
    is_upvote: bool = Field(
        ...,
        description="True for upvote, False for downvote"
    )


class VoteResponse(BaseModel):
    """Schema for vote response."""
    id: UUID
    user_id: UUID
    content_type: str
    content_id: str
    is_upvote: bool
    created_at: datetime

    class Config:
        from_attributes = True


class VoteUpdate(BaseModel):
    """Schema for updating a vote."""
    is_upvote: bool = Field(
        ...,
        description="True for upvote, False for downvote"
    )

