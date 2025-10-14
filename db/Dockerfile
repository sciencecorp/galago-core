# Use official Python image as the base image
FROM --platform=$TARGETPLATFORM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir --timeout=120 -r requirements.txt

# Copy the application code
COPY . /app/db

ENV PYTHONPATH="/app"

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the FastAPI app with Uvicorn
CMD ["uvicorn", "db.main:app", "--host", "0.0.0.0", "--port", "8000"]
