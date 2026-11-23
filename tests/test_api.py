import unittest
import json
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
import database as db

class TestMultiCloudDevOpsAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        cls.client = app.test_client()
        db.init_db()

    def test_01_dashboard_summary(self):
        res = self.client.get('/api/dashboard')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        self.assertIn('total_clouds', data['data'])
        self.assertIn('total_applications', data['data'])
        self.assertIn('successful_deployments', data['data'])
        self.assertIn('application_availability', data['data'])
        self.assertEqual(data['data']['total_clouds'], 3)

    def test_02_clouds_endpoint(self):
        res = self.client.get('/api/clouds')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        clouds = data['data']
        self.assertEqual(len(clouds), 3)
        codes = [c['code'] for c in clouds]
        self.assertIn('AWS', codes)
        self.assertIn('Azure', codes)
        self.assertIn('GCP', codes)
        # Verify DEMO DATA label is present
        for c in clouds:
            self.assertIn('demo_badge', c)

    def test_03_deployments_list(self):
        res = self.client.get('/api/deployments')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        self.assertTrue(len(data['data']) > 0)

    def test_04_trigger_deployment(self):
        payload = {
            "app_name": "payment-service",
            "cloud_provider": "AWS",
            "version": "v1.2.0",
            "environment": "Production"
        }
        res = self.client.post(
            '/api/deploy',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        self.assertIn('deployment_id', data['data'])
        dep_id = data['data']['deployment_id']

        # Verify query single deployment
        res_single = self.client.get(f'/api/deployments/{dep_id}')
        self.assertEqual(res_single.status_code, 200)
        single_data = json.loads(res_single.data)
        self.assertEqual(single_data['data']['app_name'], 'payment-service')

    def test_05_deploy_validation_error(self):
        # Missing app_name
        res = self.client.post(
            '/api/deploy',
            data=json.dumps({"cloud_provider": "AWS"}),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 400)

        # Invalid cloud provider
        res = self.client.post(
            '/api/deploy',
            data=json.dumps({"app_name": "test", "cloud_provider": "InvalidCloud"}),
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 400)

    def test_06_pipeline_endpoint(self):
        res = self.client.get('/api/pipeline')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        stages = data['data']['stages']
        self.assertEqual(len(stages), 7)
        stage_titles = [s['title'] for s in stages]
        self.assertIn('GitHub', stage_titles)
        self.assertIn('Jenkins', stage_titles)
        self.assertIn('Build', stage_titles)
        self.assertIn('Test', stage_titles)
        self.assertIn('Docker', stage_titles)
        self.assertIn('Kubernetes', stage_titles)
        self.assertIn('Cloud Deployment', stage_titles)

    def test_07_health_endpoint(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'Healthy')
        self.assertEqual(data['database'], 'Healthy')
        self.assertIn('uptime_seconds', data)

    def test_08_metrics_prometheus(self):
        res = self.client.get('/api/metrics')
        self.assertEqual(res.status_code, 200)
        self.assertIn(b'multicloud_deployments_total', res.data)

    def test_09_metrics_json_frontend(self):
        res = self.client.get('/api/metrics?format=json')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        self.assertIn('cpu_utilization', data['data'])
        self.assertIn('memory_utilization', data['data'])
        self.assertIn('response_time_ms', data['data'])

    def test_10_logs_endpoint(self):
        res = self.client.get('/api/logs?cloud=AWS')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        self.assertTrue(len(data['data']) > 0)

if __name__ == '__main__':
    unittest.main()
