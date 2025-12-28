# AI Tool Usage Summary - Cursor AI Collaboration

## Project: Crypto Advisor - Full Stack Application

### Day 1 - Project Setup & Backend Foundation

**Me:** I need to start a new crypto advisor project with FastAPI and React. Can you help me create the basic folder structure?

**Cursor AI:** Absolutely! I'll help you set up a well-organized monorepo structure. Let me create the directories:

```
cryptoAdvisor/
├── backend/          # Python FastAPI backend
├── frontend/         # React TypeScript frontend
└── README.md
```

For the backend, we'll structure it following FastAPI best practices with separation of concerns:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app initialization
│   ├── config.py         # Environment configuration
│   ├── database.py       # Database connection
│   ├── auth/             # Authentication logic
│   ├── models/           # SQLAlchemy ORM models
│   ├── routers/          # API endpoints
│   ├── schemas/          # Pydantic validation schemas
│   └── services/         # External API integrations
├── alembic/              # Database migrations
├── requirements.txt
└── .env.example
```

This structure keeps your code modular and maintainable. Each directory has a specific purpose, making it easy to find and modify code later.

---

**Me:** What Python packages do I need for FastAPI with JWT authentication and PostgreSQL?

**Cursor AI:** Great question! Let me break down the dependencies you'll need and why:

**Core Framework:**
- `fastapi==0.104.1` - The web framework itself
- `uvicorn==0.24.0` - ASGI server to run FastAPI (with --reload for development)

**Database:**
- `sqlalchemy==2.0.23` - ORM for database operations
- `psycopg2-binary==2.9.9` - PostgreSQL adapter for Python
- `alembic==1.12.1` - Database migration tool (like Git for your database schema)

**Authentication:**
- `python-jose[cryptography]==3.3.0` - For creating and validating JWT tokens
- `passlib[bcrypt]==1.7.4` - For secure password hashing with bcrypt algorithm
- `python-multipart==0.0.6` - Needed for form data parsing (login forms)

**Configuration & HTTP:**
- `python-dotenv==1.0.0` - Load environment variables from .env file
- `httpx==0.25.1` - Modern HTTP client for calling external APIs
- `pydantic==2.5.0` - Data validation (comes with FastAPI but good to specify)
- `pydantic-settings==2.1.0` - For managing configuration settings

I'll create the requirements.txt file with these dependencies. You can install them all at once with `pip install -r requirements.txt` after creating your virtual environment.

---

**Me:** Now create the database.py file with SQLAlchemy setup

**Cursor AI:** Great! Let me create the database setup in `database.py`. This is the foundation for all your database operations:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create database engine
# pool_pre_ping=True checks if connection is alive before using it
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=True  # Set to False in production (logs all SQL queries)
)

# SessionLocal will be used to create database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    """
    Create a database session for each request.
    Automatically closes the session when done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**How to use this in your routes:**
```python
from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    # 'db' is automatically created and closed
    users = db.query(User).all()
    return users
```

**Setting up your DATABASE_URL:**
In your `.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/crypto_advisor
```

For local development:
1. Install PostgreSQL
2. Create a database: `createdb crypto_advisor`
3. Update the connection string with your credentials

The `get_db()` function is a dependency injection pattern - FastAPI will automatically provide a database session to any route that needs it, and clean it up when the request is done. This prevents database connection leaks!

---

**Me:** How do I hash passwords securely in Python?

**Cursor AI:** Excellent question - password security is critical! We'll use bcrypt through the passlib library. Let me create an `auth/password.py` file and explain how it works:

```python
from passlib.context import CryptContext

# Create a password context with bcrypt algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.
    Bcrypt automatically generates a salt and includes it in the hash.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hashed password.
    Returns True if they match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)
```

**How bcrypt works:**
1. When a user signs up, we hash their password with `hash_password("mypassword123")`
2. Bcrypt automatically generates a random "salt" and combines it with the password
3. The result is a one-way hash - you can't reverse it to get the original password
4. When they log in, we compare their input with the stored hash using `verify_password()`
5. Even if someone gets your database, they can't use the hashes to log in

**Why bcrypt?**
- It's intentionally slow, making brute-force attacks impractical
- Each password gets a unique salt automatically
- It's adaptive - you can increase the cost factor as computers get faster

Never store passwords in plain text, and never use simple hashing like MD5 or SHA1 for passwords!

---

**Me:** Create the JWT token generation function

**Cursor AI:** Perfect! JWT (JSON Web Tokens) will handle your authentication. Let me create `auth/jwt.py` with detailed explanations:

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from app.config import settings

# Algorithm used for encoding/decoding
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token for user authentication.
    
    Args:
        data: Dictionary containing user information (typically user_id and email)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token as a string
    """
    # Create a copy to avoid modifying the original
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add expiration to the token payload
    to_encode.update({"exp": expire})
    
    # Encode the token with your secret key
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT token.
    
    Returns:
        Dictionary with token data if valid, None if invalid/expired
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

**How JWT works:**
1. When a user logs in successfully, you create a token with their user ID
2. The token is signed with your SECRET_KEY - this proves it came from your server
3. You send this token back to the client (they store it in localStorage or a cookie)
4. For protected routes, the client sends the token in the Authorization header
5. Your server validates the token and extracts the user ID to know who's making the request

**Important security notes:**
- The SECRET_KEY must be kept secret and never committed to Git
- Tokens expire after 30 minutes (you can adjust this)
- The token is signed but not encrypted - don't put sensitive data in it
- Always use HTTPS in production to prevent token interception

---

**Me:** Now I need a signup endpoint. Where should I put it?

**Cursor AI:** Create it in `routers/auth.py`. This keeps authentication routes organized. Let me create the complete auth router with both signup and login endpoints:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(request.password)
    new_user = User(
        email=request.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": new_user.id, "email": new_user.email}
    }

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    
    # Verify credentials
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email}
    }
```

This provides secure signup and login with JWT tokens!

---

**Me:** How do I protect routes that need authentication?

