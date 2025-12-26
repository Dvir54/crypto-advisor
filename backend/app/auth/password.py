"""Password hashing and verification utilities using bcrypt."""
from passlib.context import CryptContext

# Create bcrypt context for password hashing
# Bcrypt is specifically designed for password hashing with built-in salt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    Args:
        password: Plain text password from user input
    
    Returns:
        Hashed password string (includes salt)
    
    # Store 'hashed' in database, NEVER store plain password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password from login form
        hashed_password: Stored hashed password from database
    
    Returns:
        True if password matches, False otherwise
    
    """
    return pwd_context.verify(plain_password, hashed_password)

