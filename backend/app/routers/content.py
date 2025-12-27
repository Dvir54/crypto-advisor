from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import random

from app.services.coingecko import CoinGeckoService
from app.services.cryptopanic import CryptoPanicService
from app.services.openrouter import OpenRouterService
from app.services.meme import MemeService
from app.schemas.content import CoinPricesResponse, NewsResponse, InsightResponse, MemeResponse
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.config import get_settings

router = APIRouter()


@router.get("/prices", response_model=CoinPricesResponse)
async def get_prices(
    coins: Optional[str] = Query(None, description="Comma-separated list of coin symbols (e.g., BTC,ETH,SOL)"),
    current_user: User = Depends(get_current_user)
):
    """Get cryptocurrency prices from CoinGecko"""
    # Parse coins parameter
    coin_list = None
    if coins:
        coin_list = [coin.strip().upper() for coin in coins.split(",")]
    
    # If no coins specified, get user preferences
    if not coin_list and current_user.preferences:
        coin_list = current_user.preferences.crypto_assets
    
    # Fetch prices from CoinGecko
    prices_data = await CoinGeckoService.get_coin_prices(coins=coin_list)
    
    return {
        "success": True,
        "data": prices_data
    }


@router.get("/news", response_model=NewsResponse)
async def get_news(
    currencies: Optional[str] = Query(None, description="Comma-separated list of currency symbols (e.g., BTC,ETH,SOL)"),
    limit: int = Query(10, ge=1, le=20, description="Number of news items to return"),
    current_user: User = Depends(get_current_user)
):
    """Get market news from CryptoPanic with static fallback"""
    # Parse currencies parameter
    currency_list = None
    if currencies:
        currency_list = [curr.strip().upper() for curr in currencies.split(",")]
    
    # If no currencies specified, get user preferences
    if not currency_list and current_user.preferences:
        currency_list = current_user.preferences.crypto_assets
    
    # Fetch news from CryptoPanic (with automatic fallback)
    news_data = await CryptoPanicService.get_news(currencies=currency_list, limit=limit)
    
    # Determine if we're using API or fallback
    settings = get_settings()
    source = "api" if settings.cryptopanic_api_key else "fallback"
    
    return {
        "success": True,
        "data": news_data,
        "source": source
    }


@router.get("/insight", response_model=InsightResponse)
async def get_insight(
    current_user: User = Depends(get_current_user)
):
    """Get AI-generated cryptocurrency insight from OpenRouter"""
    # Get user preferences
    crypto_assets = None
    investor_type = None
    
    if current_user.preferences:
        crypto_assets = current_user.preferences.crypto_assets
        investor_type = current_user.preferences.investor_type
    
    # Optionally fetch recent price data for context
    recent_prices = None
    try:
        if crypto_assets:
            prices_data = await CoinGeckoService.get_coin_prices(coins=crypto_assets)
            recent_prices = {}
            for coin in prices_data:
                recent_prices[coin.get("symbol")] = {
                    "current_price": coin.get("current_price"),
                    "price_change_percentage_24h": coin.get("price_change_percentage_24h")
                }
    except Exception as e:
        # If price fetch fails, continue without price context
        print(f"Failed to fetch prices for insight context: {str(e)}")
    
    # Generate AI insight
    insight_data = await OpenRouterService.generate_insight(
        crypto_assets=crypto_assets,
        investor_type=investor_type,
        recent_prices=recent_prices
    )
    
    return {
        "success": True,
        "data": insight_data
    }


@router.get("/meme", response_model=MemeResponse)
async def get_meme(
    category: Optional[str] = Query(None, description="Filter by category (hodl, trading, nft, etc.)"),
    current_user: User = Depends(get_current_user)
):
    """Get random crypto meme from static collection"""
    # If category specified, get meme from that category
    if category:
        memes = MemeService.get_memes_by_category(category, limit=10)
        if not memes:
            # Fall back to random if no memes in category
            meme_data = MemeService.get_random_meme()
        else:
            meme_data = random.choice(memes)
    else:
        # Get random meme from entire collection
        meme_data = MemeService.get_random_meme()
    
    return {
        "success": True,
        "data": meme_data
    }

