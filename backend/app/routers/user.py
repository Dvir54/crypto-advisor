from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.preferences import Preferences
from app.schemas.preferences import PreferencesRequest, PreferencesResponse

router = APIRouter()


@router.post("/preferences", response_model=PreferencesResponse, status_code=status.HTTP_201_CREATED)
async def save_preferences(
    preferences_data: PreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save or update user preferences from onboarding quiz.
    
    Creates new preferences if they don't exist, or updates existing ones.
    Also marks the user's onboarding as complete.
    """
    # Check if preferences already exist for this user
    existing_preferences = db.query(Preferences).filter(
        Preferences.user_id == current_user.id
    ).first()
    
    if existing_preferences:
        # Update existing preferences
        existing_preferences.crypto_assets = preferences_data.crypto_assets
        existing_preferences.investor_type = preferences_data.investor_type
        existing_preferences.content_types = preferences_data.content_types
        preferences = existing_preferences
    else:
        # Create new preferences
        preferences = Preferences(
            user_id=current_user.id,
            crypto_assets=preferences_data.crypto_assets,
            investor_type=preferences_data.investor_type,
            content_types=preferences_data.content_types
        )
        db.add(preferences)
    
    # Mark onboarding as complete
    current_user.onboarding_complete = True
    
    db.commit()
    db.refresh(preferences)
    db.refresh(current_user)  # Refresh user to get updated onboarding_complete status
    
    return preferences


@router.get("/preferences", response_model=PreferencesResponse)
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user preferences.
    
    Returns the authenticated user's preferences.
    Raises 404 if preferences have not been set yet.
    """
    preferences = db.query(Preferences).filter(
        Preferences.user_id == current_user.id
    ).first()
    
    if not preferences:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preferences not found. Please complete onboarding first."
        )
    
    return preferences

