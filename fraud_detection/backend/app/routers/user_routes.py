from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.auth import get_current_user
from app.database import get_db
from app.models import User, CreditPurchase
from app.schemas import UserOut, CreditPurchaseOut
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if credits need to be reset
    days_since_reset = (datetime.utcnow() - user.last_credit_reset).days
    if days_since_reset >= 5:
        user.credits = 100
        user.last_credit_reset = datetime.utcnow()
        db.commit()
    return user

@router.get("/me/credit-history", response_model=List[CreditPurchaseOut])
def get_credit_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(CreditPurchase).filter(
        CreditPurchase.user_id == user.id
    ).order_by(CreditPurchase.created_at.desc()).all()
