#!/bin/bash

export PYTHONPATH=..
if [ "$DEBUG" = "1" ]; then
    echo "Starting FastAPI application in debug mode..."
    python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn db.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "Starting FastAPI application in normal mode..."
    uvicorn db.main:app --host 0.0.0.0 --port 8000 --reload
fi