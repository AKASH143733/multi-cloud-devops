const {
  useState,
  useEffect,
  useRef
} = React;

// Default Seed Data for 100% Permanent Static/GitHub Pages Hosting
const INITIAL_CLOUDS = [{
  id: 1,
  name: "Amazon Web Services",
  code: "AWS",
  region: "us-east-1 (N. Virginia)",
  status: "Healthy",
  apps_count: 6,
  cpu_usage: 42.5,
  memory_usage: 58.2,
  active_deployments: 1,
  is_demo: 1,
  demo_badge: "DEMO DATA"
}, {
  id: 2,
  name: "Microsoft Azure",
  code: "Azure",
  region: "eastus (Virginia)",
  status: "Healthy",
  apps_count: 5,
  cpu_usage: 38.1,
  memory_usage: 51.4,
  active_deployments: 0,
  is_demo: 1,
  demo_badge: "DEMO DATA"
}, {
  id: 3,
  name: "Google Cloud Platform",
  code: "GCP",
  region: "us-central1 (Iowa)",
  status: "Healthy",
  apps_count: 4,
  cpu_usage: 31.8,
  memory_usage: 46.7,
  active_deployments: 0,
  is_demo: 1,
  demo_badge: "DEMO DATA"
}];
const INITIAL_DEPLOYMENTS = [{
  id: 106,
  app_name: "e-commerce-api",
  cloud_provider: "AWS",
  version: "v2.4.1",
  environment: "Production",
  status: "Success",
  stage: "Verification",
  progress: 100,
  deployed_by: "DevOps Lead (Akash)",
  created_at: "2026-11-23 18:30:15",
  duration_seconds: 48
}, {
  id: 105,
  app_name: "payment-gateway",
  cloud_provider: "Azure",
  version: "v1.9.0",
  environment: "Production",
  status: "Success",
  stage: "Verification",
  progress: 100,
  deployed_by: "Jenkins CI/CD",
  created_at: "2026-11-23 16:15:22",
  duration_seconds: 55
}, {
  id: 104,
  app_name: "user-auth-service",
  cloud_provider: "GCP",
  version: "v3.1.2",
  environment: "Production",
  status: "Success",
  stage: "Verification",
  progress: 100,
  deployed_by: "Jenkins CI/CD",
  created_at: "2026-11-23 13:40:08",
  duration_seconds: 42
}, {
  id: 103,
  app_name: "notification-broker",
  cloud_provider: "Azure",
  version: "v1.3.8",
  environment: "Staging",
  status: "Success",
  stage: "Verification",
  progress: 100,
  deployed_by: "DevOps Engineer",
  created_at: "2026-11-23 10:20:44",
  duration_seconds: 61
}, {
  id: 102,
  app_name: "analytics-pipeline",
  cloud_provider: "AWS",
  version: "v2.0.3-hotfix",
  environment: "Production",
  status: "Failed",
  stage: "Testing",
  progress: 50,
  deployed_by: "GitHub Actions",
  created_at: "2026-11-23 08:05:12",
  duration_seconds: 32
}, {
  id: 101,
  app_name: "frontend-web-portal",
  cloud_provider: "GCP",
  version: "v4.5.0",
  environment: "Production",
  status: "Success",
  stage: "Verification",
  progress: 100,
  deployed_by: "DevOps Engineer",
  created_at: "2026-11-22 22:10:00",
  duration_seconds: 39
}];
const INITIAL_LOGS = [{
  id: 1,
  timestamp: "2026-11-23 20:15:30",
  level: "INFO",
  cloud_provider: "AWS",
  service: "ECS-Service",
  message: "Healthcheck probe succeeded on e-commerce-api container [status: 200 OK, latency: 24ms]"
}, {
  id: 2,
  timestamp: "2026-11-23 20:12:10",
  level: "SUCCESS",
  cloud_provider: "Azure",
  service: "AKS-Cluster",
  message: "Replica pod payment-gateway-7f89c6-d2q rolled out cleanly across Azure East US"
}, {
  id: 3,
  timestamp: "2026-11-23 20:05:45",
  level: "INFO",
  cloud_provider: "GCP",
  service: "Cloud-Run",
  message: "Autoscaler balanced 12 incoming requests across active instances in us-central1"
}, {
  id: 4,
  timestamp: "2026-11-23 19:55:20",
  level: "WARNING",
  cloud_provider: "AWS",
  service: "CloudWatch",
  message: "CPU utilization threshold reached 78% on node ip-10-0-2-45; autoscaling initiated"
}, {
  id: 5,
  timestamp: "2026-11-23 19:40:15",
  level: "INFO",
  cloud_provider: "GCP",
  service: "GKE-Ingress",
  message: "TLS certificate renewed successfully via Let's Encrypt for api.multicloud.local"
}, {
  id: 6,
  timestamp: "2026-11-23 19:25:00",
  level: "ERROR",
  cloud_provider: "AWS",
  service: "CI/CD-Worker",
  message: "Pipeline #84: Integration test failed in container runner: test_event_timeout (code: 104)"
}, {
  id: 7,
  timestamp: "2026-11-23 19:10:30",
  level: "SUCCESS",
  cloud_provider: "ALL",
  service: "Terraform",
  message: "Multi-cloud state synchronization check completed: 0 drifting resources detected"
}];

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [clouds, setClouds] = useState(INITIAL_CLOUDS);
  const [deployments, setDeployments] = useState(INITIAL_DEPLOYMENTS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Deployment Modal & Simulation State
  const [appList, setAppList] = useState(['e-commerce-api', 'payment-gateway', 'user-auth-service', 'frontend-web-portal', 'analytics-pipeline', 'notification-broker']);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [selectedCloudForDeploy, setSelectedCloudForDeploy] = useState('AWS');
  const [selectedAppForDeploy, setSelectedAppForDeploy] = useState('e-commerce-api');
  const [isCustomApp, setIsCustomApp] = useState(false);
  const [customAppName, setCustomAppName] = useState('');
  const [customAppTech, setCustomAppTech] = useState('Python / Docker');
  const [deployVersion, setDeployVersion] = useState('v2.5.0');
  const [deployEnvironment, setDeployEnvironment] = useState('Production');
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({
      message,
      type
    });
    setTimeout(() => setToast(null), 4000);
  };

  // Smart Metrics Generator
  const generateMetrics = () => {
    const now = new Date();
    const timestamps = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 60000);
      timestamps.push(d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0'));
    }
    return {
      timestamps,
      cpu_utilization: {
        aws: [40, 42, 45, 48, 44, 43, 46, 42.5],
        azure: [35, 36, 38, 41, 39, 37, 36, 38.1],
        gcp: [28, 30, 29, 32, 33, 31, 30, 31.8]
      },
      memory_utilization: {
        aws: [55, 56, 58, 60, 59, 57, 58, 58.2],
        azure: [48, 50, 49, 52, 53, 50, 52, 51.4],
        gcp: [44, 45, 46, 48, 47, 45, 46, 46.7]
      },
      response_time_ms: {
        aws: [28, 32, 29, 35, 27, 26, 31, 29.4],
        azure: [34, 36, 38, 35, 37, 33, 36, 35.2],
        gcp: [24, 25, 27, 29, 26, 25, 24, 25.8]
      },
      uptime_percentage: 99.94,
      cloud_availability: {
        AWS: 99.98,
        Azure: 99.95,
        GCP: 99.99
      },
      requests_per_minute: [120, 145, 180, 210, 195, 230, 260, 248]
    };
  };

  // Load initial data (Try API, fallback to client state)
  const fetchAllData = async () => {
    try {
      // Attempt backend fetch if on Flask
      const dashRes = await fetch('/api/dashboard').then(r => r.json()).catch(() => null);
      if (dashRes && dashRes.status === 'success') {
        const [cloudsRes, depsRes, logsRes, metricsRes] = await Promise.all([fetch('/api/clouds').then(r => r.json()).catch(() => null), fetch('/api/deployments').then(r => r.json()).catch(() => null), fetch('/api/logs?limit=40').then(r => r.json()).catch(() => null), fetch('/api/metrics?format=json').then(r => r.json()).catch(() => null)]);
        if (cloudsRes && cloudsRes.status === 'success') setClouds(cloudsRes.data);
        if (depsRes && depsRes.status === 'success') setDeployments(depsRes.data);
        if (logsRes && logsRes.status === 'success') setLogs(logsRes.data);
        if (metricsRes && metricsRes.status === 'success') setMetrics(metricsRes.data);
        return;
      }
    } catch (e) {
      // Fallback to static mode seamlessly
    }

    // Static mode default
    setMetrics(generateMetrics());
  };
  useEffect(() => {
    // Load saved deployments from localStorage if any
    try {
      const savedDeps = localStorage.getItem('multicloud_deployments');
      if (savedDeps) setDeployments(JSON.parse(savedDeps));
    } catch (e) {}
    fetchAllData();
    setMetrics(generateMetrics());
  }, []);

  // 6-Stage Simulated Deployment Trigger
  const handleStartDeployment = () => {
    const finalAppName = isCustomApp && customAppName.trim() ? customAppName.trim() : selectedAppForDeploy;
    if (!finalAppName) {
      showToast('Please enter an application name', 'error');
      return;
    }

    // Add custom app to catalog if not present
    if (!appList.includes(finalAppName)) {
      setAppList(prev => {
        const updated = [...prev, finalAppName];
        try {
          localStorage.setItem('multicloud_app_list', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
    setIsDeploying(true);
    const newId = (deployments[0]?.id || 100) + 1;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const stages = [{
      name: "Source Code Checkout",
      progress: 15,
      log: `Cloned commit 8f4e21a from github.com/AKASH143733/multi-cloud-devops. Branch: main`
    }, {
      name: "Build",
      progress: 35,
      log: `Compiled ${finalAppName} package. Bundled assets & verified dependencies`
    }, {
      name: "Testing",
      progress: 55,
      log: `PyTest: 48 passed, 0 failed. Bandit security scan passed with 0 vulnerabilities`
    }, {
      name: "Docker Image Creation",
      progress: 75,
      log: `Successfully built docker image ${finalAppName}:${deployVersion} (size: 142MB)`
    }, {
      name: "Deployment",
      progress: 90,
      log: `Applied Kubernetes manifest to ${selectedCloudForDeploy} cluster. Replicas scaled to 2`
    }, {
      name: "Verification",
      progress: 100,
      log: `Healthcheck HTTP 200 OK received from ${selectedCloudForDeploy} endpoint. Rollout complete!`
    }];
    setActiveSimulation({
      id: newId,
      app_name: finalAppName,
      cloud_provider: selectedCloudForDeploy,
      version: deployVersion,
      environment: deployEnvironment,
      stage: stages[0].name,
      progress: stages[0].progress,
      status: 'In Progress',
      log: stages[0].log
    });
    showToast(`Deployment #${newId} queued for ${selectedCloudForDeploy}`, 'info');
    let currentStageIdx = 0;
    const timer = setInterval(() => {
      currentStageIdx++;
      if (currentStageIdx < stages.length) {
        const s = stages[currentStageIdx];
        setActiveSimulation(prev => ({
          ...prev,
          stage: s.name,
          progress: s.progress,
          status: currentStageIdx === stages.length - 1 ? 'Success' : 'In Progress',
          log: s.log
        }));
      } else {
        clearInterval(timer);
        setIsDeploying(false);

        // Add to deployments list
        const newRecord = {
          id: newId,
          app_name: finalAppName,
          cloud_provider: selectedCloudForDeploy,
          version: deployVersion,
          environment: deployEnvironment,
          status: "Success",
          stage: "Verification",
          progress: 100,
          deployed_by: "DevOps Engineer (Online)",
          created_at: nowStr,
          duration_seconds: 12
        };
        setDeployments(prev => {
          const updated = [newRecord, ...prev];
          try {
            localStorage.setItem('multicloud_deployments', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        // Add log entry
        setLogs(prev => [{
          id: Date.now(),
          timestamp: nowStr,
          level: "SUCCESS",
          cloud_provider: selectedCloudForDeploy,
          service: "DeployWorker",
          message: `Deployment #${newId} for ${finalAppName} (${deployVersion}) verified with 100% availability.`
        }, ...prev]);
        showToast(`Deployment #${newId} completed successfully!`, 'success');
      }
    }, 1800);
  };
  const handleResetDemo = () => {
    if (!confirm('Reset all demo data and restore initial clean state?')) return;
    localStorage.removeItem('multicloud_deployments');
    setDeployments(INITIAL_DEPLOYMENTS);
    setClouds(INITIAL_CLOUDS);
    setLogs(INITIAL_LOGS);
    showToast('Demo data reset to clean default state', 'success');
  };

  // Calculate Summary Counts
  const successfulCount = deployments.filter(d => d.status === 'Success').length;
  const failedCount = deployments.filter(d => d.status === 'Failed').length;
  const totalCount = deployments.length;
  const summaryData = {
    total_clouds: clouds.length,
    total_applications: appList.length,
    successful_deployments: successfulCount,
    failed_deployments: failedCount,
    total_deployments: totalCount,
    application_availability: 99.94,
    recent_deployments: deployments.slice(0, 5)
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "app-container"
  }, /*#__PURE__*/React.createElement("aside", {
    className: `sidebar ${mobileMenuOpen ? 'open' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sidebar-logo-icon"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-cloud-arrow-up"
  })), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-brand"
  }, /*#__PURE__*/React.createElement("h1", null, "Multi-Cloud DevOps"), /*#__PURE__*/React.createElement("span", null, "Deployment & Mgmt"))), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav-section-label"
  }, "Main Navigation"), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'dashboard' ? 'active' : ''}`,
    onClick: () => {
      setCurrentView('dashboard');
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-chart-pie"
  }), /*#__PURE__*/React.createElement("span", null, "Dashboard")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'clouds' ? 'active' : ''}`,
    onClick: () => {
      setCurrentView('clouds');
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-server"
  }), /*#__PURE__*/React.createElement("span", null, "Cloud Providers"), /*#__PURE__*/React.createElement("span", {
    className: "badge-count"
  }, "3")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'deployments' ? 'active' : ''}`,
    onClick: () => {
      setCurrentView('deployments');
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rocket"
  }), /*#__PURE__*/React.createElement("span", null, "Deployment Mgmt")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'pipeline' ? 'active' : ''}`,
    onClick: () => {
      setCurrentView('pipeline');
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-diagram-project"
  }), /*#__PURE__*/React.createElement("span", null, "CI/CD Pipeline")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'monitoring' ? 'active' : ''}`,
    onClick: () => {
      setCurrentView('monitoring');
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-chart-line"
  }), /*#__PURE__*/React.createElement("span", null, "Monitoring")), /*#__PURE__*/React.createElement("div", {
    className: `nav-item ${currentView === 'logs' ? 'active' : ''}`,
    onClick: () => {
      setCurrentView('logs');
      setMobileMenuOpen(false);
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-terminal"
  }), /*#__PURE__*/React.createElement("span", null, "System Logs")), /*#__PURE__*/React.createElement("div", {
    className: "nav-section-label",
    style: {
      marginTop: '20px'
    }
  }, "Multi-Cloud Fleet"), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-cloud-pills"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cloud-pill aws"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-aws"
  }), "AWS"), /*#__PURE__*/React.createElement("div", {
    className: "cloud-pill azure"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-microsoft"
  }), "Azure"), /*#__PURE__*/React.createElement("div", {
    className: "cloud-pill gcp"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-google"
  }), "GCP"))), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    style: {
      width: '100%',
      justifyContent: 'center'
    },
    onClick: handleResetDemo
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rotate-left"
  }), " Reset Demo State"))), /*#__PURE__*/React.createElement("div", {
    className: "main-wrapper"
  }, /*#__PURE__*/React.createElement("header", {
    className: "top-navbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "top-navbar-left"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    style: {
      display: 'none'
    },
    onClick: () => setMobileMenuOpen(!mobileMenuOpen)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-bars"
  })), /*#__PURE__*/React.createElement("div", {
    className: "page-title-group"
  }, /*#__PURE__*/React.createElement("h2", null, currentView === 'dashboard' && 'Central DevOps Overview', currentView === 'clouds' && 'Multi-Cloud Infrastructure', currentView === 'deployments' && 'Deployment Lifecycle Management', currentView === 'pipeline' && 'Continuous Delivery Pipeline', currentView === 'monitoring' && 'Telemetry & Resource Monitoring', currentView === 'logs' && 'Centralized Audit & Application Logs'), /*#__PURE__*/React.createElement("p", null, "AWS \xB7 Microsoft Azure \xB7 Google Cloud Platform"))), /*#__PURE__*/React.createElement("div", {
    className: "top-navbar-right"
  }, /*#__PURE__*/React.createElement("div", {
    className: "demo-mode-badge"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pulse-dot"
  }), "PERMANENT CLOUD DEMO"), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => setIsDeployModalOpen(true)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-paper-plane"
  }), " Deploy Application"))), /*#__PURE__*/React.createElement("main", {
    className: "content-body"
  }, currentView === 'dashboard' && /*#__PURE__*/React.createElement(DashboardView, {
    data: summaryData,
    clouds: clouds,
    onNavigate: setCurrentView,
    onOpenDeploy: cloud => {
      if (cloud) setSelectedCloudForDeploy(cloud);
      setIsDeployModalOpen(true);
    }
  }), currentView === 'clouds' && /*#__PURE__*/React.createElement(CloudProvidersView, {
    clouds: clouds,
    onDeployToCloud: cloud => {
      setSelectedCloudForDeploy(cloud);
      setIsDeployModalOpen(true);
    }
  }), currentView === 'deployments' && /*#__PURE__*/React.createElement(DeploymentsView, {
    deployments: deployments,
    onOpenDeploy: () => setIsDeployModalOpen(true)
  }), currentView === 'pipeline' && /*#__PURE__*/React.createElement(PipelineView, {
    onTriggerPipeline: () => {
      showToast('Continuous Delivery Pipeline triggered across all clouds', 'success');
    }
  }), currentView === 'monitoring' && /*#__PURE__*/React.createElement(MonitoringView, {
    metrics: metrics || generateMetrics()
  }), currentView === 'logs' && /*#__PURE__*/React.createElement(LogsView, {
    logs: logs,
    onRefresh: fetchAllData
  }))), isDeployModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal-header"
  }, /*#__PURE__*/React.createElement("h3", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-cloud-arrow-up",
    style: {
      color: 'var(--cloud-blue)',
      marginRight: '8px'
    }
  }), " Deploy Application to Cloud"), /*#__PURE__*/React.createElement("button", {
    className: "modal-close-btn",
    onClick: () => !isDeploying && setIsDeployModalOpen(false)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-xmark"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "modal-body"
  }, !isDeploying && !activeSimulation ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Application Name"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: isCustomApp ? '__custom__' : selectedAppForDeploy,
    onChange: e => {
      if (e.target.value === '__custom__') {
        setIsCustomApp(true);
      } else {
        setIsCustomApp(false);
        setSelectedAppForDeploy(e.target.value);
      }
    }
  }, appList.map(app => /*#__PURE__*/React.createElement("option", {
    key: app,
    value: app
  }, app)), /*#__PURE__*/React.createElement("option", {
    value: "__custom__"
  }, "\u2795 + Register New Custom Application..."))), isCustomApp && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      padding: '14px',
      borderRadius: '8px',
      border: '1px solid #bae6fd',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: '10px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      color: 'var(--cloud-blue)'
    }
  }, "Enter Custom Application Name"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    placeholder: "e.g. ai-chatbot-service, order-processor",
    value: customAppName,
    onChange: e => setCustomAppName(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: '12px',
      color: 'var(--cloud-blue)'
    }
  }, "Technology / Framework"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    placeholder: "e.g. FastAPI / Docker, Node.js, Go",
    value: customAppTech,
    onChange: e => setCustomAppTech(e.target.value)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-group"
  }, /*#__PURE__*/React.createElement("label", null, "Target Cloud Provider"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: selectedCloudForDeploy,
    onChange: e => setSelectedCloudForDeploy(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "AWS"
  }, "Amazon Web Services (AWS us-east-1)"), /*#__PURE__*/React.createElement("option", {
    value: "Azure"
  }, "Microsoft Azure (Azure eastus)"), /*#__PURE__*/React.createElement("option", {
    value: "GCP"
  }, "Google Cloud Platform (GCP us-central1)"))), /*#__PURE__*/React.createElement("div", {
    className: "form-group",
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Version Tag"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "form-input",
    value: deployVersion,
    onChange: e => setDeployVersion(e.target.value),
    placeholder: "e.g. v2.5.0"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Environment"), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    value: deployEnvironment,
    onChange: e => setDeployEnvironment(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "Production"
  }, "Production"), /*#__PURE__*/React.createElement("option", {
    value: "Staging"
  }, "Staging"), /*#__PURE__*/React.createElement("option", {
    value: "Development"
  }, "Development")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '12px',
      color: '#0369a1',
      margin: '16px 0'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-circle-info",
    style: {
      marginRight: '6px'
    }
  }), "Clicking ", /*#__PURE__*/React.createElement("strong", null, "Start Multi-Cloud Deployment"), " executes the 6-stage simulated pipeline: Checkout \u2192 Build \u2192 Testing \u2192 Docker \u2192 Deployment \u2192 Verification."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: () => setIsDeployModalOpen(false)
  }, "Cancel"), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: handleStartDeployment
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-play"
  }), " Start Multi-Cloud Deployment"))) : /*#__PURE__*/React.createElement(DeploymentStepper, {
    simulation: activeSimulation,
    onClose: () => {
      setIsDeployModalOpen(false);
      setActiveSimulation(null);
      setIsDeploying(false);
    }
  })))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#0284c7',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
      fontWeight: 600,
      fontSize: '13px',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: toast.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-bell'
  }), toast.message));
}

