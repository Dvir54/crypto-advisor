import httpx
from typing import List, Dict, Optional
from fastapi import HTTPException


class CoinGeckoService:
    """Service to interact with CoinGecko API"""
    
    BASE_URL = "https://api.coingecko.com/api/v3"
    
    # Mapping of common crypto symbols to CoinGecko IDs
    COIN_ID_MAP = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "SOL": "solana",
        "USDT": "tether",
        "BNB": "binancecoin",
        "XRP": "ripple",
        "ADA": "cardano",
        "DOGE": "dogecoin",
        "MATIC": "matic-network",
        "DOT": "polkadot",
    }
    
    @classmethod
    async def get_coin_prices(
        cls, 
        coins: Optional[List[str]] = None,
        vs_currency: str = "usd"
    ) -> List[Dict]:
        """
        Fetch cryptocurrency prices from CoinGecko API
        
        Args:
            coins: List of coin symbols (e.g., ["BTC", "ETH", "SOL"])
            vs_currency: Currency to show prices in (default: "usd")
            
        Returns:
            List of coin data with prices and changes
        """
        # If no coins specified, use default popular coins
        if not coins:
            coins = ["BTC", "ETH", "SOL", "BNB", "XRP"]
        
        # Convert symbols to CoinGecko IDs
        coin_ids = []
        for symbol in coins:
            coin_id = cls.COIN_ID_MAP.get(symbol.upper())
            if coin_id:
                coin_ids.append(coin_id)
        
        if not coin_ids:
            raise HTTPException(
                status_code=400, 
                detail="No valid cryptocurrency symbols provided"
            )
        
        # Build API request
        ids_param = ",".join(coin_ids)
        url = f"{cls.BASE_URL}/coins/markets"
        params = {
            "vs_currency": vs_currency,
            "ids": ids_param,
            "order": "market_cap_desc",
            "per_page": len(coin_ids),
            "page": 1,
            "sparkline": False,
            "price_change_percentage": "24h"
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Format the response
                formatted_data = []
                for coin in data:
                    formatted_data.append({
                        "id": coin.get("id"),
                        "symbol": coin.get("symbol", "").upper(),
                        "name": coin.get("name"),
                        "image": coin.get("image"),
                        "current_price": coin.get("current_price"),
                        "price_change_percentage_24h": coin.get("price_change_percentage_24h"),
                        "market_cap": coin.get("market_cap"),
                        "total_volume": coin.get("total_volume"),
                        "high_24h": coin.get("high_24h"),
                        "low_24h": coin.get("low_24h"),
                    })
                
                return formatted_data
                
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="CoinGecko API request timed out"
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"CoinGecko API error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch coin prices: {str(e)}"
            )
    
    @classmethod
    async def get_coin_details(cls, coin_id: str) -> Dict:
        """
        Fetch detailed information about a specific cryptocurrency
        
        Args:
            coin_id: CoinGecko coin ID (e.g., "bitcoin", "ethereum")
            
        Returns:
            Detailed coin information
        """
        url = f"{cls.BASE_URL}/coins/{coin_id}"
        params = {
            "localization": False,
            "tickers": False,
            "market_data": True,
            "community_data": False,
            "developer_data": False,
            "sparkline": False
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                market_data = data.get("market_data", {})
                
                return {
                    "id": data.get("id"),
                    "symbol": data.get("symbol", "").upper(),
                    "name": data.get("name"),
                    "description": data.get("description", {}).get("en", ""),
                    "image": data.get("image", {}).get("large"),
                    "current_price": market_data.get("current_price", {}).get("usd"),
                    "market_cap": market_data.get("market_cap", {}).get("usd"),
                    "market_cap_rank": data.get("market_cap_rank"),
                    "total_volume": market_data.get("total_volume", {}).get("usd"),
                    "price_change_24h": market_data.get("price_change_24h"),
                    "price_change_percentage_24h": market_data.get("price_change_percentage_24h"),
                    "price_change_percentage_7d": market_data.get("price_change_percentage_7d"),
                    "price_change_percentage_30d": market_data.get("price_change_percentage_30d"),
                }
                
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"CoinGecko API error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch coin details: {str(e)}"
            )

