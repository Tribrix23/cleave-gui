import { useState, useEffect, useRef } from 'react'
import cleaveLogo from '../assets/cleavedb-logo.png'

interface DashboardPageProps {
  username: string
  onSignOut: () => void
}

interface SystemStorage {
  totalGB: number
  freeGB: number
  usedGB: number
  percentUsed: number
  drive: string
}

interface RequestDataPoint {
  id: number
  time: string
  requests: number
  latency: number
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
  },
  {
    id: 'db-5',
    name: 'orders_fulfillment_db',
    engine: 'Document Vector',
    status: 'Online',
    size: '14.6 GB',
    collections: 12,
    latency: '0.73 ms',
    lastActive: '4s ago'
  },
  {
    id: 'db-6',
    name: 'timeseries_metrics_local',
    engine: 'Columnar LSM',
    status: 'Online',
    size: '21.8 GB',
    collections: 6,
    latency: '0.38 ms',
    lastActive: '2s ago'
  },
  {
    id: 'db-7',
    name: 'auth_tokens_kv',
    engine: 'In-Memory KeyValue',
    status: 'Online',
    size: '750 MB',
    collections: 3,
    latency: '0.15 ms',
    lastActive: 'Just now'
  },
  {
    id: 'db-8',
    name: 'vector_search_embeddings',
    engine: 'Vector HNSW',
    status: 'Online',
    size: '16.4 GB',
    collections: 5,
    latency: '1.14 ms',
    lastActive: '18s ago'
  },
  {
    id: 'db-9',
    name: 'config_metadata_store',
    engine: 'Append-Only Log',
    status: 'Online',
    size: '2.3 GB',
    collections: 4,
    latency: '0.42 ms',
    lastActive: '42s ago'
  }
]

// Generate realistic initial chart data
function generateInitialPoints(): RequestDataPoint[] {
  const points: RequestDataPoint[] = []
  const now = Date.now()
  const baseReq = 3400

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 1500)
    const timeStr = timestamp.toTimeString().split(' ')[0]
    // Organic wave pattern with random variance
    const variance = Math.sin(i * 0.45) * 850 + (Math.random() * 400 - 200)
    const req = Math.round(baseReq + variance)
    const lat = parseFloat((0.65 + Math.random() * 0.35).toFixed(2))
    points.push({
      id: 25 - i,
      time: timeStr,
      requests: req,
      latency: lat
    })
  }
  return points
}

