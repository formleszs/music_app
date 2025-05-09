from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from . import models, schemas
from .auth import get_password_hash

async def get_user_by_phone(db: AsyncSession, phone: str):
    result = await db.execute(
        select(models.User).where(models.User.phone == phone)
    )
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(phone=user.phone, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def create_track(db: AsyncSession, track: schemas.TrackCreate):
    db_track = models.Track(**track.dict())
    db.add(db_track)
    await db.commit()
    await db.refresh(db_track)
    return db_track

async def like_track(db: AsyncSession, track_like: schemas.TrackLike, user_id: int):
    # Проверяем, не лайкнул ли уже эту песню
    result = await db.execute(
        select(models.LikedTrack).where(
            models.LikedTrack.user_id == user_id,
            models.LikedTrack.track_id == track_like.track_id
        )
    )
    existing_like = result.scalar_one_or_none()
    
    if existing_like:
        return None
    
    db_like = models.LikedTrack(user_id=user_id, track_id=track_like.track_id)
    db.add(db_like)
    await db.commit()
    await db.refresh(db_like)
    return db_like

async def get_liked_tracks(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(models.Track)
        .join(models.LikedTrack)
        .where(models.LikedTrack.user_id == user_id)
        .options(selectinload(models.Track.liked_by))
    )
    return result.scalars().all()
