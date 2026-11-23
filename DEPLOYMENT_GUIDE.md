# TECHNICAL DEPLOYMENT GUIDE

**Project:** Multi-Cloud Application Deployment and Management Using DevOps  
**Architecture:** Multi-Cloud Infrastructure (AWS, Azure, GCP) + Kubernetes + Docker + Jenkins + Prometheus/Grafana

---

## 1. System Requirements

### Minimum Hardware Requirements
- **CPU:** 2.0 GHz Dual-Core processor or higher
- **RAM:** 4 GB RAM (8 GB recommended for Docker Compose / Minikube)
- **Disk Space:** 500 MB free space (2 GB if running full Docker container images)

### Software Prerequisites
- **Operating System:** Windows 10/11, macOS, or Ubuntu 20.04+ Linux
- **Python:** Version 3.10, 3.11, or 3.12 (Python 3.12 verified)
- **Git:** Git 2.30+
- **Optional Tools:**
  - Docker Desktop (for containerized execution)
  - kubectl (for Kubernetes manifest verification)
  - Terraform v1.5+ (for infrastructure planning)

---

## 2. Local Environment Setup & Execution

### Step 1: Clone or Navigate to the Workspace
```bash
cd c:\Users\AKASH A DUBARI\Desktop\DataFix
```

### Step 2: Install Python Dependencies
```bash
python -m pip install -r requirements.txt
```

### Step 3: Configure Environment Variables (Optional)
The application includes robust defaults in `config.py`. To customize settings, copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Key variables:
- `PORT`: Web server port (Default: `5000`)
- `HOST`: Bind address (Default: `0.0.0.0`)
- `DEMO_MODE`: Enable simulation badges and offline execution (Default: `true`)
- `AWS_REGION`: AWS region label (Default: `us-east-1`)
- `AZURE_REGION`: Azure region label (Default: `eastus`)
- `GCP_REGION`: GCP region label (Default: `us-central1`)

### Step 4: Run the Application
```bash
python app.py
```
Expected output:
```text
=== Multi-Cloud DevOps Platform starting on http://0.0.0.0:5000 ===
 * Serving Flask app 'app'
 * Debug mode: off
 * Running on http://127.0.0.1:5000
```

### Step 5: Verify the Application
Open your web browser and navigate to:
```text
http://localhost:5000
```

---

## 3. Docker Deployment Guide

The application includes an optimized, production-ready `Dockerfile` based on `python:3.12-slim`.

### 3.1 Building the Docker Image
```bash
docker build -t multicloud-devops-platform:latest .
```

### 3.2 Running the Container
```bash
docker run -d \
  -p 5000:5000 \
  --name multicloud-dashboard \
  --restart unless-stopped \
  multicloud-devops-platform:latest
```

### 3.3 Verifying Container Operation
```bash
# Check container status
docker ps

# Inspect container healthcheck
docker inspect --format='{{json .State.Health}}' multicloud-dashboard

# View container output logs
docker logs multicloud-dashboard
```

---

## 4. Docker Compose Multi-Container Orchestration

To run the complete DevOps telemetry stack (Dashboard + Prometheus + Grafana) simultaneously:

### 4.1 Start the Stack
```bash
docker compose up --build -d
```

### 4.2 Verifying All Services
```bash
docker compose ps
```
The following three containers will be running:
1. `multicloud-devops-platform`: Port 5000 (Web Dashboard & REST API)
2. `multicloud-prometheus`: Port 9090 (Telemetry Scraper)
3. `multicloud-grafana`: Port 3000 (Grafana Dashboards, Credentials: `admin` / `admin`)

### 4.3 Stopping the Stack
```bash
docker compose down
```

---

## 5. Kubernetes (K8s) Deployment Guide

The project provides complete production manifests in the `k8s/` directory.

