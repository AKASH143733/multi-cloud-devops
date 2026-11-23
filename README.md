# Multi-Cloud Application Deployment and Management Using DevOps

[![DevOps Platform](https://img.shields.io/badge/Platform-Multi--Cloud%20DevOps-0284c7.svg)](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix)
[![Docker](https://img.shields.io/badge/Container-Docker%20%7C%20Compose-2496ED.svg)](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/Dockerfile)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes%202%20Replicas-326CE5.svg)](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/k8s/deployment.yaml)
[![Terraform](https://img.shields.io/badge/IaC-Terraform%20(AWS%2C%20Azure%2C%20GCP)-7B42BC.svg)](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/terraform)
[![Monitoring](https://img.shields.io/badge/Telemetry-Prometheus%20%26%20Grafana-E6522C.svg)](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/monitoring)
[![License](https://img.shields.io/badge/License-MIT-10b981.svg)]()
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-10b981.svg)](https://famous-berries-rule.loca.lt)

---

### 🌐 Live Public Demonstration
- 🔗 **Live Dashboard URL:** **[https://multicloud-devops-akash.loca.lt](https://multicloud-devops-akash.loca.lt)**
- 🔑 **Tunnel Password (if prompted on first visit):** `106.202.110.41`

---

> A centralized, enterprise-grade DevOps platform demonstrating how microservices are developed, containerized, orchestrated, deployed, and monitored across **Amazon Web Services (AWS)**, **Microsoft Azure**, and **Google Cloud Platform (GCP)** without vendor lock-in.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Definition & Objectives](#problem-definition--objectives)
3. [Technology Stack](#technology-stack)
4. [System Architecture & Visual Pipeline](#system-architecture--visual-pipeline)
5. [Frontend Design & Pages](#frontend-design--pages)
6. [Quick Start & Execution Guide](#quick-start--execution-guide)
7. [Docker & Container Orchestration](#docker--container-orchestration)
8. [Kubernetes High-Availability Deployment](#kubernetes-high-availability-deployment)
9. [Jenkins CI/CD Declarative Pipeline](#jenkins-cicd-declarative-pipeline)
10. [Terraform Multi-Cloud Infrastructure](#terraform-multi-cloud-infrastructure)
11. [Prometheus & Grafana Monitoring](#prometheus--grafana-monitoring)
12. [REST API Documentation](#rest-api-documentation)
13. [University Presentation & Faculty Demo](#university-presentation--faculty-demo)
14. [Advantages, Limitations & Future Scope](#advantages-limitations--future-scope)

---

## 1. Project Overview

Modern cloud architectures increasingly require **multi-cloud resilience** to prevent cloud vendor lock-in, meet regional data sovereignty laws, guarantee near-100% service uptime, and optimize cloud infrastructure costs.

This project delivers a **full-featured, production-ready DevOps Management Dashboard** connecting three major cloud ecosystems:
- **Amazon Web Services (AWS)** — us-east-1 (N. Virginia)
- **Microsoft Azure** — eastus (Virginia)
- **Google Cloud Platform (GCP)** — us-central1 (Iowa)

The system unifies:
1. **Centralized DevOps Control Plane:** Real-time health metrics, active microservices, deployment audits, and cluster utilization across all clouds.
2. **Automated 6-Stage Deployment Lifecycle:** Source Code Checkout &rarr; Build &rarr; Testing &rarr; Docker Image Creation &rarr; Cloud Deployment &rarr; Synthetic Verification.
3. **CI/CD Pipeline Flow:** Visual diagram modeling `GitHub -> Jenkins -> Build -> Test -> Docker -> Kubernetes -> Cloud Deployment`.
4. **Telemetry & Observability:** Live CPU, memory, latency, and throughput metrics with Prometheus scrapers and Grafana dashboards.
5. **Zero Paid Cloud Dependencies:** Includes automated simulation with clearly marked `DEMO DATA` / `SIMULATED ENVIRONMENT` tags, enabling flawless university presentations and offline evaluations.

---

## 2. Problem Definition & Objectives

### Problem Definition
Organizations operating in single-cloud environments suffer from single-point-of-failure (SPOF) risks, vendor price exploitation, unpredictable regional outages, and compliance hurdles. However, orchestrating applications across heterogeneous clouds (AWS, Azure, GCP) traditionally demands disparate consoles, fragmented monitoring systems, and incompatible deployment pipelines.

### Key Objectives
- **Centralize Multi-Cloud Governance:** Provide a single dashboard view of compute, memory, and application status across AWS, Azure, and GCP.
- **Implement Unified CI/CD:** Deliver standard declarative pipelines (`Jenkinsfile`) that compile, test, containerize, and deploy workloads uniformly.
- **Containerize & Orchestrate:** Package applications using lightweight Docker images and scale with Kubernetes 2-replica high-availability manifests.
- **Automate Infrastructure as Code (IaC):** Modular Terraform templates for AWS (ECS/VPC), Azure (AKS/VNet), and GCP (GKE/VPC).
- **Comprehensive Monitoring:** Prometheus endpoint exposition (`/api/metrics`) and pre-configured Grafana telemetry dashboards.

---

## 3. Technology Stack

| Layer | Technologies & Tools | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, CSS3, JavaScript (ES6+), React 18, Chart.js, FontAwesome 6 | Responsive cloud console (white background, dark blue headings `#0f172a`, light blue cards `#f0f9ff`, green success `#10b981`, red failure `#ef4444`) |
| **Backend REST API** | Python 3.12, Flask 3.1, SQLite 3, Flask-CORS | High-throughput REST API, async background deployment simulator, persistent database |
| **DevOps & CI/CD** | Git, GitHub, Jenkins (Declarative Pipeline) | Multi-stage continuous integration and delivery with automated testing and rollouts |
| **Containerization** | Docker, Docker Compose (v3.8) | Multi-arch container image with health checks and multi-container orchestration |
| **Orchestration** | Kubernetes (k8s) | 2-replica deployment, rolling updates, liveness/readiness probes, LoadBalancer service, HPA |
| **Infrastructure as Code** | Terraform (v1.5+) | Cloud-specific HCL modules for AWS, Microsoft Azure, and Google Cloud Platform |
| **Observability** | Prometheus, Grafana | Metric scraping (`/api/metrics`), latency monitoring, CPU/RAM utilization, request counters |

---

## 4. System Architecture & Visual Pipeline

```
+-----------------------------------------------------------------------------------+
|                           DEVELOPER / DEVOPS ENGINEER                             |
+-----------------------------------------------------------------------------------+
                                         │  (git push)
                                         ▼
+-----------------------------------------------------------------------------------+
|                                     GITHUB                                        |
+-----------------------------------------------------------------------------------+
                                         │  (webhook trigger)
                                         ▼
+-----------------------------------------------------------------------------------+
|                         JENKINS CI/CD ORCHESTRATION                               |
|  [Checkout] ──► [Dependencies] ──► [PyTest] ──► [Docker Build] ──► [Deploy & Verify]
+-----------------------------------------------------------------------------------+
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
+───────────────────+          +───────────────────+          +───────────────────+
|    AMAZON AWS     |          |  MICROSOFT AZURE  |          |   GOOGLE CLOUD    |
|  AWS ECS / EKS    |          |     Azure AKS     |          |    Google GKE     |
|  us-east-1        |          |     eastus        |          |    us-central1    |
+───────────────────+          +───────────────────+          +───────────────────+
        │                                │                                │
        └────────────────────────────────┼────────────────────────────────┘
                                         ▼
+-----------------------------------------------------------------------------------+
|                  CENTRALIZED MONITORING & GOVERNANCE DASHBOARD                    |
|   • Flask REST API (Port 5000)        • Prometheus Scraper (Port 9090)            |
|   • React Responsive UI               • Grafana Dashboards (Port 3000)            |
+-----------------------------------------------------------------------------------+
```

---

## 5. Frontend Design & Pages

The web application follows modern enterprise cloud design principles:
- **Clean Sidebar Navigation:** Direct access to Dashboard, Cloud Providers, Deployment Management, CI/CD Pipeline, Monitoring, and Logs.
- **Color Discipline:**
  - Headings: Dark Blue (`#0f172a`, `#1e3a8a`)
  - Cards: Light Blue (`#f0f9ff`, border `#bae6fd`)
  - Status Indicators: Green (`#10b981`) for success, Red (`#ef4444`) for failures, Amber (`#f59e0b`) for active/warning.

### Page Breakdown:
1. **Dashboard:** Central metrics (Total clouds: 3, Total apps: 6, Successful deployments, App availability 99.94%), cloud cards preview, and recent activities.
2. **Cloud Providers:** Dedicated AWS, Azure, and GCP cards displaying status, active workloads, CPU/memory progress bars, and direct deploy triggers. Clearly labeled with `DEMO DATA` tags.
3. **Deployment Management:** Deployment history table with cloud filters, plus the interactive **Deploy Application** modal. Features a real-time animated **6-stage deployment simulator** with progress bar and terminal logs.
4. **CI/CD Pipeline:** Interactive visual flow graph showing `GitHub -> Jenkins -> Build -> Test -> Docker -> Kubernetes -> Cloud Deployment` with duration indicators, pulse animations, and stage log inspectors.
5. **Monitoring:** Real-time Chart.js telemetry covering CPU utilization, Memory usage, Application response latency (ms), and Request throughput (req/min).
6. **System Logs:** Centralized audit terminal supporting live text search, cloud provider filters (AWS/Azure/GCP/All), log level filters (INFO/SUCCESS/WARNING/ERROR), and JSON log export.

---

## 6. Quick Start & Execution Guide

### Prerequisites
- Python 3.10+ (Python 3.12 verified)
- Modern web browser (Chrome, Edge, Firefox, Safari)
- Optional: Docker & Docker Compose (for containerized execution)

### 1-Command Local Execution (Immediate Demo)
```bash
# 1. Clone or navigate to the project directory
cd c:\Users\AKASH A DUBARI\Desktop\DataFix

# 2. Run the application
python app.py
```

Open your browser at:
👉 **`http://localhost:5000`**

### Running Automated Test Suite
```bash
# Run unit & API integration tests
python -m unittest discover tests/

# Run end-to-end multi-cloud verification script
python verify_e2e.py
```

---

## 7. Docker & Container Orchestration

### Build and Run Standalone Container
```bash
# Build Docker image
docker build -t multicloud-devops-platform:latest .

# Run container on port 5000
docker run -d -p 5000:5000 --name multicloud-app multicloud-devops-platform:latest

# Verify container health
curl http://localhost:5000/api/health
```

### Full Multi-Container Stack (App + Prometheus + Grafana)
```bash
# Start all services
docker compose up --build -d

# Check status of running containers
docker compose ps
```

Services exposed:
- **DevOps Dashboard:** `http://localhost:5000`
- **Prometheus Scraper:** `http://localhost:9090`
- **Grafana Dashboard:** `http://localhost:3000` (User: `admin`, Pass: `admin`)

---

## 8. Kubernetes High-Availability Deployment

All manifests are located in [k8s/](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/k8s):
- `k8s/deployment.yaml`: 2 High-Availability Pod replicas with rolling updates and liveness/readiness probes.
- `k8s/service.yaml`: LoadBalancer service exposing port 80 &rarr; targetPort 5000.
- `k8s/configmap.yaml`: Multi-cloud region configuration & Horizontal Pod Autoscaler (HPA).

### Deployment Commands:
```bash
# Apply ConfigMap & Horizontal Pod Autoscaler
kubectl apply -f k8s/configmap.yaml

# Deploy 2-replica application
kubectl apply -f k8s/deployment.yaml

# Expose service via LoadBalancer
kubectl apply -f k8s/service.yaml

# Verify pod status and replicas
kubectl get pods -l app=multicloud-devops-app

# Verify service endpoint
kubectl get svc multicloud-devops-service
```

---

## 9. Jenkins CI/CD Declarative Pipeline

The declarative pipeline is specified in [Jenkinsfile](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/Jenkinsfile):
```groovy
pipeline {
    agent any
    stages {
        stage('1. Source Code Checkout') { ... }
        stage('2. Install Dependencies') { ... }
        stage('3. Run Automated Tests')  { ... }
        stage('4. Build Docker Image')   { ... }
        stage('5. Deploy Application')   { ... }
        stage('6. Verify Application Health') { ... }
    }
}
```

*Note: If Jenkins is not installed on the host machine, the in-app interactive CI/CD Pipeline view simulates live pipeline triggers with complete stage logs and animations!*

---

## 10. Terraform Multi-Cloud Infrastructure

Separate, modular Infrastructure as Code templates are provided in [terraform/](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/terraform):

| Cloud Folder | Resources Provisioned | Region |
| :--- | :--- | :--- |
| [terraform/aws/](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/terraform/aws) | VPC, Public Subnet, Internet Gateway, Security Groups, ECS Cluster | `us-east-1` |
| [terraform/azure/](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/terraform/azure) | Resource Group, Virtual Network (VNet), Subnet, AKS Kubernetes Cluster | `eastus` |
| [terraform/gcp/](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/terraform/gcp) | VPC Network, Subnetwork, Google Kubernetes Engine (GKE) Cluster | `us-central1` |

### To test Terraform plans locally:
```bash
cd terraform/aws
terraform init
terraform plan
```

---

## 11. Prometheus & Grafana Monitoring

1. **Prometheus Configuration:** [monitoring/prometheus.yml](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/monitoring/prometheus.yml) scrapes the `/api/metrics` endpoint every 10 seconds.
2. **Grafana Pre-Provisioned Dashboard:** [monitoring/grafana/dashboards/multicloud-dashboard.json](file:///c:/Users/AKASH%20A%20DUBARI/Desktop/DataFix/monitoring/grafana/dashboards/multicloud-dashboard.json) renders panels for:
   - Total Multi-Cloud Deployments counter
   - Multi-Cloud CPU Utilization (%)
   - Multi-Cloud RAM Usage (%)
   - End-to-End Latency SLA (ms)
   - Real-time HTTP Request Rates

---

## 12. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Returns total clouds, total apps, successful/failed counts, availability SLA |
| `GET` | `/api/clouds` | Returns real-time CPU, RAM, status, and demo tags for AWS, Azure, GCP |
| `GET` | `/api/deployments` | Lists deployment history (supports `?cloud=AWS` filter) |
| `GET` | `/api/deployments/<id>` | Queries live stage progress and duration for a specific deployment |
| `POST` | `/api/deploy` | Initiates 6-stage simulated deployment (`app_name`, `cloud_provider`, `version`) |
| `GET` | `/api/pipeline` | Returns the 7-stage CI/CD pipeline states and execution summaries |
| `GET` | `/api/health` | Healthcheck endpoint reporting uptime, DB connectivity, and cloud health |
| `GET` | `/api/metrics` | Prometheus metrics scrape format (text/plain) or JSON (`?format=json`) |
| `GET` | `/api/logs` | Centralized system logs (supports `?cloud=`, `?level=`, `?search=`) |
| `POST` | `/api/reset-demo` | Resets SQLite database and metrics to clean default demo state |

---

## 13. University Presentation & Faculty Demo

Follow this step-by-step sequence when demonstrating to faculty:
1. **Start the Application:** Run `python app.py` and open `http://localhost:5000`.
2. **Review Central Dashboard:** Point out the 4 summary metric cards, the 3 cloud provider statuses (AWS, Azure, GCP), and the zero-downtime availability metric.
3. **Inspect Cloud Providers View:** Click **Cloud Providers** in the sidebar. Highlight compute and memory utilization across each cloud. Point out the `DEMO DATA` badge demonstrating ethical transparency.
4. **Trigger Live Deployment:**
   - Click the blue **Deploy Application** button in the top right.
   - Select an application (e.g. `e-commerce-api`), target cloud (e.g. `Microsoft Azure`), and version `v2.5.0`.
   - Click **Start Multi-Cloud Deployment**.
   - Watch the animated **6-stage deployment stepper** progress live: Source Code Checkout &rarr; Build &rarr; Testing &rarr; Docker Image Creation &rarr; Deployment &rarr; Verification.
5. **Inspect Updated Deployments:** Notice how the deployment table updates automatically with the new deployment ID and duration.
6. **Walk Through CI/CD Pipeline:** Navigate to **CI/CD Pipeline** to show the visual flow (`GitHub -> Jenkins -> Build -> Test -> Docker -> Kubernetes -> Cloud Deployment`). Click stages to inspect simulated terminal outputs.
7. **Demonstrate Telemetry & Monitoring:** Navigate to **Monitoring** to observe the real-time Chart.js graphs tracking CPU, memory, and latency trends.
8. **Audit System Logs:** Navigate to **System Logs**, type a keyword into the search bar, filter by `SUCCESS` or `Azure`, and demonstrate JSON export.

---

## 14. Advantages, Limitations & Future Scope

### Advantages
- Eliminates vendor lock-in through standardized containerization and multi-cloud IaC.
- Zero cost to run, test, and demonstrate (works 100% offline).
- High availability via 2-replica Kubernetes configuration and rolling zero-downtime updates.
- End-to-end visibility combining CI/CD orchestration with Prometheus/Grafana observability.

### Limitations
- In offline mode, cloud responses are realistic simulations rather than live billed API calls.
- SQLite is ideal for demonstration and single-node orchestration, but enterprise deployments would utilize managed PostgreSQL or CockroachDB.

### Future Scope
- Integration with HashiCorp Vault for dynamic multi-cloud secret management.
- Implementation of cross-cloud service mesh using Istio or Linkerd.
- AI-driven predictive autoscaling and automated failover routing across cloud regions.