// -------------------------------------------------------------
// Component: Deployment Stepper (Simulated 6 Stages)
// -------------------------------------------------------------
function DeploymentStepper({
  simulation,
  onClose
}) {
  const stages = [{
    id: 1,
    name: "Source Code Checkout",
    detail: "Cloning GitHub repo & checking out release tag"
  }, {
    id: 2,
    name: "Build",
    detail: "Compiling bytecode & packaging application artifacts"
  }, {
    id: 3,
    name: "Testing",
    detail: "PyTest unit tests & Bandit security vulnerability scans"
  }, {
    id: 4,
    name: "Docker Image Creation",
    detail: "Building Docker container image & tagging sha256"
  }, {
    id: 5,
    name: "Deployment",
    detail: `Applying Kubernetes manifest to ${simulation?.cloud_provider || 'Cloud'}`
  }, {
    id: 6,
    name: "Verification",
    detail: "Synthetic health probes & response verification"
  }];
  const currentStageName = simulation?.stage || 'Source Code Checkout';
  const currentProgress = simulation?.progress || 10;
  const isFinished = simulation?.status === 'Success';
  const getStageIndex = name => {
    const idx = stages.findIndex(s => s.name.toLowerCase() === (name || '').toLowerCase());
    return idx !== -1 ? idx : 0;
  };
  const activeIdx = getStageIndex(currentStageName);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      color: 'var(--primary-dark-blue)'
    }
  }, "Deploying: ", /*#__PURE__*/React.createElement("strong", null, simulation?.app_name), " (", simulation?.version, ")"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Target: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--cloud-blue)',
      fontWeight: 600
    }
  }, simulation?.cloud_provider), " (", simulation?.environment || 'Production', ")")), /*#__PURE__*/React.createElement("div", {
    className: `status-pill ${isFinished ? 'success' : 'in_progress'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: `status-indicator-dot ${isFinished ? 'green' : 'amber'}`
  }), simulation?.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      fontWeight: 600,
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Pipeline Progress"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--cloud-blue)'
    }
  }, currentProgress, "%")), /*#__PURE__*/React.createElement("div", {
    className: "progress-track",
    style: {
      height: '10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `progress-fill ${isFinished ? 'green' : 'blue'}`,
    style: {
      width: `${currentProgress}%`
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "deployment-stepper"
  }, stages.map((st, idx) => {
    let statusClass = '';
    let icon = idx + 1;
    let tagText = 'Pending';
    if (idx < activeIdx || isFinished) {
      statusClass = 'completed';
      icon = /*#__PURE__*/React.createElement("i", {
        className: "fa-solid fa-check"
      });
      tagText = 'Completed';
    } else if (idx === activeIdx && !isFinished) {
      statusClass = 'active';
      icon = /*#__PURE__*/React.createElement("i", {
        className: "fa-solid fa-spinner fa-spin"
      });
      tagText = 'Running';
    }
    return /*#__PURE__*/React.createElement("div", {
      key: st.id,
      className: `step-row ${statusClass}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "step-icon-badge"
    }, icon), /*#__PURE__*/React.createElement("div", {
      className: "step-info"
    }, /*#__PURE__*/React.createElement("h4", null, st.name), /*#__PURE__*/React.createElement("p", null, st.detail)), /*#__PURE__*/React.createElement("span", {
      className: "step-status-tag",
      style: {
        backgroundColor: statusClass === 'completed' ? '#ecfdf5' : statusClass === 'active' ? '#e0f2fe' : '#f1f5f9',
        color: statusClass === 'completed' ? '#059669' : statusClass === 'active' ? '#0284c7' : '#64748b'
      }
    }, tagText));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#0f172a',
      padding: '12px 16px',
      borderRadius: '8px',
      color: '#38bdf8',
      fontFamily: 'monospace',
      fontSize: '12px',
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-terminal",
    style: {
      marginRight: '6px'
    }
  }), simulation?.log || 'Executing stage commands...'), isFinished && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '20px',
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check"
  }), " Done & View Deployments")));
}

