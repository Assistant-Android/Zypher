from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
import pandas as pd
import numpy as np
import os
import io
import threading
import joblib
from typing import Optional, Dict, Any, List, Union
import pickle

# ML imports
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier

app = FastAPI(title="FastAPI XGBoost Backend")

# Add CORS middleware with specific configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Define required columns for data processing
REQUIRED_COLUMNS = [
    'transit_duration', 'ra', 'stellar_radius', 'insolation_flux',
    'dec', 'planet_radius', 'stellar_temp', 'koi_model_snr',
    'transit_depth', 'orbital_period', 'equilibrium_temp',
    'planet_radius_missing'
]

DERIVED_FEATURES = [
    'radius_ratio', 'flux_temp_ratio', 'depth_radius_ratio',
    'duration_period_ratio', 'radius_star_interaction',
    'radius_temp_interaction', 'depth_radius_interaction',
    'duration_radius_interaction', 'flux_temp_interaction',
    'flux_radius_interaction'
]

# Use absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "model")

DATA_PATH = os.path.join(DATA_DIR, "main.csv")
MODEL_PATH = os.path.join(DATA_DIR, "model.joblib")
LLM_MODEL_PATH = os.path.join(MODEL_DIR, "random_forest_model.pkl")

# Create necessary directories
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

if not os.path.exists(DATA_PATH):
    # Initialize with all required columns including ML features
    initial_columns = REQUIRED_COLUMNS + ['feature1', 'feature2', 'target', 'st_tmag', 'st_tmag_missing']
    df_init = pd.DataFrame(columns=initial_columns)
    df_init.to_csv(DATA_PATH, index=False)

data_lock = threading.Lock()
model_lock = threading.Lock()

def validate_numeric_columns(df: pd.DataFrame) -> None:
    """Validate that required columns contain numeric data"""
    try:
        # Convert numeric columns to float, handling missing values
        numeric_cols = [col for col in REQUIRED_COLUMNS if col != 'planet_radius_missing']
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Convert boolean columns
        if 'planet_radius_missing' in df.columns:
            df['planet_radius_missing'] = df['planet_radius_missing'].astype(bool)
        if 'st_tmag_missing' in df.columns:
            df['st_tmag_missing'] = df['st_tmag_missing'].astype(bool)
    except (ValueError, TypeError) as e:
        raise ValueError(f"Error converting data types: {str(e)}")