**Cursor AI:** Create a dependency function that validates the JWT token and returns the current user. Let me create `auth/dependencies.py`:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.auth.jwt import decode_access_token

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user.
    Validates JWT token and returns the user object.
    """
    token = credentials.credentials
    
    # Decode token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user from database
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user
```

**Usage in protected routes:**
```python
@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email}
```

Now any route using `Depends(get_current_user)` requires a valid JWT token!

---

**Me:** Set up Alembic for database migrations

**Cursor AI:** Running `alembic init alembic` and configuring it to work with your SQLAlchemy models. First, initialize Alembic:

```bash
alembic init alembic
```

Then update `alembic/env.py` to use your models:

```python
from app.database import Base
from app.models.user import User
from app.models.preferences import Preferences
from app.models.vote import Vote

# Set target metadata
target_metadata = Base.metadata
```

And configure `alembic.ini` with your database URL, or better yet, use the config:

```python
from app.config import settings
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL)
```

Now you can create and run migrations!

---

**Me:** Create the initial migration for the User table

**Cursor AI:** Use `alembic revision --autogenerate -m "initial migration"` to create the migration file. This will scan your models and generate the migration automatically:

```bash
alembic revision --autogenerate -m "Add user table"
```

Alembic will create a file in `alembic/versions/` with the up and down migrations. Review it to make sure it looks correct!

---

**Me:** I want to store crypto_assets as a list, investor_type as a string, and content_interests as a list in Preferences

**Cursor AI:** SQLAlchemy doesn't support list types directly. I'll use JSON columns for the list fields. Let me create `models/preferences.py`:

```python
from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Preferences(Base):
    __tablename__ = "preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # JSON columns for lists
    crypto_assets = Column(JSON, nullable=False)  # ["bitcoin", "ethereum"]
    investor_type = Column(String, nullable=False)  # "moderate"
    content_interests = Column(JSON, nullable=False)  # ["news", "memes"]
    
    # Relationship
    user = relationship("User", back_populates="preferences")
```

JSON columns let you store Python lists/dicts as JSON in PostgreSQL. You can query and update them as normal Python objects!

---

### Day 2 - External APIs & Frontend Setup

**Me:** I need to integrate CoinGecko API to get crypto prices. Can you show me how to write the service?

**Cursor AI:** Absolutely! Let me create a robust CoinGecko service in `services/coingecko.py`. External API integration requires good error handling and structure:

```python
import httpx
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

class CoinGeckoService:
    """Service for fetching cryptocurrency data from CoinGecko API"""
    
    def __init__(self):
        self.base_url = COINGECKO_BASE_URL
        self.client = httpx.AsyncClient(timeout=10.0)
    
    async def get_coin_prices(self, coin_ids: List[str]) -> Optional[List[Dict]]:
        """
        Fetch current prices for multiple cryptocurrencies.
        
        Args:
            coin_ids: List of coin IDs (e.g., ["bitcoin", "ethereum"])
            
        Returns:
            List of dictionaries with coin data, or None if request fails
        """
        try:
            ids_param = ",".join(coin_ids)
            
            response = await self.client.get(
                f"{self.base_url}/coins/markets",
                params={
                    "vs_currency": "usd",
                    "ids": ids_param,
                    "order": "market_cap_desc",
                    "sparkline": False,
                    "price_change_percentage": "24h"
                }
            )
            
            response.raise_for_status()
            data = response.json()
            
            # Transform to simplified format
            coins = []
            for coin in data:
                coins.append({
                    "id": coin["id"],
                    "symbol": coin["symbol"].upper(),
                    "name": coin["name"],
                    "current_price": coin["current_price"],
                    "price_change_24h": coin["price_change_percentage_24h"],
                    "market_cap": coin["market_cap"],
                    "image": coin["image"]
                })
            
            return coins
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching coin prices: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching coin prices: {e}")
            return None
```

**Key concepts:**
- `async/await` for non-blocking requests
- Error handling with try/except
- Logging for debugging
- Data transformation to simplify the response

---

**Me:** Now the AI insights with OpenRouter. How do I structure the prompt to get good personalized advice?

**Cursor AI:** Great question! Prompt engineering is crucial for getting quality AI responses. Let me create `services/openrouter.py` with a well-structured prompt:

```python
import httpx
from typing import Dict, Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

class OpenRouterService:
    """Service for generating AI insights using OpenRouter"""
    
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def generate_insight(
        self, 
        preferences: Dict, 
        market_data: Dict
    ) -> Optional[str]:
        """Generate a personalized crypto market insight."""
        try:
            system_message = self._build_system_message()
            user_prompt = self._build_user_prompt(preferences, market_data)
            
            response = await self.client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "meta-llama/llama-3.1-8b-instruct:free",
                    "messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": user_prompt}
                    ],
                    "max_tokens": 200,
                    "temperature": 0.7
                }
            )
            
            response.raise_for_status()
            data = response.json()
            insight = data["choices"][0]["message"]["content"]
            return insight.strip()
            
        except Exception as e:
            logger.error(f"Error generating insight: {e}")
            return None
    
    def _build_system_message(self) -> str:
        """System message defines the AI's role and behavior."""
        return """You are a knowledgeable cryptocurrency market analyst with years of experience. 
Your job is to provide clear, balanced insights about the crypto market tailored to each user's 
interests and investment style. Be conversational and helpful, but never give specific financial 
advice like "buy" or "sell". Focus on market trends, sentiment, and educational insights. 
Keep responses concise - 2-3 sentences maximum."""
    
    def _build_user_prompt(self, preferences: Dict, market_data: Dict) -> str:
        """User prompt provides specific context for personalization."""
        crypto_assets = ", ".join(preferences.get("crypto_assets", []))
        investor_type = preferences.get("investor_type", "moderate")
        interests = ", ".join(preferences.get("content_interests", []))
        
        market_summary = self._summarize_market_data(market_data)
        
        prompt = f"""
User Profile:
- Cryptocurrencies of interest: {crypto_assets}
- Investor type: {investor_type}
- Content interests: {interests}

Current Market Snapshot:
{market_summary}

Based on this user's profile and the current market conditions, provide a brief, 
personalized insight that would be valuable to them. Speak directly to the user 
in a friendly but professional tone.
        """.strip()
        
        return prompt
    
    def _summarize_market_data(self, market_data: Dict) -> str:
        """Convert raw market data into human-readable summary."""
        summaries = []
        for coin in market_data.get("coins", [])[:3]:
            name = coin["name"]
            price = coin["current_price"]
            change = coin["price_change_24h"]
            direction = "up" if change > 0 else "down"
            summaries.append(f"- {name}: ${price:,.2f} ({direction} {abs(change):.1f}%)")
        
        return "\n".join(summaries)
