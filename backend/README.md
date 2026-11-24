# Multi-Cloud DevOps Backend (Python / Flask)

This directory contains the complete Python Flask REST API backend for the **Multi-Cloud Application Deployment and Management Platform**.

---

## Architecture Overview

```text
backend/
├── app.py             # Flask application, REST endpoints, and Prometheus metrics
├── database.py        # SQLite schema, migrations, connection pool, and demo seeds
├── config.py          # Environment settings, secret keys, and cloud region mappings
├── requirements.txt   # Python package dependencies
└── __init__.py        # Package initialization
```

---

## Key Backend REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Overall summary counts (clouds, total apps, successful deploys, failed deploys, availability SLA) |
| `GET` | `/api/clouds` | Status, compute (vCPU), memory (RAM), and demo tags for AWS, Azure, and GCP |
| `GET` | `/api/deployments` | List of all deployment records with cloud and status filtering |
| `GET` | `/api/deployments/<id>` | Query live progress (0-100%) and current stage of a specific deployment |
| `POST` | `/api/deploy` | Triggers a 6-stage simulated multi-cloud deployment (`app_name`, `cloud_provider`, `version`) |
| `GET` | `/api/pipeline` | CI/CD visual pipeline stages (`GitHub -> Jenkins -> Build -> Test -> Docker -> Kubernetes -> Cloud`) |
| `GET` | `/api/health` | System health check (database connection, uptime seconds, cloud health) |
| `GET` | `/api/metrics` | Prometheus metrics scrape format (text/plain) or JSON (`?format=json`) |
| `GET` | `/api/logs` | Centralized audit and deployment logs with keyword and level filtering |
| `POST` | `/api/reset-demo` | Resets SQLite database and metrics to clean default demo state |

---

## 6-Stage Asynchronous Deployment Lifecycle

The backend runs an asynchronous background worker thread whenever a deployment is triggered:
1. **Source Code Checkout:** Clones git commit from GitHub repository.
2. **Build:** Compiles bytecode and packages application artifacts.
3. **Testing:** Executes PyTest suite and Bandit security checks.
4. **Docker Image Creation:** Compiles multi-arch container image with sha256 checksum.
5. **Deployment:** Applies Kubernetes manifests across AWS, Azure, or GCP clusters.
6. **Verification:** Synthetic HTTP health probe verifying zero-downtime availability.

---

## Running the Backend

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run Flask server
python app.py
```
Server runs on: `http://localhost:5000`
