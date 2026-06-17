# models/train_lstm.py
# Quarterly revenue forecaster (2 quarters ahead)
# Fallback: ARIMA if TensorFlow not available

import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import warnings
warnings.filterwarnings('ignore')

DATA_DIR = Path("data/structured")
MODEL_DIR = Path("models/artefacts")
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def train_arima():
    """Train ARIMA model on quarterly Service Revenue."""
    from statsmodels.tsa.arima.model import ARIMA
    
    quarterly = pd.read_csv(DATA_DIR / "quarterly.csv").sort_values(["Year", "Quarter"])
    # Service Revenue column name – check your quarterly.csv
    # It might be "Service_Revenue" or something else. Let's inspect.
    print("Quarterly columns:", quarterly.columns.tolist())
    
    # Use "Service_Revenue" if present, otherwise look for similar name
    rev_col = None
    for col in quarterly.columns:
        if 'revenue' in col.lower() and 'service' in col.lower():
            rev_col = col
            break
    if rev_col is None:
        # Fallback to first numeric column that looks like revenue
        for col in quarterly.columns:
            if col not in ['Year', 'Quarter', 'Period_ID', 'Period_Type']:
                rev_col = col
                break
    if rev_col is None:
        raise ValueError("Could not find revenue column in quarterly data")
    
    print(f"Using revenue column: {rev_col}")
    revenue = quarterly[rev_col].dropna().values
    
    # ARIMA(2,1,1) as per master plan
    model = ARIMA(revenue, order=(2, 1, 1))
    fitted = model.fit()
    
    # Save model
    joblib.dump(fitted, MODEL_DIR / "arima_revenue.joblib")
    print(f"✅ ARIMA model saved. AIC = {fitted.aic:.2f}")
    
    # Forecast 2 quarters ahead
    forecast = fitted.forecast(steps=2)
    print(f"Forecast next 2 quarters: {forecast}")
    
    return fitted

def train_lstm():
    """Optional LSTM – only if TensorFlow available."""
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
        from sklearn.preprocessing import MinMaxScaler
        
        quarterly = pd.read_csv(DATA_DIR / "quarterly.csv").sort_values(["Year", "Quarter"])
        rev_col = [c for c in quarterly.columns if 'revenue' in c.lower() and 'service' in c.lower()]
        if not rev_col:
            rev_col = [c for c in quarterly.columns if c not in ['Year', 'Quarter', 'Period_ID', 'Period_Type']]
        rev_col = rev_col[0]
        revenue = quarterly[rev_col].values.reshape(-1, 1)
        
        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(revenue)
        
        # Build sequences
        lookback = 4
        X, y = [], []
        for i in range(lookback, len(scaled)):
            X.append(scaled[i-lookback:i, 0])
            y.append(scaled[i, 0])
        X, y = np.array(X), np.array(y)
        X = X.reshape((X.shape[0], X.shape[1], 1))
        
        # Split
        split = int(len(X) * 0.8)
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=(lookback, 1)),
            Dropout(0.2),
            LSTM(32),
            Dropout(0.2),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        model.fit(X[:split], y[:split], epochs=50, batch_size=4, verbose=0,
                  validation_data=(X[split:], y[split:]))
        model.save(MODEL_DIR / "lstm_revenue.h5")
        joblib.dump(scaler, MODEL_DIR / "lstm_scaler.joblib")
        print("✅ LSTM model saved.")
        return model
    except Exception as e:
        print(f"⚠️ LSTM not available: {e}")
        return None

if __name__ == "__main__":
    print("Training revenue forecaster...")
    arima_model = train_arima()
    lstm_model = train_lstm()
    print("\nDone. Models saved in", MODEL_DIR)