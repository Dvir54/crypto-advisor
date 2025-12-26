"""Pydantic schemas for preferences endpoints."""
from pydantic import BaseModel, Field
from uuid import UUID
from typing import List, Optional


class PreferencesRequest(BaseModel):
    """Schema for creating/updating user preferences."""
    crypto_assets: List[str] = Field(..., description="List of crypto assets (e.g., ['BTC', 'ETH', 'SOL'])")
    investor_type: str = Field(..., description="Type of investor: 'hodler', 'daytrader', 'nft'")
    content_types: List[str] = Field(..., description="Preferred content types (e.g., ['news', 'charts', 'social', 'fun'])")


class PreferencesResponse(BaseModel):
    """Schema for preferences response."""
    id: UUID = Field(..., description="Preferences unique identifier")
    user_id: UUID = Field(..., description="User's unique identifier")
    crypto_assets: List[str] = Field(..., description="List of crypto assets")
    investor_type: str = Field(..., description="Type of investor")
    content_types: List[str] = Field(..., description="Preferred content types")

    class Config:
        from_attributes = True  # Enables ORM mode for SQLAlchemy models

