# models/train_impact_model.py
# MTN QuantRisk - Train XGBoost Models for 6 KPIs
# Chidima - Week 2 Task 2.5

import pandas as pd
import numpy as np
from pathlib import Path
from xgboost import XGBRegressor
from sklearn.model_selection import LeaveOneOut, cross_val_predict
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

# ------------------------------
# 1. Paths and Directories
# ------------------------------
DATA_DIR = Path("data/structured")
MODEL_DIR = Path("models/artefacts")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# ------------------------------
# 2. Feature Columns (Macro Variables)
# ------------------------------
FEATURE_COLS = [
    "Inflation_YoY_Pct",
    "Policy_Rate_Pct",
    "Cedi_USD_Avg",
    "GDP_Growth_Pct",
    "Mobile_Penetration_Pct",
    "Data_Penetration_Pct",
]

# ------------------------------
# 3. Target Mappings (Column Name in merged DataFrame -> Model File Name)
# ------------------------------
TARGETS = {
    "Service_Rev_Growth_Pct": "revenue_growth",
    "EBITDA_Margin_Pct"     : "ebitda_margin",
    "PAT_Margin_Pct"        : "pat_margin",
    "MoMo_Revenue"          : "momo_revenue",
    "ARPU_GHS"              : "arpu",
    "Data_Growth_Pct"       : "data_revenue_growth",
}

# ------------------------------
# 4. Function to Augment Dataset with Synthetic Scenarios
#    Uses Foureira's scenario_engine.apply_scenario()
# ------------------------------
# Map macro-feature column names to the external KPI IDs the scenario engine
# stresses. This is the fix for audit finding H2 / TD-06: previously the
# augmented rows reused *identical* base macro features with different targets,
# so the model could not learn any macro->target relationship. Now each
# synthetic row carries the scenario's actually-stressed macro features.
_FEATURE_TO_KPI = {
    "Inflation_YoY_Pct":      "EXT01",
    "Policy_Rate_Pct":       "EXT02",
    "Cedi_USD_Avg":          "EXT03",
}

# KPI IDs whose stressed value is a valid target column for training.
_KPI_TO_TARGET = {
    "FIN06": "Service_Rev_Growth_Pct",
    "FIN03": "EBITDA_Margin_Pct",
    "FIN05": "PAT_Margin_Pct",
    "SEG03": "MoMo_Revenue",
    "OPS04": "ARPU_GHS",
    "SEG01": "Data_Growth_Pct",   # Data Revenue growth used as the Data target
}


def build_augmented_dataset(real_df):
    """
    Augment real historical data with synthetic scenario rows.

    Each synthetic row is built from ONE scenario run at severity 1.0:
      - macro features = the scenario's stressed EXT values (capped to the
        observed range so synthetic rows cannot explode outside history)
      - target columns = the scenario's stressed KPI values

    This preserves the macro->target signal that the previous implementation
    destroyed by reusing identical base macro features (audit H2 / 4.2).
    ``train_all_models`` defaults to ``augment=False`` until the quarterly
    dataset is large enough to make augmentation worth the leakage risk.
    """
    from pipeline.scenario_engine import apply_scenario, load_scenario_library

    lib = load_scenario_library()
    scenario_ids = lib["Scenario_ID"].unique()

    print(f"Found {len(scenario_ids)} unique scenarios for augmentation")

    base_macro = real_df[FEATURE_COLS].iloc[-1].to_dict()
    # Sanity bounds: synthetic macro features must stay within the historical
    # min/max so they look like real, in-distribution observations.
    macro_min = real_df[FEATURE_COLS].min()
    macro_max = real_df[FEATURE_COLS].max()

    synthetic_rows = []
    for sc_id in scenario_ids:
        try:
            result = apply_scenario(sc_id, severity_multiplier=1.0, macro_overlays={})
            stressed = {row["kpiId"]: row["scenarioValue"] for row in result["results"]}

            row = base_macro.copy()
            # Overwrite the macro features the scenario actually stressed.
            for feat, kpi in _FEATURE_TO_KPI.items():
                if kpi in stressed:
                    val = stressed[kpi]
                    # Clamp synthetic macro features to the observed range.
                    if feat in macro_min.index:
                        val = float(min(max(val, macro_min[feat]), macro_max[feat]))
                    row[feat] = val

            # Targets come from the stressed KPI values.
            for kpi, target in _KPI_TO_TARGET.items():
                if target in TARGETS and kpi in stressed:
                    row[target] = stressed[kpi]

            row["source"] = f"synthetic_{sc_id}"
            synthetic_rows.append(row)
        except Exception as e:
            print(f"  [WARN] Skipping {sc_id}: {e}")

    synth_df = pd.DataFrame(synthetic_rows)
    print(f"Generated {len(synth_df)} synthetic rows")

    real_df = real_df.copy()
    real_df["source"] = "real"
    combined = pd.concat([real_df, synth_df], ignore_index=True)
    return combined

