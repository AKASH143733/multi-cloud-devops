const {
  useState,
  useEffect,
  useRef
} = React;

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [clouds, setClouds] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Deployment Modal & Simulation State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [selectedCloudForDeploy, setSelectedCloudForDeploy] = useState('AWS');
  const [selectedAppForDeploy, setSelectedAppForDeploy] = useState('e-commerce-api');
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

  // Load initial data
  const fetchAllData = async () => {
    try {
      const [dashRes, cloudsRes, depsRes, pipeRes, logsRes, metricsRes] = await Promise.all([fetch('/api/dashboard').then(r => r.json()), fetch('/api/clouds').then(r => r.json()), fetch('/api/deployments').then(r => r.json()), fetch('/api/pipeline').then(r => r.json()), fetch('/api/logs?limit=40').then(r => r.json()), fetch('/api/metrics?format=json').then(r => r.json())]);
      if (dashRes.status === 'success') setDashboardData(dashRes.data);
      if (cloudsRes.status === 'success') setClouds(cloudsRes.data);
      if (depsRes.status === 'success') setDeployments(depsRes.data);
      if (pipeRes.status === 'success') setPipeline(pipeRes.data);
      if (logsRes.status === 'success') setLogs(logsRes.data);
      if (metricsRes.status === 'success') setMetrics(metricsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Trigger Deployment handler
  const handleStartDeployment = async () => {
    setIsDeploying(true);
    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_name: selectedAppForDeploy,
          cloud_provider: selectedCloudForDeploy,
          version: deployVersion,
          environment: deployEnvironment
        })
      });
      const result = await res.json();
      if (result.status === 'success') {
        const depId = result.data.deployment_id;
        setActiveSimulation({
          id: depId,
          app_name: selectedAppForDeploy,
          cloud_provider: selectedCloudForDeploy,
          version: deployVersion,
          stage: 'Source Code Checkout',
          progress: 15,
          status: 'In Progress',
          log: 'Initiating automated multi-cloud pipeline sequence...'
        });
        showToast(`Deployment #${depId} triggered to ${selectedCloudForDeploy}`, 'success');

        // Poll deployment status
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/deployments/${depId}`).then(r => r.json());
            if (statusRes.status === 'success') {
              const d = statusRes.data;
              setActiveSimulation(prev => ({
                ...prev,
                stage: d.stage,
                progress: d.progress,
                status: d.status,
                log: d.details || 'Processing...'
              }));
              if (d.status === 'Success' || d.status === 'Failed') {
                clearInterval(pollInterval);
                setIsDeploying(false);
                showToast(`Deployment #${depId} completed successfully!`, 'success');
                fetchAllData();
              }
            }
          } catch (e) {
            console.error('Error polling deployment:', e);
          }
        }, 1500);
      } else {
        showToast(result.message || 'Deployment error', 'error');
        setIsDeploying(false);
      }
    } catch (err) {
      showToast('Failed to trigger deployment', 'error');
      setIsDeploying(false);
    }
  };
  const handleResetDemo = async () => {
    if (!confirm('Reset all demo data and restore initial clean state?')) return;
    try {
      await fetch('/api/reset-demo', {
        method: 'POST'
      });
      showToast('Demo data reset to clean default state', 'success');
      fetchAllData();
    } catch (err) {
      showToast('Failed to reset demo', 'error');
    }
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
  }, "Simulated Clouds"), /*#__PURE__*/React.createElement("div", {
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
  }), "DEMO ENVIRONMENT"), /*#__PURE__*/React.createElement("button", {
    className: "btn-primary",
    onClick: () => setIsDeployModalOpen(true)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-paper-plane"
  }), " Deploy Application"))), /*#__PURE__*/React.createElement("main", {
    className: "content-body"
  }, loading ? /*#__PURE__*/React.createElement("div", {
    className: "initial-loader",
    style: {
      minHeight: '400px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "spinner"
  }), /*#__PURE__*/React.createElement("h2", null, "Loading telemetry from clouds...")) : /*#__PURE__*/React.createElement(React.Fragment, null, currentView === 'dashboard' && /*#__PURE__*/React.createElement(DashboardView, {
    data: dashboardData,
    clouds: clouds,
    deployments: deployments,
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
    onOpenDeploy: () => setIsDeployModalOpen(true),
    activeSimulation: activeSimulation
  }), currentView === 'pipeline' && /*#__PURE__*/React.createElement(PipelineView, {
    pipeline: pipeline,
    onTriggerPipeline: () => {
      showToast('CI/CD Pipeline triggered successfully', 'success');
      fetchAllData();
    }
  }), currentView === 'monitoring' && /*#__PURE__*/React.createElement(MonitoringView, {
    metrics: metrics
  }), currentView === 'logs' && /*#__PURE__*/React.createElement(LogsView, {
    logs: logs,
    onRefresh: fetchAllData
  })))), isDeployModalOpen && /*#__PURE__*/React.createElement("div", {
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
    value: selectedAppForDeploy,
    onChange: e => setSelectedAppForDeploy(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "e-commerce-api"
  }, "e-commerce-api (Python / Flask)"), /*#__PURE__*/React.createElement("option", {
    value: "payment-gateway"
  }, "payment-gateway (Go / Docker)"), /*#__PURE__*/React.createElement("option", {
    value: "user-auth-service"
  }, "user-auth-service (Node.js)"), /*#__PURE__*/React.createElement("option", {
    value: "frontend-web-portal"
  }, "frontend-web-portal (React / Nginx)"), /*#__PURE__*/React.createElement("option", {
    value: "analytics-pipeline"
  }, "analytics-pipeline (Python / Spark)"))), /*#__PURE__*/React.createElement("div", {
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
  }), "Clicking ", /*#__PURE__*/React.createElement("strong", null, "Start Multi-Cloud Deployment"), " will execute the 6-stage simulated pipeline: Checkout \u2192 Build \u2192 Testing \u2192 Docker \u2192 Deployment \u2192 Verification."), /*#__PURE__*/React.createElement("div", {
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
  deployments,
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
  }), " Synced: Just now"), /*#__PURE__*/React.createElement("button", {
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
    className: `status-pill ${dep.cloud_provider.toLowerCase() === 'aws' ? 'warning' : 'in_progress'}`,
    style: {
      background: '#f0f9ff',
      color: 'var(--primary-dark-blue)'
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
  }), " SIMULATED DEMO ENVIRONMENT")), /*#__PURE__*/React.createElement("div", {
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
  onOpenDeploy,
  activeSimulation
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
  pipeline,
  onTriggerPipeline
}) {
  const [activeStageDetail, setActiveStageDetail] = useState(null);
  const stages = pipeline?.stages || [{
    id: "github",
    title: "GitHub",
    tool: "GitHub Enterprise",
    status: "Success",
    duration: "4s",
    output: "Push event to main branch"
  }, {
    id: "jenkins",
    title: "Jenkins",
    tool: "Jenkins Master",
    status: "Success",
    duration: "8s",
    output: "Triggered declarative pipeline"
  }, {
    id: "build",
    title: "Build",
    tool: "Python 3.12",
    status: "Success",
    duration: "28s",
    output: "Assets packaged into wheels"
  }, {
    id: "test",
    title: "Test",
    tool: "PyTest Suite",
    status: "Success",
    duration: "19s",
    output: "48 tests passed (0 failures)"
  }, {
    id: "docker",
    title: "Docker",
    tool: "Docker Engine",
    status: "Success",
    duration: "35s",
    output: "Built image multicloud:latest"
  }, {
    id: "k8s",
    title: "Kubernetes",
    tool: "kubectl / Helm",
    status: "Success",
    duration: "22s",
    output: "Applied deployment.yaml (2 replicas)"
  }, {
    id: "cloud",
    title: "Cloud Deployment",
    tool: "AWS / Azure / GCP",
    status: "Success",
    duration: "40s",
    output: "Multi-cloud endpoints live"
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

    // Destroy previous chart instances if they exist
    if (cpuChartInstance.current) cpuChartInstance.current.destroy();
    if (memChartInstance.current) memChartInstance.current.destroy();
    if (latencyChartInstance.current) latencyChartInstance.current.destroy();
    if (trafficChartInstance.current) trafficChartInstance.current.destroy();

    // 1. CPU Chart
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

    // 2. Memory Chart
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

    // 3. Response Time Chart
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

    // 4. Requests Throughput Chart
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