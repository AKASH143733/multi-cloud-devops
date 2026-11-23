# SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATION

**Project:** Multi-Cloud Application Deployment and Management Using DevOps  
**Document:** System Architecture & Design Specification  
**Classification:** Technical Documentation / Academic Presentation

---

## 1. Architectural Blueprint & Philosophy

The architecture of the **Multi-Cloud Application Deployment and Management Platform** is engineered upon three core pillars:
1. **Cloud Neutrality (Vendor Independence):** Decoupling application runtime from proprietary cloud APIs through containerization and standardized declarative manifests.
2. **Centralized Observability:** Unifying telemetry, logs, and deployment states across geographically distributed cloud regions into a single pane of glass.
3. **High Availability & Fault Tolerance:** Multi-replica pod scheduling, automated health probes, and continuous zero-downtime rolling deployment strategies.

```
+───────────────────────────────────────────────────────────────────────────────────+
|                                  CLIENT LAYER                                     |
|    • Desktop & Mobile Responsive Web Browser                                      |
|    • Single Page React 18 Application (`static/js/app.js`)                        |
|    • Chart.js Real-time Telemetry Visualization Engine                            |
+───────────────────────────────────────────────────────────────────────────────────+
                                         │  HTTP / REST (JSON)
                                         ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                            BACKEND CONTROL PLANE LAYER                            |
|    • Python 3.12 Flask Application Server (`app.py`)                              |
|    • Asynchronous Background Deployment Thread Pool                               |
|    • Prometheus Metrics Registry (`/api/metrics`)                                 |
|    • Cross-Origin Resource Sharing (CORS) Protection                              |
+───────────────────────────────────────────────────────────────────────────────────+
                      │                                    │
                      ▼                                    ▼
+───────────────────────────────────+    +──────────────────────────────────────────+
|           DATA LAYER              |    |           MONITORING LAYER               |
|  • SQLite3 Database               |    |  • Prometheus Scraper (Port 9090)        |
|    (`multicloud.db`)              |    |  • Grafana Dashboard (Port 3000)         |
|  • Persistent Deployment History  |    |  • Scraping `/api/metrics` at 10s SLA    |
|  • Microservice Catalog           |    +──────────────────────────────────────────+
|  • Centralized Audit Logs         |
+───────────────────────────────────+
                      │
                      ▼
+───────────────────────────────────────────────────────────────────────────────────+
|                       MULTI-CLOUD INFRASTRUCTURE LAYER                            |
|                                                                                   |
|   ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────┐  |
|   |   Amazon Web Services  |  |    Microsoft Azure     |  |    Google Cloud    |  |
|   |   AWS ECS / EKS        |  |    Azure AKS           |  |    Google GKE      |  |
|   |   Region: us-east-1    |  |    Region: eastus      |  |    Region: us-cen1 |  |
|   |   VPC: 10.0.0.0/16     |  |    VNet: 10.1.0.0/16   |  |    VPC: 10.2.0.0/16|  |
|   └────────────────────────┘  └────────────────────────┘  └────────────────────┘  |
|                                                                                   |
|   Provisioned via Terraform Modules (`terraform/aws`, `azure`, `gcp`)             |
|   Orchestrated via Kubernetes (`k8s/deployment.yaml`, `service.yaml`)             |
+───────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Multi-Cloud Topology & Resource Breakdown

| Cloud Platform | Target Compute Service | Region Identifier | Subnet CIDR | Cluster Identity |
| :--- | :--- | :--- | :--- | :--- |
| **AWS** | Amazon ECS / EKS | `us-east-1` (N. Virginia) | `10.0.1.0/24` | `aws-k8s-prod-01` |
| **Microsoft Azure** | Azure Kubernetes Service (AKS) | `eastus` (Virginia) | `10.1.1.0/24` | `azure-k8s-prod-01` |
| **Google Cloud (GCP)** | Google Kubernetes Engine (GKE) | `us-central1` (Iowa) | `10.2.0.0/16` | `gcp-k8s-prod-01` |

### Multi-Cloud Federation Strategy
Rather than binding microservices to provider-specific services (e.g., AWS DynamoDB, Azure CosmosDB, GCP Cloud Spanner), the platform enforces standardized container interfaces:
- Standard OCI (Open Container Initiative) Docker images.
- Standard Kubernetes Deployment and Service primitives.
- Cloud agnostic metrics exposition formatted for Prometheus scrapers.

---

## 3. CI/CD Delivery Pipeline Lifecycle

The continuous integration and delivery architecture consists of 7 logical stages:

```
[1. GitHub] ──► [2. Jenkins] ──► [3. Build] ──► [4. Test] ──► [5. Docker] ──► [6. K8s] ──► [7. Cloud]
```

1. **Source Control (GitHub):** Developers commit and push code updates to the `main` branch.
2. **Orchestrator Trigger (Jenkins):** GitHub webhooks notify Jenkins, initializing the declarative pipeline execution.
3. **Build & Package:** Dependencies are verified, bytecodes compiled, and wheels bundled.
4. **Automated Testing & Security:** PyTest runs unit & regression suites; Bandit performs static security scanning.
5. **Container Packaging (Docker):** Docker engine builds a multi-architecture container image and labels it with the build ID and SHA-256 digest.
6. **Cluster Rollout (Kubernetes):** `kubectl` applies manifests with zero-downtime rolling updates.
7. **Multi-Cloud Verification:** Synthetic probes test endpoints across AWS, Azure, and GCP clusters, verifying HTTP 200 OK responses.

---

## 4. Database Schema Design (SQLite3)

The persistent database layer is managed through `database.py` utilizing SQLite3 with ACID compliance:

```
+-----------------------------------------------------------------------------------+
| TABLE: clouds                                                                     |
+-----------------------------------------------------------------------------------+
| id                 | INTEGER PRIMARY KEY AUTOINCREMENT                            |
| name               | TEXT NOT NULL ('Amazon Web Services', etc.)                  |
| code               | TEXT NOT NULL UNIQUE ('AWS', 'Azure', 'GCP')                 |
| region             | TEXT NOT NULL                                                |
| status             | TEXT NOT NULL ('Healthy')                                    |
| apps_count         | INTEGER DEFAULT 0                                            |
| cpu_usage          | REAL DEFAULT 0.0                                             |
| memory_usage       | REAL DEFAULT 0.0                                             |
| active_deployments | INTEGER DEFAULT 0                                            |
| is_demo            | INTEGER DEFAULT 1                                            |
| last_sync          | TEXT                                                         |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| TABLE: applications                                                               |
+-----------------------------------------------------------------------------------+
| id                 | INTEGER PRIMARY KEY AUTOINCREMENT                            |
| name               | TEXT NOT NULL UNIQUE                                         |
| description        | TEXT                                                         |
| language           | TEXT ('Python / Flask', 'Node.js', etc.)                     |
| current_version    | TEXT ('v2.4.1')                                              |
| status             | TEXT ('Running')                                             |
| cloud_provider     | TEXT ('AWS', 'Azure', 'GCP')                                 |
| health_score       | INTEGER DEFAULT 100                                          |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| TABLE: deployments                                                                |
+-----------------------------------------------------------------------------------+
| id                 | INTEGER PRIMARY KEY AUTOINCREMENT                            |
| app_name           | TEXT NOT NULL                                                |
| cloud_provider     | TEXT NOT NULL ('AWS', 'Azure', 'GCP')                        |
| version            | TEXT NOT NULL                                                |
| environment        | TEXT ('Production', 'Staging')                               |
| status             | TEXT ('Success', 'Failed', 'In Progress')                    |
| stage              | TEXT ('Verification', 'Build', etc.)                         |
| progress           | INTEGER DEFAULT 0                                            |
| deployed_by        | TEXT                                                         |
| created_at         | TEXT NOT NULL                                                |
| duration_seconds   | INTEGER DEFAULT 0                                            |
| details            | TEXT                                                         |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| TABLE: logs                                                                       |
+-----------------------------------------------------------------------------------+
| id                 | INTEGER PRIMARY KEY AUTOINCREMENT                            |
| timestamp          | TEXT NOT NULL                                                |
| level              | TEXT ('INFO', 'SUCCESS', 'WARNING', 'ERROR')                 |
| cloud_provider     | TEXT ('AWS', 'Azure', 'GCP', 'ALL')                          |
| service            | TEXT ('ECS-Service', 'AKS-Cluster', etc.)                    |
| message            | TEXT NOT NULL                                                |
+-----------------------------------------------------------------------------------+
```

---

## 5. Security & Best Practices

1. **Zero Hardcoded Credentials:** Cloud secrets and API tokens are not stored in source code; environment configuration follows `.env.example`.
2. **Strict Input Sanitization:** All REST endpoints validate incoming JSON data types and sanitize application identifiers.
3. **Prepared SQL Statements:** Parameterized queries (`?`) are utilized across all SQLite operations, preventing SQL injection vulnerabilities.
4. **Network Isolation:** Docker Compose runs services in an isolated bridge network (`devops-network`).
5. **Least Privilege Containerization:** Lightweight Python slim image runs with minimal attack surface.
6. **Demarcation of Demo States:** Transparent badge indicators prevent misrepresentation of simulated cloud infrastructure.

---

## 6. High Availability & Fault Tolerance Design

- **Kubernetes 2-Replica Architecture:** Two identical pod replicas run simultaneously behind the LoadBalancer service. If one replica terminates, Kubernetes restarts it automatically while the second replica answers incoming traffic.
- **Liveness & Readiness Probes:** Container health is actively polled on `/api/health`. Unhealthy pods are automatically removed from routing pools and re-spawned.
- **Rolling Updates (`maxSurge: 1, maxUnavailable: 0`):** New versions are spun up before existing versions are terminated, guaranteeing zero-downtime deployments.
