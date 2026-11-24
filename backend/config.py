import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'multicloud-devops-secret-key-2026')
    DATABASE_PATH = os.environ.get('DATABASE_PATH', os.path.join(os.path.dirname(__file__), 'multicloud.db'))
    DEMO_MODE = os.environ.get('DEMO_MODE', 'true').lower() in ('true', '1', 't')
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('DEBUG', 'false').lower() in ('true', '1', 't')

    # Simulated Cloud Regions
    AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1 (N. Virginia)')
    AZURE_REGION = os.environ.get('AZURE_REGION', 'eastus (Virginia)')
    GCP_REGION = os.environ.get('GCP_REGION', 'us-central1 (Iowa)')
