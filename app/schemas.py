from pydantic import BaseModel
from typing import Optional, List

class UserCreate(BaseModel):
    phone: str
    password: str

class UserOut(BaseModel):
    id: int
    phone: str
    is_active: bool

    class Config:
        orm_mode = True

class TrackCreate(BaseModel):
    title: str
    artist: str
    duration: int

class TrackOut(BaseModel):
    id: int
    title: str
    artist: str
    duration: int

    class Config:
        orm_mode = True

class TrackLike(BaseModel):
    track_id: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone: Optional[str] = None
