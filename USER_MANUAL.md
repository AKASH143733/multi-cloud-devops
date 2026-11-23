# USER MANUAL: MULTI-CLOUD DEVOPS PLATFORM

**Project:** Multi-Cloud Application Deployment and Management Using DevOps  
**Target Audience:** Students, Instructors, Faculty Examiners, and DevOps Practitioners

---

## 1. Introduction

Welcome to the **Multi-Cloud Application Deployment and Management Platform** user manual. This manual provides an exhaustive operational walkthrough of the web application, detailing user interface components, simulated deployment execution, telemetry interpretation, and presentation guidance for university evaluations.

---

## 2. Navigating the User Interface

The user interface is structured around a persistent **Navigation Sidebar** on the left and a dynamic **Main Content Area** on the right.

### 2.1 The Navigation Sidebar
- **Logo & Brand:** Displays the cloud deployment icon and project title.
- **Navigation Links:**
  - `Dashboard`: High-level executive overview of clusters, workloads, and SLAs.
  - `Cloud Providers`: Detailed view of AWS, Azure, and Google Cloud resource consumption.
  - `Deployment Mgmt`: Central deployment ledger and interactive deployment launcher.
  - `CI/CD Pipeline`: Visual pipeline stages from Git commit to Kubernetes rollout.
  - `Monitoring`: Real-time charts covering CPU, RAM, latency, and request rates.
  - `System Logs`: Terminal-grade audit log viewer with keyword filtering.
- **Cloud Status Indicators:** Shows AWS, Azure, and GCP indicator tags at the bottom.
- **Reset Demo State Button:** Instantly wipes custom test runs and restores clean default data.

---

## 3. Step-by-Step Page Walkthroughs

### 3.1 Dashboard Page (`/`)
When the user accesses the web application, the **Dashboard** is the default landing page.
- **Metric Cards (Top Row):**
  1. `Cloud Providers`: Displays total connected providers (3: AWS, Azure, GCP).
  2. `Total Applications`: Number of microservices registered (6 services).
  3. `Successful Deploys`: Number of successful deployments and calculated success rate percentage.
  4. `App Availability`: Calculated Service Level Agreement percentage (99.94%).
- **Multi-Cloud Infrastructure Status:** Quick-look preview cards for AWS, Microsoft Azure, and GCP showing active status, hosted applications, CPU utilization bar, and RAM usage bar.
- **Recent Deployment Activities:** Tabular view of the latest 5 deployment events with application name, cloud provider tag, version string, environment, status pill, and timestamp.

### 3.2 Cloud Providers Page
Accessible by clicking **Cloud Providers** in the sidebar:
- Features 3 prominent cards:
  - **Amazon Web Services (AWS):** Region: `us-east-1 (N. Virginia)`, Cluster: `aws-k8s-prod-01`.
  - **Microsoft Azure:** Region: `eastus (Virginia)`, Cluster: `azure-k8s-prod-01`.
  - **Google Cloud Platform (GCP):** Region: `us-central1 (Iowa)`, Cluster: `gcp-k8s-prod-01`.
- Each card shows:
  - Status indicator (`Healthy` in emerald green).
  - `DEMO DATA` badge indicating simulated environment transparency.
  - Hosted workloads count.
  - Interactive compute (vCPU) and memory (RAM) progress meters.
  - Direct action button: `Deploy to AWS`, `Deploy to Azure`, or `Deploy to GCP`.

### 3.3 Deployment Management Page
Accessible by clicking **Deployment Mgmt** in the sidebar:
- Displays an overview banner and a prominent **Deploy Application** button.
- **Filter Controls:** Allows filtering the deployment history by All, AWS, Azure, or GCP.
- **Deployments Table:** Columns include:
  - Deployment ID (e.g., `#101`)
  - Application Name (e.g., `e-commerce-api`, `payment-gateway`)
  - Target Cloud Provider with colored tag
  - Version Tag (e.g., `v2.4.1`)
  - Environment (`Production`, `Staging`, `Development`)
  - Status (Success with green dot, In Progress with amber dot, or Failed with red dot)
  - Pipeline Stage
  - Progress bar with percentage
  - Timestamp and Deployed By signature

