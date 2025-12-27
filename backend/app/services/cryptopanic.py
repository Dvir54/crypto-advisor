import httpx
from typing import List, Dict, Optional
from fastapi import HTTPException
from app.config import get_settings


class CryptoPanicService:
    """Service to interact with CryptoPanic API with static fallback"""
    
    BASE_URL = "https://cryptopanic.com/api/v1"
    
    # Static fallback news for when API is unavailable or no key is provided
    FALLBACK_NEWS = [
        {
            "id": "static-1",
            "title": "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
            "url": "https://cryptopanic.com",
            "source": "CryptoNews",
            "published_at": "2024-01-15T10:30:00Z",
            "kind": "news",
            "currencies": ["BTC"],
            "votes": {
                "positive": 145,
                "negative": 12
            }
        },
        {
            "id": "static-2",
            "title": "Ethereum 2.0 Upgrade Shows Promising Performance Improvements",
            "url": "https://cryptopanic.com",
            "source": "EthereumWorld",
            "published_at": "2024-01-15T09:15:00Z",
            "kind": "news",
            "currencies": ["ETH"],
            "votes": {
                "positive": 203,
                "negative": 8
            }
        },
        {
            "id": "static-3",
            "title": "Solana Network Processes Record Number of Transactions",
            "url": "https://cryptopanic.com",
            "source": "SolanaDaily",
            "published_at": "2024-01-15T08:45:00Z",
            "kind": "news",
            "currencies": ["SOL"],
            "votes": {
                "positive": 178,
                "negative": 15
            }
        },
        {
            "id": "static-4",
            "title": "Major Financial Institutions Begin Offering Crypto Trading Services",
            "url": "https://cryptopanic.com",
            "source": "FinanceToday",
            "published_at": "2024-01-15T07:20:00Z",
            "kind": "news",
            "currencies": ["BTC", "ETH"],
            "votes": {
                "positive": 267,
                "negative": 23
            }
        },
        {
            "id": "static-5",
            "title": "DeFi Market Shows Strong Growth Despite Market Volatility",
            "url": "https://cryptopanic.com",
            "source": "DeFiInsider",
            "published_at": "2024-01-15T06:00:00Z",
            "kind": "news",
            "currencies": ["ETH", "SOL"],
            "votes": {
                "positive": 156,
                "negative": 19
            }
        },
        {
            "id": "static-6",
            "title": "Crypto Regulation Discussion Intensifies in Major Economies",
            "url": "https://cryptopanic.com",
            "source": "RegulatoryWatch",
            "published_at": "2024-01-14T18:30:00Z",
            "kind": "news",
            "currencies": ["BTC", "ETH"],
            "votes": {
                "positive": 89,
                "negative": 45
            }
        },
        {
            "id": "static-7",
            "title": "NFT Marketplace Launches Innovative Creator Royalty System",
            "url": "https://cryptopanic.com",
            "source": "NFTTimes",
            "published_at": "2024-01-14T16:45:00Z",
            "kind": "news",
            "currencies": ["ETH"],
            "votes": {
                "positive": 234,
                "negative": 31
            }
        },
        {
            "id": "static-8",
            "title": "Blockchain Technology Adoption Grows in Supply Chain Management",
            "url": "https://cryptopanic.com",
            "source": "TechInnovation",
            "published_at": "2024-01-14T14:20:00Z",
            "kind": "news",
            "currencies": ["BTC", "ETH"],
            "votes": {
                "positive": 198,
                "negative": 16
            }
        }
    ]
    
    @classmethod
    async def get_news(
        cls,
        currencies: Optional[List[str]] = None,
        kind: str = "news",
        limit: int = 10
    ) -> List[Dict]:
        """
        Fetch cryptocurrency news from CryptoPanic API with static fallback
        
        Args:
            currencies: List of currency symbols to filter by (e.g., ["BTC", "ETH"])
            kind: Type of posts to fetch ("news", "media", "all")
            limit: Number of news items to return
            
        Returns:
            List of news items
        """
        settings = get_settings()
        api_key = settings.cryptopanic_api_key
        
        # If no API key, use static fallback
        if not api_key:
            return cls._get_fallback_news(currencies, limit)
        
        # Build API request
        url = f"{cls.BASE_URL}/posts/"
        params = {
            "auth_token": api_key,
            "kind": kind,
            "public": "true"
        }
        
        # Add currency filter if specified
        if currencies:
            # CryptoPanic expects comma-separated lowercase symbols
            currencies_param = ",".join([c.upper() for c in currencies])
            params["currencies"] = currencies_param
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Extract and format results
                results = data.get("results", [])[:limit]
                
                formatted_news = []
                for item in results:
                    formatted_news.append({
                        "id": str(item.get("id")),
                        "title": item.get("title"),
                        "url": item.get("url"),
                        "source": item.get("source", {}).get("title", "Unknown"),
                        "published_at": item.get("published_at"),
                        "kind": item.get("kind"),
                        "currencies": [c.get("code") for c in item.get("currencies", [])],
                        "votes": item.get("votes", {}),
                        "domain": item.get("domain")
                    })
                
                return formatted_news
                
        except httpx.TimeoutException:
            print("CryptoPanic API timeout, falling back to static news")
            return cls._get_fallback_news(currencies, limit)
        except httpx.HTTPStatusError as e:
            print(f"CryptoPanic API error: {e.response.status_code}, falling back to static news")
            return cls._get_fallback_news(currencies, limit)
        except Exception as e:
            print(f"Failed to fetch news from CryptoPanic: {str(e)}, falling back to static news")
            return cls._get_fallback_news(currencies, limit)
    
    @classmethod
    def _get_fallback_news(
        cls,
        currencies: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get static fallback news
        
        Args:
            currencies: List of currency symbols to filter by
            limit: Number of news items to return
            
        Returns:
            List of static news items
        """
        news = cls.FALLBACK_NEWS.copy()
        
        # Filter by currencies if specified
        if currencies:
            currencies_upper = [c.upper() for c in currencies]
            filtered_news = []
            for item in news:
                item_currencies = item.get("currencies", [])
                # Check if any of the item's currencies match the filter
                if any(curr in currencies_upper for curr in item_currencies):
                    filtered_news.append(item)
            news = filtered_news
        
        # Return limited results
        return news[:limit]
    
    @classmethod
    async def get_trending_news(cls, limit: int = 5) -> List[Dict]:
        """
        Get trending cryptocurrency news (highest votes)
        
        Args:
            limit: Number of news items to return
            
        Returns:
            List of trending news items
        """
        news = await cls.get_news(limit=20)  # Get more to find trending
        
        # Sort by positive votes (if available)
        sorted_news = sorted(
            news,
            key=lambda x: x.get("votes", {}).get("positive", 0),
            reverse=True
        )
        
        return sorted_news[:limit]

