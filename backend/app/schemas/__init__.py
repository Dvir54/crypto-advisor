"""Pydantic schemas package."""
from app.schemas.auth import (
    UserSignupRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.preferences import (
    PreferencesRequest,
    PreferencesResponse,
)
from app.schemas.content import (
    CoinPrice,
    CoinPricesResponse,
    NewsVotes,
    NewsItem,
    NewsResponse,
    AIInsight,
    InsightResponse,
    Meme,
    MemeResponse,
)
from app.schemas.vote import (
    VoteCreate,
    VoteResponse,
    VoteUpdate,
)

__all__ = [
    "UserSignupRequest",
    "UserLoginRequest",
    "TokenResponse",
    "UserResponse",
    "PreferencesRequest",
    "PreferencesResponse",
    "CoinPrice",
    "CoinPricesResponse",
    "NewsVotes",
    "NewsItem",
    "NewsResponse",
    "AIInsight",
    "InsightResponse",
    "Meme",
    "MemeResponse",
    "VoteCreate",
    "VoteResponse",
    "VoteUpdate",
]
