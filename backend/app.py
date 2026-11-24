import time
import threading
import datetime
import random
import os
from flask import Flask, jsonify, request, send_from_directory, render_template
from flask_cors import CORS
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST

from config import Config
import database as db

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config.from_object(Config)
CORS(app)

# Initialize Database
db.init_db()

# Application start time for uptime tracking
START_TIME = time.time()

# Prometheus Metrics
DEPLOYMENT_COUNTER = Counter(
    'multicloud_deployments_total',
    'Total multi-cloud deployments executed',
    ['cloud_provider', 'status']
)
HTTP_REQUESTS_TOTAL = Counter(
    'multicloud_http_requests_total',
    'Total HTTP requests processed by endpoint',
    ['endpoint', 'method', 'status']
)
CLOUD_CPU_GAUGE = Gauge(
    'multicloud_cloud_cpu_percent',
    'Simulated CPU usage across cloud providers',
    ['cloud_provider']
)
CLOUD_MEMORY_GAUGE = Gauge(
    'multicloud_cloud_memory_percent',
    'Simulated Memory usage across cloud providers',
    ['cloud_provider']
)
APP_RESPONSE_TIME_GAUGE = Gauge(
    'multicloud_app_response_time_ms',
    'Application response latency in milliseconds',
    ['cloud_provider']
)

# Simulated Pipeline Stages
PIPELINE_STAGES = [
    {"id": 1, "name": "Source Code Checkout", "icon": "git-branch", "description": "Cloning repository from GitHub main branch"},
    {"id": 2, "name": "Build", "icon": "package", "description": "Compiling assets and packaging application binaries"},
    {"id": 3, "name": "Testing", "icon": "check-circle", "description": "Running PyTest unit, integration and security lint suites"},
    {"id": 4, "name": "Docker Image Creation", "icon": "box", "description": "Building multi-arch Docker image & tagging sha256"},
    {"id": 5, "name": "Deployment", "icon": "cloud-upload", "description": "Rolling update to target cloud provider infrastructure"},
    {"id": 6, "name": "Verification", "icon": "shield-check", "description": "Synthetic smoke tests and zero-downtime health verification"}
]

@app.before_request
def before_request_hook():
    request._start_time = time.time()

@app.after_request
def after_request_hook(response):
    try:
        endpoint = request.path
        method = request.method
        status = str(response.status_code)
        HTTP_REQUESTS_TOTAL.labels(endpoint=endpoint, method=method, status=status).inc()
    except Exception:
        pass
    return response

# --- Background Simulation Worker for 6 Deployment Stages ---
def run_simulated_deployment(deployment_id, app_name, cloud_provider, version, environment):
    stages = [
        ("Source Code Checkout", 15, "Cloned commit 8f4e21a from github.com/multicloud/repo. Branch: main"),
        ("Build", 35, f"Compiled {app_name} package. Bundled assets & verified dependencies"),
        ("Testing", 55, "PyTest: 48 passed, 0 failed. Bandit security scan passed with 0 vulnerabilities"),
        ("Docker Image Creation", 75, f"Successfully built docker image {app_name}:{version} (size: 142MB)"),
        ("Deployment", 90, f"Applied Kubernetes manifest to {cloud_provider} cluster. Replicas scaled to 2"),
        ("Verification", 100, f"Healthcheck HTTP 200 OK received from {cloud_provider} endpoint. Rollout complete!")
    ]

    total_start = time.time()
    for stage_name, progress, log_msg in stages:
        time.sleep(2.0)  # realistic simulation timing per stage
        duration = int(time.time() - total_start)
        db.update_deployment_stage(deployment_id, stage_name, progress, "In Progress", log_msg, duration)
        db.add_log_entry("INFO", cloud_provider, "DeployWorker", f"Deployment #{deployment_id} [{stage_name}]: {log_msg}")

    final_duration = int(time.time() - total_start)
    db.update_deployment_stage(deployment_id, "Verification", 100, "Success", "Deployment verified successfully with 100% availability.", final_duration)
    db.add_log_entry("SUCCESS", cloud_provider, "DeployWorker", f"Deployment #{deployment_id} for {app_name} ({version}) succeeded in {final_duration}s.")
    DEPLOYMENT_COUNTER.labels(cloud_provider=cloud_provider, status="Success").inc()

# --- Web UI Routes ---

@app.route('/')
def index():
    return render_template('index.html')

