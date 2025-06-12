// react-dashboard/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiResults, setApiResults] = useState({
    gofiber: null,
    wordpress: null,
    loading: false,
    error: null
  });

  const testAPI = async (endpoint, name) => {
    setApiResults(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use relative URL to avoid CORS (proxy through nginx)
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResults(prev => ({
        ...prev,
        [name]: { success: true, data, status: response.status },
        loading: false
      }));
    } catch (err) {
      setApiResults(prev => ({
        ...prev,
        [name]: { success: false, error: err.message },
        loading: false
      }));
    }
  };

  const createTestRecord = async () => {
    setApiResults(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use relative URL to avoid CORS (proxy through nginx)
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Test Record ${Date.now()}`,
          value: `Created via Dashboard at ${new Date().toLocaleString()}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      alert('Record created successfully!');
      // Refresh the data
      testAPI('/api/data', 'gofiber');
    } catch (err) {
      alert(`Error creating record: ${err.message}`);
    }
  };

  useEffect(() => {
    // Test APIs on load
    testAPI('/api/data', 'gofiber');
    testAPI('/api/posts', 'wordpress');
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 APISIX Gateway Dashboard</h1>
        <p>Monitor your API Gateway and test endpoints</p>
      </header>

      <main className="main-content">
        <div className="status-cards">
          <div className="status-card">
            <h3>🏗️ APISIX Gateway</h3>
            <div className="status active">
              <span className="indicator"></span>
              Active (Standalone Mode)
            </div>
            <p>API Gateway running on port 9080</p>
          </div>

          <div className="status-card">
            <h3>⚡ GoFiber Backend</h3>
            <div className={`status ${apiResults.gofiber?.success ? 'active' : 'error'}`}>
              <span className="indicator"></span>
              {apiResults.gofiber?.success ? 'Connected' : 'Error'}
            </div>
            <p>Custom API with MariaDB</p>
          </div>

          <div className="status-card">
            <h3>📝 WordPress API</h3>
            <div className={`status ${apiResults.wordpress?.success ? 'active' : 'error'}`}>
              <span className="indicator"></span>
              {apiResults.wordpress?.success ? 'Connected' : 'Error'}
            </div>
            <p>Content management API</p>
          </div>
        </div>

        <div className="api-section">
          <h2>🧪 API Testing</h2>
          
          <div className="test-buttons">
            <button 
              onClick={() => testAPI('/api/data', 'gofiber')}
              className="btn btn-primary"
              disabled={apiResults.loading}
            >
              Test GoFiber API
            </button>
            
            <button 
              onClick={() => testAPI('/api/posts', 'wordpress')}
              className="btn btn-primary"
              disabled={apiResults.loading}
            >
              Test WordPress API
            </button>
            
            <button 
              onClick={createTestRecord}
              className="btn btn-secondary"
              disabled={apiResults.loading}
            >
              Create Test Record
            </button>
          </div>

          {apiResults.loading && (
            <div className="loading">Testing APIs...</div>
          )}

          <div className="results-grid">
            {apiResults.gofiber && (
              <div className="result-card">
                <h4>GoFiber API Result</h4>
                <div className={`result-status ${apiResults.gofiber.success ? 'success' : 'error'}`}>
                  {apiResults.gofiber.success ? '✅ Success' : '❌ Failed'}
                </div>
                {apiResults.gofiber.success ? (
                  <div className="result-data">
                    <p><strong>Records found:</strong> {apiResults.gofiber.data.count || 0}</p>
                    <pre>{JSON.stringify(apiResults.gofiber.data, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="result-error">
                    Error: {apiResults.gofiber.error}
                  </div>
                )}
              </div>
            )}

            {apiResults.wordpress && (
              <div className="result-card">
                <h4>WordPress API Result</h4>
                <div className={`result-status ${apiResults.wordpress.success ? 'success' : 'error'}`}>
                  {apiResults.wordpress.success ? '✅ Success' : '❌ Failed'}
                </div>
                {apiResults.wordpress.success ? (
                  <div className="result-data">
                    <p><strong>Posts found:</strong> {Array.isArray(apiResults.wordpress.data) ? apiResults.wordpress.data.length : 1}</p>
                    <pre>{JSON.stringify(apiResults.wordpress.data, null, 2).substring(0, 500)}...</pre>
                  </div>
                ) : (
                  <div className="result-error">
                    Error: {apiResults.wordpress.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="info-section">
          <h2>📋 Available Endpoints</h2>
          <div className="endpoints-grid">
            <div className="endpoint-card">
              <h4>GoFiber Data API</h4>
              <code>GET /api/data</code>
              <code>POST /api/data</code>
              <code>PUT /api/data/:id</code>
              <code>DELETE /api/data/:id</code>
              <p>Custom backend with CRUD operations</p>
            </div>
            <div className="endpoint-card">
              <h4>WordPress Posts API</h4>
              <code>GET /api/posts</code>
              <code>POST /api/posts</code>
              <p>WordPress REST API for content management</p>
            </div>
          </div>
        </div>

        <div className="direct-links">
          <h2>🔗 Direct Access</h2>
          <div className="links-grid">
            <a href="http://localhost:8080/health" target="_blank" rel="noopener noreferrer" className="link-card">
              <h4>GoFiber Health Check</h4>
              <p>Direct backend health status</p>
            </a>
            <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer" className="link-card">
              <h4>WordPress Admin</h4>
              <p>WordPress dashboard</p>
            </a>
            <a href="http://localhost:9080/api/data" target="_blank" rel="noopener noreferrer" className="link-card">
              <h4>API Gateway Data</h4>
              <p>GoFiber API through APISIX</p>
            </a>
            <a href="http://localhost:9080/api/posts" target="_blank" rel="noopener noreferrer" className="link-card">
              <h4>API Gateway Posts</h4>
              <p>WordPress API through APISIX</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;