```

**Prompt engineering breakdown:**
1. **System Message** - defines the AI's role, tone, and boundaries
2. **User Prompt** - provides user context and current market data
3. **Parameters** - temperature 0.7 for creative but focused responses, max_tokens 200 to keep it concise

The AI adapts its language based on whether the user is conservative (focuses on stability) or aggressive (mentions opportunities)!

---

**Me:** Okay backend is looking good. Let me start the frontend. I've never really done React before. Can you explain what React is and how to set it up?

**Cursor AI:** Of course! Let me explain React from the ground up, then we'll set up your project.

**What is React?**
React is a JavaScript library for building user interfaces. Think of it like LEGO blocks:
- Each piece of your UI is a "component" (like a button, form, or card)
- Components can be reused everywhere
- When data changes, React automatically updates the UI
- You write in JSX (looks like HTML but it's JavaScript)

**Key Concepts:**

**1. Components** - Reusable UI pieces
```jsx
function Button() {
  return <button>Click me</button>;
}
```

**2. Props** - Passing data to components
```jsx
function Greeting({ name }) {
  return <h1>Hello {name}!</h1>;
}
// Usage: <Greeting name="Alice" />
```

**3. State** - Data that can change
```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

**4. Effects** - Side effects (API calls, subscriptions)
```jsx
useEffect(() => {
  fetchData();
}, []); // Empty array = run once on mount
```

**Setting up your project:**

Run this command:
```bash
npm create vite@latest frontend -- --template react-ts
```

This creates a React app with:
- **Vite** - super fast build tool
- **TypeScript** - adds types to JavaScript for fewer bugs
- **React 19** - latest version

After creation:
```bash
cd frontend
npm install
npm run dev
```

Your app will run at `http://localhost:5173` with hot reload!

---

**Me:** Yes! What packages do I need for routing and making API calls?

**Cursor AI:** Perfect! You'll need a few essential packages. Let me explain each one:

**1. React Router** - for navigation between pages
```bash
npm install react-router-dom
```

This lets you create multiple pages without full page reloads (Single Page Application).

Example:
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
</BrowserRouter>
```

**2. Axios** - for HTTP requests
```bash
npm install axios
```

Axios makes API calls cleaner than fetch:
```typescript
// Axios (cleaner)
const { data } = await axios.get('/api/coins');

// vs fetch (verbose)
const response = await fetch('/api/coins');
const data = await response.json();
```

Axios also has better error handling, supports interceptors, and can set default headers!

Install both:
```bash
npm install react-router-dom axios
```

---

**Me:** Yes, set up React Router. But I don't really understand how routing works in a SPA. Can you explain?

**Cursor AI:** Great question! This is fundamental. Let me explain the difference:

**Traditional Multi-Page Website:**
```
User clicks "About" link
→ Browser requests /about from server
→ Server sends entire HTML page
→ Page reloads (white flash)
→ Browser renders new page
```

**Single Page Application (SPA) with React Router:**
```
User clicks "About" link
→ React Router intercepts the click
→ Changes URL to /about (no server request!)
→ React unmounts old component, mounts new one
→ Instant transition, no reload
```

**Benefits:**
- Faster (no page reload)
- Smoother transitions (you can animate them)
- Keeps app state (like auth) alive
- Feels like a native app

**How it works in code:**

```tsx
// main.tsx - Wrap your app
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

```tsx
// App.tsx - Define routes
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}
```

**Navigation:**
```tsx
import { Link, useNavigate } from 'react-router-dom';

// Use Link for navigation
<Link to="/login">Login</Link>  ✅

// Or navigate programmatically
const navigate = useNavigate();
navigate('/dashboard');
```

**The deployment catch:**
When you deploy, you need to configure your server to always serve `index.html` for any route. Otherwise refreshing `/dashboard` will give a 404. We'll handle this with `vercel.json` later!

---

**Me:** Yes please! And can you explain what that `element={}` syntax is? The curly braces confuse me.

**Cursor AI:** Absolutely! The curly braces `{}` are fundamental to JSX. Let me break this down:

**JSX = HTML-like syntax in JavaScript**

In JSX, you have two "modes":

**1. HTML Mode** (outside braces):
```jsx
<div>Hello world</div>  // This is just text
```

**2. JavaScript Mode** (inside braces):
```jsx
<div>{5 + 5}</div>  // Displays: 10
<div>{user.name}</div>  // Displays user's name
<div>{isLoggedIn ? 'Welcome' : 'Please login'}</div>
```

**Think of braces as an "escape hatch" to JavaScript.**

**Examples:**

```jsx
// ❌ Without braces - React thinks "count" is literal text
<p>You clicked count times</p>

// ✅ With braces - React evaluates the variable
<p>You clicked {count} times</p>
```

```jsx
// Passing a string - quotes are fine
<Greeting name="Alice" />

// Passing a number - need braces!
<Counter initialCount={0} />
```

```jsx
// Passing a component - needs braces
<Route path="/login" element={<LoginPage />} />
// Because <LoginPage /> is JavaScript (React component)
```

**More examples:**
```jsx
function Profile() {
  const user = { name: 'Alice', age: 25 };
  const isAdmin = true;
  
  return (
    <div>
      {/* JavaScript expressions */}
      <h1>{user.name}</h1>
      <p>Age: {user.age}</p>
      
      {/* Conditional rendering */}
      {isAdmin && <button>Admin Panel</button>}
      
      {/* Ternary */}
      {user.age >= 18 ? <p>Adult</p> : <p>Minor</p>}
      
      {/* Map over array */}
      {['red', 'blue'].map(color => (
        <div key={color}>{color}</div>
      ))}
      
      {/* Inline styles (TWO sets of braces!) */}
      <div style={{ color: 'red', fontSize: '20px' }}>
        Styled text
      </div>
    </div>
  );
}
```

**Double braces explained:**
```jsx
style={{ color: 'red' }}
```
- Outer braces: "I'm writing JavaScript"
- Inner braces: "I'm creating a JavaScript object"

