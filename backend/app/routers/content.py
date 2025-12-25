from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/prices")
async def get_prices():
    """Get cryptocurrency prices from CoinGecko"""
    # TODO: Implement in Phase 4
    pass


@router.get("/news")
async def get_news():
    """Get market news from CryptoPanic"""
    # TODO: Implement in Phase 4
    pass


@router.get("/insight")
async def get_insight():
    """Get AI-generated insight from OpenRouter"""
    # TODO: Implement in Phase 4
    pass


@router.get("/meme")
async def get_meme():
    """Get random crypto meme"""
    # TODO: Implement in Phase 4
    pass

