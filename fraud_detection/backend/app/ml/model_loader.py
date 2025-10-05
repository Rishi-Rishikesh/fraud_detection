import json
import logging
from typing import Dict, Any, Tuple
import os

import pandas as pd
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline

# Set up logging
logger = logging.getLogger(__name__)

# Model will be created if not found
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "fraud_model.joblib")

# Global variables for encoding
_merchant_encoder = LabelEncoder()
_category_encoder = LabelEncoder()
_model = None
_scaler = None

def _create_simple_model():
    """Create a simple fraud detection model using available features"""
    global _merchant_encoder, _category_encoder, _model, _scaler

    # Train with synthetic data that matches our input features
    np.random.seed(42)
    n_samples = 10000

    # Generate realistic transaction data
    merchants = ['amazon', 'walmart', 'target', 'starbucks', 'mcdonalds', 'uber', 'netflix', 'paypal']
    categories = ['shopping', 'food', 'entertainment', 'travel', 'transfer', 'payment']

    data = {
        "amount": np.random.exponential(100, n_samples),
        "merchant": np.random.choice(merchants, n_samples),
        "category": np.random.choice(categories, n_samples),
        "hour": np.random.randint(0, 24, n_samples),
        "user_age": np.random.randint(18, 80, n_samples)
    }

    X = pd.DataFrame(data)

    # Fit encoders
    _merchant_encoder.fit(merchants)
    _category_encoder.fit(categories)

    # Encode categorical features
    X_encoded = X.copy()
    X_encoded["merchant"] = _merchant_encoder.transform(X_encoded["merchant"])
    X_encoded["category"] = _category_encoder.transform(X_encoded["category"])

    # Create target: fraud if amount > 200 and hour is unusual (late night/early morning)
    # or if merchant is suspicious, or high amount for age
    fraud_conditions = (
        (X["amount"] > 200) & ((X["hour"] < 6) | (X["hour"] > 22)) |
        (X["amount"] > 500) |
        ((X["amount"] > 100) & (X["user_age"] < 25))
    )
    y = fraud_conditions.astype(int)

    # Add some noise to make it more realistic
    noise = np.random.random(n_samples) < 0.05
    y = (y | noise).astype(int)

    logger.info(f"Training model with {n_samples} samples. Fraud rate: {y.mean():.3f}")

    # Create pipeline
    _model = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10))
    ])

    _model.fit(X_encoded, y)
    return _model

# Try to load existing model, create new one if not found
try:
    if os.path.exists(MODEL_PATH):
        logger.info(f"Loading existing model from {MODEL_PATH}")
        _model = joblib.load(MODEL_PATH)
        logger.info("Successfully loaded existing model")
    else:
        logger.info("Model file not found, creating new model")
        _model = _create_simple_model()
        # Save the model
        joblib.dump(_model, MODEL_PATH)
        logger.info(f"Created and saved new model to {MODEL_PATH}")

    # Always ensure encoders are fitted with known categories
    merchants = ['amazon', 'walmart', 'target', 'starbucks', 'mcdonalds', 'uber', 'netflix', 'paypal']
    categories = ['shopping', 'food', 'entertainment', 'travel', 'transfer', 'payment']
    _merchant_encoder.fit(merchants)
    _category_encoder.fit(categories)
    logger.info("Encoders fitted with known categories")

except Exception as e:
    logger.error(f"Error loading/creating model: {str(e)}")
    logger.info("Creating fallback model")
    _model = _create_simple_model()

THRESHOLD = 0.5

def preprocess_features(features: Dict[str, Any]) -> pd.DataFrame:
    """Convert raw features into model-ready format"""
    try:
        df = pd.DataFrame([features])

        # Ensure all required features are present
        required_features = {"amount", "merchant", "category", "hour", "user_age"}
        missing_features = required_features - set(features.keys())
        if missing_features:
            raise ValueError(f"Missing required features: {missing_features}")

        # Encode categorical features
        df_processed = df.copy()
        df_processed["merchant"] = _merchant_encoder.transform([df["merchant"].iloc[0]])[0]
        df_processed["category"] = _category_encoder.transform([df["category"].iloc[0]])[0]

        logger.info(f"Successfully preprocessed features: {features}")
        return df_processed

    except Exception as e:
        logger.error(f"Error preprocessing features: {str(e)}")
        raise ValueError(f"Failed to preprocess features: {str(e)}")

def predict_proba(features: Dict[str, Any]) -> float:
    """Get raw fraud probability"""
    try:
        df = preprocess_features(features)
        proba = _model.predict_proba(df)[:, 1][0]
        logger.info(f"Prediction probability: {proba}")
        return float(proba)
    except Exception as e:
        logger.error(f"Error predicting probability: {str(e)}")
        raise RuntimeError(f"Failed to predict probability: {str(e)}")

def predict_label(features: Dict[str, Any]) -> Tuple[bool, float]:
    """Get binary prediction and probability"""
    try:
        p = predict_proba(features)
        is_fraud = p >= THRESHOLD
        logger.info(f"Prediction: is_fraud={is_fraud}, probability={p}")
        return is_fraud, p
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        raise RuntimeError(f"Failed to make prediction: {str(e)}")