Does this make sense?

---

**Me:** Yes that helps! Now create the AuthContext. But first - what exactly is React Context? Why do I need it?

**Cursor AI:** Excellent question! Context solves a common problem in React called "prop drilling".

**The Problem:**

Imagine your app structure:
```
App
└── Navbar
    └── UserMenu
        └── LogoutButton  // Needs user info!
```

Without Context:
```tsx
<App user={user}>
  <Navbar user={user}>
    <UserMenu user={user}>
      <LogoutButton user={user} />  // Finally used here!
    </UserMenu>
  </Navbar>
</App>
```

You have to pass `user` through EVERY component, even if Navbar and UserMenu don't need it!

**The Solution: React Context**

Context is like a "global variable" for your component tree:

```tsx
// Create context
const AuthContext = createContext();

// Provider wraps your app
<AuthContext.Provider value={user}>
  <App>
    <Navbar>
      <UserMenu>
        <LogoutButton />  // Can access user directly!
      </UserMenu>
    </Navbar>
  </App>
</AuthContext.Provider>

// Any component can access it
function LogoutButton() {
  const user = useContext(AuthContext);
}
```

**When to use Context:**
- ✅ Authentication (current user, login/logout)
- ✅ Theme (dark mode / light mode)
- ✅ Language/localization
- ❌ Don't use for ALL state (use regular state for component-specific data)

**Now let's build AuthContext:**

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', {
      email,
      password
    });
    
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    setUser(user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  };

  const signup = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/signup', {
      email,
      password
    });
    
    const { access_token, user } = response.data;
    localStorage.setItem('token', access_token);
    setUser(user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Key concepts:**

**localStorage:**
- Browser storage that persists after closing the tab
- `localStorage.setItem('token', 'abc123')` - save
- `localStorage.getItem('token')` - retrieve

**Why checkAuth on mount?**
- When user refreshes, React state is lost
- But the token is still in localStorage!
- `checkAuth()` verifies the token and restores user state
- Keeps users logged in across page refreshes

**The loading state:**
- While `checkAuth()` runs, we don't know if user is logged in
- Show a loading spinner during this time
- Prevents flash of wrong content

---

**Me:** Create the login page. Can you explain forms in React?

**Cursor AI:** Perfect question! React forms ARE different from regular HTML.

**Regular HTML Form (uncontrolled):**
```html
<form onsubmit="handleSubmit()">
  <input name="email" />
  <button>Submit</button>
</form>
```
Browser controls the value.

**React Form (controlled):**
```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </form>
  );
}
```
React controls the value through state.

**Why controlled inputs?**
- Validate as user types
- Disable submit if invalid
- Format input (e.g., auto-uppercase)
- Clear form easily (just reset state)

**Full LoginPage:**

```tsx
// pages/LoginPage.tsx
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();  // Don't reload page!
    
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Log in to your crypto advisor account</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <p className="footer-text">
          Don't have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
```

**Key points:**

**1. e.preventDefault()** - prevents form from reloading the page
**2. Conditional rendering** - `{error && <div>{error}</div>}` only shows if error exists
**3. Disabled state** - `disabled={loading}` prevents double-submission
**4. htmlFor** - JSX uses `htmlFor` instead of `for` (reserved keyword)
**5. className** - JSX uses `className` instead of `class`

The page has proper error handling, loading states, and a beautiful design!

---

### Day 3 - Dashboard, Features & Deployment

**Me:** The login works! Now I need to create the dashboard. But I'm confused about how to fetch data in React. Where do I make API calls?

**Cursor AI:** Excellent question! Data fetching in React has a specific pattern.

**Where to fetch data:**
- ❌ **NOT** in the component body (runs on every render)
- ✅ **YES** in `useEffect` hook

**The useEffect Hook:**

```tsx
function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Runs AFTER first render
    fetchData();
  }, []); // Dependencies array
  
  return <div>{data}</div>;
}
```

**Dependency array explained:**

```tsx
// Runs ONCE on mount
useEffect(() => {
  fetchUserData();
}, []);

// Runs when userId changes
useEffect(() => {
  fetchUserData(userId);
}, [userId]);

// Runs after EVERY render (usually a mistake!)
useEffect(() => {
  fetchData();
});
```

**Common pattern:**

```tsx
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/data');
        setData(response.data);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;
  
  return <div>{/* Render data */}</div>;
}
```

**For your dashboard, you need multiple API calls. Best approach: Custom hook!**

```tsx
// hooks/useContentData.ts
import { useState, useEffect } from 'react';
import { contentService } from '../services/contentService';

interface ContentData {
  coins: Coin[];
  news: NewsArticle[];
  insight: string;
  meme: Meme;
}

export function useContentData() {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel with Promise.all
      const [coinsRes, newsRes, insightRes, memeRes] = await Promise.all([
        contentService.getCoinPrices(),
        contentService.getNews(),
        contentService.getInsights(),
        contentService.getMeme()
      ]);

      setData({
        coins: coinsRes.data,
        news: newsRes.data,
        insight: insightRes.data.text,
        meme: memeRes.data
      });

    } catch (err: any) {
      console.error('Error fetching content:', err);
      setError(err.response?.data?.detail || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchAllContent };
}
```

**Why custom hooks are great:**
1. **Reusable** - use in any component
2. **Clean** - keeps component focused on UI
3. **Testable** - can test separately
4. **Maintainable** - data logic in one place

**Promise.all explained:**
```tsx
// Sequential (slow - 2 seconds total)
const coins = await fetchCoins();  // 1 second
const news = await fetchNews();    // 1 second

// Parallel (fast - 1 second total)
const [coins, news] = await Promise.all([
  fetchCoins(),   // Both run
  fetchNews()     // at once!
]);
```

---

**Me:** Yes please! And can you show me how to set up axios with the base URL and authorization headers?

**Cursor AI:** Absolutely! Axios configuration is crucial for clean API setup.

**Create axios instance:**

```tsx
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor - runs BEFORE every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - runs AFTER every response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

**Explained:**

**1. Create instance:**
- `baseURL` - prepended to all requests
- `import.meta.env.VITE_API_URL` - reads from .env
- `timeout` - fails if takes longer than 10s

**2. Environment variables in Vite:**
```env
# .env
VITE_API_URL=http://localhost:8000
```
Must start with `VITE_` to be accessible.

**3. Request interceptor:**
- Runs before EVERY request
- Automatically adds auth token
- No more manual Authorization headers!

**4. Response interceptor:**
- Runs after EVERY response
- Handles 401 errors globally
- Auto-logout if token expired

**Now create content service:**

```tsx
// services/contentService.ts
import api from './api';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  market_cap: number;
  image: string;
}

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
}

