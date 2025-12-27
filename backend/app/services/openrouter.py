import httpx
from typing import Dict, Optional, List
from fastapi import HTTPException
from app.config import get_settings


class OpenRouterService:
    """Service to interact with OpenRouter API for AI-generated insights"""
    
    BASE_URL = "https://openrouter.ai/api/v1"
    
    # Default model to use (free tier)
    DEFAULT_MODEL = "meta-llama/llama-3.2-3b-instruct:free"
    
    @classmethod
    async def generate_insight(
        cls,
        crypto_assets: Optional[List[str]] = None,
        investor_type: Optional[str] = None,
        recent_prices: Optional[Dict] = None
    ) -> Dict:
        """
        Generate AI-powered cryptocurrency insight using OpenRouter
        
        Args:
            crypto_assets: List of crypto symbols user is interested in
            investor_type: Type of investor (hodler, daytrader, nft)
            recent_prices: Recent price data to provide context
            
        Returns:
            Dict with AI-generated insight
        """
        settings = get_settings()
        api_key = settings.openrouter_api_key
        
        if not api_key:
            # Return a static insight if no API key
            return cls._get_fallback_insight(crypto_assets, investor_type)
        
        # Build the prompt based on user preferences
        prompt = cls._build_prompt(crypto_assets, investor_type, recent_prices)
        
        # Prepare API request
        url = f"{cls.BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://cryptoadvisor.app",  # Optional but recommended
            "X-Title": "Crypto Advisor"  # Optional but recommended
        }
        
        payload = {
            "model": cls.DEFAULT_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a knowledgeable cryptocurrency advisor providing brief, actionable insights. Keep responses concise (2-3 paragraphs max) and focus on current market trends and practical advice."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 300,
            "temperature": 0.7
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                # Extract the AI-generated content
                insight_text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                if not insight_text:
                    return cls._get_fallback_insight(crypto_assets, investor_type)
                
                return {
                    "insight": insight_text.strip(),
                    "source": "ai",
                    "model": cls.DEFAULT_MODEL,
                    "crypto_assets": crypto_assets or [],
                    "investor_type": investor_type
                }
                
        except httpx.TimeoutException:
            print("OpenRouter API timeout, falling back to static insight")
            return cls._get_fallback_insight(crypto_assets, investor_type)
        except httpx.HTTPStatusError as e:
            print(f"OpenRouter API error: {e.response.status_code}, falling back to static insight")
            return cls._get_fallback_insight(crypto_assets, investor_type)
        except Exception as e:
            print(f"Failed to generate AI insight: {str(e)}, falling back to static insight")
            return cls._get_fallback_insight(crypto_assets, investor_type)
    
    @classmethod
    def _build_prompt(
        cls,
        crypto_assets: Optional[List[str]],
        investor_type: Optional[str],
        recent_prices: Optional[Dict]
    ) -> str:
        """Build a contextual prompt for the AI based on user preferences"""
        
        # Base prompt
        prompt_parts = ["Provide a brief cryptocurrency market insight"]
        
        # Add crypto assets context
        if crypto_assets and len(crypto_assets) > 0:
            assets_str = ", ".join(crypto_assets)
            prompt_parts.append(f"focusing on {assets_str}")
        else:
            prompt_parts.append("for the general crypto market")
        
        # Add investor type context
        if investor_type:
            if investor_type == "hodler":
                prompt_parts.append("Tailor the advice for a long-term holder (HODLER) perspective.")
            elif investor_type == "daytrader":
                prompt_parts.append("Tailor the advice for an active day trader looking for short-term opportunities.")
            elif investor_type == "nft":
                prompt_parts.append("Tailor the advice for an NFT enthusiast and collector.")
        
        # Add price context if available
        if recent_prices:
            prompt_parts.append("\nRecent price movements:")
            for symbol, data in recent_prices.items():
                change = data.get("price_change_percentage_24h", 0)
                prompt_parts.append(f"- {symbol}: {change:+.2f}% (24h)")
        
        prompt_parts.append("\nProvide actionable advice in 2-3 short paragraphs.")
        
        return " ".join(prompt_parts)
    
    @classmethod
    def _get_fallback_insight(
        cls,
        crypto_assets: Optional[List[str]] = None,
        investor_type: Optional[str] = None
    ) -> Dict:
        """
        Get static fallback insight based on user preferences
        
        Args:
            crypto_assets: List of crypto symbols
            investor_type: Type of investor
            
        Returns:
            Dict with static insight
        """
        # Determine which fallback to use based on investor type
        if investor_type == "hodler":
            insight = (
                "As a long-term holder, focus on accumulating quality assets during market dips. "
                "The current market conditions present opportunities for dollar-cost averaging into "
                "established cryptocurrencies with strong fundamentals.\n\n"
                "Bitcoin and Ethereum continue to show resilience as institutional adoption grows. "
                "Consider diversifying across different blockchain ecosystems while maintaining a "
                "core position in blue-chip cryptocurrencies. Remember, patience and conviction in "
                "your investment thesis are key for long-term success."
            )
        elif investor_type == "daytrader":
            insight = (
                "Short-term trading opportunities are present in the current volatility. Monitor "
                "key support and resistance levels closely, and pay attention to trading volume "
                "as confirmation signals.\n\n"
                "Set clear stop-losses to manage risk, and don't chase pumps. The most profitable "
                "trades often come from patience and waiting for optimal entry points. Keep an eye "
                "on Bitcoin dominance as it often signals altcoin season opportunities."
            )
        elif investor_type == "nft":
            insight = (
                "The NFT market is evolving beyond just collectibles into utility-driven projects. "
                "Focus on communities with strong engagement and projects building real value for "
                "holders through exclusive benefits and experiences.\n\n"
                "Blue-chip NFT collections continue to hold value during market downturns. Consider "
                "the long-term potential of projects tied to established brands and those offering "
                "tangible utility. Always research the team, roadmap, and community before investing "
                "in new NFT projects."
            )
        else:
            # General insight
            insight = (
                "The cryptocurrency market remains dynamic with both opportunities and risks. "
                "Diversification across different asset classes and blockchain ecosystems can help "
                "manage volatility while maintaining exposure to growth potential.\n\n"
                "Stay informed about regulatory developments and technological innovations in the "
                "space. Focus on projects with strong fundamentals, active development teams, and "
                "real-world use cases. Remember to only invest what you can afford to lose and "
                "maintain a long-term perspective despite short-term market fluctuations."
            )
        
        # Customize for specific crypto assets if provided
        if crypto_assets and len(crypto_assets) > 0:
            assets_mentioned = []
            for asset in crypto_assets:
                if asset == "BTC":
                    assets_mentioned.append("Bitcoin's position as digital gold")
                elif asset == "ETH":
                    assets_mentioned.append("Ethereum's smart contract ecosystem")
                elif asset == "SOL":
                    assets_mentioned.append("Solana's high-performance network")
            
            if assets_mentioned:
                insight += f"\n\nYour portfolio focus on {', '.join(assets_mentioned)} "
                insight += "provides exposure to key areas of the crypto ecosystem."
        
        return {
            "insight": insight,
            "source": "fallback",
            "model": "static",
            "crypto_assets": crypto_assets or [],
            "investor_type": investor_type
        }
    
    @classmethod
    async def get_market_summary(cls, crypto_assets: List[str]) -> str:
        """
        Get a quick AI-generated market summary for specific assets
        
        Args:
            crypto_assets: List of crypto symbols
            
        Returns:
            Brief market summary text
        """
        settings = get_settings()
        api_key = settings.openrouter_api_key
        
        if not api_key:
            return "Market conditions remain dynamic. Stay informed and trade responsibly."
        
        assets_str = ", ".join(crypto_assets)
        prompt = f"In one sentence, summarize the current market sentiment for {assets_str}."
        
        url = f"{cls.BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": cls.DEFAULT_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 100,
            "temperature": 0.7
        }
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                
                return data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                
        except Exception as e:
            print(f"Failed to get market summary: {str(e)}")
            return "Market conditions remain dynamic. Stay informed and trade responsibly."

