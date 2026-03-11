"""
Auth utilities: SQLite user store, bcrypt password hashing, JWT tokens.
"""
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

# ---------------------------------------------------------------------------
# Config (override via environment variables in production)
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get("DSS_SECRET_KEY")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
DB_PATH = os.environ.get("DSS_DB_PATH")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------


def _init_db(conn: sqlite3.Connection) -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT    NOT NULL,
            email     TEXT    NOT NULL UNIQUE,
            institute TEXT    NOT NULL,
            password  TEXT    NOT NULL
        )
    """)
    conn.commit()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    _init_db(conn)
    try:
        yield conn
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# User operations
# ---------------------------------------------------------------------------


def create_user(name: str, email: str, institute: str, password: str) -> None:
    """Create a new user. Raises ValueError if email is already taken."""
    hashed = pwd_context.hash(password)
    with get_db() as conn:
        try:
            conn.execute(
                "INSERT INTO users (name, email, institute, password) VALUES (?, ?, ?, ?)",
                (name, email, institute, hashed),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            raise ValueError(f"Email '{email}' is already registered.")


def authenticate_user(email: str, password: str) -> Optional[sqlite3.Row]:
    """Return the user row if credentials match, otherwise None."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
    if row and pwd_context.verify(password, row["password"]):
        return row
    return None


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------


def create_access_token(user_id: int, email: str) -> str:
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
