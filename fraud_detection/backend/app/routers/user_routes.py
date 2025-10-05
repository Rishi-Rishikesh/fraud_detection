from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import func, desc, case

from app.auth import get_current_user
from app.database import get_db
from app.models import User, CreditPurchase, Transaction
from app.schemas import UserOut, CreditPurchaseOut

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

@router.get("/stats")
async def get_user_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get total transactions
    total_transactions = db.query(func.count(Transaction.id)).filter(
        Transaction.user_id == user.id
    ).scalar()

    # Get fraud transactions count
    fraud_transactions = db.query(func.count(Transaction.id)).filter(
        Transaction.user_id == user.id,
        Transaction.is_fraud == True
    ).scalar()

    # Calculate success rate
    success_rate = 0 if total_transactions == 0 else (
        (total_transactions - fraud_transactions) / total_transactions * 100
    )

    return {
        "total_transactions": total_transactions,
        "fraud_detected": fraud_transactions,
        "success_rate": round(success_rate, 2),
        "available_credits": user.credits
    }

@router.get("/recent-transactions")
async def get_recent_transactions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user.id
    ).order_by(desc(Transaction.created_at)).limit(10).all()

    return [{
        "id": tx.id,
        "amount": tx.amount,
        "merchant": tx.merchant,
        "category": tx.category,
        "is_fraud": tx.is_fraud,
        "created_at": tx.created_at.isoformat(),
        "fraud_probability": tx.fraud_probability
    } for tx in transactions]

@router.get("/chart-data")
async def get_chart_data(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get transactions from the last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    transactions = db.query(
        func.date(Transaction.created_at).label('date'),
        func.count(Transaction.id).label('total'),
        func.sum(case((Transaction.is_fraud == True, 1), else_=0)).label('fraud')
    ).filter(
        Transaction.user_id == user.id,
        Transaction.created_at >= seven_days_ago
    ).group_by(
        func.date(Transaction.created_at)
    ).all()

    # Format data for charts
    chart_data = [{
        "date": str(record.date),
        "total": record.total,
        "fraud": record.fraud or 0,
        "safe": record.total - (record.fraud or 0)
    } for record in transactions]

    # Get category distribution
    category_stats = db.query(
        Transaction.category,
        func.count(Transaction.id).label('count')
    ).filter(
        Transaction.user_id == user.id
    ).group_by(
        Transaction.category
    ).all()

    return {
        "daily_trends": chart_data,
        "category_distribution": [{
            "category": stat.category,
            "count": stat.count
        } for stat in category_stats]
    }