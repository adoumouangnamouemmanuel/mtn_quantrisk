# models/explain.py
# SHAP explainability for XGBoost models
# Chidima - Week 2 Task 2.6

import shap
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

MODEL_DIR = Path("models/artefacts")

# These must match FEATURE_COLS in train_impact_model.py
FEATURE_COLS = [
    "Inflation_YoY_Pct",
    "Policy_Rate_Pct",
    "Cedi_USD_Avg",
    "GDP_Growth_Pct",
    "Mobile_Penetration_Pct",
    "Data_Penetration_Pct",
]

# Map KPI IDs to model filenames (same as in TARGETS mapping)
MODEL_MAP = {
    "FIN01": "revenue_growth",      # Service Revenue Growth
    "FIN03": "ebitda_margin",       # EBITDA Margin %
    "FIN05": "pat_margin",          # PAT Margin %
    "SEG03": "momo_revenue",        # MoMo Revenue (GHSm)
    "OPS04": "arpu",                # ARPU (GHS)
    # For Data Growth, you may map "DATA01" or similar – we'll use a placeholder
    "DATA01": "data_revenue_growth",
}

def explain_kpi(kpi_id: str, macro_values: dict) -> dict:
    """
    Returns SHAP-based explanation for a single KPI prediction.
    
    Parameters:
    -----------
    kpi_id : str
        One of "FIN01", "FIN03", "FIN05", "SEG03", "OPS04", "DATA01"
    macro_values : dict
        Must contain all keys in FEATURE_COLS.
        Example: {"Inflation_YoY_Pct": 5.4, "Policy_Rate_Pct": 28.0, ...}
    
    Returns:
    --------
    dict with:
        - kpi_id
        - model (filename)
        - top_driver (feature with largest |SHAP|)
        - ranked_drivers (list of features sorted by |SHAP| descending)
        - explanation (dict of feature -> {shap_value, feature_value, direction})
    """
    model_name = MODEL_MAP.get(kpi_id)
    if model_name is None:
        return {"error": f"No model registered for KPI {kpi_id}"}
    
    model_path = MODEL_DIR / f"{model_name}.joblib"
    scaler_path = MODEL_DIR / "feature_scaler.joblib"
    
    if not model_path.exists():
        return {"error": f"Model file not found: {model_path}"}
    if not scaler_path.exists():
        return {"error": f"Scaler file not found: {scaler_path}. Run train_impact_model.py first."}
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    
    # Prepare input as DataFrame (single row)
    X_raw = pd.DataFrame([macro_values])[FEATURE_COLS].fillna(0)
    X_scaled = scaler.transform(X_raw)
    
    # SHAP TreeExplainer works with original model (no need to scale for explainer)
    # But SHAP expects the raw input (unscaled) because the model was trained on scaled features?
    # Actually XGBoost doesn't care about scaling, but we scaled during training.
    # For correct SHAP values, we should use the same preprocessing: pass scaled features.
    # However, SHAP's TreeExplainer can take the model and the raw (unscaled) data if the model was trained on raw.
    # Since we scaled, we must pass scaled values. Let's convert X_scaled to DataFrame for clarity.
    X_scaled_df = pd.DataFrame(X_scaled, columns=FEATURE_COLS)
    
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_scaled_df)[0]  # first (only) row
    
    explanation = {}
    for i, feat in enumerate(FEATURE_COLS):
        sv = float(shap_values[i])
        explanation[feat] = {
            "shap_value": round(sv, 5),
            "feature_value": macro_values.get(feat),
            "direction": "increases_risk" if sv > 0 else "decreases_risk"
        }
    
    ranked = sorted(explanation.items(), key=lambda x: abs(x[1]["shap_value"]), reverse=True)
    
    return {
        "kpi_id": kpi_id,
        "model": model_name,
        "top_driver": ranked[0][0],
        "ranked_drivers": [r[0] for r in ranked],
        "explanation": explanation,
    }

# Quick test if run directly
if __name__ == "__main__":
    # Example macro values (FY25 base from master plan)
    test_macro = {
        "Inflation_YoY_Pct": 5.4,
        "Policy_Rate_Pct": 28.0,
        "Cedi_USD_Avg": 11.6,
        "GDP_Growth_Pct": 5.0,
        "Mobile_Penetration_Pct": 148,
        "Data_Penetration_Pct": 72,
    }
    result = explain_kpi("FIN03", test_macro)
    print("SHAP explanation for EBITDA Margin:")
    print(f"Top driver: {result['top_driver']}")
    for f in result['ranked_drivers'][:3]:
        v = result['explanation'][f]
        print(f"  {f}: SHAP={v['shap_value']:+6.4f} (value={v['feature_value']}) -> {v['direction']}")