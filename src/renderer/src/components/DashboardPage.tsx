import { useState } from 'react'
import cleaveLogo from '../assets/cleavedb-logo.png'

interface DashboardPageProps {
  username: string
  onSignOut: () => void
}

interface DatabaseItem {
  id: string
  name: string
  engine: string
  status: 'Online' | 'Syncing' | 'Optimizing'
  size: string
  collections: number
  latency: string
  lastActive: string
}

const INITIAL_DATABASES: DatabaseItem[] = [
  {
    id: 'db-1',
    name: 'analytics_events_prod',
    engine: 'Columnar LSM',
    status: 'Online',
    size: '8.2 GB',
    collections: 8,
    latency: '0.62 ms',
    lastActive: 'Just now'
  },
  {
    id: 'db-2',
    name: 'user_vault_store',
    engine: 'Document Vector',
    status: 'Online',
    size: '4.1 GB',
    collections: 4,
    latency: '0.84 ms',
    lastActive: '12s ago'
  },
  {
    id: 'db-3',
    name: 'realtime_session_cache',
    engine: 'In-Memory KeyValue',
    status: 'Online',
    size: '1.2 GB',
    collections: 2,
    latency: '0.21 ms',
    lastActive: '1s ago'
  },
  {
    id: 'db-4',
    name: 'audit_journal_immutable',
    engine: 'Append-Only Log',
    status: 'Syncing',
    size: '4.9 GB',
    collections: 2,
    latency: '1.05 ms',
    lastActive: '3m ago'
  }
]

