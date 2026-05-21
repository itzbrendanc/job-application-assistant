from __future__ import annotations

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=401, detail="Invalid token") from e

    user = db.query(User).filter(User.id == user_id).one_or_none()
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