def calculate_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate derived features from raw input features"""
    df = df.copy()
    try:
        # Calculate ratios
        if all(col in df.columns for col in ['planet_radius', 'stellar_radius']):
            df['radius_ratio'] = df['planet_radius'] / df['stellar_radius']
        if all(col in df.columns for col in ['insolation_flux', 'stellar_temp']):
            df['flux_temp_ratio'] = df['insolation_flux'] / df['stellar_temp']
        if all(col in df.columns for col in ['transit_depth', 'planet_radius']):
            df['depth_radius_ratio'] = df['transit_depth'] / df['planet_radius']
        if all(col in df.columns for col in ['transit_duration', 'orbital_period']):
            df['duration_period_ratio'] = df['transit_duration'] / df['orbital_period']
        
        # Calculate interactions
        if all(col in df.columns for col in ['planet_radius', 'stellar_radius']):
            df['radius_star_interaction'] = df['planet_radius'] * df['stellar_radius']
        if all(col in df.columns for col in ['planet_radius', 'stellar_temp']):
            df['radius_temp_interaction'] = df['planet_radius'] * df['stellar_temp']
        if all(col in df.columns for col in ['transit_depth', 'planet_radius']):
            df['depth_radius_interaction'] = df['transit_depth'] * df['planet_radius']
        if all(col in df.columns for col in ['transit_duration', 'planet_radius']):
            df['duration_radius_interaction'] = df['transit_duration'] * df['planet_radius']
        if all(col in df.columns for col in ['insolation_flux', 'stellar_temp']):
            df['flux_temp_interaction'] = df['insolation_flux'] * df['stellar_temp']
        if all(col in df.columns for col in ['insolation_flux', 'planet_radius']):
            df['flux_radius_interaction'] = df['insolation_flux'] * df['planet_radius']
    except Exception as e:
        print(f"Warning: Error calculating some derived features: {str(e)}")
    
    return df

def train_model(df: pd.DataFrame, save: bool = True) -> Dict[str, Any]:
    """Train the model with the provided data"""
    with model_lock:
        try:
            # Prepare features
            feature_cols = REQUIRED_COLUMNS + DERIVED_FEATURES
            feature_cols = [col for col in feature_cols if col in df.columns]
            feature_cols.remove('planet_radius_missing')  # Remove boolean column
            
            X = df[feature_cols].fillna(0)
            if 'target' not in df.columns:
                raise ValueError("Dataset must contain a 'target' column")
            y = df['target'].fillna(0)
            
            # Split data
            X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            model = XGBClassifier(
                use_label_encoder=False,
                eval_metric='logloss',
                n_estimators=100,
                max_depth=6,
                objective='binary:logistic',
                base_score=0.5  # Set base_score to 0.5 for binary classification
            )
            
            # Convert target to binary values (0 or 1)
            y_train = y_train.astype(int)
            y_val = y_val.astype(int)
            
            model.fit(X_train, y_train)
            
            # Evaluate
            val_preds = model.predict(X_val)
            accuracy = float(accuracy_score(y_val, val_preds))
            
            # Save if requested
            if save:
                joblib.dump(model, MODEL_PATH)
            
            return {
                "accuracy": accuracy,
                "n_train": len(X_train),
                "n_val": len(X_val),
                "features_used": feature_cols
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Model training failed: {str(e)}"
            )

@app.get("/health")
async def health_check():
    """Health check endpoint to verify server is running"""
    return {"status": "ok", "message": "Server is running"}

@app.post("/retrain")
async def retrain_model():
    """Retrain the model with the current dataset"""
    try:
        # Read the current dataset
        with data_lock:
            df = pd.read_csv(DATA_PATH)
            if df.empty:
                raise HTTPException(status_code=400, detail="No data available for training")
        
        # Train the model
        result = train_model(df, save=True)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Model retrained successfully",
                "details": result
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    """Handle file upload and process the data"""
    print(f"Received file upload request: {file.filename}")  # Debug log
    
    try:
        # Validate file extension
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
        # Read file contents
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Parse CSV
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail="The CSV file is empty")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        
        # Process the dataframe
        try:
            # Ensure numeric columns are properly typed
            validate_numeric_columns(df)
            
            # Calculate derived features
            df = calculate_derived_features(df)
            
            # Handle missing values
            for col in df.columns:
                if col not in ['planet_radius_missing', 'st_tmag_missing']:
                    df[col] = df[col].fillna(df[col].mean() if df[col].dtype.kind in 'fc' else 0)
            
            # Append to existing data
            with data_lock:
                if os.path.exists(DATA_PATH):
                    existing = pd.read_csv(DATA_PATH)
                    # Ensure all columns from existing data are present
                    for col in existing.columns:
                        if col not in df.columns:
                            df[col] = np.nan
                    # Reorder columns to match existing
                    df = df[existing.columns]
                df.to_csv(DATA_PATH, index=False)
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": "File processed successfully",
                    "rows_processed": len(df),
                    "columns": list(df.columns)
                }
            )
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process data: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/download")
async def download_dataset():
    """Download the current dataset as CSV"""
    try:
        with data_lock:
            if not os.path.exists(DATA_PATH):
                raise HTTPException(status_code=404, detail="No data available for download")
            
            df = pd.read_csv(DATA_PATH)
            if df.empty:
                raise HTTPException(status_code=404, detail="No data available for download")
            
            # Create a string buffer and write the CSV to it
            buffer = io.StringIO()
            df.to_csv(buffer, index=False)
            buffer.seek(0)
            
            # Return the CSV as a streaming response
            return StreamingResponse(
                iter([buffer.getvalue()]),
                media_type="text/csv",
                headers={
                    "Content-Disposition": "attachment; filename=exoplanet_data.csv"
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="debug")