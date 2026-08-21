# Model Card — XGBoost Impact Models

**Model family:** XGBoost (gradient-boosted trees)
**Task:** Regression — predict a KPI's value from Ghana macro features
**Owner:** MTN Risk Team
**Last trained:** see `models/artefacts/training_results.json` `mtime`
**Artefact location:** `models/artefacts/*.joblib`

## 1. Intended use

Six separate XGBoost regressors translate Ghanaian macro conditions into
expected MTN Ghana KPI values. They power the **SHAP driver-attribution**
panel on the Stress Tester page (`models/explain.py`) and, indirectly, the
scenario `shapAttributions` field returned by `POST /api/scenarios/{id}/run`.

When the model artefact or scaler is missing the API surfaces an explicit
`shapUnavailable: true` flag rather than a fabricated attribution (audit C6).

## 2. Targets (one model per target)

| Target column | Model file | KPI ID | Unit | Definition |
|---|---|---|---|---|
| `Service_Rev_Growth_Pct` | `revenue_growth.joblib` | FIN06 | % | Year-over-year Service Revenue growth |
| `EBITDA_Margin_Pct` | `ebitda_margin.joblib` | FIN03 | % | EBITDA ÷ Service Revenue |
| `PAT_Margin_Pct` | `pat_margin.joblib` | FIN05 | % | Profit-after-tax ÷ Service Revenue |
| `MoMo_Revenue` | `momo_revenue.joblib` | SEG03 | GHSm | Mobile-money revenue (absolute) |
| `ARPU_GHS` | `arpu.joblib` | OPS04 | GHS | Average revenue per user |
| `Data_Growth_Pct` | `data_revenue_growth.joblib` | SEG01 | % | YoY Data Revenue growth |

Growth figures are year-over-year. Margins are expressed as percentages.

## 3. Features

All models share six macro features, standardised with a `StandardScaler`
saved at `models/artefacts/feature_scaler.joblib`:

| Feature | Source CSV | Description |
|---|---|---|
| `Inflation_YoY_Pct` | `macro_context.csv` (EXT01) | Ghana CPI inflation, YoY % |
| `Policy_Rate_Pct` | `macro_context.csv` (EXT02) | Bank of Ghana policy rate % |
| `Cedi_USD_Avg` | `macro_context.csv` (EXT03) | Average GHS per USD |
| `GDP_Growth_Pct` | `macro_context.csv` | Ghana annual GDP growth % |
| `Mobile_Penetration_Pct` | `macro_context.csv` | Mobile subscriptions / population % |
| `Data_Penetration_Pct` | `macro_context.csv` | Data subscriptions / population % |

## 4. Training data

- **Real rows:** merged from `annual.csv`, `macro_context.csv`,
  `segments_annual.csv`, `operational_annual.csv` on `Year`.
- **Rows per target:** 20–24 (annual observations 2020–2025 + partial
  history). This is the dominant limitation of the whole model family — see
  §7.
- **Augmentation (`augment=True`):** synthetic rows are generated from the
  repository scenario library; each row carries the scenario's *stressed*
  EXT macro values clamped to the observed historical range, with the
  scenario's stressed KPI value as the target. This preserves the
  macro→target signal that an earlier, broken implementation destroyed.
  **Default is `augment=False`** because the augmented rows risk
  label leakage (the targets are themselves derived from the scenario
  engine, not independent observations).

## 5. Validation

Leave-One-Out (LOO) cross-validation (`sk.model_selection.LeaveOneOut`),
the appropriate scheme for very small datasets. Reported metrics are in
`training_results.json`:

| Target | Train rows | LOO MAE | LOO R² |
|---|---|---|---|
| Service_Rev_Growth_Pct | 20 | 0.0211 | 0.9999 |
| EBITDA_Margin_Pct | 24 | 0.0145 | 0.9998 |
| PAT_Margin_Pct | 24 | 0.0155 | 0.9999 |
| MoMo_Revenue | 24 | 1.0331 | 1.0000 |
| ARPU_GHS | 24 | 5.7042 | 0.8199 |
| Data_Growth_Pct | 20 | 0.0349 | 1.0000 |

## 6. Hyperparameters

Shared across all six models, chosen to overfit less on tiny data:

```
n_estimators=200, max_depth=3, learning_rate=0.05,
subsample=0.8, colsample_bytree=0.8,
reg_alpha=0.1, reg_lambda=1.0, random_state=42
```

## 7. Limitations & ethical considerations

1. **Statistically insignificant sample.** 20–24 rows cannot support a
   defensible macro→KPI regression. The near-perfect LOO R² (≈0.9999) is a
   symptom of memorisation, not generalisation — do **not** treat these
   metrics as evidence of real-world accuracy. The `/api/health` endpoint
   reports `accuracyProven: false` for this reason.
2. **No temporal split.** LOO shuffle ignores time ordering, so the models
   can train on the future and predict the past. A proper time-series
   walk-forward split is required before any production reliance.
3. **Augmentation leakage.** When `augment=True`, synthetic targets are
   produced by the same scenario engine the API uses, so the model can
   partly "see" the transformation it is being asked to predict.
4. **No calibration / drift monitoring.** Severity tiers and thresholds are
   hand-tuned; there is no prediction logging or drift detection.
5. **Macro feature coverage.** Only three of six features (the EXT KPIs)
   are varied by scenarios; the other three are copied from the latest real
   year and may not reflect plausible future regimes.

## 8. Retraining

`POST /api/retrain` calls `train_all_models(augment=False)` in-process (audit
H6) and writes new artefacts + `training_results.json`. Retrain after
collecting more quarterly data (target: ≥24 quarterly rows per KPI with a
walk-forward split).

## 9. Monitoring

Today there is no automated drift detection (tracked as M7). The health
endpoint reports artefact presence and stored LOO metrics, plus the explicit
note that "artifact presence does not prove current production accuracy."
