function App() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>System Overview</h1>
          <p>Real-time analytics and platform performance metrics.</p>
        </div>
        <div className="header-actions">
          {/* Add actions if needed */}
        </div>
      </header>

      <main>
        <div className="content-grid">
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">System Performance</h2>
              <button style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.75rem',
                cursor: 'pointer',
              }}
              >
                View Details
              </button>
            </div>
            <div style={{
              height: '300px',
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              border: '1px dashed var(--border-color)',
            }}
            >
              {/* Visualization Placeholder */}
              Performance Chart Visualization
            </div>
          </section>

          <aside className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Recent Activity</h2>
            </div>
            <div className="activity-list">
              {[
                { name: 'System Update', type: 'Deployment successful', time: '2m ago' },
                { name: 'New User', type: 'Registration: Alex Rivera', time: '15m ago' },
                { name: 'Security Alert', type: 'Failed login attempt detected', time: '1h ago' },
                { name: 'Database Backup', type: 'Automated backup completed', time: '3h ago' },
                { name: 'Optimization', type: 'Cache cleared globally', time: '5h ago' },
              ].map((item, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-avatar" />
                  <div className="activity-info">
                    <h4>{item.name}</h4>
                    <p>{item.type}</p>
                  </div>
                  <span className="activity-time">{item.time}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