export default function DashboardPage({ username, onSignOut }: DashboardPageProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'overview' | 'databases' | 'query' | 'settings'>('overview')
  const [queryInput, setQueryInput] = useState(
    'SELECT collection_name, doc_count, memory_bytes FROM _sys.collections ORDER BY memory_bytes DESC LIMIT 5;'
  )
  const [queryExecuted, setQueryExecuted] = useState(false)
  const [queryRunning, setQueryRunning] = useState(false)
  const [databases] = useState<DatabaseItem[]>(INITIAL_DATABASES)
  const [searchFilter, setSearchFilter] = useState('')

  const handleRunQuery = (): void => {
    setQueryRunning(true)
    setTimeout(() => {
      setQueryRunning(false)
      setQueryExecuted(true)
    }, 280)
  }

  const filteredDatabases = databases.filter((db) =>
    db.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const userInitial = (username || 'Developer').charAt(0).toUpperCase()

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-group">
            <img src={cleaveLogo} alt="CleaveDB Logo" className="sidebar-logo" />
            <span className="sidebar-brand-name">CleaveDB</span>
          </div>
          <span className="sidebar-badge">v2.4.1</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            <span>Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'databases' ? 'active' : ''}`}
            onClick={() => setActiveTab('databases')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <span>Databases</span>
            <span className="nav-count">{databases.length}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'query' ? 'active' : ''}`}
            onClick={() => setActiveTab('query')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <span>Query Console</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer with Logged in Profile */}
        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-avatar-circle">
              {userInitial}
            </div>
            <div className="user-details">
              <span className="user-username">{username || 'Developer'}</span>
              <span className="user-status-pill">
                <span className="status-dot-green" />
                Connected
              </span>
            </div>
            <button
              type="button"
              className="signout-button"
              onClick={onSignOut}
              title="Sign out and return to login"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        {/* Top Navbar */}
        <header className="dashboard-top-header">
          <div className="header-breadcrumbs">
            <span className="breadcrumb-muted">CleaveDB</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-muted">Clusters</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">primary-cluster-01</span>
          </div>

          <div className="header-actions">
            <div className="cluster-health-badge">
              <span className="status-dot-green" />
              <span>US-East · Latency: 0.8ms</span>
            </div>
            <button type="button" className="action-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New Database</span>
            </button>
          </div>
        </header>

        {/* Dashboard Body Scrollable Area */}
        <div className="dashboard-body">
          {/* Welcome Banner */}
          <section className="welcome-banner">
            <div className="welcome-text">
              <h1 className="welcome-title">Welcome back, {username || 'Developer'} 👋</h1>
              <p className="welcome-subtitle">
                Your CleaveDB cluster is healthy and processing queries with sub-millisecond latency.
              </p>
            </div>
          </section>

          {/* Quick Metrics Cards */}
          <section className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Total Storage</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">18.4 GB</div>
              <div className="metric-bar-container">
                <div className="metric-bar-fill" style={{ width: '61%' }} />
              </div>
              <span className="metric-footer">61% of 30 GB SSD Pool</span>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Active Databases</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">4</div>
              <span className="metric-footer">16 collections · 2.4M records</span>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Cluster IOPS</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">5,420 /s</div>
              <span className="metric-footer">3,840 read · 1,580 write</span>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Average Latency</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">0.85 ms</div>
              <span className="metric-footer">p99: 1.82 ms · 99.99% uptime</span>
            </div>
          </section>

          {/* Databases Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">Database Catalogs</h2>
                <span className="section-tag">{filteredDatabases.length} Available</span>
              </div>
              <div className="search-input-wrapper">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter databases..."
                  className="search-input"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrapper">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Database Name</th>
                    <th>Storage Engine</th>
                    <th>Status</th>
                    <th>Size</th>
                    <th>Collections</th>
                    <th>Latency</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDatabases.map((db) => (
                    <tr key={db.id}>
                      <td>
                        <div className="db-name-cell">
                          <span className="db-disk-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <ellipse cx="12" cy="5" rx="9" ry="3" />
                              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                            </svg>
                          </span>
                          <span className="db-name-text">{db.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="engine-badge">{db.engine}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${db.status.toLowerCase()}`}>
                          <span className={`dot-${db.status.toLowerCase()}`} />
                          {db.status}
                        </span>
                      </td>
                      <td className="cell-muted">{db.size}</td>
                      <td className="cell-muted">{db.collections}</td>
                      <td className="cell-muted">{db.latency}</td>
                      <td className="cell-muted">{db.lastActive}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => {
                            setActiveTab('query')
                            setQueryInput(`SELECT * FROM ${db.name}.collections LIMIT 10;`)
                          }}
                        >
                          Query
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick Query Console Widget */}
          <section className="dashboard-section query-widget-section">
            <div className="section-header">
              <div className="section-title-group">
                <h2 className="section-title">Interactive Query Console</h2>
                <span className="section-tag">Direct Engine Access</span>
              </div>
              <button
                type="button"
                className="run-query-btn"
                onClick={handleRunQuery}
                disabled={queryRunning}
              >
                {queryRunning ? (
                  <span>Executing...</span>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Execute Query</span>
                  </>
                )}
              </button>
            </div>

            <div className="query-editor-card">
              <div className="query-editor-header">
                <span className="query-prompt-label">SQL / CleaveQL</span>
                <span className="query-target-db">Target: primary-cluster-01</span>
              </div>
              <textarea
                className="query-textarea"
                rows={3}
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
              />
            </div>

            {queryExecuted && (
              <div className="query-result-card">
                <div className="query-result-meta">
                  <span className="result-status-text">
                    ✓ Query completed in 0.72 ms · 3 rows returned
                  </span>
                </div>
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>collection_name</th>
                      <th>doc_count</th>
                      <th>memory_bytes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>analytics_daily_pageviews</td>
                      <td>1,420,500</td>
                      <td>4.2 GB</td>
                    </tr>
                    <tr>
                      <td>user_auth_tokens</td>
                      <td>280,000</td>
                      <td>840 MB</td>
                    </tr>
                    <tr>
                      <td>audit_transaction_events</td>
                      <td>719,500</td>
                      <td>1.6 GB</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
