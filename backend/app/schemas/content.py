from pydantic import BaseModel
from typing import Optional, List, Dict


class CoinPrice(BaseModel):
    """Schema for cryptocurrency price data"""
    id: str
    symbol: str
    name: str
    image: Optional[str] = None
    current_price: Optional[float] = None
    price_change_percentage_24h: Optional[float] = None
    market_cap: Optional[float] = None
    total_volume: Optional[float] = None
    high_24h: Optional[float] = None
    low_24h: Optional[float] = None


class CoinPricesResponse(BaseModel):
    """Response schema for coin prices endpoint"""
    success: bool
    data: List[CoinPrice]


class NewsVotes(BaseModel):
    """Schema for news vote counts"""
    positive: Optional[int] = 0
    negative: Optional[int] = 0


class NewsItem(BaseModel):
    """Schema for cryptocurrency news item"""
    id: str
    title: str
    url: str
    source: str
    published_at: str
    kind: str
    currencies: List[str]
    votes: Optional[NewsVotes] = None
    domain: Optional[str] = None


class NewsResponse(BaseModel):
    """Response schema for news endpoint"""
    success: bool
    data: List[NewsItem]
    source: str  # "api" or "fallback"


class AIInsight(BaseModel):
    """Schema for AI-generated insight"""
    insight: str
    source: str  # "ai" or "fallback"
    model: str
    crypto_assets: List[str]
    investor_type: Optional[str] = None


class InsightResponse(BaseModel):
    """Response schema for AI insight endpoint"""
    success: bool
    data: AIInsight


class Meme(BaseModel):
    """Schema for crypto meme"""
    id: str
    title: str
    image_url: str
    caption: str
    tags: List[str]
    category: str


class MemeResponse(BaseModel):
    """Response schema for meme endpoint"""
    success: bool
    data: Meme

