# Use slim version to reduce image size and build time
FROM python:3.12.2-slim

# Set working directory
WORKDIR /app

# Install only essential build tools (less bloat)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Pre-copy requirements first to use caching
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Then copy the rest of the code (preserves pip cache)
COPY . .

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]