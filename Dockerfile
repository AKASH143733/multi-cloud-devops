# Multi-Cloud DevOps Application - Production Containerization
FROM python:3.12-slim

# Set metadata and environment variables
LABEL maintainer="Multi-Cloud DevOps Engineering Team"
LABEL description="Multi-Cloud Application Deployment and Management Platform"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000 \
    DEMO_MODE=true \
    HOST=0.0.0.0

WORKDIR /app

# Install curl for container health probes
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency definition and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Expose application port
EXPOSE 5000

# Define container health check
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Run the Flask production entry point
CMD ["python", "app.py"]