interface Insight {
  text: string;
  generated_at: string;
}

interface Meme {
  id: string;
  title: string;
  image_url: string;
  tags: string[];
}

export const contentService = {
  getCoinPrices: () => {
    return api.get<Coin[]>('/api/content/coins');
  },

  getNews: () => {
    return api.get<NewsArticle[]>('/api/content/news');
  },

  getInsights: () => {
    return api.get<Insight>('/api/content/insights');
  },

  getMeme: () => {
    return api.get<Meme>('/api/content/meme');
  }
};
```

**Why organize like this?**

**1. Type safety** - TypeScript knows the response types
**2. Single source of truth** - change endpoint once, updates everywhere
**3. Easy to mock** - for testing

This keeps your API calls clean and maintainable!

---

**Me:** Create the dashboard page now

**Cursor AI:** Perfect! Let me create the dashboard that uses our custom hook:

```tsx
// pages/DashboardPage.tsx
import { useContentData } from '../hooks/useContentData';
import { useAuth } from '../contexts/AuthContext';
import { CoinPricesSection } from '../components/dashboard/CoinPricesSection';
import { NewsSection } from '../components/dashboard/NewsSection';
import { InsightSection } from '../components/dashboard/InsightSection';
import { MemeSection } from '../components/dashboard/MemeSection';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useContentData();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your personalized dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.email}</h1>
        <button onClick={refetch} className="refresh-btn">
          🔄 Refresh
        </button>
      </header>

      <div className="dashboard-grid">
        <CoinPricesSection coins={data.coins} />
        <NewsSection news={data.news} />
        <InsightSection insight={data.insight} />
        <MemeSection meme={data.meme} onNext={refetch} />
      </div>
    </div>
  );
}

export default DashboardPage;
```

This cleanly handles loading, error, and success states, then renders the content sections!

---

**Me:** Create one of the section components, like CoinPricesSection. I want to understand how to pass data to child components.

**Cursor AI:** Excellent! Let me create `CoinPricesSection` and explain props in detail:

**Props = "Properties" = Data passed from parent to child**

```tsx
// Parent passes data
<CoinPricesSection coins={coinData} />

// Child receives data
function CoinPricesSection({ coins }) {
  // Use coins here
}
```

**Full component:**

```tsx
// components/dashboard/CoinPricesSection.tsx
interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  market_cap: number;
  image: string;
}

interface CoinPricesSectionProps {
  coins: Coin[];
}