# ------------------------------
# 5. Main Training Function
# ------------------------------
def train_all_models(augment=True):
    """
    Load data, merge, optionally augment, scale, train XGBoost models.
    """
    # Load data
    annual = pd.read_csv(DATA_DIR / "annual.csv")
    macro = pd.read_csv(DATA_DIR / "macro_context.csv")
    segments = pd.read_csv(DATA_DIR / "segments_annual.csv")
    operational = pd.read_csv(DATA_DIR / "operational_annual.csv")
    
    # Drop duplicate identifier columns that cause merge conflicts (e.g., Period_ID)
    # Keep only Year and the columns we actually need for features/targets
    # This prevents MergeError from suffixes like '_x' and '_y'
    for df in [annual, macro, segments, operational]:
        # Drop any column that is not Year and not in our final keep list
        # But we don't know all target columns yet. Safer: drop common duplicate columns like 'Period_ID'
        if 'Period_ID' in df.columns:
            df.drop(columns=['Period_ID'], inplace=True)
        # Also drop any other obvious duplicates
        for col in ['Scenario', 'Source', 'Unnamed: 0']:
            if col in df.columns:
                df.drop(columns=[col], inplace=True)
    
    # Merge all on Year
    df = annual.merge(macro, on="Year", how="left")
    df = df.merge(segments, on="Year", how="left")
    df = df.merge(operational, on="Year", how="left")
    
    # Keep only the columns we need
    keep_cols = ["Year"] + FEATURE_COLS + list(TARGETS.keys())
    # Ensure all keep_cols exist; if not, they will be dropped later but we can warn
    existing_cols = [col for col in keep_cols if col in df.columns]
    missing = set(keep_cols) - set(existing_cols)
    if missing:
        print(f"Warning: Missing columns: {missing}")
    df = df[existing_cols].copy()
    
    # Drop rows with missing target values (the first few years may have missing)
    df = df.dropna(subset=list(TARGETS.keys()), how="all")
    
    print(f"Real data rows: {len(df)}")
    
    # Optionally augment with synthetic scenarios
    if augment:
        df = build_augmented_dataset(df)
        print(f"After augmentation: {len(df)} rows")
    
    # Prepare features and scale
    X_raw = df[FEATURE_COLS].copy()
    # Fill any missing features with 0 (should not happen if macro data complete)
    X_raw = X_raw.fillna(0)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)
    joblib.dump(scaler, MODEL_DIR / "feature_scaler.joblib")
    
    # Train one model per target
    results_log = {}
    
    for target_col, model_name in TARGETS.items():
        if target_col not in df.columns:
            print(f"  [SKIP] {target_col} not found in data")
            continue
        
        y_raw = df[target_col].copy()
        # Drop rows where target is NaN
        valid_mask = y_raw.notna()
        X_valid = X_scaled[valid_mask]
        y_valid = y_raw[valid_mask]
        
        if len(X_valid) < 5:
            print(f"  [SKIP] {target_col}: only {len(X_valid)} valid rows")
            continue
        
        # XGBoost model with shallow trees to avoid overfitting
        model = XGBRegressor(
            n_estimators=200,
            max_depth=3,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=42
        )
        
        # Leave-One-Out cross-validation (appropriate for small data)
        loo = LeaveOneOut()
        try:
            preds = cross_val_predict(model, X_valid, y_valid, cv=loo)
            mae = mean_absolute_error(y_valid, preds)
            r2 = r2_score(y_valid, preds)
        except Exception as e:
            print(f"  [WARN] Cross-val failed for {target_col}: {e}")
            mae, r2 = -1, -1
        
        # Retrain on full data
        model.fit(X_valid, y_valid)
        model_path = MODEL_DIR / f"{model_name}.joblib"
        joblib.dump(model, model_path)
        
        # Feature importance
        importance = dict(zip(FEATURE_COLS, model.feature_importances_.tolist()))
        
        results_log[target_col] = {
            "model_file": str(model_path),
            "train_rows": int(len(X_valid)),
            "loo_mae": round(float(mae), 4),
            "loo_r2": round(float(r2), 4),
            "feature_importance": importance
        }
        print(f"  ✓ {target_col:25s} MAE={mae:.3f} R²={r2:.3f} rows={len(X_valid)}")
    
    # Save results log
    with open(MODEL_DIR / "training_results.json", "w") as f:
        json.dump(results_log, f, indent=2)
    
    print(f"\n✅ Training complete. {len(results_log)} models saved in {MODEL_DIR}")
    return results_log

# ------------------------------
# 6. Run if executed directly
# ------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("MTN QuantRisk - XGBoost Model Training")
    print("=" * 60)
    
    # Set augment=False if scenario library not yet ready
    # Set augment=True once Foureira has added scenarios
    # For now, we can try augment=False first to ensure basic training works
    results = train_all_models(augment=False)
    
    print("\nTraining results summary:")
    for target, info in results.items():
        print(f"  {target}: MAE={info['loo_mae']:.3f}, R²={info['loo_r2']:.3f}, rows={info['train_rows']}")