// -------------------------------------------------------------
// View 1: Central Dashboard
// -------------------------------------------------------------
function DashboardView({
  data,
  clouds,
  onNavigate,
  onOpenDeploy
}) {
  if (!data) return null;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric-card-title"
  }, "Cloud Providers"), /*#__PURE__*/React.createElement("div", {
    className: "metric-icon-bubble blue"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-cloud"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-value"
  }, data.total_clouds), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-subtext"
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-pill success",
    style: {
      padding: '2px 6px',
      fontSize: '10px'
    }
  }, "Active"), "AWS \xB7 Azure \xB7 GCP")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric-card-title"
  }, "Total Applications"), /*#__PURE__*/React.createElement("div", {
    className: "metric-icon-bubble purple"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-layer-group"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-value"
  }, data.total_applications), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-subtext"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-microchip",
    style: {
      color: 'var(--cloud-blue)'
    }
  }), " Microservices containerized")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric-card-title"
  }, "Successful Deploys"), /*#__PURE__*/React.createElement("div", {
    className: "metric-icon-bubble green"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-circle-check"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-value"
  }, data.successful_deployments), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-subtext"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-arrow-trend-up",
    style: {
      color: 'var(--success-green)'
    }
  }), data.total_deployments > 0 ? Math.round(data.successful_deployments / data.total_deployments * 100) : 100, "% Success rate")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card-header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric-card-title"
  }, "App Availability"), /*#__PURE__*/React.createElement("div", {
    className: "metric-icon-bubble blue"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-shield-heart"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-value"
  }, data.application_availability, "%"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-subtext"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-circle-dot",
    style: {
      color: 'var(--success-green)'
    }
  }), " Zero downtime SLA"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-title",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-cubes"
  }), " Multi-Cloud Infrastructure Status"), /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: () => onNavigate('clouds')
  }, "View Detailed Providers \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "cloud-cards-grid"
  }, clouds.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "cloud-provider-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cloud-card-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cloud-identity"
  }, /*#__PURE__*/React.createElement("div", {
    className: `cloud-logo-box ${c.code.toLowerCase()}`
  }, c.code === 'AWS' && /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-aws"
  }), c.code === 'Azure' && /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-microsoft"
  }), c.code === 'GCP' && /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-google"
  })), /*#__PURE__*/React.createElement("div", {
    className: "cloud-title-box"
  }, /*#__PURE__*/React.createElement("h3", null, c.name), /*#__PURE__*/React.createElement("p", null, c.region))), /*#__PURE__*/React.createElement("span", {
    className: "badge-demo"
  }, "DEMO DATA")), /*#__PURE__*/React.createElement("div", {
    className: "cloud-stats-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cloud-stat-item"
  }, /*#__PURE__*/React.createElement("span", null, "Cloud Status"), /*#__PURE__*/React.createElement("div", {
    className: "status-pill success",
    style: {
      marginTop: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-indicator-dot green"
  }), c.status)), /*#__PURE__*/React.createElement("div", {
    className: "cloud-stat-item"
  }, /*#__PURE__*/React.createElement("span", null, "Applications"), /*#__PURE__*/React.createElement("strong", null, c.apps_count, " Services"))), /*#__PURE__*/React.createElement("div", {
    className: "resource-bar-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "resource-bar-label"
  }, /*#__PURE__*/React.createElement("span", null, "CPU Utilization"), /*#__PURE__*/React.createElement("span", null, c.cpu_usage, "%")), /*#__PURE__*/React.createElement("div", {
    className: "progress-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill blue",
    style: {
      width: `${c.cpu_usage}%`
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "resource-bar-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "resource-bar-label"
  }, /*#__PURE__*/React.createElement("span", null, "Memory Usage"), /*#__PURE__*/React.createElement("span", null, c.memory_usage, "%")), /*#__PURE__*/React.createElement("div", {
    className: "progress-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill purple",
    style: {
      width: `${c.memory_usage}%`
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "cloud-card-footer"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-clock-rotate-left"
  }), " Synced: Live"), /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    style: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    onClick: () => onOpenDeploy(c.code)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rocket"
  }), " Deploy to ", c.code)))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "section-title",
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-clock-rotate-left"
  }), " Recent Deployment Activities"), /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: () => onNavigate('deployments')
  }, "View Full History \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", {
    className: "data-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Deployment ID"), /*#__PURE__*/React.createElement("th", null, "Application"), /*#__PURE__*/React.createElement("th", null, "Cloud Provider"), /*#__PURE__*/React.createElement("th", null, "Version"), /*#__PURE__*/React.createElement("th", null, "Environment"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Stage"), /*#__PURE__*/React.createElement("th", null, "Deployed At"))), /*#__PURE__*/React.createElement("tbody", null, (data.recent_deployments || []).map(dep => /*#__PURE__*/React.createElement("tr", {
    key: dep.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "#", dep.id)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-box",
    style: {
      color: 'var(--cloud-blue)',
      marginRight: '6px'
    }
  }), dep.app_name), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "status-pill",
    style: {
      background: '#f0f9ff',
      color: 'var(--secondary-dark-blue)'
    }
  }, dep.cloud_provider)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, dep.version)), /*#__PURE__*/React.createElement("td", null, dep.environment), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `status-pill ${dep.status === 'Success' ? 'success' : dep.status === 'Failed' ? 'failed' : 'in_progress'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: `status-indicator-dot ${dep.status === 'Success' ? 'green' : dep.status === 'Failed' ? 'red' : 'amber'}`
  }), dep.status)), /*#__PURE__*/React.createElement("td", null, dep.stage), /*#__PURE__*/React.createElement("td", null, dep.created_at))))))));
}

// -------------------------------------------------------------
// View 2: Cloud Providers
// -------------------------------------------------------------
function CloudProvidersView({
  clouds,
  onDeployToCloud
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "deploy-action-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "deploy-action-header-text"
  }, /*#__PURE__*/React.createElement("h3", null, "Multi-Cloud Provider Fleet"), /*#__PURE__*/React.createElement("p", null, "Independent infrastructure management across AWS, Azure, and Google Cloud with Terraform & Kubernetes orchestration.")), /*#__PURE__*/React.createElement("span", {
    className: "badge-demo",
    style: {
      fontSize: '12px',
      padding: '6px 12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-shield"
  }), " MULTI-CLOUD CONNECTED")), /*#__PURE__*/React.createElement("div", {
    className: "cloud-cards-grid"
  }, clouds.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "cloud-provider-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cloud-card-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cloud-identity"
  }, /*#__PURE__*/React.createElement("div", {
    className: `cloud-logo-box ${c.code.toLowerCase()}`
  }, c.code === 'AWS' && /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-aws"
  }), c.code === 'Azure' && /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-microsoft"
  }), c.code === 'GCP' && /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-google"
  })), /*#__PURE__*/React.createElement("div", {
    className: "cloud-title-box"
  }, /*#__PURE__*/React.createElement("h3", null, c.name), /*#__PURE__*/React.createElement("p", null, c.region))), /*#__PURE__*/React.createElement("span", {
    className: "badge-demo"
  }, "DEMO DATA")), /*#__PURE__*/React.createElement("div", {
    className: "cloud-stats-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cloud-stat-item"
  }, /*#__PURE__*/React.createElement("span", null, "Cloud Status"), /*#__PURE__*/React.createElement("div", {
    className: "status-pill success",
    style: {
      marginTop: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "status-indicator-dot green"
  }), c.status)), /*#__PURE__*/React.createElement("div", {
    className: "cloud-stat-item"
  }, /*#__PURE__*/React.createElement("span", null, "Hosted Apps"), /*#__PURE__*/React.createElement("strong", null, c.apps_count, " Workloads"))), /*#__PURE__*/React.createElement("div", {
    className: "resource-bar-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "resource-bar-label"
  }, /*#__PURE__*/React.createElement("span", null, "Compute (vCPU Allocation)"), /*#__PURE__*/React.createElement("span", null, c.cpu_usage, "%")), /*#__PURE__*/React.createElement("div", {
    className: "progress-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill blue",
    style: {
      width: `${c.cpu_usage}%`
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "resource-bar-group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "resource-bar-label"
  }, /*#__PURE__*/React.createElement("span", null, "RAM (Cluster Memory)"), /*#__PURE__*/React.createElement("span", null, c.memory_usage, "%")), /*#__PURE__*/React.createElement("div", {
    className: "progress-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill purple",
    style: {
      width: `${c.memory_usage}%`
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#ffffff',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid var(--card-border-subtle)',
      margin: '14px 0',
      fontSize: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Kubernetes Cluster:"), /*#__PURE__*/React.createElement("strong", null, c.code.toLowerCase(), "-k8s-prod-01")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "Provisioning Engine:"), /*#__PURE__*/React.createElement("strong", null, "Terraform v1.7.0"))), /*#__PURE__*/React.createElement("div", {
    className: "cloud-card-footer"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      color: 'var(--text-muted)'
    }
  }, "Provider: ", c.code), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    style: {
      padding: '8px 14px',
      fontSize: '12px'
    },
    onClick: () => onDeployToCloud(c.code)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-play"
  }), " Deploy to ", c.code))))));
}

// -------------------------------------------------------------
// View 3: Deployment Management
// -------------------------------------------------------------
function DeploymentsView({
  deployments,
  onOpenDeploy
}) {
  const [filterCloud, setFilterCloud] = useState('ALL');
  const filtered = filterCloud === 'ALL' ? deployments : deployments.filter(d => d.cloud_provider.toUpperCase() === filterCloud.toUpperCase());
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "deploy-action-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "deploy-action-header-text"
  }, /*#__PURE__*/React.createElement("h3", null, "Continuous Deployment Management"), /*#__PURE__*/React.createElement("p", null, "Deploy application container workloads with zero downtime across AWS, Azure, and Google Cloud.")), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: onOpenDeploy
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rocket"
  }), " Deploy Application")), /*#__PURE__*/React.createElement("div", {
    className: "filter-bar"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--primary-dark-blue)'
    }
  }, "Filter by Cloud:"), ['ALL', 'AWS', 'Azure', 'GCP'].map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    className: `btn-secondary ${filterCloud === c ? 'active' : ''}`,
    style: {
      padding: '6px 14px',
      background: filterCloud === c ? '#e0f2fe' : '#ffffff',
      borderColor: filterCloud === c ? 'var(--cloud-blue)' : '#cbd5e1'
    },
    onClick: () => setFilterCloud(c)
  }, c)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, "Total: ", filtered.length, " deployments")), /*#__PURE__*/React.createElement("div", {
    className: "table-container"
  }, /*#__PURE__*/React.createElement("table", {
    className: "data-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "ID"), /*#__PURE__*/React.createElement("th", null, "Application"), /*#__PURE__*/React.createElement("th", null, "Cloud Provider"), /*#__PURE__*/React.createElement("th", null, "Version"), /*#__PURE__*/React.createElement("th", null, "Environment"), /*#__PURE__*/React.createElement("th", null, "Status"), /*#__PURE__*/React.createElement("th", null, "Pipeline Stage"), /*#__PURE__*/React.createElement("th", null, "Progress"), /*#__PURE__*/React.createElement("th", null, "Deployment Date"), /*#__PURE__*/React.createElement("th", null, "Deployed By"))), /*#__PURE__*/React.createElement("tbody", null, filtered.map(dep => /*#__PURE__*/React.createElement("tr", {
    key: dep.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "#", dep.id)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, dep.app_name)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "status-pill",
    style: {
      background: '#e0f2fe',
      color: 'var(--secondary-dark-blue)'
    }
  }, dep.cloud_provider)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("code", null, dep.version)), /*#__PURE__*/React.createElement("td", null, dep.environment), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: `status-pill ${dep.status === 'Success' ? 'success' : dep.status === 'Failed' ? 'failed' : 'in_progress'}`
  }, /*#__PURE__*/React.createElement("span", {
    className: `status-indicator-dot ${dep.status === 'Success' ? 'green' : dep.status === 'Failed' ? 'red' : 'amber'}`
  }), dep.status)), /*#__PURE__*/React.createElement("td", null, dep.stage), /*#__PURE__*/React.createElement("td", {
    style: {
      width: '120px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-track",
    style: {
      flex: 1,
      height: '6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: `progress-fill ${dep.status === 'Success' ? 'green' : dep.status === 'Failed' ? 'red' : 'blue'}`,
    style: {
      width: `${dep.progress || 100}%`
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '11px',
      color: 'var(--text-muted)'
    }
  }, dep.progress || 100, "%"))), /*#__PURE__*/React.createElement("td", null, dep.created_at), /*#__PURE__*/React.createElement("td", {
    style: {
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, dep.deployed_by)))))));
}

// -------------------------------------------------------------
// View 4: CI/CD Pipeline
// -------------------------------------------------------------
function PipelineView({
  onTriggerPipeline
}) {
  const [activeStageDetail, setActiveStageDetail] = useState(null);
  const stages = [{
    id: "github",
    title: "GitHub",
    tool: "GitHub Enterprise",
    status: "Success",
    duration: "4s",
    output: "Push event to refs/heads/main"
  }, {
    id: "jenkins",
    title: "Jenkins",
    tool: "Jenkins Master",
    status: "Success",
    duration: "8s",
    output: "Triggered declarative pipeline job #142"
  }, {
    id: "build",
    title: "Build",
    tool: "Python 3.12",
    status: "Success",
    duration: "28s",
    output: "Assets packaged into wheels and verified"
  }, {
    id: "test",
    title: "Test",
    tool: "PyTest Suite",
    status: "Success",
    duration: "19s",
    output: "48 tests passed (0 failures, 0 vulnerabilities)"
  }, {
    id: "docker",
    title: "Docker",
    tool: "Docker Engine",
    status: "Success",
    duration: "35s",
    output: "Built image multicloud:latest (sha256:4b912a)"
  }, {
    id: "k8s",
    title: "Kubernetes",
    tool: "kubectl / Helm",
    status: "Success",
    duration: "22s",
    output: "Applied deployment.yaml (2 replicas), service exposed"
  }, {
    id: "cloud",
    title: "Cloud Deployment",
    tool: "AWS / Azure / GCP",
    status: "Success",
    duration: "40s",
    output: "Multi-cloud endpoints synchronized & live"
  }];
  const getStageIcon = id => {
    switch (id) {
      case 'github':
        return /*#__PURE__*/React.createElement("i", {
          className: "fa-brands fa-github"
        });
      case 'jenkins':
        return /*#__PURE__*/React.createElement("i", {
          className: "fa-brands fa-jenkins"
        });
      case 'build':
        return /*#__PURE__*/React.createElement("i", {
          className: "fa-solid fa-hammer"
        });
      case 'test':
        return /*#__PURE__*/React.createElement("i", {
          className: "fa-solid fa-vial-circle-check"
        });
      case 'docker':
        return /*#__PURE__*/React.createElement("i", {
          className: "fa-brands fa-docker"
        });
      case 'k8s':
        return /*#__PURE__*/React.createElement("i", {
          className: "fa-solid fa-dharmachakra"
        });
      case 'cloud':
        return /*#__PURE__*/React.createElement("i", {
          className: "fa-solid fa-cloud"
        });
      default:
        return /*#__PURE__*/React.createElement("i", {
          className: "fa-solid fa-circle-check"
        });
    }
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "deploy-action-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "deploy-action-header-text"
  }, /*#__PURE__*/React.createElement("h3", null, "Visual Continuous Delivery Pipeline"), /*#__PURE__*/React.createElement("p", null, "Automated pipeline flow: GitHub \u2192 Jenkins \u2192 Build \u2192 Test \u2192 Docker \u2192 Kubernetes \u2192 Multi-Cloud Deployment")), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: onTriggerPipeline
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-play"
  }), " Trigger CI/CD Pipeline")), /*#__PURE__*/React.createElement("div", {
    className: "pipeline-visual-wrapper"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pipeline-diagram"
  }, stages.map((st, index) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: st.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "pipeline-node",
    onClick: () => setActiveStageDetail(st)
  }, /*#__PURE__*/React.createElement("div", {
    className: "pipeline-circle"
  }, getStageIcon(st.id)), /*#__PURE__*/React.createElement("div", {
    className: "pipeline-title"
  }, st.title), /*#__PURE__*/React.createElement("div", {
    className: "pipeline-tool"
  }, st.tool), /*#__PURE__*/React.createElement("span", {
    className: "status-pill success",
    style: {
      marginTop: '6px',
      fontSize: '10px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check"
  }), " ", st.duration)), index < stages.length - 1 && /*#__PURE__*/React.createElement("div", {
    className: "pipeline-connector pulse-flow"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "card-white",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: '16px',
      color: 'var(--primary-dark-blue)',
      marginBottom: '12px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-terminal",
    style: {
      color: 'var(--cloud-blue)',
      marginRight: '8px'
    }
  }), "Stage Execution Inspector: ", /*#__PURE__*/React.createElement("strong", null, activeStageDetail ? activeStageDetail.title : 'Overview (Click any stage above)')), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#0f172a',
      padding: '16px',
      borderRadius: '8px',
      color: '#38bdf8',
      fontFamily: 'monospace',
      fontSize: '13px'
    }
  }, activeStageDetail ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, "[INFO] Stage: ", activeStageDetail.title, " (", activeStageDetail.tool, ")"), /*#__PURE__*/React.createElement("div", null, "[INFO] Status: ", activeStageDetail.status, " | Execution Time: ", activeStageDetail.duration), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#4ade80',
      marginTop: '6px'
    }
  }, "[SUCCESS] ", activeStageDetail.output)) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, "[INFO] Pipeline: Multi-Cloud Production Continuous Delivery"), /*#__PURE__*/React.createElement("div", null, "[INFO] Target: Amazon Web Services (ECS/EKS) | Microsoft Azure (AKS) | Google Cloud (GKE)"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: '#4ade80',
      marginTop: '4px'
    }
  }, "[SUCCESS] All 7 pipeline stages verified and operational. Click on any stage above to view granular logs.")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card-light-blue"
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      marginBottom: '10px',
      fontSize: '15px',
      color: 'var(--secondary-dark-blue)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-jenkins",
    style: {
      marginRight: '8px'
    }
  }), " Jenkins Pipeline Automation"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: 'var(--text-navy)',
      marginBottom: '10px'
    }
  }, "Defined in ", /*#__PURE__*/React.createElement("code", null, "Jenkinsfile"), " using Declarative syntax with stages:"), /*#__PURE__*/React.createElement("ul", {
    style: {
      paddingLeft: '20px',
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      lineHeight: '1.8'
    }
  }, /*#__PURE__*/React.createElement("li", null, "1. Checkout Source Code from GitHub"), /*#__PURE__*/React.createElement("li", null, "2. Install Dependencies via pip"), /*#__PURE__*/React.createElement("li", null, "3. Run Automated Unit & Security Tests"), /*#__PURE__*/React.createElement("li", null, "4. Build & Tag Docker Container Image"), /*#__PURE__*/React.createElement("li", null, "5. Deploy to Multi-Cloud Clusters"), /*#__PURE__*/React.createElement("li", null, "6. Verify Application Health & SLA"))), /*#__PURE__*/React.createElement("div", {
    className: "card-light-blue"
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      marginBottom: '10px',
      fontSize: '15px',
      color: 'var(--secondary-dark-blue)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-dharmachakra",
    style: {
      marginRight: '8px'
    }
  }), " Kubernetes Orchestration"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '13px',
      color: 'var(--text-navy)',
      marginBottom: '10px'
    }
  }, "Defined in ", /*#__PURE__*/React.createElement("code", null, "k8s/deployment.yaml"), " and ", /*#__PURE__*/React.createElement("code", null, "k8s/service.yaml"), ":"), /*#__PURE__*/React.createElement("ul", {
    style: {
      paddingLeft: '20px',
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      lineHeight: '1.8'
    }
  }, /*#__PURE__*/React.createElement("li", null, "Replicas: 2 High-Availability Pods"), /*#__PURE__*/React.createElement("li", null, "Probes: Liveness & Readiness healthchecks"), /*#__PURE__*/React.createElement("li", null, "Rolling Updates: Zero-downtime container replacement"), /*#__PURE__*/React.createElement("li", null, "Service: LoadBalancer exposing internal port 5000"), /*#__PURE__*/React.createElement("li", null, "Auto-scaling: Horizontal Pod Autoscaler (HPA) configured")))));
}

// -------------------------------------------------------------
// View 5: Monitoring View (Charts & Graphs)
// -------------------------------------------------------------
function MonitoringView({
  metrics
}) {
  const cpuChartRef = useRef(null);
  const memChartRef = useRef(null);
  const latencyChartRef = useRef(null);
  const trafficChartRef = useRef(null);
  const cpuChartInstance = useRef(null);
  const memChartInstance = useRef(null);
  const latencyChartInstance = useRef(null);
  const trafficChartInstance = useRef(null);
  useEffect(() => {
    if (!metrics || !window.Chart) return;
    const timestamps = metrics.timestamps || ['18:00', '18:05', '18:10', '18:15', '18:20', '18:25', '18:30', '18:35'];
    if (cpuChartInstance.current) cpuChartInstance.current.destroy();
    if (memChartInstance.current) memChartInstance.current.destroy();
    if (latencyChartInstance.current) latencyChartInstance.current.destroy();
    if (trafficChartInstance.current) trafficChartInstance.current.destroy();
    if (cpuChartRef.current) {
      cpuChartInstance.current = new Chart(cpuChartRef.current, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: 'AWS CPU (%)',
            data: metrics.cpu_utilization.aws,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.3,
            fill: true
          }, {
            label: 'Azure CPU (%)',
            data: metrics.cpu_utilization.azure,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            tension: 0.3,
            fill: true
          }, {
            label: 'GCP CPU (%)',
            data: metrics.cpu_utilization.gcp,
            borderColor: '#ea4335',
            backgroundColor: 'rgba(234, 67, 53, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    if (memChartRef.current) {
      memChartInstance.current = new Chart(memChartRef.current, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: 'AWS Memory (%)',
            data: metrics.memory_utilization.aws,
            borderColor: '#f59e0b',
            tension: 0.3
          }, {
            label: 'Azure Memory (%)',
            data: metrics.memory_utilization.azure,
            borderColor: '#0284c7',
            tension: 0.3
          }, {
            label: 'GCP Memory (%)',
            data: metrics.memory_utilization.gcp,
            borderColor: '#ea4335',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    if (latencyChartRef.current) {
      latencyChartInstance.current = new Chart(latencyChartRef.current, {
        type: 'bar',
        data: {
          labels: timestamps,
          datasets: [{
            label: 'AWS Latency (ms)',
            data: metrics.response_time_ms.aws,
            backgroundColor: '#f59e0b'
          }, {
            label: 'Azure Latency (ms)',
            data: metrics.response_time_ms.azure,
            backgroundColor: '#0284c7'
          }, {
            label: 'GCP Latency (ms)',
            data: metrics.response_time_ms.gcp,
            backgroundColor: '#ea4335'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    if (trafficChartRef.current) {
      trafficChartInstance.current = new Chart(trafficChartRef.current, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: 'Requests / Min',
            data: metrics.requests_per_minute || [120, 140, 180, 210, 205, 240, 270, 260],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
    return () => {
      if (cpuChartInstance.current) cpuChartInstance.current.destroy();
      if (memChartInstance.current) memChartInstance.current.destroy();
      if (latencyChartInstance.current) latencyChartInstance.current.destroy();
      if (trafficChartInstance.current) trafficChartInstance.current.destroy();
    };
  }, [metrics]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "metrics-grid-4",
    style: {
      marginBottom: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric-card-title"
  }, "Overall Uptime"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-value",
    style: {
      color: 'var(--success-green)'
    }
  }, metrics?.uptime_percentage || '99.94', "%"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-subtext"
  }, "Verified past 30 days")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric-card-title"
  }, "AWS Availability"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-value"
  }, metrics?.cloud_availability?.AWS || '99.98', "%"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-subtext"
  }, "us-east-1 N. Virginia")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric-card-title"
  }, "Azure Availability"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-value"
  }, metrics?.cloud_availability?.Azure || '99.95', "%"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-subtext"
  }, "eastus Virginia")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "metric-card-title"
  }, "GCP Availability"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-value"
  }, metrics?.cloud_availability?.GCP || '99.99', "%"), /*#__PURE__*/React.createElement("div", {
    className: "metric-card-subtext"
  }, "us-central1 Iowa"))), /*#__PURE__*/React.createElement("div", {
    className: "charts-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-header"
  }, /*#__PURE__*/React.createElement("h4", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-microchip",
    style: {
      color: 'var(--cloud-blue)',
      marginRight: '8px'
    }
  }), " CPU Utilization (%)"), /*#__PURE__*/React.createElement("span", {
    className: "badge-demo"
  }, "PROMETHEUS SCRAPED")), /*#__PURE__*/React.createElement("div", {
    className: "chart-container"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: cpuChartRef
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chart-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-header"
  }, /*#__PURE__*/React.createElement("h4", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-memory",
    style: {
      color: '#9333ea',
      marginRight: '8px'
    }
  }), " Memory Utilization (%)"), /*#__PURE__*/React.createElement("span", {
    className: "badge-demo"
  }, "PROMETHEUS SCRAPED")), /*#__PURE__*/React.createElement("div", {
    className: "chart-container"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: memChartRef
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chart-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-header"
  }, /*#__PURE__*/React.createElement("h4", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-stopwatch",
    style: {
      color: '#f59e0b',
      marginRight: '8px'
    }
  }), " Application Response Time (ms)"), /*#__PURE__*/React.createElement("span", {
    className: "badge-demo"
  }, "LATENCY SLA")), /*#__PURE__*/React.createElement("div", {
    className: "chart-container"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: latencyChartRef
  }))), /*#__PURE__*/React.createElement("div", {
    className: "chart-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-header"
  }, /*#__PURE__*/React.createElement("h4", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-wave-square",
    style: {
      color: 'var(--success-green)',
      marginRight: '8px'
    }
  }), " Request Traffic (Requests / Min)"), /*#__PURE__*/React.createElement("span", {
    className: "badge-demo"
  }, "GLOBAL INGRESS")), /*#__PURE__*/React.createElement("div", {
    className: "chart-container"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: trafficChartRef
  })))));
}

// -------------------------------------------------------------
// View 6: System Logs View
// -------------------------------------------------------------
function LogsView({
  logs,
  onRefresh
}) {
  const [filterCloud, setFilterCloud] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = logs.filter(log => {
    const matchesCloud = filterCloud === 'ALL' || log.cloud_provider.toUpperCase() === filterCloud.toUpperCase() || log.cloud_provider === 'ALL';
    const matchesLevel = filterLevel === 'ALL' || log.level.toUpperCase() === filterLevel.toUpperCase();
    const matchesSearch = !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase()) || log.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCloud && matchesLevel && matchesSearch;
  });
  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multicloud-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "filter-bar"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "filter-input",
    placeholder: "Search logs by keyword or service...",
    value: searchTerm,
    onChange: e => setSearchTerm(e.target.value)
  }), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    style: {
      width: '150px'
    },
    value: filterCloud,
    onChange: e => setFilterCloud(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, "All Clouds"), /*#__PURE__*/React.createElement("option", {
    value: "AWS"
  }, "AWS"), /*#__PURE__*/React.createElement("option", {
    value: "Azure"
  }, "Azure"), /*#__PURE__*/React.createElement("option", {
    value: "GCP"
  }, "GCP")), /*#__PURE__*/React.createElement("select", {
    className: "form-select",
    style: {
      width: '150px'
    },
    value: filterLevel,
    onChange: e => setFilterLevel(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "ALL"
  }, "All Levels"), /*#__PURE__*/React.createElement("option", {
    value: "INFO"
  }, "INFO"), /*#__PURE__*/React.createElement("option", {
    value: "SUCCESS"
  }, "SUCCESS"), /*#__PURE__*/React.createElement("option", {
    value: "WARNING"
  }, "WARNING"), /*#__PURE__*/React.createElement("option", {
    value: "ERROR"
  }, "ERROR")), /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: onRefresh
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-rotate"
  }), " Refresh"), /*#__PURE__*/React.createElement("button", {
    className: "btn-secondary",
    onClick: exportLogs
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-download"
  }), " Export JSON")), /*#__PURE__*/React.createElement("div", {
    className: "terminal-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "terminal-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "terminal-dots"
  }, /*#__PURE__*/React.createElement("div", {
    className: "terminal-dot red"
  }), /*#__PURE__*/React.createElement("div", {
    className: "terminal-dot yellow"
  }), /*#__PURE__*/React.createElement("div", {
    className: "terminal-dot green"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12px',
      color: '#94a3b8'
    }
  }, "multicloud-devops-engine \xB7 Showing ", filtered.length, " entries"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '11px',
      color: '#38bdf8'
    }
  }, "Live Stream \u2022")), /*#__PURE__*/React.createElement("div", {
    className: "terminal-body"
  }, filtered.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: '#64748b',
      padding: '30px'
    }
  }, "No logs found matching selected criteria.") : filtered.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    className: "terminal-log-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "log-time"
  }, l.timestamp), /*#__PURE__*/React.createElement("span", {
    className: `log-lvl ${l.level}`
  }, l.level), /*#__PURE__*/React.createElement("span", {
    className: "log-cloud"
  }, "[", l.cloud_provider, "]"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#94a3b8',
      width: '120px'
    }
  }, l.service, ":"), /*#__PURE__*/React.createElement("span", {
    className: "log-text"
  }, l.message))))));
}

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render( /*#__PURE__*/React.createElement(App, null));