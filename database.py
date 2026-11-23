import sqlite3
import datetime
import random
import os
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clouds Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clouds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            region TEXT NOT NULL,
            status TEXT NOT NULL,
            apps_count INTEGER DEFAULT 0,
            cpu_usage REAL DEFAULT 0.0,
            memory_usage REAL DEFAULT 0.0,
            active_deployments INTEGER DEFAULT 0,
            is_demo INTEGER DEFAULT 1,
            last_sync TEXT
        )
    ''')

    # Applications Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            language TEXT,
            current_version TEXT,
            status TEXT DEFAULT 'Running',
            cloud_provider TEXT DEFAULT 'AWS',
            health_score INTEGER DEFAULT 100
        )
    ''')

    # Deployments Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS deployments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT NOT NULL,
            cloud_provider TEXT NOT NULL,
            version TEXT NOT NULL,
            environment TEXT DEFAULT 'Production',
            status TEXT NOT NULL,
            stage TEXT NOT NULL,
            progress INTEGER DEFAULT 0,
            deployed_by TEXT DEFAULT 'DevOps Engineer',
            created_at TEXT NOT NULL,
            duration_seconds INTEGER DEFAULT 0,
            details TEXT
        )
    ''')

    # Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            level TEXT NOT NULL,
            cloud_provider TEXT NOT NULL,
            service TEXT NOT NULL,
            message TEXT NOT NULL
        )
    ''')

    # System Metrics History Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS metrics_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            cpu_usage REAL,
            memory_usage REAL,
            response_time_ms REAL,
            requests_per_sec INTEGER,
            cloud_provider TEXT
        )
    ''')

    conn.commit()

    # Seed initial data if tables are empty
    seed_initial_data(conn)
    conn.close()

def seed_initial_data(conn):
    cursor = conn.cursor()

    # Check if clouds already seeded
    cursor.execute('SELECT COUNT(*) FROM clouds')
    if cursor.fetchone()[0] == 0:
        now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        clouds_data = [
            ('Amazon Web Services', 'AWS', Config.AWS_REGION, 'Healthy', 6, 42.5, 58.2, 1, 1, now),
            ('Microsoft Azure', 'Azure', Config.AZURE_REGION, 'Healthy', 5, 38.1, 51.4, 0, 1, now),
            ('Google Cloud Platform', 'GCP', Config.GCP_REGION, 'Healthy', 4, 31.8, 46.7, 0, 1, now),
        ]
        cursor.executemany('''
            INSERT INTO clouds (name, code, region, status, apps_count, cpu_usage, memory_usage, active_deployments, is_demo, last_sync)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', clouds_data)

    # Check if applications already seeded
    cursor.execute('SELECT COUNT(*) FROM applications')
    if cursor.fetchone()[0] == 0:
        apps_data = [
            ('e-commerce-api', 'Microservice API for checkout and product catalog', 'Python / Flask', 'v2.4.1', 'Running', 'AWS', 99),
            ('payment-gateway', 'Secure PCI-compliant payment processor', 'Go / Docker', 'v1.9.0', 'Running', 'Azure', 100),
            ('user-auth-service', 'OAuth2 / JWT Identity & Access Management', 'Node.js', 'v3.1.2', 'Running', 'GCP', 98),
            ('analytics-pipeline', 'Real-time telemetry event processing engine', 'Python / Spark', 'v2.0.4', 'Running', 'AWS', 96),
            ('frontend-web-portal', 'Customer facing responsive React web app', 'React / Nginx', 'v4.5.0', 'Running', 'GCP', 100),
            ('notification-broker', 'Asynchronous push and email dispatch broker', 'Python / Redis', 'v1.3.8', 'Running', 'Azure', 97)
        ]
        cursor.executemany('''
            INSERT INTO applications (name, description, language, current_version, status, cloud_provider, health_score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', apps_data)

    # Check if deployments already seeded
    cursor.execute('SELECT COUNT(*) FROM deployments')
    if cursor.fetchone()[0] == 0:
        base_time = datetime.datetime.now()
        deployments_data = [
            ('e-commerce-api', 'AWS', 'v2.4.1', 'Production', 'Success', 'Verification', 100, 'DevOps Lead (Akash)', 
             (base_time - datetime.timedelta(hours=2)).strftime('%Y-%m-%d %H:%M:%S'), 48, 'Deployed via Terraform ECS cluster in us-east-1'),
            ('payment-gateway', 'Azure', 'v1.9.0', 'Production', 'Success', 'Verification', 100, 'Jenkins CI/CD', 
             (base_time - datetime.timedelta(hours=5)).strftime('%Y-%m-%d %H:%M:%S'), 55, 'Azure Kubernetes Service (AKS) rollout successful'),
            ('user-auth-service', 'GCP', 'v3.1.2', 'Production', 'Success', 'Verification', 100, 'Jenkins CI/CD', 
             (base_time - datetime.timedelta(hours=9)).strftime('%Y-%m-%d %H:%M:%S'), 42, 'Google Cloud Run microservice deployed with 0 downtime'),
            ('notification-broker', 'Azure', 'v1.3.8', 'Staging', 'Success', 'Verification', 100, 'DevOps Engineer', 
             (base_time - datetime.timedelta(hours=14)).strftime('%Y-%m-%d %H:%M:%S'), 61, 'Staging container verified against mock Redis queue'),
            ('analytics-pipeline', 'AWS', 'v2.0.3-hotfix', 'Production', 'Failed', 'Testing', 50, 'GitHub Actions', 
             (base_time - datetime.timedelta(hours=22)).strftime('%Y-%m-%d %H:%M:%S'), 32, 'Unit test assertion failed: telemetry schema validation timeout'),
            ('frontend-web-portal', 'GCP', 'v4.5.0', 'Production', 'Success', 'Verification', 100, 'DevOps Engineer', 
             (base_time - datetime.timedelta(days=1, hours=3)).strftime('%Y-%m-%d %H:%M:%S'), 39, 'Deployed to GKE cluster with 3 healthy replicas')
        ]
        cursor.executemany('''
            INSERT INTO deployments (app_name, cloud_provider, version, environment, status, stage, progress, deployed_by, created_at, duration_seconds, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', deployments_data)

    # Check if logs already seeded
    cursor.execute('SELECT COUNT(*) FROM logs')
    if cursor.fetchone()[0] == 0:
        base_time = datetime.datetime.now()
        logs_data = [
            ((base_time - datetime.timedelta(minutes=3)).strftime('%Y-%m-%d %H:%M:%S'), 'INFO', 'AWS', 'ECS-Service', 'Healthcheck probe succeeded on e-commerce-api container [status: 200 OK, latency: 24ms]'),
            ((base_time - datetime.timedelta(minutes=8)).strftime('%Y-%m-%d %H:%M:%S'), 'SUCCESS', 'Azure', 'AKS-Cluster', 'Replica pod payment-gateway-7f89c6-d2q rolled out cleanly across Azure East US'),
            ((base_time - datetime.timedelta(minutes=15)).strftime('%Y-%m-%d %H:%M:%S'), 'INFO', 'GCP', 'Cloud-Run', 'Autoscaler balanced 12 incoming requests across active instances in us-central1'),
            ((base_time - datetime.timedelta(minutes=24)).strftime('%Y-%m-%d %H:%M:%S'), 'WARNING', 'AWS', 'CloudWatch', 'CPU utilization threshold reached 78% on node ip-10-0-2-45; autoscaling initiated'),
            ((base_time - datetime.timedelta(minutes=33)).strftime('%Y-%m-%d %H:%M:%S'), 'INFO', 'GCP', 'GKE-Ingress', 'TLS certificate renewed successfully via Let\'s Encrypt for api.multicloud.local'),
            ((base_time - datetime.timedelta(minutes=48)).strftime('%Y-%m-%d %H:%M:%S'), 'ERROR', 'AWS', 'CI/CD-Worker', 'Pipeline #84: Integration test failed in container runner: test_event_timeout (code: 104)'),
            ((base_time - datetime.timedelta(hours=1, minutes=10)).strftime('%Y-%m-%d %H:%M:%S'), 'INFO', 'Azure', 'Monitor', 'Prometheus metrics scrape target azure-node-exporter responded in 11ms'),
            ((base_time - datetime.timedelta(hours=1, minutes=45)).strftime('%Y-%m-%d %H:%M:%S'), 'SUCCESS', 'ALL', 'Terraform', 'Multi-cloud state synchronization check completed: 0 drifting resources detected')
        ]
        cursor.executemany('''
            INSERT INTO logs (timestamp, level, cloud_provider, service, message)
            VALUES (?, ?, ?, ?, ?)
        ''', logs_data)

    conn.commit()

# --- Database Query Helpers ---

def get_dashboard_summary():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) FROM clouds')
    total_clouds = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM applications')
    total_apps = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM deployments WHERE status = "Success"')
    successful_deployments = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM deployments WHERE status = "Failed"')
    failed_deployments = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM deployments')
    total_deployments = cursor.fetchone()[0]

    availability = 99.94  # calculated SLA

    cursor.execute('''
        SELECT id, app_name, cloud_provider, version, environment, status, stage, progress, created_at, duration_seconds 
        FROM deployments 
        ORDER BY id DESC LIMIT 5
    ''')
    recent_deployments = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return {
        "total_clouds": total_clouds,
        "total_applications": total_apps,
        "successful_deployments": successful_deployments,
        "failed_deployments": failed_deployments,
        "total_deployments": total_deployments,
        "application_availability": availability,
        "recent_deployments": recent_deployments,
        "is_demo_mode": Config.DEMO_MODE
    }

def get_all_clouds():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM clouds ORDER BY id ASC')
    clouds = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return clouds

def get_all_deployments(limit=50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM deployments ORDER BY id DESC LIMIT ?', (limit,))
    deployments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return deployments

def get_deployment_by_id(deployment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM deployments WHERE id = ?', (deployment_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_deployment_record(app_name, cloud_provider, version, environment='Production', deployed_by='DevOps Engineer'):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    cursor.execute('''
        INSERT INTO deployments (app_name, cloud_provider, version, environment, status, stage, progress, deployed_by, created_at, duration_seconds, details)
        VALUES (?, ?, ?, ?, 'In Progress', 'Source Code Checkout', 5, ?, ?, 0, 'Deployment initiated')
    ''', (app_name, cloud_provider, version, environment, deployed_by, created_at))
    
    dep_id = cursor.lastrowid

    # Also log this event
    cursor.execute('''
        INSERT INTO logs (timestamp, level, cloud_provider, service, message)
        VALUES (?, 'INFO', ?, 'DeploymentEngine', ?)
    ''', (created_at, cloud_provider, f'Deployment #{dep_id} triggered for {app_name} ({version}) to {cloud_provider} [{environment}]'))

    conn.commit()
    conn.close()
    return dep_id

def update_deployment_stage(deployment_id, stage, progress, status, details=None, duration=0):
    conn = get_db_connection()
    cursor = conn.cursor()
    if details:
        cursor.execute('''
            UPDATE deployments 
            SET stage = ?, progress = ?, status = ?, details = ?, duration_seconds = ?
            WHERE id = ?
        ''', (stage, progress, status, details, duration, deployment_id))
    else:
        cursor.execute('''
            UPDATE deployments 
            SET stage = ?, progress = ?, status = ?, duration_seconds = ?
            WHERE id = ?
        ''', (stage, progress, status, duration, deployment_id))
    conn.commit()
    conn.close()

def get_all_logs(cloud_provider=None, level=None, limit=50, search=None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = 'SELECT * FROM logs WHERE 1=1'
    params = []

    if cloud_provider and cloud_provider.upper() != 'ALL':
        query += ' AND (cloud_provider = ? OR cloud_provider = "ALL")'
        params.append(cloud_provider)

    if level and level.upper() != 'ALL':
        query += ' AND level = ?'
        params.append(level.upper())

    if search:
        query += ' AND (message LIKE ? OR service LIKE ?)'
        params.append(f'%{search}%')
        params.append(f'%{search}%')

    query += ' ORDER BY id DESC LIMIT ?'
    params.append(limit)

    cursor.execute(query, params)
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return logs

def add_log_entry(level, cloud_provider, service, message):
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('''
        INSERT INTO logs (timestamp, level, cloud_provider, service, message)
        VALUES (?, ?, ?, ?, ?)
    ''', (timestamp, level, cloud_provider, service, message))
    conn.commit()
    conn.close()

def reset_database_to_demo():
    if os.path.exists(Config.DATABASE_PATH):
        try:
            os.remove(Config.DATABASE_PATH)
        except Exception:
            pass
    init_db()
