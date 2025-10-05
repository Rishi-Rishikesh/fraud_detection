from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.ml.model_loader import predict_label
from app.database import get_db
from app.models import User, CreditPurchase
from app.auth import get_current_user
import logging

router = APIRouter()

logger = logging.getLogger(__name__)

class Transaction(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount (must be positive)")
    merchant: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=50)
    hour: int = Field(..., ge=0, lt=24, description="Hour of day (0-23)")
    user_age: int = Field(..., ge=18, le=120, description="User age (18-120)")
    description: Optional[str] = Field(None, max_length=500)
    
    @validator('category')
    def validate_category(cls, v):
        valid_categories = {
            'shopping', 'entertainment', 'travel', 'food', 
            'transfer', 'withdrawal', 'payment'
        }
        if v.lower() not in valid_categories:
            raise ValueError(f'Category must be one of: {valid_categories}')
        return v.lower()

class CreditPurchaseRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Purchase amount in dollars")

def check_and_reset_credits(user: User, db: Session):
    days_since_reset = (datetime.utcnow() - user.last_credit_reset).days
    if days_since_reset >= 5:
        user.credits = 100
        user.last_credit_reset = datetime.utcnow()
        db.commit()

@router.post("/credits/purchase")
async def purchase_credits(
    purchase: CreditPurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    credits_per_dollar = 20  # $5 = 100 credits
    credits_to_add = int(purchase.amount * credits_per_dollar)
    
    credit_purchase = CreditPurchase(
        user_id=current_user.id,
        amount=purchase.amount,
        credits_added=credits_to_add
    )
    db.add(credit_purchase)
    
    current_user.credits += credits_to_add
    db.commit()
    
    return {"message": f"Successfully purchased {credits_to_add} credits"}

@router.get("/credits/balance")
async def get_credit_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_and_reset_credits(current_user, db)
    return {"credits": current_user.credits}

@router.post("/predict")
async def predict_fraud(
    tx: Transaction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_and_reset_credits(current_user, db)
    
    if current_user.credits < 10:
        raise HTTPException(
            status_code=402,
            detail="Insufficient credits. Fraud check requires 10 credits."
        )
    
    try:
        features = {
            "amount": tx.amount,
            "merchant": tx.merchant.lower(),
            "category": tx.category,
            "hour": tx.hour,
            "user_age": tx.user_age
        }
        
        # Get fraud prediction
        is_fraud, probability = predict_label(features)
        
        # Deduct credits after successful prediction
        current_user.credits -= 10
        db.commit()
        
        response = {
            "prediction": {
                "is_fraud": is_fraud,
                "fraud_probability": round(float(probability), 3),
                "risk_level": "high" if probability > 0.7 else "medium" if probability > 0.3 else "low"
            },
            "transaction": {
                "amount": tx.amount,
                "merchant": tx.merchant,
                "category": tx.category,
                "hour": tx.hour
            }
        }
        
        # Log prediction for monitoring
        logger.info(
            f"Fraud prediction made: prob={probability:.3f} "
            f"fraud={is_fraud} amount={tx.amount:.2f} "
            f"category={tx.category}"
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error making fraud prediction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error processing fraud detection request"
        )
