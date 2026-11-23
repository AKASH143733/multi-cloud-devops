# Multi-Cloud DevOps Frontend

This directory contains the standalone React frontend source code for the **Multi-Cloud Application Deployment and Management Dashboard**.

## Technologies Used
- React 18
- Chart.js for real-time telemetry graphs
- Modern CSS with responsive flexbox and CSS grid

## Development
To run the frontend in standalone Vite dev mode:
```bash
npm install
npm run dev
```

Note: The full-stack application is served directly by the Flask backend (`python app.py`) from `static/js/app.js` and `templates/index.html` for zero-configuration local execution and Docker deployments.