# --- API Endpoints ---

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Returns summarized stats for the dashboard home page"""
    try:
        summary = db.get_dashboard_summary()
        return jsonify({
            "status": "success",
            "data": summary
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/clouds', methods=['GET'])
def get_clouds():
    """Returns status and metrics for AWS, Microsoft Azure, and Google Cloud"""
    try:
        clouds = db.get_all_clouds()
        # Add slight dynamic fluctuation to simulate live metrics
        for c in clouds:
            jitter_cpu = round(max(10.0, min(95.0, c['cpu_usage'] + random.uniform(-2.5, 2.5))), 1)
            jitter_mem = round(max(20.0, min(90.0, c['memory_usage'] + random.uniform(-1.5, 1.5))), 1)
            c['cpu_usage'] = jitter_cpu
            c['memory_usage'] = jitter_mem
            c['demo_badge'] = "DEMO DATA" if c['is_demo'] else "LIVE CONNECTED"
            # Update Prometheus gauges
            CLOUD_CPU_GAUGE.labels(cloud_provider=c['code']).set(jitter_cpu)
            CLOUD_MEMORY_GAUGE.labels(cloud_provider=c['code']).set(jitter_mem)

        return jsonify({
            "status": "success",
            "data": clouds
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/deployments', methods=['GET'])
def get_deployments():
    """Returns list of deployments with optional cloud provider filter"""
    try:
        limit = int(request.args.get('limit', 50))
        cloud_filter = request.args.get('cloud')
        all_deployments = db.get_all_deployments(limit=limit)
        
        if cloud_filter and cloud_filter.upper() != 'ALL':
            filtered = [d for d in all_deployments if d['cloud_provider'].upper() == cloud_filter.upper()]
        else:
            filtered = all_deployments

        return jsonify({
            "status": "success",
            "count": len(filtered),
            "data": filtered
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/deployments/<int:dep_id>', methods=['GET'])
def get_single_deployment(dep_id):
    """Returns single deployment status and progress"""
    try:
        dep = db.get_deployment_by_id(dep_id)
        if not dep:
            return jsonify({"status": "error", "message": "Deployment not found"}), 404
        return jsonify({"status": "success", "data": dep}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/deploy', methods=['POST'])
def trigger_deployment():
    """Validates and triggers a deployment with simulated 6-stage lifecycle"""
    try:
        payload = request.get_json(silent=True)
        if not payload:
            return jsonify({"status": "error", "message": "Invalid JSON payload"}), 400

        app_name = payload.get('app_name', '').strip()
        cloud_provider = payload.get('cloud_provider', '').strip()
        version = payload.get('version', '').strip()
        environment = payload.get('environment', 'Production').strip()

        # Validation
        if not app_name:
            return jsonify({"status": "error", "message": "Application name is required"}), 400
        if cloud_provider not in ['AWS', 'Azure', 'GCP']:
            return jsonify({"status": "error", "message": "Invalid cloud provider. Choose AWS, Azure, or GCP"}), 400
        if not version:
            version = f"v{random.randint(1, 3)}.{random.randint(0, 9)}.{random.randint(0, 9)}"

        # Create record in DB
        deployment_id = db.create_deployment_record(
            app_name=app_name,
            cloud_provider=cloud_provider,
            version=version,
            environment=environment,
            deployed_by='DevOps Dashboard User'
        )

        # Launch background simulated worker
        worker = threading.Thread(
            target=run_simulated_deployment,
            args=(deployment_id, app_name, cloud_provider, version, environment),
            daemon=True
        )
        worker.start()

        return jsonify({
            "status": "success",
            "message": f"Deployment #{deployment_id} queued successfully for {cloud_provider}",
            "data": {
                "deployment_id": deployment_id,
                "app_name": app_name,
                "cloud_provider": cloud_provider,
                "version": version,
                "environment": environment,
                "initial_stage": "Source Code Checkout",
                "progress": 5,
                "stages": [s["name"] for s in PIPELINE_STAGES]
            }
        }), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/pipeline', methods=['GET'])
def get_pipeline():
    """Returns the visual CI/CD pipeline definition and execution status"""
    pipeline_data = {
        "pipeline_name": "Multi-Cloud Continuous Delivery Pipeline",
        "repository": "github.com/organization/multi-cloud-devops-platform",
        "branch": "main",
        "last_commit": "8f4e21a (Merge: Optimize Kubernetes ingress routing across AWS, Azure, and GCP)",
        "last_run_time": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "overall_status": "Success",
        "stages": [
            {
                "id": "github",
                "title": "GitHub",
                "tool": "GitHub Enterprise",
                "status": "Success",
                "duration": "4s",
                "output": "Webhook triggered by push to refs/heads/main"
            },
            {
                "id": "jenkins",
                "title": "Jenkins",
                "tool": "Jenkins Orchestrator",
                "status": "Success",
                "duration": "8s",
                "output": "Pipeline job #142 started on agent k8s-node-worker"
            },
            {
                "id": "build",
                "title": "Build",
                "tool": "Python 3.12 / Wheel",
                "status": "Success",
                "duration": "28s",
                "output": "Successfully compiled bytecode and built wheel package"
            },
            {
                "id": "test",
                "title": "Test",
                "tool": "PyTest & Bandit",
                "status": "Success",
                "duration": "19s",
                "output": "Unit tests: 100% passed. 0 security warnings"
            },
            {
                "id": "docker",
                "title": "Docker",
                "tool": "Docker Engine 26.0",
                "status": "Success",
                "duration": "35s",
                "output": "Image built: multicloud-app:latest (digest: sha256:4b912a...)"
            },
            {
                "id": "k8s",
                "title": "Kubernetes",
                "tool": "kubectl / Helm v3",
                "status": "Success",
                "duration": "22s",
                "output": "Applied deployment.yaml (2 replicas), service.yaml exposed"
            },
            {
                "id": "cloud",
                "title": "Cloud Deployment",
                "tool": "Terraform / Multi-Cloud",
                "status": "Success",
                "duration": "40s",
                "output": "Target AWS (ECS/EKS), Azure (AKS), and GCP (GKE) synchronized"
            }
        ]
    }
    return jsonify({"status": "success", "data": pipeline_data}), 200

@app.route('/api/health', methods=['GET'])
def get_health():
    """Returns application health, uptime, and database connectivity"""
    uptime_seconds = int(time.time() - START_TIME)
    
    # Check DB connectivity
    db_status = "Healthy"
    try:
        conn = db.get_db_connection()
        conn.execute("SELECT 1").fetchone()
        conn.close()
    except Exception as e:
        db_status = f"Unhealthy: {str(e)}"

    return jsonify({
        "status": "Healthy",
        "app_name": "Multi-Cloud DevOps Dashboard",
        "version": "1.0.0",
        "environment": "Multi-Cloud Production Simulator",
        "uptime_seconds": uptime_seconds,
        "uptime_formatted": str(datetime.timedelta(seconds=uptime_seconds)),
        "database": db_status,
        "clouds": {
            "aws": "Healthy",
            "azure": "Healthy",
            "gcp": "Healthy"
        },
        "timestamp": datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }), 200

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Prometheus metrics endpoint (text/plain) or JSON for frontend charts"""
    format_type = request.args.get('format', 'prometheus')
    
    if format_type == 'json':
        # Return structured telemetry for frontend charts
        now = datetime.datetime.now()
        time_labels = [(now - datetime.timedelta(minutes=i*5)).strftime('%H:%M') for i in reversed(range(8))]
        
        return jsonify({
            "status": "success",
            "data": {
                "timestamps": time_labels,
                "cpu_utilization": {
                    "aws": [40, 42, 45, 48, 44, 43, 46, 42.5],
                    "azure": [35, 36, 38, 41, 39, 37, 36, 38.1],
                    "gcp": [28, 30, 29, 32, 33, 31, 30, 31.8]
                },
                "memory_utilization": {
                    "aws": [55, 56, 58, 60, 59, 57, 58, 58.2],
                    "azure": [48, 50, 49, 52, 53, 50, 52, 51.4],
                    "gcp": [44, 45, 46, 48, 47, 45, 46, 46.7]
                },
                "response_time_ms": {
                    "aws": [28, 32, 29, 35, 27, 26, 31, 29.4],
                    "azure": [34, 36, 38, 35, 37, 33, 36, 35.2],
                    "gcp": [24, 25, 27, 29, 26, 25, 24, 25.8]
                },
                "uptime_percentage": 99.94,
                "cloud_availability": {
                    "AWS": 99.98,
                    "Azure": 99.95,
                    "GCP": 99.99
                },
                "requests_per_minute": [120, 145, 180, 210, 195, 230, 260, 248]
            }
        }), 200

    # Otherwise return standard Prometheus scrape format
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Returns system and deployment logs with filtering"""
    try:
        cloud = request.args.get('cloud', 'ALL')
        level = request.args.get('level', 'ALL')
        search = request.args.get('search')
        limit = int(request.args.get('limit', 50))

        logs = db.get_all_logs(cloud_provider=cloud, level=level, limit=limit, search=search)
        return jsonify({
            "status": "success",
            "count": len(logs),
            "data": logs
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/reset-demo', methods=['POST'])
def reset_demo():
    """Resets the SQLite database and metrics for clean demo presentation"""
    try:
        db.reset_database_to_demo()
        return jsonify({
            "status": "success",
            "message": "Demo data successfully reset to clean default state"
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print(f"=== Multi-Cloud DevOps Platform starting on http://{Config.HOST}:{Config.PORT} ===")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
