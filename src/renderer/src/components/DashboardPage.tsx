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
  const [activeTab, setActiveTab] = useState<'overview' | 'databases' | 'analytics' | 'settings'>('overview')
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
      {/* Unified Top Header: Spans Full Width Across the Window */}
      <header className="dashboard-top-header">
        <div className="header-brand-section">
          <div className="sidebar-logo-group">
            <img src={cleaveLogo} alt="CleaveDB Logo" className="sidebar-logo" />
            <span className="sidebar-brand-name">CleaveDB</span>
          </div>
          <span className="sidebar-badge">v2.4.1</span>
        </div>

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

      {/* Main Workspace below the unified header */}
      <div className="dashboard-workspace">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
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
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Analytics</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Settings</span>
            </button>
          </nav>

          {/* Sidebar Footer with Logged-in Profile */}
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

        {/* Dashboard Body Scrollable Area */}
        <div className="dashboard-body">
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
        </div>
      </div>
    </div>
  )
}
