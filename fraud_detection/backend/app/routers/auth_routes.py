from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, Token
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt_handler import create_access_token

router = APIRouter()

@router.post("/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # check duplicates
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check for duplicate username
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        name=payload.name,
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        credits=100  # Give new users 100 initial credits
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(sub=str(user.id))
    return Token(
        access_token=token,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "credits": user.credits,
            "created_at": user.created_at.isoformat()
        }
    )

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(sub=str(user.id))
    return Token(
        access_token=token,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "credits": user.credits,
            "created_at": user.created_at.isoformat()
        }
    )
