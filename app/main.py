import logging
from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from . import models, schemas, crud, auth, database
from .database import engine, AsyncSessionLocal, Base
from fastapi.middleware.cors import CORSMiddleware

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.post("/register", response_model=schemas.UserOut)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    db_user = await crud.get_user_by_phone(db, phone=user.phone)
    if db_user:
        raise HTTPException(status_code=400, detail="Phone already registered")
    return await crud.create_user(db, user)

@app.post("/login")
async def login(user: schemas.UserCreate, db: AsyncSession = Depends(database.get_db)):
    db_user = await crud.get_user_by_phone(db, phone=user.phone)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    access_token = auth.create_access_token(data={"sub": user.phone})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/tracks", response_model=schemas.TrackOut)
async def create_track(track: schemas.TrackCreate, db: AsyncSession = Depends(database.get_db)):
    return await crud.create_track(db, track)

@app.post("/like")
async def like_track(
    track_like: schemas.TrackLike,
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    return await crud.like_track(db, track_like, current_user.id)

@app.get("/tracks/liked", response_model=List[schemas.TrackOut])
async def get_liked_tracks(
    current_user: models.User = Depends(auth.get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    return await crud.get_liked_tracks(db, current_user.id)
