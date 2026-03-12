"""
Auth utilities: MongoDB user store, bcrypt password hashing, JWT tokens.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import DuplicateKeyError

# ---------------------------------------------------------------------------
# Config (override via environment variables in production)
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get("DSS_SECRET_KEY")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

_MONGO_USER = os.environ.get("DSS_MONGO_USER")
_MONGO_PASS = os.environ.get("DSS_MONGO_PASS")
_MONGO_HOST = os.environ.get("DSS_MONGO_HOST", "mongodb")
_MONGO_PORT = os.environ.get("DSS_MONGO_PORT", "27017")
MONGO_URI = os.environ.get(
    "DSS_MONGO_URI",
    f"mongodb://{_MONGO_USER}:{_MONGO_PASS}@{_MONGO_HOST}:{_MONGO_PORT}/dssdb?authSource=admin",
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

_client: Optional[MongoClient] = None


def _get_users_collection() -> Collection:
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    coll = _client["dssdb"]["users"]
    coll.create_index("email", unique=True)
    return coll


def get_activity_logs_collection() -> Collection:
    """Return the 'activity_logs' collection, creating a TTL index on first access."""
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    coll = _client["dssdb"]["activity_logs"]
    # TTL index: automatically purge log entries older than 90 days
    coll.create_index("timestamp", expireAfterSeconds=60 * 60 * 24 * 90)
    return coll


# ---------------------------------------------------------------------------
# User operations
# ---------------------------------------------------------------------------


VALID_ROLES = {"user", "guest", "admin"}


def create_user(name: str, email: str, institute: str, password: str) -> None:
    """Create a new user. Raises ValueError if email is already taken."""
    hashed = pwd_context.hash(password)
    coll = _get_users_collection()
    try:
        coll.insert_one(
            {"name": name, "email": email, "institute": institute, "password": hashed, "role": "guest"}
        )
    except DuplicateKeyError:
        raise ValueError(f"Email '{email}' is already registered.")


def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Return the user document if credentials match, otherwise None."""
    coll = _get_users_collection()
    user = coll.find_one({"email": email})
    if user and pwd_context.verify(password, user["password"]):
        return user
    return None


def list_users() -> list[dict]:
    """Return all users with only public fields (name, email, institute, role)."""
    coll = _get_users_collection()
    return list(coll.find({}, {"_id": 0, "name": 1, "email": 1, "institute": 1, "role": 1}))


def update_user_role(email: str, role: str) -> bool:
    """Update a user's role. Returns True if user was found and updated, False otherwise."""
    if role not in VALID_ROLES:
        raise ValueError(f"Invalid role '{role}'. Must be one of: {', '.join(sorted(VALID_ROLES))}.")
    coll = _get_users_collection()
    result = coll.update_one({"email": email}, {"$set": {"role": role}})
    return result.matched_count > 0


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": email,
        "uid": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------


def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """FastAPI dependency - inject into any route that needs authentication."""
    try:
        return jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