### 3.4 How to Trigger and Watch a Simulated Deployment
1. Click the **Deploy Application** button in the top navbar or on the Deployment Management page.
2. A deployment configuration modal will appear.
3. Select an **Application Name** from the dropdown (e.g., `payment-gateway`).
4. Select the **Target Cloud Provider** (e.g., `Microsoft Azure`).
5. Enter or modify the **Version Tag** (e.g., `v2.5.0`).
6. Select the **Environment** (`Production`, `Staging`, or `Development`).
7. Click **Start Multi-Cloud Deployment**.
8. **Watch the 6-Stage Deployment Simulator in Real Time:**
   - **Stage 1: Source Code Checkout:** Clones git repository and checks out the release tag.
   - **Stage 2: Build:** Compiles bytecode and packages application artifacts into wheels.
   - **Stage 3: Testing:** Runs automated unit tests and Bandit security linting.
   - **Stage 4: Docker Image Creation:** Builds multi-arch Docker image and generates sha256 checksum.
   - **Stage 5: Deployment:** Applies Kubernetes deployment manifests to target cloud cluster.
   - **Stage 6: Verification:** Executes synthetic HTTP health checks and verifies zero-downtime availability.
9. Notice the **live progress bar** advancing from 0% to 100%, stage icons shifting from pending &rarr; running spinner &rarr; green checkmark, and terminal logs updating in real time.
10. Click **Done & View Deployments** to return to the updated history table.

### 3.5 CI/CD Pipeline Page
Accessible by clicking **CI/CD Pipeline** in the sidebar:
- Renders an interactive visual flowchart:
  `GitHub` &rarr; `Jenkins` &rarr; `Build` &rarr; `Test` &rarr; `Docker` &rarr; `Kubernetes` &rarr; `Cloud Deployment`
- Each stage features an icon, title, tool used, duration badge, and pulsing directional connectors.
- **Stage Inspector:** Click any stage node to inspect its execution status, duration, and output logs.
- Click **Trigger CI/CD Pipeline** to simulate an automated webhook pipeline run.

### 3.6 Monitoring Page
Accessible by clicking **Monitoring** in the sidebar:
- Top availability cards showing Overall Uptime (99.94%), AWS Availability (99.98%), Azure Availability (99.95%), and GCP Availability (99.99%).
- 4 real-time interactive Chart.js graphs:
  1. `CPU Utilization (%)`: Multi-line chart comparing AWS (amber), Azure (blue), and GCP (red).
  2. `Memory Utilization (%)`: Memory allocation comparison across clouds.
  3. `Application Response Time (ms)`: Bar chart measuring microservice latency SLAs.
  4. `Request Traffic (Req/Min)`: Ingress request volume area graph.

### 3.7 System Logs Page
Accessible by clicking **System Logs** in the sidebar:
- Terminal-styled black console displaying timestamped audit logs.
- Features:
  - **Search Input:** Type any microservice name, error code, or keyword to filter logs in real time.
  - **Cloud Filter:** Filter logs by All, AWS, Azure, or GCP.
  - **Level Filter:** Filter logs by All, INFO, SUCCESS, WARNING, or ERROR.
  - **Refresh:** Pulls latest logs from SQLite database.
  - **Export JSON:** Downloads current filtered logs to a local `.json` file.

---

## 4. Resetting Demo State
During faculty evaluation, if multiple test deployments have been run and you wish to return the system to its initial clean state:
1. Click the **Reset Demo State** button at the bottom of the sidebar.
2. Confirm the prompt.
3. The SQLite database is re-initialized with standard default data.

---

## 5. Frequently Asked Questions (Viva / Examination Q&A)

**Q1: Why use a multi-cloud strategy instead of a single cloud provider?**  
*Answer:* Multi-cloud prevents vendor lock-in, eliminates single-point-of-failure risks (if an entire AWS region experiences an outage, Azure and GCP instances maintain business continuity), enables cost optimization across cloud pricing tiers, and complies with regional data sovereignty regulations.

**Q2: How does the application ensure high availability?**  
*Answer:* High availability is achieved at multiple layers:
1. Container level: Docker packages the app with all dependencies.
2. Cluster level: Kubernetes runs a minimum of 2 replicas across nodes with automated rolling updates and restart policies (`restartPolicy: Always`).
3. Infrastructure level: Workloads can be provisioned across AWS, Azure, and GCP using Terraform.

**Q3: How does the monitoring integration work?**  
*Answer:* The Flask backend exposes a standard Prometheus `/api/metrics` endpoint using `prometheus_client`. Prometheus scrapes these metrics periodically, and Grafana visualizes them on dedicated dashboards. In addition, the dashboard renders direct telemetry charts using Chart.js.

**Q4: Is any paid cloud subscription needed to evaluate this project?**  
*Answer:* No. The system has been designed with simulated multi-cloud drivers and realistic data generation, allowing faculty to test every feature offline or locally without spending cloud credits.
