from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.auth import get_current_user
from app.database import get_db
from app.models import User, Transaction
from app.schemas import UserOut
from app.utils.hashing import hash_password

router = APIRouter()

def require_admin(user: User = Depends(get_current_user)):
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/users", response_model=List[UserOut])
async def get_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).all()

@router.put("/users/{user_id}/credits")
async def update_user_credits(
    user_id: int,
    credits: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.credits = credits
    db.commit()
    return {"message": "Credits updated successfully"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/stats")
async def get_admin_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_transactions = db.query(Transaction).count()
    fraud_transactions = db.query(Transaction).filter(Transaction.is_fraud == True).count()
    return {
        "total_users": total_users,
        "total_transactions": total_transactions,
        "fraud_transactions": fraud_transactions
    }