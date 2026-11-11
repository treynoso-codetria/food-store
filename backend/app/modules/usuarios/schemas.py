"""Schemas de entrada y salida de usuarios. Nunca exponen hashed_password."""
from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50, regex=r"^[A-Za-z0-9_.-]+$")
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt usa hasta 72 bytes


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