### 5.1 Kubernetes Manifest Architecture
1. **`k8s/configmap.yaml`:** Supplies environment configuration and defines a **HorizontalPodAutoscaler (HPA)** targeting 75% average CPU utilization.
2. **`k8s/deployment.yaml`:**
   - Deploys **2 replicas** for High Availability.
   - Configures `RollingUpdate` deployment strategy (`maxSurge: 1`, `maxUnavailable: 0`).
   - Implements `livenessProbe` on `/api/health` (initialDelay: 15s).
   - Implements `readinessProbe` on `/api/health` (initialDelay: 5s).
   - Sets container CPU/Memory resource requests and limits.
3. **`k8s/service.yaml`:** Exposes the pod cluster via a **LoadBalancer** service on port 80 routing to container targetPort 5000.

### 5.2 Deploying to Minikube or Kubernetes Cluster
```bash
# Apply ConfigMap and Horizontal Pod Autoscaler
kubectl apply -f k8s/configmap.yaml

# Apply 2-replica Deployment
kubectl apply -f k8s/deployment.yaml

# Apply LoadBalancer Service
kubectl apply -f k8s/service.yaml
```

### 5.3 Verifying Kubernetes Deployment
```bash
# Verify pods (must show 2 running replicas)
kubectl get pods -l app=multicloud-devops-app

# Verify deployment rollout status
kubectl rollout status deployment/multicloud-devops-deployment

# Verify service exposure
kubectl get svc multicloud-devops-service

# Check logs from pod replicas
kubectl logs -l app=multicloud-devops-app --tail=50
```

---

## 6. Jenkins CI/CD Pipeline Setup

The repository contains a Declarative `Jenkinsfile` ready for enterprise CI/CD servers.

### 6.1 Creating a Jenkins Pipeline Job
1. Open Jenkins at `http://<jenkins-host>:8080`.
2. Click **New Item** &rarr; Select **Pipeline** &rarr; Enter name `multicloud-devops-pipeline`.
3. In the Pipeline section:
   - Select **Pipeline script from SCM**.
   - SCM: **Git**.
   - Repository URL: Path to this Git repository.
   - Script Path: `Jenkinsfile`.
4. Click **Save** and click **Build Now**.

### 6.2 Pipeline Execution Stages
1. **Stage 1 (Checkout):** Pulls latest commit from Git repository.
2. **Stage 2 (Dependencies):** Installs Python dependencies (`requirements.txt`).
3. **Stage 3 (Test):** Executes automated test suite (`python -m unittest discover tests/`).
4. **Stage 4 (Docker Build):** Builds multi-arch container image `multicloud/devops-dashboard:latest`.
5. **Stage 5 (Deploy):** Applies Kubernetes manifests across cloud clusters.
6. **Stage 6 (Verify):** Probes `/api/health` for HTTP 200 OK verification.

---

## 7. Terraform Multi-Cloud Infrastructure as Code

Each cloud provider has an isolated infrastructure configuration folder:

### 7.1 Amazon Web Services (AWS)
Located in `terraform/aws/`:
- Resources: AWS VPC, Public Subnet, Internet Gateway, Security Groups, and ECS Cluster.
- Execution:
  ```bash
  cd terraform/aws
  terraform init
  terraform plan
  ```

### 7.2 Microsoft Azure
Located in `terraform/azure/`:
- Resources: Resource Group, Virtual Network (VNet), Subnet, and Azure Kubernetes Service (AKS).
- Execution:
  ```bash
  cd terraform/azure
  terraform init
  terraform plan
  ```

### 7.3 Google Cloud Platform (GCP)
Located in `terraform/gcp/`:
- Resources: VPC Network, Subnetwork, and Google Kubernetes Engine (GKE) Cluster.
- Execution:
  ```bash
  cd terraform/gcp
  terraform init
  terraform plan
  ```

---

## 8. Automated Testing & Verification Commands

```bash
# Run unit & API integration test suite
python -m unittest discover tests/

# Run end-to-end multi-cloud verification script
python verify_e2e.py
```
All tests verify HTTP response codes, JSON payloads, Prometheus metric formats, and background deployment transitions.
