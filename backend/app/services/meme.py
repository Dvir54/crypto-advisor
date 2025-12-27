import json
import random
from typing import Dict, List, Optional
from pathlib import Path
from fastapi import HTTPException


class MemeService:
    """Service to serve crypto memes from static JSON file"""
    
    # Path to memes JSON file
    MEMES_FILE = Path(__file__).parent.parent / "data" / "memes.json"
    
    # Cache for memes data
    _memes_cache: Optional[List[Dict]] = None
    
    @classmethod
    def _load_memes(cls) -> List[Dict]:
        """
        Load memes from JSON file
        
        Returns:
            List of meme dictionaries
        """
        if cls._memes_cache is not None:
            return cls._memes_cache
        
        try:
            with open(cls.MEMES_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                cls._memes_cache = data.get("memes", [])
                return cls._memes_cache
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail=f"Memes data file not found: {cls.MEMES_FILE}"
            )
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Invalid JSON in memes file: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load memes: {str(e)}"
            )
    
    @classmethod
    def get_random_meme(cls) -> Dict:
        """
        Get a random meme from the collection
        
        Returns:
            Random meme dictionary
        """
        memes = cls._load_memes()
        
        if not memes:
            raise HTTPException(
                status_code=404,
                detail="No memes available"
            )
        
        return random.choice(memes)
    
    @classmethod
    def get_meme_by_id(cls, meme_id: str) -> Optional[Dict]:
        """
        Get a specific meme by ID
        
        Args:
            meme_id: The meme ID to retrieve
            
        Returns:
            Meme dictionary or None if not found
        """
        memes = cls._load_memes()
        
        for meme in memes:
            if meme.get("id") == meme_id:
                return meme
        
        return None
    
    @classmethod
    def get_memes_by_category(cls, category: str, limit: int = 5) -> List[Dict]:
        """
        Get memes filtered by category
        
        Args:
            category: Category to filter by (hodl, trading, nft, etc.)
            limit: Maximum number of memes to return
            
        Returns:
            List of memes in the specified category
        """
        memes = cls._load_memes()
        
        # Filter by category
        filtered_memes = [
            meme for meme in memes 
            if meme.get("category") == category.lower()
        ]
        
        # Shuffle and limit
        random.shuffle(filtered_memes)
        return filtered_memes[:limit]
    
    @classmethod
    def get_memes_by_tags(cls, tags: List[str], limit: int = 5) -> List[Dict]:
        """
        Get memes that match any of the provided tags
        
        Args:
            tags: List of tags to match
            limit: Maximum number of memes to return
            
        Returns:
            List of memes matching the tags
        """
        memes = cls._load_memes()
        tags_lower = [tag.lower() for tag in tags]
        
        # Filter by tags
        filtered_memes = []
        for meme in memes:
            meme_tags = [tag.lower() for tag in meme.get("tags", [])]
            if any(tag in meme_tags for tag in tags_lower):
                filtered_memes.append(meme)
        
        # Shuffle and limit
        random.shuffle(filtered_memes)
        return filtered_memes[:limit]
    
    @classmethod
    def get_all_memes(cls) -> List[Dict]:
        """
        Get all available memes
        
        Returns:
            List of all memes
        """
        return cls._load_memes()
    
    @classmethod
    def get_categories(cls) -> List[str]:
        """
        Get list of all available meme categories
        
        Returns:
            List of unique categories
        """
        memes = cls._load_memes()
        categories = set()
        
        for meme in memes:
            category = meme.get("category")
            if category:
                categories.add(category)
        
        return sorted(list(categories))
    
    @classmethod
    def get_meme_stats(cls) -> Dict:
        """
        Get statistics about the meme collection
        
        Returns:
            Dictionary with meme statistics
        """
        memes = cls._load_memes()
        categories = cls.get_categories()
        
        return {
            "total_memes": len(memes),
            "categories": categories,
            "category_counts": {
                category: len(cls.get_memes_by_category(category, limit=1000))
                for category in categories
            }
        }
    
    @classmethod
    def reload_memes(cls) -> None:
        """
        Force reload memes from file (clears cache)
        """
        cls._memes_cache = None
        cls._load_memes()

