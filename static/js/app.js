const { useState, useEffect, useRef } = React;

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
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Load initial data
    const fetchAllData = async () => {
        try {
            const [dashRes, cloudsRes, depsRes, pipeRes, logsRes, metricsRes] = await Promise.all([
                fetch('/api/dashboard').then(r => r.json()),
                fetch('/api/clouds').then(r => r.json()),
                fetch('/api/deployments').then(r => r.json()),
                fetch('/api/pipeline').then(r => r.json()),
                fetch('/api/logs?limit=40').then(r => r.json()),
                fetch('/api/metrics?format=json').then(r => r.json())
            ]);

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
                headers: { 'Content-Type': 'application/json' },
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
            await fetch('/api/reset-demo', { method: 'POST' });
            showToast('Demo data reset to clean default state', 'success');
            fetchAllData();
        } catch (err) {
            showToast('Failed to reset demo', 'error');
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo-icon">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <div className="sidebar-brand">
                        <h1>Multi-Cloud DevOps</h1>
                        <span>Deployment & Mgmt</span>
                    </div>
                </div>

                <div className="sidebar-nav">
                    <div className="nav-section-label">Main Navigation</div>

                    <div 
                        className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
                    >
                        <i className="fa-solid fa-chart-pie"></i>
                        <span>Dashboard</span>
                    </div>

                    <div 
                        className={`nav-item ${currentView === 'clouds' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('clouds'); setMobileMenuOpen(false); }}
                    >
                        <i className="fa-solid fa-server"></i>
                        <span>Cloud Providers</span>
                        <span className="badge-count">3</span>
                    </div>

                    <div 
                        className={`nav-item ${currentView === 'deployments' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('deployments'); setMobileMenuOpen(false); }}
                    >
                        <i className="fa-solid fa-rocket"></i>
                        <span>Deployment Mgmt</span>
                    </div>

                    <div 
                        className={`nav-item ${currentView === 'pipeline' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('pipeline'); setMobileMenuOpen(false); }}
                    >
                        <i className="fa-solid fa-diagram-project"></i>
                        <span>CI/CD Pipeline</span>
                    </div>

                    <div 
                        className={`nav-item ${currentView === 'monitoring' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('monitoring'); setMobileMenuOpen(false); }}
                    >
                        <i className="fa-solid fa-chart-line"></i>
                        <span>Monitoring</span>
                    </div>

                    <div 
                        className={`nav-item ${currentView === 'logs' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('logs'); setMobileMenuOpen(false); }}
                    >
                        <i className="fa-solid fa-terminal"></i>
                        <span>System Logs</span>
                    </div>

                    <div className="nav-section-label" style={{ marginTop: '20px' }}>Simulated Clouds</div>
                    <div className="sidebar-cloud-pills">
                        <div className="cloud-pill aws">
                            <i className="fa-brands fa-aws"></i>
                            AWS
                        </div>
                        <div className="cloud-pill azure">
                            <i className="fa-brands fa-microsoft"></i>
                            Azure
                        </div>
                        <div className="cloud-pill gcp">
                            <i className="fa-brands fa-google"></i>
                            GCP
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleResetDemo}>
                        <i className="fa-solid fa-rotate-left"></i> Reset Demo State
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className="main-wrapper">
                {/* Navbar */}
                <header className="top-navbar">
                    <div className="top-navbar-left">
                        <button className="btn-secondary" style={{ display: 'none' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <i className="fa-solid fa-bars"></i>
                        </button>
                        <div className="page-title-group">
                            <h2>
                                {currentView === 'dashboard' && 'Central DevOps Overview'}
                                {currentView === 'clouds' && 'Multi-Cloud Infrastructure'}
                                {currentView === 'deployments' && 'Deployment Lifecycle Management'}
                                {currentView === 'pipeline' && 'Continuous Delivery Pipeline'}
                                {currentView === 'monitoring' && 'Telemetry & Resource Monitoring'}
                                {currentView === 'logs' && 'Centralized Audit & Application Logs'}
                            </h2>
                            <p>AWS · Microsoft Azure · Google Cloud Platform</p>
                        </div>
                    </div>

                    <div className="top-navbar-right">
                        <div className="demo-mode-badge">
                            <span className="pulse-dot"></span>
                            DEMO ENVIRONMENT
                        </div>

                        <button className="btn-primary" onClick={() => setIsDeployModalOpen(true)}>
                            <i className="fa-solid fa-paper-plane"></i> Deploy Application
                        </button>
                    </div>
                </header>

                {/* Body Content */}
                <main className="content-body">
                    {loading ? (
                        <div className="initial-loader" style={{ minHeight: '400px' }}>
                            <div className="spinner"></div>
                            <h2>Loading telemetry from clouds...</h2>
                        </div>
                    ) : (
                        <>
                            {currentView === 'dashboard' && (
                                <DashboardView 
                                    data={dashboardData} 
                                    clouds={clouds}
                                    deployments={deployments}
                                    onNavigate={setCurrentView}
                                    onOpenDeploy={(cloud) => {
                                        if (cloud) setSelectedCloudForDeploy(cloud);
                                        setIsDeployModalOpen(true);
                                    }}
                                />
                            )}

                            {currentView === 'clouds' && (
                                <CloudProvidersView 
                                    clouds={clouds} 
                                    onDeployToCloud={(cloud) => {
                                        setSelectedCloudForDeploy(cloud);
                                        setIsDeployModalOpen(true);
                                    }}
                                />
                            )}

                            {currentView === 'deployments' && (
                                <DeploymentsView 
                                    deployments={deployments} 
                                    onOpenDeploy={() => setIsDeployModalOpen(true)}
                                    activeSimulation={activeSimulation}
                                />
                            )}

                            {currentView === 'pipeline' && (
                                <PipelineView 
                                    pipeline={pipeline} 
                                    onTriggerPipeline={() => {
                                        showToast('CI/CD Pipeline triggered successfully', 'success');
                                        fetchAllData();
                                    }}
                                />
                            )}

                            {currentView === 'monitoring' && (
                                <MonitoringView metrics={metrics} />
                            )}

                            {currentView === 'logs' && (
                                <LogsView logs={logs} onRefresh={fetchAllData} />
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Deployment Modal */}
            {isDeployModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3><i className="fa-solid fa-cloud-arrow-up" style={{ color: 'var(--cloud-blue)', marginRight: '8px' }}></i> Deploy Application to Cloud</h3>
                            <button className="modal-close-btn" onClick={() => !isDeploying && setIsDeployModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            {!isDeploying && !activeSimulation ? (
                                <>
                                    <div className="form-group">
                                        <label>Application Name</label>
                                        <select 
                                            className="form-select" 
                                            value={selectedAppForDeploy}
                                            onChange={(e) => setSelectedAppForDeploy(e.target.value)}
                                        >
                                            <option value="e-commerce-api">e-commerce-api (Python / Flask)</option>
                                            <option value="payment-gateway">payment-gateway (Go / Docker)</option>
                                            <option value="user-auth-service">user-auth-service (Node.js)</option>
                                            <option value="frontend-web-portal">frontend-web-portal (React / Nginx)</option>
                                            <option value="analytics-pipeline">analytics-pipeline (Python / Spark)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Target Cloud Provider</label>
                                        <select 
                                            className="form-select" 
                                            value={selectedCloudForDeploy}
                                            onChange={(e) => setSelectedCloudForDeploy(e.target.value)}
                                        >
                                            <option value="AWS">Amazon Web Services (AWS us-east-1)</option>
                                            <option value="Azure">Microsoft Azure (Azure eastus)</option>
                                            <option value="GCP">Google Cloud Platform (GCP us-central1)</option>
                                        </select>
                                    </div>

                                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                        <div>
                                            <label>Version Tag</label>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                value={deployVersion}
                                                onChange={(e) => setDeployVersion(e.target.value)}
                                                placeholder="e.g. v2.5.0"
                                            />
                                        </div>
                                        <div>
                                            <label>Environment</label>
                                            <select 
                                                className="form-select"
                                                value={deployEnvironment}
                                                onChange={(e) => setDeployEnvironment(e.target.value)}
                                            >
                                                <option value="Production">Production</option>
                                                <option value="Staging">Staging</option>
                                                <option value="Development">Development</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#0369a1', margin: '16px 0' }}>
                                        <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
                                        Clicking <strong>Start Multi-Cloud Deployment</strong> will execute the 6-stage simulated pipeline: Checkout &rarr; Build &rarr; Testing &rarr; Docker &rarr; Deployment &rarr; Verification.
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button className="btn-secondary" onClick={() => setIsDeployModalOpen(false)}>Cancel</button>
                                        <button className="btn-primary" onClick={handleStartDeployment}>
                                            <i className="fa-solid fa-play"></i> Start Multi-Cloud Deployment
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <DeploymentStepper simulation={activeSimulation} onClose={() => {
                                    setIsDeployModalOpen(false);
                                    setActiveSimulation(null);
                                    setIsDeploying(false);
                                }} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Message */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    backgroundColor: toast.type === 'success' ? '#10b981' : (toast.type === 'error' ? '#ef4444' : '#0284c7'),
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
                }}>
                    <i className={toast.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-bell'}></i>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------------
// Component: Deployment Stepper (Simulated 6 Stages)
// -------------------------------------------------------------
function DeploymentStepper({ simulation, onClose }) {
    const stages = [
        { id: 1, name: "Source Code Checkout", detail: "Cloning GitHub repo & checking out release tag" },
        { id: 2, name: "Build", detail: "Compiling bytecode & packaging application artifacts" },
        { id: 3, name: "Testing", detail: "PyTest unit tests & Bandit security vulnerability scans" },
        { id: 4, name: "Docker Image Creation", detail: "Building Docker container image & tagging sha256" },
        { id: 5, name: "Deployment", detail: `Applying Kubernetes manifest to ${simulation?.cloud_provider || 'Cloud'}` },
        { id: 6, name: "Verification", detail: "Synthetic health probes & response verification" }
    ];

    const currentStageName = simulation?.stage || 'Source Code Checkout';
    const currentProgress = simulation?.progress || 10;
    const isFinished = simulation?.status === 'Success';

    const getStageIndex = (name) => {
        const idx = stages.findIndex(s => s.name.toLowerCase() === (name || '').toLowerCase());
        return idx !== -1 ? idx : 0;
    };

    const activeIdx = getStageIndex(currentStageName);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h4 style={{ fontSize: '16px', color: 'var(--primary-dark-blue)' }}>
                        Deploying: <strong>{simulation?.app_name}</strong> ({simulation?.version})
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Target: <span style={{ color: 'var(--cloud-blue)', fontWeight: 600 }}>{simulation?.cloud_provider}</span> ({simulation?.environment || 'Production'})
                    </p>
                </div>
                <div className={`status-pill ${isFinished ? 'success' : 'in_progress'}`}>
                    <span className={`status-indicator-dot ${isFinished ? 'green' : 'amber'}`}></span>
                    {simulation?.status}
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Pipeline Progress</span>
                    <span style={{ color: 'var(--cloud-blue)' }}>{currentProgress}%</span>
                </div>
                <div className="progress-track" style={{ height: '10px' }}>
                    <div 
                        className={`progress-fill ${isFinished ? 'green' : 'blue'}`} 
                        style={{ width: `${currentProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* 6 Stage List */}
            <div className="deployment-stepper">
                {stages.map((st, idx) => {
                    let statusClass = '';
                    let icon = idx + 1;
                    let tagText = 'Pending';

                    if (idx < activeIdx || isFinished) {
                        statusClass = 'completed';
                        icon = <i className="fa-solid fa-check"></i>;
                        tagText = 'Completed';
                    } else if (idx === activeIdx && !isFinished) {
                        statusClass = 'active';
                        icon = <i className="fa-solid fa-spinner fa-spin"></i>;
                        tagText = 'Running';
                    }

                    return (
                        <div key={st.id} className={`step-row ${statusClass}`}>
                            <div className="step-icon-badge">{icon}</div>
                            <div className="step-info">
                                <h4>{st.name}</h4>
                                <p>{st.detail}</p>
                            </div>
                            <span className="step-status-tag" style={{
                                backgroundColor: statusClass === 'completed' ? '#ecfdf5' : (statusClass === 'active' ? '#e0f2fe' : '#f1f5f9'),
                                color: statusClass === 'completed' ? '#059669' : (statusClass === 'active' ? '#0284c7' : '#64748b')
                            }}>
                                {tagText}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Live Terminal Log Stream */}
            <div style={{ background: '#0f172a', padding: '12px 16px', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px', marginTop: '16px' }}>
                <i className="fa-solid fa-terminal" style={{ marginRight: '6px' }}></i>
                {simulation?.log || 'Executing stage commands...'}
            </div>

            {isFinished && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-primary" onClick={onClose}>
                        <i className="fa-solid fa-check"></i> Done & View Deployments
                    </button>
                </div>
            )}
        </div>
    );
}

// -------------------------------------------------------------
// View 1: Central Dashboard
// -------------------------------------------------------------
function DashboardView({ data, clouds, deployments, onNavigate, onOpenDeploy }) {
    if (!data) return null;

    return (
        <div>
            {/* Top 4 Metrics Grid */}
            <div className="metrics-grid-4">
                <div className="metric-card">
                    <div className="metric-card-header">
                        <span className="metric-card-title">Cloud Providers</span>
                        <div className="metric-icon-bubble blue">
                            <i className="fa-solid fa-cloud"></i>
                        </div>
                    </div>
                    <div className="metric-card-value">{data.total_clouds}</div>
                    <div className="metric-card-subtext">
                        <span className="status-pill success" style={{ padding: '2px 6px', fontSize: '10px' }}>Active</span>
                        AWS · Azure · GCP
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-card-header">
                        <span className="metric-card-title">Total Applications</span>
                        <div className="metric-icon-bubble purple">
                            <i className="fa-solid fa-layer-group"></i>
                        </div>
                    </div>
                    <div className="metric-card-value">{data.total_applications}</div>
                    <div className="metric-card-subtext">
                        <i className="fa-solid fa-microchip" style={{ color: 'var(--cloud-blue)' }}></i> Microservices containerized
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-card-header">
                        <span className="metric-card-title">Successful Deploys</span>
                        <div className="metric-icon-bubble green">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                    </div>
                    <div className="metric-card-value">{data.successful_deployments}</div>
                    <div className="metric-card-subtext">
                        <i className="fa-solid fa-arrow-trend-up" style={{ color: 'var(--success-green)' }}></i>
                        {data.total_deployments > 0 ? Math.round((data.successful_deployments / data.total_deployments) * 100) : 100}% Success rate
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-card-header">
                        <span className="metric-card-title">App Availability</span>
                        <div className="metric-icon-bubble blue">
                            <i className="fa-solid fa-shield-heart"></i>
                        </div>
                    </div>
                    <div className="metric-card-value">{data.application_availability}%</div>
                    <div className="metric-card-subtext">
                        <i className="fa-solid fa-circle-dot" style={{ color: 'var(--success-green)' }}></i> Zero downtime SLA
                    </div>
                </div>
            </div>

            {/* Cloud Providers Quick Summary */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>
                        <i className="fa-solid fa-cubes"></i> Multi-Cloud Infrastructure Status
                    </h3>
                    <button className="btn-secondary" onClick={() => onNavigate('clouds')}>
                        View Detailed Providers &rarr;
                    </button>
                </div>

                <div className="cloud-cards-grid">
                    {clouds.map(c => (
                        <div key={c.id} className="cloud-provider-card">
                            <div className="cloud-card-header">
                                <div className="cloud-identity">
                                    <div className={`cloud-logo-box ${c.code.toLowerCase()}`}>
                                        {c.code === 'AWS' && <i className="fa-brands fa-aws"></i>}
                                        {c.code === 'Azure' && <i className="fa-brands fa-microsoft"></i>}
                                        {c.code === 'GCP' && <i className="fa-brands fa-google"></i>}
                                    </div>
                                    <div className="cloud-title-box">
                                        <h3>{c.name}</h3>
                                        <p>{c.region}</p>
                                    </div>
                                </div>
                                <span className="badge-demo">DEMO DATA</span>
                            </div>

                            <div className="cloud-stats-row">
                                <div className="cloud-stat-item">
                                    <span>Cloud Status</span>
                                    <div className="status-pill success" style={{ marginTop: '4px' }}>
                                        <span className="status-indicator-dot green"></span>
                                        {c.status}
                                    </div>
                                </div>
                                <div className="cloud-stat-item">
                                    <span>Applications</span>
                                    <strong>{c.apps_count} Services</strong>
                                </div>
                            </div>

                            <div className="resource-bar-group">
                                <div className="resource-bar-label">
                                    <span>CPU Utilization</span>
                                    <span>{c.cpu_usage}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill blue" style={{ width: `${c.cpu_usage}%` }}></div>
                                </div>
                            </div>

                            <div className="resource-bar-group">
                                <div className="resource-bar-label">
                                    <span>Memory Usage</span>
                                    <span>{c.memory_usage}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill purple" style={{ width: `${c.memory_usage}%` }}></div>
                                </div>
                            </div>

                            <div className="cloud-card-footer">
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <i className="fa-solid fa-clock-rotate-left"></i> Synced: Just now
                                </span>
                                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => onOpenDeploy(c.code)}>
                                    <i className="fa-solid fa-rocket"></i> Deploy to {c.code}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Deployment Activities */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="section-title" style={{ margin: 0 }}>
                        <i className="fa-solid fa-clock-rotate-left"></i> Recent Deployment Activities
                    </h3>
                    <button className="btn-secondary" onClick={() => onNavigate('deployments')}>
                        View Full History &rarr;
                    </button>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Deployment ID</th>
                                <th>Application</th>
                                <th>Cloud Provider</th>
                                <th>Version</th>
                                <th>Environment</th>
                                <th>Status</th>
                                <th>Stage</th>
                                <th>Deployed At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.recent_deployments || []).map(dep => (
                                <tr key={dep.id}>
                                    <td><strong>#{dep.id}</strong></td>
                                    <td><i className="fa-solid fa-box" style={{ color: 'var(--cloud-blue)', marginRight: '6px' }}></i>{dep.app_name}</td>
                                    <td>
                                        <span className={`status-pill ${dep.cloud_provider.toLowerCase() === 'aws' ? 'warning' : 'in_progress'}`} style={{ background: '#f0f9ff', color: 'var(--primary-dark-blue)' }}>
                                            {dep.cloud_provider}
                                        </span>
                                    </td>
                                    <td><code>{dep.version}</code></td>
                                    <td>{dep.environment}</td>
                                    <td>
                                        <span className={`status-pill ${dep.status === 'Success' ? 'success' : (dep.status === 'Failed' ? 'failed' : 'in_progress')}`}>
                                            <span className={`status-indicator-dot ${dep.status === 'Success' ? 'green' : (dep.status === 'Failed' ? 'red' : 'amber')}`}></span>
                                            {dep.status}
                                        </span>
                                    </td>
                                    <td>{dep.stage}</td>
                                    <td>{dep.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// View 2: Cloud Providers
// -------------------------------------------------------------
function CloudProvidersView({ clouds, onDeployToCloud }) {
    return (
        <div>
            <div className="deploy-action-header">
                <div className="deploy-action-header-text">
                    <h3>Multi-Cloud Provider Fleet</h3>
                    <p>Independent infrastructure management across AWS, Azure, and Google Cloud with Terraform & Kubernetes orchestration.</p>
                </div>
                <span className="badge-demo" style={{ fontSize: '12px', padding: '6px 12px' }}>
                    <i className="fa-solid fa-shield"></i> SIMULATED DEMO ENVIRONMENT
                </span>
            </div>

            <div className="cloud-cards-grid">
                {clouds.map(c => (
                    <div key={c.id} className="cloud-provider-card">
                        <div className="cloud-card-header">
                            <div className="cloud-identity">
                                <div className={`cloud-logo-box ${c.code.toLowerCase()}`}>
                                    {c.code === 'AWS' && <i className="fa-brands fa-aws"></i>}
                                    {c.code === 'Azure' && <i className="fa-brands fa-microsoft"></i>}
                                    {c.code === 'GCP' && <i className="fa-brands fa-google"></i>}
                                </div>
                                <div className="cloud-title-box">
                                    <h3>{c.name}</h3>
                                    <p>{c.region}</p>
                                </div>
                            </div>
                            <span className="badge-demo">DEMO DATA</span>
                        </div>

                        <div className="cloud-stats-row">
                            <div className="cloud-stat-item">
                                <span>Cloud Status</span>
                                <div className="status-pill success" style={{ marginTop: '4px' }}>
                                    <span className="status-indicator-dot green"></span>
                                    {c.status}
                                </div>
                            </div>
                            <div className="cloud-stat-item">
                                <span>Hosted Apps</span>
                                <strong>{c.apps_count} Workloads</strong>
                            </div>
                        </div>

                        <div className="resource-bar-group">
                            <div className="resource-bar-label">
                                <span>Compute (vCPU Allocation)</span>
                                <span>{c.cpu_usage}%</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill blue" style={{ width: `${c.cpu_usage}%` }}></div>
                            </div>
                        </div>

                        <div className="resource-bar-group">
                            <div className="resource-bar-label">
                                <span>RAM (Cluster Memory)</span>
                                <span>{c.memory_usage}%</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill purple" style={{ width: `${c.memory_usage}%` }}></div>
                            </div>
                        </div>

                        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '12px', border: '1px solid var(--card-border-subtle)', margin: '14px 0', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Kubernetes Cluster:</span>
                                <strong>{c.code.toLowerCase()}-k8s-prod-01</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Provisioning Engine:</span>
                                <strong>Terraform v1.7.0</strong>
                            </div>
                        </div>

                        <div className="cloud-card-footer">
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Provider: {c.code}
                            </span>
                            <button className="btn-primary" style={{ padding: '8px 14px', fontSize: '12px' }} onClick={() => onDeployToCloud(c.code)}>
                                <i className="fa-solid fa-play"></i> Deploy to {c.code}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// View 3: Deployment Management
// -------------------------------------------------------------
function DeploymentsView({ deployments, onOpenDeploy, activeSimulation }) {
    const [filterCloud, setFilterCloud] = useState('ALL');

    const filtered = filterCloud === 'ALL' 
        ? deployments 
        : deployments.filter(d => d.cloud_provider.toUpperCase() === filterCloud.toUpperCase());

    return (
        <div>
            {/* Deploy Action Header Banner */}
            <div className="deploy-action-header">
                <div className="deploy-action-header-text">
                    <h3>Continuous Deployment Management</h3>
                    <p>Deploy application container workloads with zero downtime across AWS, Azure, and Google Cloud.</p>
                </div>
                <button className="btn-primary" onClick={onOpenDeploy}>
                    <i className="fa-solid fa-rocket"></i> Deploy Application
                </button>
            </div>

            {/* Filter controls */}
            <div className="filter-bar">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark-blue)' }}>Filter by Cloud:</span>
                {['ALL', 'AWS', 'Azure', 'GCP'].map(c => (
                    <button 
                        key={c}
                        className={`btn-secondary ${filterCloud === c ? 'active' : ''}`}
                        style={{ padding: '6px 14px', background: filterCloud === c ? '#e0f2fe' : '#ffffff', borderColor: filterCloud === c ? 'var(--cloud-blue)' : '#cbd5e1' }}
                        onClick={() => setFilterCloud(c)}
                    >
                        {c}
                    </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Total: {filtered.length} deployments
                </span>
            </div>

            {/* Deployments Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Application</th>
                            <th>Cloud Provider</th>
                            <th>Version</th>
                            <th>Environment</th>
                            <th>Status</th>
                            <th>Pipeline Stage</th>
                            <th>Progress</th>
                            <th>Deployment Date</th>
                            <th>Deployed By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(dep => (
                            <tr key={dep.id}>
                                <td><strong>#{dep.id}</strong></td>
                                <td>
                                    <strong>{dep.app_name}</strong>
                                </td>
                                <td>
                                    <span className="status-pill" style={{ background: '#e0f2fe', color: 'var(--secondary-dark-blue)' }}>
                                        {dep.cloud_provider}
                                    </span>
                                </td>
                                <td><code>{dep.version}</code></td>
                                <td>{dep.environment}</td>
                                <td>
                                    <span className={`status-pill ${dep.status === 'Success' ? 'success' : (dep.status === 'Failed' ? 'failed' : 'in_progress')}`}>
                                        <span className={`status-indicator-dot ${dep.status === 'Success' ? 'green' : (dep.status === 'Failed' ? 'red' : 'amber')}`}></span>
                                        {dep.status}
                                    </span>
                                </td>
                                <td>{dep.stage}</td>
                                <td style={{ width: '120px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="progress-track" style={{ flex: 1, height: '6px' }}>
                                            <div 
                                                className={`progress-fill ${dep.status === 'Success' ? 'green' : (dep.status === 'Failed' ? 'red' : 'blue')}`} 
                                                style={{ width: `${dep.progress || 100}%` }}
                                            ></div>
                                        </div>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dep.progress || 100}%</span>
                                    </div>
                                </td>
                                <td>{dep.created_at}</td>
                                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dep.deployed_by}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// View 4: CI/CD Pipeline
// -------------------------------------------------------------
function PipelineView({ pipeline, onTriggerPipeline }) {
    const [activeStageDetail, setActiveStageDetail] = useState(null);

    const stages = pipeline?.stages || [
        { id: "github", title: "GitHub", tool: "GitHub Enterprise", status: "Success", duration: "4s", output: "Push event to main branch" },
        { id: "jenkins", title: "Jenkins", tool: "Jenkins Master", status: "Success", duration: "8s", output: "Triggered declarative pipeline" },
        { id: "build", title: "Build", tool: "Python 3.12", status: "Success", duration: "28s", output: "Assets packaged into wheels" },
        { id: "test", title: "Test", tool: "PyTest Suite", status: "Success", duration: "19s", output: "48 tests passed (0 failures)" },
        { id: "docker", title: "Docker", tool: "Docker Engine", status: "Success", duration: "35s", output: "Built image multicloud:latest" },
        { id: "k8s", title: "Kubernetes", tool: "kubectl / Helm", status: "Success", duration: "22s", output: "Applied deployment.yaml (2 replicas)" },
        { id: "cloud", title: "Cloud Deployment", tool: "AWS / Azure / GCP", status: "Success", duration: "40s", output: "Multi-cloud endpoints live" }
    ];

    const getStageIcon = (id) => {
        switch (id) {
            case 'github': return <i className="fa-brands fa-github"></i>;
            case 'jenkins': return <i className="fa-brands fa-jenkins"></i>;
            case 'build': return <i className="fa-solid fa-hammer"></i>;
            case 'test': return <i className="fa-solid fa-vial-circle-check"></i>;
            case 'docker': return <i className="fa-brands fa-docker"></i>;
            case 'k8s': return <i className="fa-solid fa-dharmachakra"></i>;
            case 'cloud': return <i className="fa-solid fa-cloud"></i>;
            default: return <i className="fa-solid fa-circle-check"></i>;
        }
    };

    return (
        <div>
            {/* Header info */}
            <div className="deploy-action-header">
                <div className="deploy-action-header-text">
                    <h3>Visual Continuous Delivery Pipeline</h3>
                    <p>Automated pipeline flow: GitHub &rarr; Jenkins &rarr; Build &rarr; Test &rarr; Docker &rarr; Kubernetes &rarr; Multi-Cloud Deployment</p>
                </div>
                <button className="btn-primary" onClick={onTriggerPipeline}>
                    <i className="fa-solid fa-play"></i> Trigger CI/CD Pipeline
                </button>
            </div>

            {/* Interactive Visual Pipeline Diagram */}
            <div className="pipeline-visual-wrapper">
                <div className="pipeline-diagram">
                    {stages.map((st, index) => (
                        <React.Fragment key={st.id}>
                            <div 
                                className="pipeline-node"
                                onClick={() => setActiveStageDetail(st)}
                            >
                                <div className="pipeline-circle">
                                    {getStageIcon(st.id)}
                                </div>
                                <div className="pipeline-title">{st.title}</div>
                                <div className="pipeline-tool">{st.tool}</div>
                                <span className="status-pill success" style={{ marginTop: '6px', fontSize: '10px' }}>
                                    <i className="fa-solid fa-check"></i> {st.duration}
                                </span>
                            </div>

                            {index < stages.length - 1 && (
                                <div className="pipeline-connector pulse-flow"></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Stage Detail Card */}
            <div className="card-white" style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', color: 'var(--primary-dark-blue)', marginBottom: '12px' }}>
                    <i className="fa-solid fa-terminal" style={{ color: 'var(--cloud-blue)', marginRight: '8px' }}></i>
                    Stage Execution Inspector: <strong>{activeStageDetail ? activeStageDetail.title : 'Overview (Click any stage above)'}</strong>
                </h4>
                <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px' }}>
                    {activeStageDetail ? (
                        <>
                            <div>[INFO] Stage: {activeStageDetail.title} ({activeStageDetail.tool})</div>
                            <div>[INFO] Status: {activeStageDetail.status} | Execution Time: {activeStageDetail.duration}</div>
                            <div style={{ color: '#4ade80', marginTop: '6px' }}>[SUCCESS] {activeStageDetail.output}</div>
                        </>
                    ) : (
                        <div>
                            <div>[INFO] Pipeline: Multi-Cloud Production Continuous Delivery</div>
                            <div>[INFO] Target: Amazon Web Services (ECS/EKS) | Microsoft Azure (AKS) | Google Cloud (GKE)</div>
                            <div style={{ color: '#4ade80', marginTop: '4px' }}>[SUCCESS] All 7 pipeline stages verified and operational. Click on any stage above to view granular logs.</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pipeline Configuration Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card-light-blue">
                    <h4 style={{ marginBottom: '10px', fontSize: '15px', color: 'var(--secondary-dark-blue)' }}>
                        <i className="fa-brands fa-jenkins" style={{ marginRight: '8px' }}></i> Jenkins Pipeline Automation
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-navy)', marginBottom: '10px' }}>
                        Defined in <code>Jenkinsfile</code> using Declarative syntax with stages:
                    </p>
                    <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        <li>1. Checkout Source Code from GitHub</li>
                        <li>2. Install Dependencies via pip</li>
                        <li>3. Run Automated Unit & Security Tests</li>
                        <li>4. Build & Tag Docker Container Image</li>
                        <li>5. Deploy to Multi-Cloud Clusters</li>
                        <li>6. Verify Application Health & SLA</li>
                    </ul>
                </div>

                <div className="card-light-blue">
                    <h4 style={{ marginBottom: '10px', fontSize: '15px', color: 'var(--secondary-dark-blue)' }}>
                        <i className="fa-solid fa-dharmachakra" style={{ marginRight: '8px' }}></i> Kubernetes Orchestration
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-navy)', marginBottom: '10px' }}>
                        Defined in <code>k8s/deployment.yaml</code> and <code>k8s/service.yaml</code>:
                    </p>
                    <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                        <li>Replicas: 2 High-Availability Pods</li>
                        <li>Probes: Liveness & Readiness healthchecks</li>
                        <li>Rolling Updates: Zero-downtime container replacement</li>
                        <li>Service: LoadBalancer exposing internal port 5000</li>
                        <li>Auto-scaling: Horizontal Pod Autoscaler (HPA) configured</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// View 5: Monitoring View (Charts & Graphs)
// -------------------------------------------------------------
function MonitoringView({ metrics }) {
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
                    datasets: [
                        { label: 'AWS CPU (%)', data: metrics.cpu_utilization.aws, borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', tension: 0.3, fill: true },
                        { label: 'Azure CPU (%)', data: metrics.cpu_utilization.azure, borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.1)', tension: 0.3, fill: true },
                        { label: 'GCP CPU (%)', data: metrics.cpu_utilization.gcp, borderColor: '#ea4335', backgroundColor: 'rgba(234, 67, 53, 0.1)', tension: 0.3, fill: true }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // 2. Memory Chart
        if (memChartRef.current) {
            memChartInstance.current = new Chart(memChartRef.current, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [
                        { label: 'AWS Memory (%)', data: metrics.memory_utilization.aws, borderColor: '#f59e0b', tension: 0.3 },
                        { label: 'Azure Memory (%)', data: metrics.memory_utilization.azure, borderColor: '#0284c7', tension: 0.3 },
                        { label: 'GCP Memory (%)', data: metrics.memory_utilization.gcp, borderColor: '#ea4335', tension: 0.3 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // 3. Response Time Chart
        if (latencyChartRef.current) {
            latencyChartInstance.current = new Chart(latencyChartRef.current, {
                type: 'bar',
                data: {
                    labels: timestamps,
                    datasets: [
                        { label: 'AWS Latency (ms)', data: metrics.response_time_ms.aws, backgroundColor: '#f59e0b' },
                        { label: 'Azure Latency (ms)', data: metrics.response_time_ms.azure, backgroundColor: '#0284c7' },
                        { label: 'GCP Latency (ms)', data: metrics.response_time_ms.gcp, backgroundColor: '#ea4335' }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // 4. Requests Throughput Chart
        if (trafficChartRef.current) {
            trafficChartInstance.current = new Chart(trafficChartRef.current, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [
                        { 
                            label: 'Requests / Min', 
                            data: metrics.requests_per_minute || [120, 140, 180, 210, 205, 240, 270, 260],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.3
                        }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        return () => {
            if (cpuChartInstance.current) cpuChartInstance.current.destroy();
            if (memChartInstance.current) memChartInstance.current.destroy();
            if (latencyChartInstance.current) latencyChartInstance.current.destroy();
            if (trafficChartInstance.current) trafficChartInstance.current.destroy();
        };
    }, [metrics]);

    return (
        <div>
            {/* Availability & Uptime Bar */}
            <div className="metrics-grid-4" style={{ marginBottom: '24px' }}>
                <div className="metric-card">
                    <span className="metric-card-title">Overall Uptime</span>
                    <div className="metric-card-value" style={{ color: 'var(--success-green)' }}>
                        {metrics?.uptime_percentage || '99.94'}%
                    </div>
                    <div className="metric-card-subtext">Verified past 30 days</div>
                </div>

                <div className="metric-card">
                    <span className="metric-card-title">AWS Availability</span>
                    <div className="metric-card-value">{metrics?.cloud_availability?.AWS || '99.98'}%</div>
                    <div className="metric-card-subtext">us-east-1 N. Virginia</div>
                </div>

                <div className="metric-card">
                    <span className="metric-card-title">Azure Availability</span>
                    <div className="metric-card-value">{metrics?.cloud_availability?.Azure || '99.95'}%</div>
                    <div className="metric-card-subtext">eastus Virginia</div>
                </div>

                <div className="metric-card">
                    <span className="metric-card-title">GCP Availability</span>
                    <div className="metric-card-value">{metrics?.cloud_availability?.GCP || '99.99'}%</div>
                    <div className="metric-card-subtext">us-central1 Iowa</div>
                </div>
            </div>

            {/* Charts 2x2 Grid */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <h4><i className="fa-solid fa-microchip" style={{ color: 'var(--cloud-blue)', marginRight: '8px' }}></i> CPU Utilization (%)</h4>
                        <span className="badge-demo">PROMETHEUS SCRAPED</span>
                    </div>
                    <div className="chart-container">
                        <canvas ref={cpuChartRef}></canvas>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h4><i className="fa-solid fa-memory" style={{ color: '#9333ea', marginRight: '8px' }}></i> Memory Utilization (%)</h4>
                        <span className="badge-demo">PROMETHEUS SCRAPED</span>
                    </div>
                    <div className="chart-container">
                        <canvas ref={memChartRef}></canvas>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h4><i className="fa-solid fa-stopwatch" style={{ color: '#f59e0b', marginRight: '8px' }}></i> Application Response Time (ms)</h4>
                        <span className="badge-demo">LATENCY SLA</span>
                    </div>
                    <div className="chart-container">
                        <canvas ref={latencyChartRef}></canvas>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h4><i className="fa-solid fa-wave-square" style={{ color: 'var(--success-green)', marginRight: '8px' }}></i> Request Traffic (Requests / Min)</h4>
                        <span className="badge-demo">GLOBAL INGRESS</span>
                    </div>
                    <div className="chart-container">
                        <canvas ref={trafficChartRef}></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// View 6: System Logs View
// -------------------------------------------------------------
function LogsView({ logs, onRefresh }) {
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
        const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `multicloud-logs-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    return (
        <div>
            {/* Filter Bar */}
            <div className="filter-bar">
                <input 
                    type="text" 
                    className="filter-input" 
                    placeholder="Search logs by keyword or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select 
                    className="form-select" 
                    style={{ width: '150px' }}
                    value={filterCloud}
                    onChange={(e) => setFilterCloud(e.target.value)}
                >
                    <option value="ALL">All Clouds</option>
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="GCP">GCP</option>
                </select>

                <select 
                    className="form-select" 
                    style={{ width: '150px' }}
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                >
                    <option value="ALL">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                </select>

                <button className="btn-secondary" onClick={onRefresh}>
                    <i className="fa-solid fa-rotate"></i> Refresh
                </button>

                <button className="btn-secondary" onClick={exportLogs}>
                    <i className="fa-solid fa-download"></i> Export JSON
                </button>
            </div>

            {/* Terminal Card */}
            <div className="terminal-card">
                <div className="terminal-header">
                    <div className="terminal-dots">
                        <div className="terminal-dot red"></div>
                        <div className="terminal-dot yellow"></div>
                        <div className="terminal-dot green"></div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        multicloud-devops-engine &middot; Showing {filtered.length} entries
                    </div>
                    <div style={{ fontSize: '11px', color: '#38bdf8' }}>
                        Live Stream &bull;
                    </div>
                </div>

                <div className="terminal-body">
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>
                            No logs found matching selected criteria.
                        </div>
                    ) : (
                        filtered.map(l => (
                            <div key={l.id} className="terminal-log-line">
                                <span className="log-time">{l.timestamp}</span>
                                <span className={`log-lvl ${l.level}`}>{l.level}</span>
                                <span className="log-cloud">[{l.cloud_provider}]</span>
                                <span style={{ color: '#94a3b8', width: '120px' }}>{l.service}:</span>
                                <span className="log-text">{l.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Render the application
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
