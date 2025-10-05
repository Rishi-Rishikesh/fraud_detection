import json
from typing import Dict, Any, Tuple

import pandas as pd
import joblib

from app.config import settings

# Load either:
# 1) a dict artifact {"model": pipeline, "threshold": 0.5, "feature_order": [...]}
# 2) or a plain sklearn Pipeline
_loaded = joblib.load(settings.MODEL_PATH)

if isinstance(_loaded, dict) and "model" in _loaded:
    MODEL = _loaded["model"]
    THRESHOLD = float(_loaded.get("threshold", 0.5))
    FEATURE_ORDER = _loaded.get("feature_order", settings.MODEL_FEATURE_ORDER or [])
else:
    MODEL = _loaded
    THRESHOLD = 0.5
    FEATURE_ORDER = settings.MODEL_FEATURE_ORDER or []

def _as_dataframe(features: Dict[str, Any]) -> pd.DataFrame:
    """
    Convert incoming dict -> DataFrame expected by the pipeline.
    If FEATURE_ORDER is known, enforce it (missing keys become None).
    Otherwise, pass columns as given (must match training).
    """
    if FEATURE_ORDER:
        row = {col: features.get(col, None) for col in FEATURE_ORDER}
        return pd.DataFrame([row])
    else:
        # Make sure keys match the columns used in training
        return pd.DataFrame([features])

def predict_proba(features: Dict[str, Any]) -> float:
    df = _as_dataframe(features)
    # Most sklearn classifiers expose predict_proba
    proba = MODEL.predict_proba(df)[:, 1][0]
    return float(proba)

def predict_label(features: Dict[str, Any]) -> Tuple[bool, float]:
    p = predict_proba(features)
    return (p >= THRESHOLD), p
