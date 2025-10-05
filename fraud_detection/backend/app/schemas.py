from datetime import datetime
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, EmailStr

# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
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
