from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    invite_code: str | None = Field(default=None, max_length=80)

    @field_validator("password")
    @classmethod
    def _bcrypt_safe_len(cls, v: str) -> str:
        # bcrypt only uses the first 72 bytes of the password; passlib/bcrypt raises if longer.
        # Enforce a hard limit to prevent runtime crashes and user confusion.
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes (UTF-8).")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
