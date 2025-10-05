import json
from typing import Dict, Any, Tuple

import pandas as pd
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler

# Default model path if not specified in config
MODEL_PATH = "fraud_model.joblib"

# Load the model
try:
    _loaded = joblib.load(MODEL_PATH)

    if isinstance(_loaded, dict):
        MODEL = _loaded["model"]
        THRESHOLD = float(_loaded.get("threshold", 0.5))
        FEATURE_ORDER = _loaded.get("feature_order", [])
    else:
        MODEL = _loaded
        THRESHOLD = 0.5
        FEATURE_ORDER = []

except Exception as e:
    # For demo purposes, create a simple dummy model if no model file exists
    from sklearn.ensemble import RandomForestClassifier
    MODEL = RandomForestClassifier(n_estimators=10)
    THRESHOLD = 0.5
    FEATURE_ORDER = ["amount", "merchant", "category", "hour", "user_age"]
    
    # Train with dummy data
    np.random.seed(42)
    n_samples = 1000
    X = pd.DataFrame({
        "amount": np.random.exponential(100, n_samples),
        "merchant": np.random.choice(["amazon", "walmart", "target"], n_samples),
        "category": np.random.choice(["shopping", "food", "entertainment"], n_samples),
        "hour": np.random.randint(0, 24, n_samples),
        "user_age": np.random.randint(18, 80, n_samples)
    })
    
    # Generate synthetic labels (more likely to be fraud if amount is high)
    y = (X["amount"] > np.percentile(X["amount"], 90)).astype(int)
    
    # Simple preprocessing
    X_processed = X.copy()
    X_processed["merchant"] = pd.Categorical(X_processed["merchant"]).codes
    X_processed["category"] = pd.Categorical(X_processed["category"]).codes
    
    # Fit the model
    MODEL.fit(X_processed, y)

def preprocess_features(features: Dict[str, Any]) -> pd.DataFrame:
    """Convert raw features into model-ready format"""
    df = pd.DataFrame([features])
    
    # Convert categorical features
    for col in ["merchant", "category"]:
        df[col] = df[col].astype("category")
        df[col] = df[col].cat.codes
    
    return df

def predict_proba(features: Dict[str, Any]) -> float:
    """Get raw fraud probability"""
    df = preprocess_features(features)
    proba = MODEL.predict_proba(df)[:, 1][0]
    return float(proba)

def predict_label(features: Dict[str, Any]) -> Tuple[bool, float]:
    """Get binary prediction and probability"""
    p = predict_proba(features)
    return (p >= THRESHOLD), p