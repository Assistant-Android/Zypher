"""
FastAPI backend for ML workflow using XGBoost.
Updated: /retrain now requires a user-uploaded CSV dataset.
All original endpoints restored.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
import io
import threading
import joblib
from typing import Optional, Dict, Any

# ML imports
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score

# Scheduler
from apscheduler.schedulers.background import BackgroundScheduler

DATA_DIR = "data"
DATA_PATH = os.path.join(DATA_DIR, "main.csv")
MODEL_PATH = os.path.join(DATA_DIR, "model.joblib")

os.makedirs(DATA_DIR, exist_ok=True)

if not os.path.exists(DATA_PATH):
    df_init = pd.DataFrame(columns=["feature1", "feature2", "target"])
    df_init.to_csv(DATA_PATH, index=False)

data_lock = threading.Lock()
model_lock = threading.Lock()

app = FastAPI(title="FastAPI XGBoost Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None

def load_model():
    global _model
    if os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception as e:
            print("Failed to load model:", e)
            _model = None
    else:
        _model = None

load_model()

class TuneRequest(BaseModel):
    method: Optional[str] = "grid"
    cv: Optional[int] = 3
    max_evals: Optional[int] = 20

def read_dataset() -> pd.DataFrame:
    with data_lock:
        return pd.read_csv(DATA_PATH)

def append_dataframe(df: pd.DataFrame):
    with data_lock:
        existing = pd.read_csv(DATA_PATH)
        combined = pd.concat([existing, df], ignore_index=True)
        combined.to_csv(DATA_PATH, index=False)

def train_model(df: pd.DataFrame, save: bool = True) -> Dict[str, Any]:
    with model_lock:
        if "target" not in df.columns:
            raise ValueError("Dataset must contain a 'target' column.")
        df = df.dropna(subset=["target"])
        if df.shape[0] < 5:
            raise ValueError("Not enough data to train.")

        X = df.drop(columns=["target"])
        y = df["target"]

        X = X.fillna(0)
        for col in X.select_dtypes(include=[object]).columns:
            X[col] = X[col].astype('category').cat.codes

        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

        model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
        model.fit(X_train, y_train)

        preds = model.predict(X_val)
        acc = float(accuracy_score(y_val, preds))

        if save:
            joblib.dump(model, MODEL_PATH)
            load_model()

        return {"accuracy": acc, "n_train": len(X_train), "n_val": len(X_val), "model_path": MODEL_PATH}

@app.get("/")
def home():
    return {"message": "✅ FastAPI XGBoost backend is running!"}

@app.post("/upload-row")
async def upload_row(file: Optional[UploadFile] = File(None), row: Optional[Dict] = None):
    if file is None and row is None:
        raise HTTPException(status_code=400, detail="Provide either Excel file or JSON row.")

    if file is not None:
        contents = await file.read()
        try:
            df = pd.read_excel(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read Excel file: {e}")
    else:
        try:
            df = pd.DataFrame([row])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse JSON: {e}")

    try:
        append_dataframe(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Append failed: {e}")

    return {"status": "ok", "n_rows_added": len(df)}

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {e}")

    try:
        append_dataframe(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Append failed: {e}")

    return {"status": "ok", "n_rows_added": len(df)}

@app.get("/download")
def download_dataset():
    df = read_dataset()
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    return StreamingResponse(iter([stream.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=main.csv"})

@app.post("/retrain")
async def retrain_with_upload(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV file: {e}")

    try:
        result = train_model(df, save=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {e}")

    return JSONResponse(content={"status": "ok", "result": result})

@app.post("/tune")
def tune_hyperparams(req: TuneRequest):
    with model_lock:
        df = read_dataset()
        if "target" not in df.columns:
            raise HTTPException(status_code=400, detail="Dataset must contain 'target' column.")
        df = df.dropna(subset=["target"])
        if df.shape[0] < 10:
            raise HTTPException(status_code=400, detail="Not enough data for tuning.")

        X = df.drop(columns=["target"]).fillna(0)
        for col in X.select_dtypes(include=[object]).columns:
            X[col] = X[col].astype('category').cat.codes
        y = df['target']

        param_grid = {
            'n_estimators': [50, 100],
            'max_depth': [3, 6],
            'learning_rate': [0.1, 0.01]
        }

        model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
        grid = GridSearchCV(model, param_grid, cv=req.cv, n_jobs=1, verbose=1)
        grid.fit(X, y)

        best = grid.best_params_
        best_score = float(grid.best_score_)
        joblib.dump(grid.best_estimator_, MODEL_PATH)
        load_model()

        return {"status": "ok", "best_params": best, "best_score": best_score}

@app.get("/predict")
def predict_row():
    if _model is None:
        raise HTTPException(status_code=400, detail="Model not available. Train a model first.")
    df = read_dataset()
    X = df.drop(columns=[col for col in df.columns if col == 'target']).fillna(0)
    for col in X.select_dtypes(include=[object]).columns:
        X[col] = X[col].astype('category').cat.codes
    preds = _model.predict(X)
    return {"n_rows": len(X), "sample_prediction": int(preds[0])}

scheduler = BackgroundScheduler()

def scheduled_retrain():
    print("Scheduled retrain running...")
    try:
        df = read_dataset()
        res = train_model(df, save=True)
        print("Scheduled retrain finished:", res)
    except Exception as e:
        print("Scheduled retrain failed:", e)

scheduler.add_job(scheduled_retrain, 'interval', hours=24, id='daily_retrain', replace_existing=True)

@app.on_event("startup")
def startup_event():
    print("Starting scheduler...")
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    print("Shutting down scheduler...")
    scheduler.shutdown(wait=False)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)