export default function DashboardPage({ username, onSignOut }: DashboardPageProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'overview' | 'databases' | 'cleaveql' | 'settings'>('overview')
  const [databases] = useState<DatabaseItem[]>(INITIAL_DATABASES)
  const [searchFilter, setSearchFilter] = useState('')

  // Live real computer storage
  const [systemStorage, setSystemStorage] = useState<SystemStorage>({
    totalGB: 256,
    freeGB: 64,
    usedGB: 192,
    percentUsed: 75,
    drive: 'C:'
  })

  // Real-time Line Chart Points
  const [chartPoints, setChartPoints] = useState<RequestDataPoint[]>(generateInitialPoints)
  const [hoveredPoint, setHoveredPoint] = useState<RequestDataPoint | null>(null)
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // CleaveQL State
  const [cqlQuery, setCqlQuery] = useState(`POUR INTO users "jane" {
  "name": "Jane",
  "age": 25,
  "city": "Manila"
}`)
  const [cqlResultTab, setCqlResultTab] = useState<'document' | 'raw' | 'metadata'>('document')
  const [cqlExecutionTime, setCqlExecutionTime] = useState('12 ms')
  const [cqlCopied, setCqlCopied] = useState(false)
  const [cqlHistory, setCqlHistory] = useState<Array<{ id: string; query: string; status: 'Success'; duration: string }>>([
    {
      id: 'h-1',
      query: 'POUR INTO users "jane" { "name": "Jane", "age": 25, "city": "Manila" }',
      status: 'Success',
      duration: '12 ms'
    },
    {
      id: 'h-2',
      query: 'SCOOP users',
      status: 'Success',
      duration: '8 ms'
    },
    {
      id: 'h-3',
      query: 'SHOW BUCKETS',
      status: 'Success',
      duration: '3 ms'
    },
    {
      id: 'h-4',
      query: 'DESCRIBE users',
      status: 'Success',
      duration: '4 ms'
    }
  ])

  const handleRunCql = (): void => {
    const lat = Math.floor(Math.random() * 8 + 8) + ' ms'
    setCqlExecutionTime(lat)
    const normalized = cqlQuery.trim().replace(/\s+/g, ' ')
    const newHistItem = {
      id: 'h-' + Date.now(),
      query: normalized,
      status: 'Success' as const,
      duration: lat
    }
    setCqlHistory((prev) => [newHistItem, ...prev.filter((item) => item.query !== normalized)].slice(0, 8))
  }

  const handleCopyId = (text: string): void => {
    navigator.clipboard?.writeText(text)
    setCqlCopied(true)
    setTimeout(() => setCqlCopied(false), 1500)
  }

  const handleSelectHistoryItem = (queryText: string): void => {
    if (queryText.includes('{')) {
      setCqlQuery(`POUR INTO users "jane" {
  "name": "Jane",
  "age": 25,
  "city": "Manila"
}`)
    } else {
      setCqlQuery(queryText)
    }
  }

  const handleNextExample = (): void => {
    const examples = [
      `POUR INTO users "jane" {
  "name": "Jane",
  "age": 25,
  "city": "Manila"
}`,
      `SCOOP users`,
      `SHOW BUCKETS`,
      `DESCRIBE users`
    ]
    const idx = examples.indexOf(cqlQuery)
    const nextIdx = (idx + 1) % examples.length
    setCqlQuery(examples[nextIdx >= 0 ? nextIdx : 0])
  }

  // Fetch real computer disk storage
  useEffect(() => {
    async function loadStorage(): Promise<void> {
      try {
        if (window.api?.getSystemStorage) {
          const info = await window.api.getSystemStorage()
          setSystemStorage(info)
        }
      } catch (err) {
        console.error('Error fetching system storage:', err)
      }
    }
    loadStorage()
    const storageTimer = setInterval(loadStorage, 10000)
    return () => clearInterval(storageTimer)
  }, [])

  // Real-time live chart updates (pushes new point every 1.5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setChartPoints((prev) => {
        const last = prev[prev.length - 1]
        const now = new Date()
        const timeStr = now.toTimeString().split(' ')[0]
        const randomDelta = (Math.random() - 0.48) * 600
        const newReq = Math.max(1800, Math.min(6200, Math.round(last.requests + randomDelta)))
        const newLat = parseFloat((0.65 + Math.random() * 0.35).toFixed(2))

        const newPoint: RequestDataPoint = {
          id: last.id + 1,
          time: timeStr,
          requests: newReq,
          latency: newLat
        }

        // Keep 25 points moving horizontally
        return [...prev.slice(1), newPoint]
      })
    }, 1500)

    return () => clearInterval(timer)
  }, [])

  const currentRequests = chartPoints[chartPoints.length - 1]?.requests ?? 3450
  const peakRequests = Math.max(...chartPoints.map((p) => p.requests))
  const avgRequests = Math.round(
    chartPoints.reduce((acc, p) => acc + p.requests, 0) / chartPoints.length
  )

  // SVG Chart Dimensions for split layout
  const svgWidth = 560
  const svgHeight = 220
  const paddingX = 35
  const paddingY = 25
  const graphWidth = svgWidth - paddingX * 2
  const graphHeight = svgHeight - paddingY * 2

  const minReq = Math.min(...chartPoints.map((p) => p.requests)) * 0.92
  const maxReq = Math.max(...chartPoints.map((p) => p.requests)) * 1.08

  // Calculate SVG point coordinates
  const coords = chartPoints.map((point, index) => {
    const x = paddingX + (index / (chartPoints.length - 1)) * graphWidth
    const y =
      svgHeight - paddingY - ((point.requests - minReq) / (maxReq - minReq)) * graphHeight
    return { x, y, point }
  })

  // Generate smooth cubic bezier SVG path
  const linePath = coords.reduce((acc, curr, index, arr) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`
    const prev = arr[index - 1]
    const cpX1 = prev.x + (curr.x - prev.x) / 2
    const cpY1 = prev.y
    const cpX2 = prev.x + (curr.x - prev.x) / 2
    const cpY2 = curr.y
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`
  }, '')

  // Area path for gradient under the line
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`

  // Handle Chart Hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const relativeX = (mouseX / rect.width) * svgWidth

    // Find closest data point
    let closestIndex = 0
    let minDistance = Infinity

    coords.forEach((coord, idx) => {
      const dist = Math.abs(coord.x - relativeX)
      if (dist < minDistance) {
        minDistance = dist
        closestIndex = idx
      }
    })

    const closest = coords[closestIndex]
    setHoveredPoint(closest.point)
    setHoverPosition({ x: closest.x, y: closest.y })
  }

  const handleMouseLeave = (): void => {
    setHoveredPoint(null)
    setHoverPosition(null)
  }

  const filteredDatabases = databases.filter((db) =>
    db.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  const userInitial = (username || 'Developer').charAt(0).toUpperCase()

  return (
    <div className="dashboard-container">
      {/* Left Sidebar: Continuous Column with Brand, Navigation & Clickable Profile */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top-section">
          {/* Brand header with NO horizontal dividing line underneath */}
          <div className="sidebar-brand-section">
            <div className="sidebar-logo-group">
              <img src={cleaveLogo} alt="CleaveDB Logo" className="sidebar-logo" />
              <span className="sidebar-brand-name">CleaveDB</span>
            </div>
            <span className="sidebar-badge">v4.0.1</span>
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
              className={`nav-item ${activeTab === 'cleaveql' ? 'active' : ''}`}
              onClick={() => setActiveTab('cleaveql')}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 12 4 7" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span>CleaveQL</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Logged-in Profile (Click opens Settings) */}
        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-avatar-circle">{userInitial}</div>
            <div className="user-details">
              <span className="user-username">{username || 'Developer'}</span>
              <span className="user-status-pill">
                <span className="status-dot-green" />
                Connected
              </span>
            </div>
            <div className="user-profile-actions">
              <button
                type="button"
                className={`profile-action-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
                title="Settings"
                aria-label="Settings"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                type="button"
                className="profile-action-btn signout-btn"
                onClick={onSignOut}
                title="Sign out and return to login"
                aria-label="Sign out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Main Content with Top Header & Dynamic Body */}
      <div className="dashboard-main-content">
        <header className="dashboard-top-header">
          <div className="header-status-section">
            <div className="header-status-group">
              <span className="cluster-indicator-dot" />
              <span className="cluster-header-title">Primary Cluster Active</span>
              <span className="cluster-region-pill">3 Nodes Online · Local PC</span>
            </div>

            <div className="header-actions">
              <div className="cluster-health-badge">
                <span className="status-dot-green" />
                <span>Real-time Stream Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body Scrollable Area */}
        <div className="dashboard-body">
          {activeTab === 'overview' && (
            <>
              {/* Welcome Greeting */}
              <section className="welcome-banner">
            <div className="welcome-text">
              <h1 className="welcome-title">Welcome back, {username || 'Developer'} 👋</h1>
              <p className="welcome-subtitle">
                Real-time operational analytics and cluster telemetry for CleaveDB.
              </p>
            </div>
          </section>

          {/* Core Analytics Cards (Requests, Latency, Databases, Clusters, Computer Storage) */}
          <section className="metrics-grid">
            {/* 1. Requests That Hit The Database */}
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Database Requests</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">{currentRequests.toLocaleString()} <span className="metric-unit">req/s</span></div>
              <span className="metric-footer">1,420,580 Total Hits Today</span>
            </div>

            {/* 2. Latency */}
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Latency</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">0.78 <span className="metric-unit">ms</span></div>
              <span className="metric-footer">p95: 1.25 ms · p99: 2.10 ms</span>
            </div>

            {/* 3. How Many Databases */}
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Databases</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">{databases.length} <span className="metric-unit">Active</span></div>
              <span className="metric-footer">16 Collections · 2.4M records</span>
            </div>

            {/* 4. Clusters */}
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Clusters</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">1 <span className="metric-unit">Cluster (3 Nodes)</span></div>
              <span className="metric-footer">clv-primary-01 · 99.99% Uptime</span>
            </div>

            {/* 5. Computer Storage (Based on the storage of the computer) */}
            <div className="metric-card storage-card-featured">
              <div className="metric-header">
                <span className="metric-label">Computer Storage ({systemStorage.drive})</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="3" />
                    <line x1="2" y1="14" x2="22" y2="14" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">
                {systemStorage.usedGB} <span className="metric-unit">GB / {systemStorage.totalGB} GB</span>
              </div>
              <div className="metric-bar-container">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${systemStorage.percentUsed}%`,
                    backgroundColor: systemStorage.percentUsed > 90 ? '#ef4444' : '#0284c7'
                  }}
                />
              </div>
              <span className="metric-footer">
                {systemStorage.freeGB} GB Free · {systemStorage.percentUsed}% Disk Used
              </span>
            </div>
          </section>

          {/* Side-by-Side Row: Request Live Stream & Nodes (Left) and Full-Height Database Catalogs (Right) */}
          <div className="dashboard-split-row">
            {/* Left Column: Requests Live Stream + Local Cluster Nodes Telemetry */}
            <div className="dashboard-left-col">
              {/* Real-time Line Chart: Requests Hitting The Database with Hover Info */}
              <section className="dashboard-section chart-section">
                <div className="chart-section-header">
                  <div className="chart-title-group">
                    <h2 className="section-title">Database Requests Live Stream</h2>
                    <div className="live-stream-badge">
                      <span className="pulse-dot" />
                      <span>Real-time</span>
                    </div>
                  </div>

                  <div className="chart-stats-summary">
                    <div className="chart-stat-item">
                      <span className="chart-stat-label">Current:</span>
                      <span className="chart-stat-val highlight">{currentRequests.toLocaleString()} req/s</span>
                    </div>
                    <div className="chart-stat-item">
                      <span className="chart-stat-label">Peak:</span>
                      <span className="chart-stat-val">{peakRequests.toLocaleString()} req/s</span>
                    </div>
                    <div className="chart-stat-item">
                      <span className="chart-stat-label">Avg:</span>
                      <span className="chart-stat-val">{avgRequests.toLocaleString()} req/s</span>
                    </div>
                  </div>
                </div>

                {/* Interactive SVG Line Chart Container */}
                <div className="chart-canvas-wrapper" ref={chartContainerRef}>
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="interactive-line-chart"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <defs>
                      {/* Gradient under line */}
                      <linearGradient id="requestAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                        <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                      </linearGradient>

                      {/* Gradient for the line stroke */}
                      <linearGradient id="lineStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={paddingY + graphHeight / 2} x2={svgWidth - paddingX} y2={paddingY + graphHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#e2e8f0" strokeWidth="1" />

                    {/* Y-axis Labels */}
                    <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" className="chart-axis-text">
                      {Math.round(maxReq).toLocaleString()}
                    </text>
                    <text x={paddingX - 8} y={paddingY + graphHeight / 2 + 4} textAnchor="end" className="chart-axis-text">
                      {Math.round((maxReq + minReq) / 2).toLocaleString()}
                    </text>
                    <text x={paddingX - 8} y={svgHeight - paddingY + 4} textAnchor="end" className="chart-axis-text">
                      {Math.round(minReq).toLocaleString()}
                    </text>

                    {/* Area under the line */}
                    <path d={areaPath} fill="url(#requestAreaGrad)" />

                    {/* Curved line chart */}
                    <path d={linePath} fill="none" stroke="url(#lineStrokeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Ambient glow on latest live point */}
                    {coords.length > 0 && (
                      <circle
                        cx={coords[coords.length - 1].x}
                        cy={coords[coords.length - 1].y}
                        r="4"
                        fill="#2563eb"
                        className="live-pulse-dot"
                      />
                    )}

                    {/* Interactive Hover Vertical Guide Line & Indicator Dot */}
                    {hoverPosition && (
                      <>
                        <line
                          x1={hoverPosition.x}
                          y1={paddingY}
                          x2={hoverPosition.x}
                          y2={svgHeight - paddingY}
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                        />
                        <circle
                          cx={hoverPosition.x}
                          cy={hoverPosition.y}
                          r="6"
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth="3"
                          filter="drop-shadow(0 2px 5px rgba(37,99,235,0.4))"
                        />
                      </>
                    )}
                  </svg>

                  {/* Floating Tooltip displaying exact requests upon hover */}
                  {hoveredPoint && hoverPosition && (
                    <div
                      className="chart-hover-tooltip"
                      style={{
                        left: `${(hoverPosition.x / svgWidth) * 100}%`,
                        top: `${(hoverPosition.y / svgHeight) * 100}%`
                      }}
                    >
                      <div className="tooltip-header">
                        <span className="tooltip-time">{hoveredPoint.time}</span>
                        <span className="tooltip-tag">Live Point</span>
                      </div>
                      <div className="tooltip-body">
                        <div className="tooltip-metric">
                          <span className="tooltip-label">Requests:</span>
                          <span className="tooltip-val-req">{hoveredPoint.requests.toLocaleString()} req/s</span>
                        </div>
                        <div className="tooltip-metric">
                          <span className="tooltip-label">Latency:</span>
                          <span className="tooltip-val-lat">{hoveredPoint.latency} ms</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chart-footer-hint">
                  <span>💡 Hover anywhere along the curve to inspect exact real-time requests and response latency.</span>
                </div>
              </section>

              {/* Local Cluster Nodes & Engine Telemetry Card */}
              <section className="dashboard-section nodes-section">
                <div className="nodes-section-header">
                  <div className="nodes-title-group">
                    <h2 className="section-title">Local Cluster Nodes</h2>
                    <span className="nodes-consensus-badge">Raft Consensus Active</span>
                  </div>
                  <span className="local-host-pill">127.0.0.1 (Local PC)</span>
                </div>

                <div className="nodes-grid">
                  <div className="node-item">
                    <div className="node-top">
                      <div className="node-name-wrapper">
                        <span className="node-dot-online" />
                        <span className="node-name">clv-node-01</span>
                      </div>
                      <span className="node-role-badge leader">Primary Leader</span>
                    </div>
                    <div className="node-metrics-row">
                      <span className="node-stat-pill">Port 9092</span>
                      <span className="node-stat-pill">CPU 11.4%</span>
                      <span className="node-stat-pill">RAM 1.4 GB</span>
                      <span className="node-stat-pill">IOPS 2,840/s</span>
                    </div>
                  </div>

                  <div className="node-item">
                    <div className="node-top">
                      <div className="node-name-wrapper">
                        <span className="node-dot-online" />
                        <span className="node-name">clv-node-02</span>
                      </div>
                      <span className="node-role-badge replica">Raft Replica</span>
                    </div>
                    <div className="node-metrics-row">
                      <span className="node-stat-pill">Port 9093</span>
                      <span className="node-stat-pill">CPU 7.2%</span>
                      <span className="node-stat-pill">RAM 980 MB</span>
                      <span className="node-stat-pill">IOPS 1,420/s</span>
                    </div>
                  </div>

                  <div className="node-item">
                    <div className="node-top">
                      <div className="node-name-wrapper">
                        <span className="node-dot-online" />
                        <span className="node-name">clv-node-03</span>
                      </div>
                      <span className="node-role-badge replica">Raft Replica</span>
                    </div>
                    <div className="node-metrics-row">
                      <span className="node-stat-pill">Port 9094</span>
                      <span className="node-stat-pill">CPU 6.8%</span>
                      <span className="node-stat-pill">RAM 910 MB</span>
                      <span className="node-stat-pill">IOPS 1,380/s</span>
                    </div>
                  </div>
                </div>

                <div className="node-engine-footer">
                  <div className="engine-status-left">
                    <span className="status-dot-green" />
                    <span>Engine IPC: \\.\pipe\cleavedb-ipc</span>
                  </div>
                  <div className="engine-status-right">
                    <span>Term 142 · Commit Index: 1,420,580 · 0.00% Packet Loss</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Database Catalogs - EXPANDED to full height (This big) */}
            <section className="dashboard-section catalogs-section catalogs-section-expanded">
              <div className="section-header">
                <div className="section-title-group">
                  <h2 className="section-title">Database Catalogs</h2>
                  <span className="section-tag">{filteredDatabases.length} Active</span>
                </div>
                <div className="catalogs-header-controls">
                  <div className="search-input-wrapper">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Filter catalogs..."
                      className="search-input"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>
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
                        <td className="cell-muted font-mono">{db.size}</td>
                        <td className="cell-muted">{db.collections}</td>
                        <td className="cell-muted font-mono">{db.latency}</td>
                        <td className="cell-muted">{db.lastActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="catalogs-card-footer">
                <div className="footer-meta-left">
                  <span>Showing {filteredDatabases.length} databases</span>
                  <span>·</span>
                  <span>74.2 GB local storage allocated</span>
                </div>
                <div className="footer-meta-right">
                  <span className="status-dot-green" />
                  <span>All local partitions healthy & synchronized</span>
                </div>
              </div>
            </section>
          </div>
        </>
      )}

      {/* TAB 2: DATABASES (Clean blank workspace) */}
      {activeTab === 'databases' && (
        <div className="tab-view-container tab-databases-view">
          <div className="view-header">
            <div className="view-header-left">
              <h1 className="view-title">Databases</h1>
              <p className="view-subtitle">Manage partitions, schemas, and storage engines across your local PC.</p>
            </div>
            <div className="view-header-actions">
              <button className="btn-secondary" onClick={() => setActiveTab('overview')} type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                <span>Inspect in Overview</span>
              </button>
              <button className="btn-primary" type="button">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Database</span>
              </button>
            </div>
          </div>

          <div className="blank-workspace-card">
            <div className="blank-workspace-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <h3 className="blank-workspace-title">Database Catalog Explorer</h3>
            <p className="blank-workspace-desc">
              This workspace is blank for now. Detailed schema inspection, index tuning, and partition explorers are ready to be configured.
            </p>
            <div className="blank-workspace-meta">
              <span className="blank-meta-chip">
                <span className="status-dot-green" /> {databases.length} Catalogs Loaded
              </span>
              <span className="blank-meta-chip">74.2 GB Local Storage</span>
              <span className="blank-meta-chip">Engine: Columnar LSM, KeyValue & Vector</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLEAVEQL (Interactive console workspace matching exact design) */}
      {activeTab === 'cleaveql' && (
        <div className="tab-view-container tab-cleaveql-view">
          {/* Top 2 Cards Grid */}
          <div className="cql-top-grid">
            {/* Left Card: Editor */}
            <div className="cql-card cql-editor-card">
              <div className="cql-card-header">
                <div className="cql-title-group">
                  <span className="cql-badge-icon">&#123;&#125;</span>
                  <div className="cql-title-texts">
                    <h2 className="cql-card-title">CleaveQL</h2>
                    <p className="cql-card-subtitle">Query your documents, relationships, and more.</p>
                  </div>
                </div>
                <button className="cql-examples-btn" type="button" onClick={handleNextExample}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <span>Examples</span>
                </button>
              </div>

              {/* Editor Frame */}
              <div className="cql-editor-frame">
                <div className="cql-gutter">
                  {cqlQuery.split('\n').map((_, idx) => (
                    <span key={idx} className="cql-line-number">{idx + 1}</span>
                  ))}
                </div>
                <div className="cql-code-body">
                  {cqlQuery.split('\n').map((line, idx) => {
                    if (line.includes('POUR INTO')) {
                      return (
                        <div key={idx} className="cql-code-line">
                          <span className="cql-kw">POUR INTO</span> users <span className="cql-str">&quot;jane&quot;</span> &#123;
                        </div>
                      )
                    }
                    if (line.includes('"name"')) {
                      return (
                        <div key={idx} className="cql-code-line cql-indent">
                          <span className="cql-prop">&quot;name&quot;</span>: <span className="cql-str">&quot;Jane&quot;</span>,
                        </div>
                      )
                    }
                    if (line.includes('"age"')) {
                      return (
                        <div key={idx} className="cql-code-line cql-indent">
                          <span className="cql-prop">&quot;age&quot;</span>: <span className="cql-num">25</span>,
                        </div>
                      )
                    }
                    if (line.includes('"city"')) {
                      return (
                        <div key={idx} className="cql-code-line cql-indent">
                          <span className="cql-prop">&quot;city&quot;</span>: <span className="cql-str">&quot;Manila&quot;</span>
                        </div>
                      )
                    }
                    if (line.trim() === '}') {
                      return (
                        <div key={idx} className="cql-code-line">&#125;</div>
                      )
                    }
                    if (line.startsWith('SCOOP')) {
                      return (
                        <div key={idx} className="cql-code-line">
                          <span className="cql-kw">SCOOP</span> users
                        </div>
                      )
                    }
                    if (line.startsWith('SHOW BUCKETS')) {
                      return (
                        <div key={idx} className="cql-code-line">
                          <span className="cql-kw">SHOW BUCKETS</span>
                        </div>
                      )
                    }
                    if (line.startsWith('DESCRIBE')) {
                      return (
                        <div key={idx} className="cql-code-line">
                          <span className="cql-kw">DESCRIBE</span> users
                        </div>
                      )
                    }
                    return (
                      <div key={idx} className="cql-code-line">{line}</div>
                    )
                  })}
                </div>
              </div>

              {/* Editor Toolbar */}
              <div className="cql-editor-toolbar">
                <div className="cql-toolbar-left">
                  <button className="cql-run-btn" type="button" onClick={handleRunCql}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Run</span>
                    <span className="cql-shortcut-badge">Ctrl ↵</span>
                  </button>
                  <button className="cql-tool-btn" type="button" title="Execution Settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="21" x2="4" y2="14" />
                      <line x1="4" y1="10" x2="4" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12" y2="3" />
                      <line x1="20" y1="21" x2="20" y2="16" />
                      <line x1="20" y1="12" x2="20" y2="3" />
                      <line x1="1" y1="14" x2="7" y2="14" />
                      <line x1="9" y1="8" x2="15" y2="8" />
                      <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                  </button>
                </div>
                <div className="cql-toolbar-right">
                  <button className="cql-format-dropdown" type="button">
                    <span>Format: Visual</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card: Result */}
            <div className="cql-card cql-result-card">
              <div className="cql-card-header">
                <div className="cql-title-group">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <h2 className="cql-card-title">Result</h2>
                </div>
                <div className="cql-success-pill">
                  <span className="cql-dot-green" />
                  <span>Success · {cqlExecutionTime}</span>
                </div>
              </div>

              {/* Segmented Tabs */}
              <div className="cql-segmented-tabs">
                <button
                  type="button"
                  className={`cql-tab-pill ${cqlResultTab === 'document' ? 'active' : ''}`}
                  onClick={() => setCqlResultTab('document')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Document</span>
                </button>
                <button
                  type="button"
                  className={`cql-tab-pill ${cqlResultTab === 'raw' ? 'active' : ''}`}
                  onClick={() => setCqlResultTab('raw')}
                >
                  <span className="cql-tab-bracket">&#123;&#125;</span>
                  <span>Raw JSON</span>
                </button>
                <button
                  type="button"
                  className={`cql-tab-pill ${cqlResultTab === 'metadata' ? 'active' : ''}`}
                  onClick={() => setCqlResultTab('metadata')}
                >
                  <span className="cql-tab-info-icon">&#9432;</span>
                  <span>Metadata</span>
                </button>
              </div>

              {/* Tab Content: Document */}
              {cqlResultTab === 'document' && (
                <div className="cql-result-body">
                  <div className="cql-result-id-bar">
                    <div className="cql-doc-id-chip">
                      <span>users:jane</span>
                      <button
                        type="button"
                        className="cql-copy-btn"
                        onClick={() => handleCopyId('users:jane')}
                        title="Copy document key"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      {cqlCopied && <span className="cql-copied-toast">Copied!</span>}
                    </div>
                    <div className="cql-result-actions">
                      <button type="button" className="cql-icon-action-btn" title="Edit document">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                      <button type="button" className="cql-icon-action-btn" title="More options">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                          <circle cx="5" cy="12" r="1.5" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="cql-fields-table">
                    <div className="cql-field-row">
                      <div className="cql-type-icon">T</div>
                      <div className="cql-field-name-wrap">
                        <span className="cql-field-name">name</span>
                        <span className="cql-field-type">string</span>
                      </div>
                      <div className="cql-field-value">Jane</div>
                    </div>

                    <div className="cql-field-row">
                      <div className="cql-type-icon">#</div>
                      <div className="cql-field-name-wrap">
                        <span className="cql-field-name">age</span>
                        <span className="cql-field-type">number</span>
                      </div>
                      <div className="cql-field-value">25</div>
                    </div>

                    <div className="cql-field-row">
                      <div className="cql-type-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div className="cql-field-name-wrap">
                        <span className="cql-field-name">city</span>
                        <span className="cql-field-type">string</span>
                      </div>
                      <div className="cql-field-value">Manila</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Raw JSON */}
              {cqlResultTab === 'raw' && (
                <div className="cql-raw-json-view">
                  <pre>{`{
  "id": "users:jane",
  "document": {
    "name": "Jane",
    "age": 25,
    "city": "Manila"
  },
  "_partition": "partition_primary_01",
  "_status": "committed",
  "_timestamp": "2026-10-11T02:30:12.482Z"
}`}</pre>
                </div>
              )}

              {/* Tab Content: Metadata */}
              {cqlResultTab === 'metadata' && (
                <div className="cql-metadata-view">
                  <div className="cql-meta-row">
                    <span className="cql-meta-label">Storage Engine</span>
                    <span className="cql-meta-val">Columnar LSM + In-Memory KeyValue</span>
                  </div>
                  <div className="cql-meta-row">
                    <span className="cql-meta-label">Execution Latency</span>
                    <span className="cql-meta-val">{cqlExecutionTime}</span>
                  </div>
                  <div className="cql-meta-row">
                    <span className="cql-meta-label">Consensus State</span>
                    <span className="cql-meta-val">Healthy · Leader clv-node-01</span>
                  </div>
                  <div className="cql-meta-row">
                    <span className="cql-meta-label">Write Journal</span>
                    <span className="cql-meta-val">Committed to WAL (148 bytes)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card: Query History */}
          <div className="cql-history-card">
            <div className="cql-history-header">
              <div className="cql-history-title-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h3 className="cql-history-title">Query History</h3>
                <span className="cql-history-subtitle">Recent queries in this session.</span>
              </div>
              <button className="cql-clear-btn" type="button" onClick={() => setCqlHistory([])}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Clear</span>
              </button>
            </div>

            <div className="cql-history-list">
              {cqlHistory.map((item) => (
                <div
                  key={item.id}
                  className="cql-history-item"
                  onClick={() => handleSelectHistoryItem(item.query)}
                  title="Click to load into editor"
                >
                  <div className="cql-history-item-left">
                    <svg className="cql-play-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    {item.query.startsWith('POUR INTO') ? (
                      <span className="cql-history-code">
                        <span className="cql-kw">POUR INTO</span> users <span className="cql-str">&quot;jane&quot;</span> &#123; <span className="cql-prop">&quot;name&quot;</span>: <span className="cql-str">&quot;Jane&quot;</span>, <span className="cql-prop">&quot;age&quot;</span>: <span className="cql-num">25</span>, <span className="cql-prop">&quot;city&quot;</span>: <span className="cql-str">&quot;Manila&quot;</span> &#125;
                      </span>
                    ) : item.query.startsWith('SCOOP') ? (
                      <span className="cql-history-code">
                        <span className="cql-kw">SCOOP</span> users
                      </span>
                    ) : item.query.startsWith('SHOW BUCKETS') ? (
                      <span className="cql-history-code">
                        <span className="cql-kw">SHOW BUCKETS</span>
                      </span>
                    ) : item.query.startsWith('DESCRIBE') ? (
                      <span className="cql-history-code">
                        <span className="cql-kw">DESCRIBE</span> users
                      </span>
                    ) : (
                      <span className="cql-history-code">{item.query}</span>
                    )}
                  </div>
                  <div className="cql-history-item-right">
                    <span className="cql-history-badge-success">{item.status}</span>
                    <span className="cql-history-duration">{item.duration}</span>
                    <button
                      className="cql-icon-action-btn"
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      title="Query options"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                        <circle cx="5" cy="12" r="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* TAB 4: SETTINGS (Accessed by clicking user card at bottom left) */}
      {activeTab === 'settings' && (
        <div className="tab-view-container tab-settings-view">
          <div className="view-header">
            <div className="view-header-left">
              <h1 className="view-title">Settings & System Configuration</h1>
              <p className="view-subtitle">Manage cluster configuration, local storage directories, and developer account.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-section-card">
              <div className="settings-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <h3 className="settings-card-title">Developer Account</h3>
              </div>
              <div className="settings-rows">
                <div className="settings-row">
                  <span className="settings-row-label">Username</span>
                  <span className="settings-row-val font-mono">{username || 'Developer'}</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Privilege Level</span>
                  <span className="settings-badge-role">Local Cluster Administrator</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Session Status</span>
                  <span className="settings-status-connected">
                    <span className="status-dot-green" /> Authenticated & Connected
                  </span>
                </div>
              </div>
            </div>

            <div className="settings-section-card">
              <div className="settings-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
                <h3 className="settings-card-title">Engine & Cluster Telemetry</h3>
              </div>
              <div className="settings-rows">
                <div className="settings-row">
                  <span className="settings-row-label">CleaveDB Version</span>
                  <span className="settings-row-val font-mono">v4.0.1 (x64 Windows)</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Engine IPC Endpoint</span>
                  <span className="settings-row-val font-mono">\\.\pipe\cleavedb-ipc</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Data Directory</span>
                  <span className="settings-row-val font-mono">C:\CleaveDB\storage\data</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Consensus Protocol</span>
                  <span className="settings-row-val">Raft 3-Node Local Cluster</span>
                </div>
              </div>
            </div>

            <div className="settings-section-card">
              <div className="settings-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                  <line x1="2" y1="14" x2="22" y2="14" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
                <h3 className="settings-card-title">Computer Storage</h3>
              </div>
              <div className="settings-rows">
                <div className="settings-row">
                  <span className="settings-row-label">Target Drive</span>
                  <span className="settings-row-val font-mono">{systemStorage.drive}</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Allocated Space</span>
                  <span className="settings-row-val">{systemStorage.usedGB} GB of {systemStorage.totalGB} GB ({systemStorage.percentUsed}%)</span>
                </div>
                <div className="settings-row">
                  <span className="settings-row-label">Available Free Space</span>
                  <span className="settings-row-val">{systemStorage.freeGB} GB Free</span>
                </div>
              </div>
            </div>

            <div className="settings-section-card">
              <div className="settings-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <h3 className="settings-card-title">Session Actions</h3>
              </div>
              <div className="settings-rows">
                <div className="settings-action-row">
                  <div className="settings-action-info">
                    <span className="action-title">Terminate Active Session</span>
                    <span className="action-desc">Signs out developer account and returns to login gate.</span>
                  </div>
                  <button className="btn-danger" onClick={onSignOut} type="button">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
  )
}
