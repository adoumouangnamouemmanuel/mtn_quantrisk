# Model Card — ARIMA Revenue Forecast

**Model:** ARIMA(2,1,1) — univariate time-series
**Task:** 2-quarter-ahead forecast of MTN Ghana Service Revenue
**Owner:** MTN Risk Team
**Artefact:** `models/artefacts/arima_revenue.joblib`

## 1. Intended use

The ARIMA model is the single source of the forecast shown on the
**Predictive (90d)** page (`GET /api/forecast/FIN01`). It forecasts
Service Revenue (KPI `FIN01`) two quarters ahead.

It is the **only** KPI with a forecast model. For every other KPI the
forecast endpoint refuses to fabricate data and returns HTTP 503 with
`"No trained forecast model for KPI {kpi_id}"` (audit C4 — the random-walk
fallback was removed).

## 2. Target

| Field | Value |
|---|---|
| Target KPI | `FIN01` — Service Revenue |
| Unit | GHSm (millions of Ghana cedis) |
| Frequency | Quarterly |
| Forecast horizon | 2 quarters (~6 months) |

The endpoint interpolates the two quarterly point forecasts into a daily
series up to the requested `horizon` (capped at 365 days) and widens the
confidence band with the horizon so uncertainty is visible rather than hidden.

## 3. Training data

- **Source:** `data/structured/quarterly.csv`, sorted by `Year`, `Quarter`.
- **Series:** the `Service_Revenue` column (the trainer auto-detects the
  first column matching `service`+`revenue`, falling back to the first
  non-identifier column).
- **Length:** the quarterly file currently spans FY20Q1–FY26Q1 (~25
  observations). This is enough for a 2-quarter ARIMA but marginal for
  robust seasonal modelling.

## 4. Model specification

- **Order:** ARIMA(2,1,1) — two autoregressive terms, one differencing,
  one moving-average term. One differencing removes the trend in nominal
  revenue.
- **Library:** `statsmodels.tsa.arima.model.ARIMA`.
- **Fit:** maximum-likelihood via `model.fit()`.
- **Selection:** fixed order chosen from the master plan; no automated
  (p,d,q) search or AIC grid is run today.

## 5. Validation

- **AIC** is printed at train time and logged; a lower AIC indicates a
  better in-sample fit.
- There is **no held-out temporal validation** today. The 2-quarter
  forecast should be spot-checked against actuals quarterly before being
  relied upon.
- No prediction-interval calibration exists; the band shown in the UI is a
  fixed ±15% heuristic that grows with horizon, not a model-derived
  interval.

## 6. Limitations

1. **Univariate.** The model sees only past revenue; it cannot react to
   macro shifts (FX, inflation) until they are already reflected in revenue.
2. **Nominal, not real.** Forecasts are in nominal GHSm; they embed
   inflation and FX effects rather than isolating volume/margin.
3. **Fixed order.** ARIMA(2,1,1) may be misspecified; a seasonal SARIMA or
   exogenous-variable ARIMAX would likely fit better once more data exists.
4. **No seasonal term.** Quarterly data has few cycles; a seasonal order
   would need several years of data to estimate reliably.
5. **No drift monitoring.** Forecast vs actual is not logged, so silent
   degradation cannot be detected.

## 7. Retraining

Run `python models/train_lstm.py` (the module name is historical; it trains
the ARIMA model and optionally an LSTM). `POST /api/retrain` retrains the
XGBoost family only — it does **not** retrain the ARIMA model. To retrain
the forecaster, run the script directly.

## 8. The optional LSTM

`train_lstm.py` can train an LSTM (`tensorflow.keras`) as an alternative
forecaster. TensorFlow is an optional dependency; if it is not installed the
LSTM step is skipped and only ARIMA is produced. The ARIMA artefact is the
one the API loads; the LSTM artefact is not currently wired into the
forecast endpoint.

## 9. Roadmap

- Add exogenous macro features → ARIMAX.
- Add a walk-forward evaluation harness and log forecast/actual pairs.
- Expose a real prediction interval from the model's variance.
- Auto-select (p,d,q) via AIC once ≥5 years of quarterly data exist.