export function CoinPricesSection({ coins }: CoinPricesSectionProps) {
  return (
    <section className="dashboard-section">
      <h2>📈 Your Crypto Prices</h2>
      
      <div className="coins-grid">
        {coins.map((coin) => (
          <div key={coin.id} className="coin-card">
            <div className="coin-header">
              <img src={coin.image} alt={coin.name} className="coin-icon" />
              <div>
                <h3>{coin.name}</h3>
                <span className="coin-symbol">{coin.symbol}</span>
              </div>
            </div>
            
            <div className="coin-price">
              ${coin.current_price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            
            <div className={`coin-change ${coin.price_change_24h >= 0 ? 'positive' : 'negative'}`}>
              {coin.price_change_24h >= 0 ? '▲' : '▼'} 
              {Math.abs(coin.price_change_24h).toFixed(2)}%
            </div>
            
            <div className="coin-marketcap">
              Market Cap: ${(coin.market_cap / 1_000_000_000).toFixed(2)}B
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Key concepts explained:**

**1. Props interface:**
```tsx
interface CoinPricesSectionProps {
  coins: Coin[];
}
```
TypeScript definition - `coins` is an array of `Coin` objects.

**2. Destructuring props:**
```tsx
function CoinPricesSection({ coins }: CoinPricesSectionProps) {
  // Can use 'coins' directly
}
// vs
function CoinPricesSection(props: CoinPricesSectionProps) {
  // Would need to use 'props.coins'
}
```

**3. .map() for lists:**
```tsx
{coins.map((coin) => (
  <div key={coin.id}>...</div>
))}
```
- Loops through each coin
- Returns JSX for each one
- `key` is required (helps React track items)

**4. Conditional className:**
```tsx
className={`coin-change ${coin.price_change_24h >= 0 ? 'positive' : 'negative'}`}
```
- Backticks for template literals
- `${}` to embed expressions
- Ternary operator for conditional class

**5. Number formatting:**
```tsx
coin.current_price.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})
```
Formats: `1234.5` → `$1,234.50`

**6. Math operations:**
```tsx
Math.abs(coin.price_change_24h)  // Absolute value
.toFixed(2)  // Round to 2 decimals
(coin.market_cap / 1_000_000_000)  // Convert to billions
```

**Data flow:**
```
Dashboard (has data)
    ↓ passes coins prop
CoinPricesSection (displays data)
```

This is "one-way data flow" - data flows down from parent to child!

---

**Me:** I want users to vote on content with like/dislike buttons. How do I implement this?

**Cursor AI:** Great feature! This involves both backend and frontend. Let me walk you through it:

**Backend - Vote model already created, now add the endpoint:**

```python
# routers/vote.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vote import Vote
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/votes", tags=["votes"])

@router.post("")
def create_or_update_vote(
    content_type: str,
    content_id: str,
    vote_type: str,  # "like" or "dislike"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if vote already exists
    existing_vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.content_type == content_type,
        Vote.content_id == content_id
    ).first()
    
    if existing_vote:
        # Update existing vote
        existing_vote.vote_type = vote_type
    else:
        # Create new vote
        new_vote = Vote(
            user_id=current_user.id,
            content_type=content_type,
            content_id=content_id,
            vote_type=vote_type
        )
        db.add(new_vote)
    
    db.commit()
    return {"status": "success"}

@router.delete("")
def delete_vote(
    content_type: str,
    content_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vote = db.query(Vote).filter(
        Vote.user_id == current_user.id,
        Vote.content_type == content_type,
        Vote.content_id == content_id
    ).first()
    
    if vote:
        db.delete(vote)
        db.commit()
    
    return {"status": "success"}
```

**Frontend - Create VoteButtons component:**

```tsx
// components/VoteButtons.tsx
import { useState } from 'react';
import { voteService } from '../services/voteService';
import './VoteButtons.css';

interface VoteButtonsProps {
  contentType: string;
  contentId: string;
  initialVote?: 'like' | 'dislike' | null;
}

export function VoteButtons({ contentType, contentId, initialVote = null }: VoteButtonsProps) {
  const [vote, setVote] = useState<'like' | 'dislike' | null>(initialVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType: 'like' | 'dislike') => {
    try {
      setLoading(true);
      
      if (vote === voteType) {
        // Clicking same button - remove vote
        await voteService.deleteVote(contentType, contentId);
        setVote(null);
      } else {
        // New vote or changing vote
        await voteService.createVote(contentType, contentId, voteType);
        setVote(voteType);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn ${vote === 'like' ? 'active' : ''}`}
        onClick={() => handleVote('like')}
        disabled={loading}
        aria-label="Like"
      >
        👍
      </button>
      
      <button
        className={`vote-btn ${vote === 'dislike' ? 'active' : ''}`}
        onClick={() => handleVote('dislike')}
        disabled={loading}
        aria-label="Dislike"
      >
        👎
      </button>
    </div>
  );
}
```

**Create vote service:**

```tsx
// services/voteService.ts
import api from './api';

export const voteService = {
  createVote: (contentType: string, contentId: string, voteType: string) => {
    return api.post('/api/votes', null, {
      params: { content_type: contentType, content_id: contentId, vote_type: voteType }
    });
  },

  deleteVote: (contentType: string, contentId: string) => {
    return api.delete('/api/votes', {
      params: { content_type: contentType, content_id: contentId }
    });
  }
};
```

**Usage in NewsSection:**

```tsx
// In NewsSection component
{news.map((article) => (
  <div key={article.id} className="news-card">
    <h3>{article.title}</h3>
    <a href={article.url} target="_blank" rel="noopener noreferrer">
      Read more
    </a>
    
    <VoteButtons 
      contentType="news"
      contentId={article.id}
    />
  </div>
))}
```

**Key concepts:**

**1. Optimistic UI:**
```tsx
setVote(voteType);  // Update UI immediately
await voteService.createVote(...);  // Then sync with server
```
Makes the app feel instant!

**2. Toggle logic:**
```tsx
if (vote === voteType) {
  // Already liked - remove like
} else {
  // Not liked or was disliked - add like
}
```

**3. Active state:**
```tsx
className={`vote-btn ${vote === 'like' ? 'active' : ''}`}
```
Highlights the active button.

**4. Disabled during loading:**
```tsx
disabled={loading}
```
Prevents double-clicks.

This creates a smooth voting experience with proper state management!

---

**Me:** Now I need to deploy this. I'm using Vercel for frontend. What files do I need to configure?

**Cursor AI:** Perfect! For Vercel deployment, you need to configure how it handles your Single Page Application. The main issue is that Vercel needs to serve `index.html` for all routes (not just `/`).

**Why?** 
When a user visits `yourapp.vercel.app/dashboard`, Vercel looks for a file at `/dashboard`. But in a SPA, all routes are handled by JavaScript - there's only `index.html`!

**Create `vercel.json`:**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Explained:**

**1. rewrites:**
```json
"source": "/(.*)",
"destination": "/index.html"
```
- `(.*)` matches ANY path
- All routes serve `index.html`
- React Router then handles the actual routing

**2. buildCommand:**
```json
"buildCommand": "npm run build"
```
Tells Vercel how to build your app (runs `vite build`).

**3. outputDirectory:**
```json
"outputDirectory": "dist"
```
Where Vite puts the built files (default for Vite).

**4. framework:**
```json
"framework": "vite"
```
Tells Vercel you're using Vite (auto-optimizations).

**Environment variables:**

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-backend.railway.app`
3. Important: Add it for **Production**, **Preview**, and **Development**

**Deployment steps:**

1. **Connect to GitHub:**
   - Push your code to GitHub
   - Import project in Vercel
   - Vercel auto-detects it's a Vite project

2. **Configure:**
   - Root directory: `frontend`
   - Build command: `npm run build` (auto-detected)
   - Output directory: `dist` (auto-detected)

3. **Add environment variables** (as above)

4. **Deploy!**
   - Vercel builds and deploys automatically
   - Every push to `main` triggers a new deployment
   - Pull requests get preview deployments!

**Testing the deployment:**
```bash
# Test production build locally first
npm run build
npm run preview
```

This ensures your app works in production mode before deploying!

---

**Me:** What about the backend on Railway? I've heard about Procfile and railway.json. What are those?

**Cursor AI:** Excellent question! Railway needs to know how to run your Python app. Let's set it up properly.

**What is Railway?**
Railway is a deployment platform that:
- Hosts your backend
- Provides PostgreSQL database
- Auto-deploys from GitHub
- Manages environment variables

**1. Create `Procfile`:**

A Procfile tells Railway what command to run to start your app.

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Explained:**
- `web:` - defines a web process
- `uvicorn app.main:app` - runs your FastAPI app
- `--host 0.0.0.0` - listen on all network interfaces (required for Railway)
- `--port $PORT` - Railway provides the PORT variable dynamically

**Why `$PORT`?**
Railway assigns a random port (like 8080 or 3000). Your app must use Railway's port, not hardcode 8000!

**2. Create `railway.json` (optional but recommended):**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Explained:**

**builder: "NIXPACKS":**
- Railway's build system
- Auto-detects Python and installs requirements.txt

**startCommand:**
- Same as Procfile (Procfile takes priority if both exist)
- Good to have as backup

**restartPolicyType:**
- Automatically restarts if app crashes
- "ON_FAILURE" = only restart on errors, not on normal exit

**restartPolicyMaxRetries:**
- Try restarting up to 10 times
- Prevents infinite restart loops

**3. Make sure `requirements.txt` is complete:**

Railway installs everything from `requirements.txt`:

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
httpx==0.25.1
pydantic==2.5.0
pydantic-settings==2.1.0
```

**4. Update `main.py` for Railway:**

Make sure your CORS allows your Vercel domain:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# IMPORTANT: Add your Vercel domain!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://your-app.vercel.app"  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**5. Railway environment variables:**

In Railway dashboard, add:
- `SECRET_KEY` - your JWT secret (generate a strong random string)
- `CRYPTOPANIC_API_KEY` - your CryptoPanic key
- `OPENROUTER_API_KEY` - your OpenRouter key
- `DATABASE_URL` - **automatically provided by Railway when you add PostgreSQL!**

**Deployment steps:**

1. **Create Railway project:**
   - Go to railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL`

3. **Configure environment variables:**
   - Go to your service → Variables
   - Add SECRET_KEY, API keys

4. **Deploy:**
   - Railway detects Python automatically
   - Installs requirements.txt
   - Runs your start command
   - Provides a URL: `https://your-app.railway.app`

5. **Run migrations:**
   - In Railway dashboard, open shell
   - Run: `alembic upgrade head`
   - This creates your database tables!

**Alternative - run migrations automatically:**

Update your start command to run migrations first:

```json
{
  "deploy": {
    "startCommand": "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

The `&&` runs migrations before starting the server!

---

**Me:** I'm confused about CORS. Why do I need it and what exactly is it?

**Cursor AI:** Great question! CORS is a security feature that trips up many developers. Let me explain clearly:

**What is CORS?**

**CORS = Cross-Origin Resource Sharing**

It's a security mechanism in browsers that blocks requests between different domains.

**The problem:**

```
Frontend: https://myapp.vercel.app
Backend:  https://myapi.railway.app

Browser: "These are different origins! Request blocked! 🛑"
```

**What's an "origin"?**

Origin = protocol + domain + port

```
Same origin:
✅ https://myapp.com/page1
✅ https://myapp.com/page2

Different origins:
❌ https://myapp.com → https://api.myapp.com  (different subdomain)
❌ http://myapp.com → https://myapp.com  (different protocol)
❌ https://myapp.com:3000 → https://myapp.com:8000  (different port)
```

**Why does this security exist?**

Imagine evil.com makes a request to yourbank.com:

```javascript
// On evil.com
fetch('https://yourbank.com/transfer', {
  method: 'POST',
  body: JSON.stringify({ to: 'hacker', amount: 1000 })
});
```

Without CORS, this would work! The browser would send your bank cookies and steal your money. 😱

CORS prevents this by requiring yourbank.com to explicitly allow requests from evil.com (which it won't).

**How CORS works:**

**1. Browser makes a request:**
```
Frontend (vercel.app) → Backend (railway.app)
```

**2. Browser adds Origin header:**
```
Origin: https://myapp.vercel.app
```

**3. Backend responds with CORS headers:**
```
Access-Control-Allow-Origin: https://myapp.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

**4. Browser checks:**
- Is myapp.vercel.app in the allowed origins? ✅
- If yes: Allow the request
- If no: Block and show CORS error

**Setting up CORS in FastAPI:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",           # Local dev
        "https://myapp.vercel.app",        # Production
        "https://myapp-*.vercel.app"       # Vercel preview deployments
    ],
    allow_credentials=True,    # Allow cookies/authorization headers
    allow_methods=["*"],       # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],       # Allow all headers
)
```

**IMPORTANT - Don't do this in production:**
```python
allow_origins=["*"]  # ❌ Allows ANY website to call your API!
```

This defeats the purpose of CORS! Only use `["*"]` for quick local testing.

**Common CORS errors:**

**Error: "No 'Access-Control-Allow-Origin' header"**
- Backend isn't sending CORS headers
- Add CORSMiddleware

**Error: "CORS policy: credentials mode is 'include'"**
- You're sending cookies/auth but didn't set `allow_credentials=True`

**Error: "Origin not allowed"**
- Your frontend URL isn't in `allow_origins` list
- Add it!

**For your app:**

```python
# In production
allow_origins=[
    "https://crypto-advisor.vercel.app",        # Your exact domain
    "https://crypto-advisor-*.vercel.app"       # Preview branches
]
```

**Testing CORS locally:**

Your local setup:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

Different ports = different origins! You still need CORS:

```python
allow_origins=["http://localhost:5173"]
```

Now your frontend and backend can communicate securely!

---

**Me:** One more thing - how do I handle environment variables properly? I'm confused about .env, .env.example, and what should be in Git.

**Cursor AI:** Excellent question! Environment variable management is crucial for security. Let me explain the full pattern:

**The Goal:**
- ✅ Code in Git (everyone can see)
- ❌ Secrets NOT in Git (only you have access)

**The Pattern:**

**1. `.env` - YOUR secrets (NEVER commit to Git!)**

```env
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_advisor
SECRET_KEY=super_secret_key_abc123_never_commit_this
CRYPTOPANIC_API_KEY=abc123def456
OPENROUTER_API_KEY=xyz789ghi012
```

This file contains REAL values. Add it to `.gitignore`!

**2. `.env.example` - Template (COMMIT to Git)**

```env
# backend/.env.example
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_advisor
SECRET_KEY=your-secret-key-here
CRYPTOPANIC_API_KEY=your-cryptopanic-key
OPENROUTER_API_KEY=your-openrouter-key
```

This shows other developers what variables are needed, but without real values!

**3. `.gitignore` - Prevents committing secrets**

```gitignore
# Backend
backend/.env
backend/venv/
backend/__pycache__/

# Frontend
frontend/.env
frontend/node_modules/
frontend/dist/
```

**Why this pattern?**

**Scenario: New teammate joins**

Without `.env.example`:
```
Teammate: "It doesn't work! What environment variables do I need?"
You: *Types out all the variables in Slack*
```

With `.env.example`:
```
Teammate: "It doesn't work!"
You: "Copy .env.example to .env and fill in your values"
Teammate: *Copies file, adds their keys, it works!*
```

**Backend - Loading environment variables:**

```python
# backend/app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    CRYPTOPANIC_API_KEY: str
    OPENROUTER_API_KEY: str
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
```

**How it works:**
1. Pydantic reads `.env` file
2. Creates `settings` object with all variables
3. Use: `settings.SECRET_KEY`
4. If a required variable is missing, it raises an error on startup!

**Frontend - Environment variables in Vite:**

```env
# frontend/.env
VITE_API_URL=http://localhost:8000
```

```env
# frontend/.env.example
VITE_API_URL=http://localhost:8000
```

```typescript
// Usage in code
const apiUrl = import.meta.env.VITE_API_URL;
```

**IMPORTANT: Vite rules:**
1. Must start with `VITE_` to be accessible
2. Variables are embedded at BUILD time (not runtime!)
3. Never put secrets in frontend .env (they'll be visible in browser!)

**Different environments:**

**Local development:**
```env
# .env.local
VITE_API_URL=http://localhost:8000
```

**Production (set in Vercel/Railway):**
```
VITE_API_URL=https://crypto-advisor.railway.app
```

**What should NEVER go in Git:**
- ❌ API keys
- ❌ Database passwords
- ❌ JWT secret keys
- ❌ Any credentials
- ❌ `.env` file

**What SHOULD go in Git:**
- ✅ `.env.example` template
- ✅ All code
- ✅ `config.py` that LOADS variables
- ✅ `.gitignore`

**Generating a strong SECRET_KEY:**

```python
# Run in Python
import secrets
print(secrets.token_urlsafe(32))
# Output: Qfj8K_Ps3LmN0v5tYxZ2rA9bW7eH6cD1
```

Use this in your `.env`!

**Deployment checklist:**

**Vercel:**
- ✅ Add `VITE_API_URL` in dashboard
- ✅ Set for Production, Preview, Development

**Railway:**
- ✅ Add `SECRET_KEY` in dashboard
- ✅ Add `CRYPTOPANIC_API_KEY`
- ✅ Add `OPENROUTER_API_KEY`
- ✅ `DATABASE_URL` auto-provided by Railway PostgreSQL

**Common mistake:**

```python
# ❌ Hardcoding secrets
SECRET_KEY = "abc123"

# ✅ Using environment variables
from app.config import settings
SECRET_KEY = settings.SECRET_KEY
```

Now your secrets are safe and your code is shareable!

---

**Me:** after deployment, how do I test that everything works?

**Cursor AI:** Great question! Let me give you a comprehensive testing checklist for your deployed app:

**1. Frontend Deployment Test:**

**Visit your Vercel URL:**
```
https://crypto-advisor.vercel.app
```

**Check these pages:**
- ✅ Home redirects to /dashboard or /login
- ✅ /login page loads
- ✅ /signup page loads
- ✅ All static assets load (no 404s in console)

**Browser Console (F12):**
```javascript
// Should see your API URL
console.log(import.meta.env.VITE_API_URL)
// Should NOT see CORS errors
```

**2. Backend Deployment Test:**

**Visit Railway URL:**
```
https://crypto-advisor.railway.app
```

Should see:
```json
{"detail": "Not Found"}
```
This is good! It means FastAPI is running.

**Check API docs:**
```
https://crypto-advisor.railway.app/docs
```

You should see the interactive Swagger UI with all your endpoints!

**3. End-to-End Flow Test:**

**Test Signup:**
1. Go to /signup
2. Enter email and password
3. Submit form
4. Should redirect to /onboarding
5. If error, check browser console and Network tab

**Check for common issues:**
- CORS error? → Add Vercel domain to backend CORS
- 404 error? → Wrong API URL in Vercel env variables
- 500 error? → Check Railway logs

**Test Onboarding:**
1. Select crypto assets
2. Choose investor type
3. Select content interests
4. Submit
5. Should redirect to /dashboard

**Test Dashboard:**
1. Should load without errors
2. Coin prices should display
3. News should display
4. AI insight should display
5. Meme should display
6. Vote buttons should work

**4. Check Railway Logs:**

In Railway dashboard:
- Click your service
- Click "Deployments" → "View Logs"

**Look for:**
```
✅ INFO: Application startup complete
✅ INFO: Uvicorn running on http://0.0.0.0:8080

❌ ERROR: Database connection failed
❌ ERROR: Missing environment variable
```

**5. Test Authentication:**

**Login/Logout Flow:**
1. Log out
2. Try to visit /dashboard
3. Should redirect to /login
4. Log in
5. Should redirect to /dashboard
6. Refresh page
7. Should stay logged in (localStorage persistence)

**6. Test API Endpoints Directly:**

Using browser console or Postman:

**Signup:**
```javascript
fetch('https://crypto-advisor.railway.app/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(console.log)
```

Should return:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

**7. Database Test:**

In Railway, click PostgreSQL → "Data":
- ✅ `users` table exists
- ✅ `preferences` table exists
- ✅ `votes` table exists
- ✅ Can see your test users

**8. Performance Test:**

**Lighthouse (in Chrome DevTools):**
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Generate report"

**Look for:**
- Performance: 80+ 
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

**9. Mobile Test:**

**Browser DevTools:**
1. F12 → Toggle device toolbar
2. Test on iPhone, iPad, Android
3. Check responsiveness

**Or visit on actual phone!**

**10. Common Issues Checklist:**

**Issue: Frontend loads but API calls fail**
```
Causes:
- Wrong VITE_API_URL in Vercel
- CORS not configured
- Backend not running

Solution:
- Check browser Network tab for exact error
- Verify API URL in Vercel environment variables
- Check Railway logs
```

**Issue: "Invalid token" after refresh**
```
Causes:
- Token not in localStorage
- Token expired
- SECRET_KEY different between deployments

Solution:
- Check localStorage in DevTools → Application
- Verify SECRET_KEY same in Railway
```

**Issue: Database connection error**
```
Causes:
- DATABASE_URL incorrect
- PostgreSQL not running
- Migrations not run

Solution:
- Check DATABASE_URL in Railway
- Run: alembic upgrade head
- Check PostgreSQL is active
```

**11. Final Checklist:**

Before submitting:
- ✅ Both frontend and backend URLs work
- ✅ Can signup new account
- ✅ Can login
- ✅ Onboarding works
- ✅ Dashboard loads all sections
- ✅ Voting works
- ✅ Logout works
- ✅ Refresh keeps you logged in
- ✅ No console errors
- ✅ Mobile responsive
- ✅ README has both URLs
