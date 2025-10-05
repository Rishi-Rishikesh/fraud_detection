from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(60), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    username = Column(String(60), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    credits = Column(Integer, default=100, nullable=False)
    last_credit_reset = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    transactions = relationship("Transaction", back_populates="user")
    credit_purchases = relationship("CreditPurchase", back_populates="user")

class CreditPurchase(Base):
    __tablename__ = "credit_purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    amount = Column(Float, nullable=False)  # Purchase amount in dollars
    credits_added = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="credit_purchases")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    # Transaction details
    amount = Column(Float, nullable=False)
    merchant = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    hour = Column(Integer, nullable=False)
    user_age = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)

    # Fraud detection results
    is_fraud = Column(Boolean, nullable=False, default=False)
    fraud_probability = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False, default=0.0)
    risk_level = Column(String(20), nullable=False, default='LOW')  # 'LOW', 'MEDIUM', 'HIGH'

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Feedback
    feedback_correct = Column(Boolean, nullable=True)
    feedback_notes = Column(Text, nullable=True)
    feedback_date = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="transactions")
