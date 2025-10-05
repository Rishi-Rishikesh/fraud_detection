from datetime import datetime
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, EmailStr

# ---------- Auth ----------
from pydantic import Field, validator
import re

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)

    @validator('password')
    def password_strength(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v

    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username must be alphanumeric')
        return v

class UserLogin(BaseModel):
    email: str  # Changed from EmailStr to str to allow username login
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# ---------- User ----------
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    credits: int
    is_admin: bool
    last_credit_reset: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class CreditPurchaseCreate(BaseModel):
    amount: float

class CreditPurchaseOut(BaseModel):
    id: int
    amount: float
    credits_added: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Fraud ----------
class TransactionIn(BaseModel):
    amount: float
    merchant: str
    category: str
    location: str
    transaction_type: str
    card_type: str
    additional_features: Optional[Dict[str, Any]] = None

class PredictionOut(BaseModel):
    is_fraud: bool
    probability: float
    confidence_score: float
    risk_level: str
    processed_at: datetime

class TransactionFeedback(BaseModel):
    feedback_correct: bool
    feedback_notes: Optional[str] = None

class TransactionOut(BaseModel):
    id: int
    amount: float
    merchant: str
    category: str
    location: str
    transaction_type: str
    card_type: str
    is_fraud: bool
    probability: float
    confidence_score: float
    risk_level: str
    created_at: datetime
    processed_at: datetime
    feedback_correct: Optional[bool] = None
    feedback_notes: Optional[str] = None
    feedback_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class TransactionStats(BaseModel):
    total_transactions: int
    fraud_detected: int
    total_amount: float
    avg_transaction: float
    fraud_percentage: float
    risk_levels: Dict[str, int]
    categories: Dict[str, int]
    merchant_stats: List[Dict[str, Any]]
    daily_volumes: List[Dict[str, Any]]
    is_fraud: bool
    probability: float
    created_at: datetime
    payload: Dict[str, Any]

    class Config:
        from_attributes = True

class HistoryOut(BaseModel):
    items: List[TransactionOut]
