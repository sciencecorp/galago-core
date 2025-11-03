# Use official Python image as the base image
FROM --platform=$TARGETPLATFORM python:3.11-slim

# Set the working directory
WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*


# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir --timeout=120 -r requirements.txt

# Copy the application code
COPY . /app/db

COPY docker-entrypoint-prod.sh /
RUN chmod +x /docker-entrypoint-prod.sh

ENV PYTHONPATH="/app"

# Expose the port FastAPI will run on
EXPOSE 8000

ENTRYPOINT ["/docker-entrypoint-prod.sh"]