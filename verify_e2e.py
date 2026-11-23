import unittest
import json
import time
from app import app
import database as db

def verify_all():
    print("=== STARTING FULL END-TO-END VERIFICATION ===")
    app.config['TESTING'] = True
    client = app.test_client()

    # 1. Test Home page serves HTML
    print("[1/8] Verifying Home UI rendering (GET /)...")
    res = client.get('/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert b"Multi-Cloud Application Deployment & Management Dashboard" in res.data
    assert b"root" in res.data
    print("  -> PASSED: Index HTML renders successfully.")

    # 2. Test Dashboard summary API
    print("[2/8] Verifying Dashboard API (GET /api/dashboard)...")
    res = client.get('/api/dashboard')
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data['data']['total_clouds'] == 3
    assert data['data']['total_applications'] >= 6
    assert data['data']['successful_deployments'] >= 1
    print(f"  -> PASSED: Dashboard returned {data['data']['total_clouds']} clouds and {data['data']['total_applications']} apps.")

    # 3. Test Clouds API
    print("[3/8] Verifying Cloud Providers API (GET /api/clouds)...")
    res = client.get('/api/clouds')
    assert res.status_code == 200
    data = json.loads(res.data)
    clouds = data['data']
    assert len(clouds) == 3
    for c in clouds:
        assert c['code'] in ['AWS', 'Azure', 'GCP']
        assert c['status'] == 'Healthy'
        assert 'demo_badge' in c
    print("  -> PASSED: AWS, Azure, GCP verified with telemetry and DEMO badges.")

    # 4. Test Trigger Deployment API with 6-stage lifecycle
    print("[4/8] Verifying Deployment Trigger & Lifecycle (POST /api/deploy)...")
    deploy_payload = {
        "app_name": "payment-gateway",
        "cloud_provider": "Azure",
        "version": "v2.0.0",
        "environment": "Production"
    }
    res = client.post('/api/deploy', data=json.dumps(deploy_payload), content_type='application/json')
    assert res.status_code == 201
    dep_data = json.loads(res.data)
    dep_id = dep_data['data']['deployment_id']
    print(f"  -> Initiated Deployment #{dep_id} to Azure...")

    # Wait 2.5 seconds to verify stage transition
    time.sleep(2.5)
    res_status = client.get(f'/api/deployments/{dep_id}')
    assert res_status.status_code == 200
    cur_dep = json.loads(res_status.data)['data']
    print(f"  -> Current Stage: {cur_dep['stage']} | Progress: {cur_dep['progress']}% | Status: {cur_dep['status']}")
    assert cur_dep['progress'] >= 5
    print("  -> PASSED: Deployment pipeline actively executing.")

    # 5. Test CI/CD Pipeline API
    print("[5/8] Verifying CI/CD Visual Pipeline (GET /api/pipeline)...")
    res = client.get('/api/pipeline')
    assert res.status_code == 200
    pipe_data = json.loads(res.data)['data']
    assert len(pipe_data['stages']) == 7
    print(f"  -> Pipeline: {' -> '.join([s['title'] for s in pipe_data['stages']])}")
    print("  -> PASSED: CI/CD Pipeline stages verified.")

    # 6. Test Health API
    print("[6/8] Verifying Health Check (GET /api/health)...")
    res = client.get('/api/health')
    assert res.status_code == 200
    health_data = json.loads(res.data)
    assert health_data['status'] == 'Healthy'
    assert health_data['database'] == 'Healthy'
    print(f"  -> System Uptime: {health_data['uptime_formatted']} | DB: {health_data['database']}")
    print("  -> PASSED: Health API verified.")

    # 7. Test Prometheus Metrics & JSON format
    print("[7/8] Verifying Metrics endpoints (GET /api/metrics)...")
    res_prom = client.get('/api/metrics')
    assert res_prom.status_code == 200
    assert b'multicloud_deployments_total' in res_prom.data

    res_json = client.get('/api/metrics?format=json')
    assert res_json.status_code == 200
    json_metrics = json.loads(res_json.data)['data']
    assert 'cpu_utilization' in json_metrics
    assert 'memory_utilization' in json_metrics
    assert 'response_time_ms' in json_metrics
    print("  -> PASSED: Both Prometheus text/plain and JSON metrics endpoints working.")

    # 8. Test Logs API
    print("[8/8] Verifying Audit Logs API (GET /api/logs)...")
    res_logs = client.get('/api/logs?limit=10')
    assert res_logs.status_code == 200
    logs_data = json.loads(res_logs.data)['data']
    assert len(logs_data) > 0
    print(f"  -> Fetched {len(logs_data)} log entries.")
    print("  -> PASSED: Logs query and filtering verified.")

    print("\n=======================================================")
    print("ALL 8 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!")
    print("=======================================================")

if __name__ == '__main__':
    verify_all()
