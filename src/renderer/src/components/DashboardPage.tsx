import { useState, useEffect, useRef } from 'react'
import cleaveLogo from '../assets/cleavedb-logo.png'

interface DashboardPageProps {
  username: string
  isSuperUser?: boolean
  onSignOut: () => void
}

interface CleaveTelemetry {
  status: string
  timestamp: number
  requests_per_second: number
  total_requests: number
  latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  chart_history: Array<[number, number, number]>
  storage: {
    total_gb: number
    used_gb: number
    free_gb: number
    used_percent: number
  }
  databases: Array<{
    name: string
    full_name: string
    tenant: string
    records: number
    size: string
    size_bytes: number
    storage_engine: string
    schema: Record<string, string>
    status: string
  }>
  cluster: {
    node_id: string
    is_leader: boolean
    leader: string
    status: string
    has_quorum: boolean
    peer_nodes: string[]
    active_ports: Record<string, number>
  }
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
  records?: number
  collections: number
  latency: string
  lastActive: string
  is_system?: boolean
}

interface BucketDocument {
  gid: string
  id: string
  body: any
  size?: string
}

interface ColumnField {
  id: string
  name: string
  type: 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'array' | 'object'
  defaultValue: string
}

function formatDocSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function BucketFolderIcon({ hasContent }: { hasContent: boolean }): React.JSX.Element {
  return (
    <div className={`bucket-folder-icon-wrapper ${hasContent ? 'has-content' : 'is-empty'}`}>
      <svg className="folder-svg" viewBox="0 0 88 74" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="folderBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="folderFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
          <filter id="flapShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* 1. Back Folder Body & Tab (Darker Blue) */}
        <path
          className="folder-back-body"
          d="M 8 16 C 8 11.58 11.58 8 16 8 L 34 8 C 37.5 8 40.5 10 42.5 13.5 L 45.5 18 L 74 18 C 78.42 18 82 21.58 82 26 L 82 62 C 82 66.42 78.42 70 74 70 L 16 70 C 11.58 70 8 66.42 8 62 Z"
          fill="url(#folderBackGrad)"
        />

        {/* Inner pocket cavity */}
        <rect x="12" y="22" width="66" height="42" rx="4" fill="#172554" opacity="0.45" />

        {/* 2. Paper Document sticking out (ONLY when hasContent is true) */}
        {hasContent && (
          <g className="folder-paper" filter="url(#paperShadow)">
            <path
              d="M 22 10 L 56 10 L 66 20 L 66 50 L 22 50 Z"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <path
              d="M 56 10 L 56 20 L 66 20 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="0.8"
            />
            <line x1="28" y1="20" x2="50" y2="20" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="27" x2="60" y2="27" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="33" x2="58" y2="33" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="39" x2="48" y2="39" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* 3. Front Flap (Opens in 3D perspective on hover) */}
        <g className="folder-front-flap-group">
          <path
            className="folder-front-flap"
            d="M 6 28 C 6 23.58 9.58 20 14 20 L 76 20 C 80.42 20 84 23.58 84 28 L 81 63 C 81 67.42 77.42 71 73 71 L 17 71 C 12.58 71 9 67.42 9 63 Z"
            fill="url(#folderFrontGrad)"
            filter="url(#flapShadow)"
          />
          <path
            className="folder-flap-rim"
            d="M 14 21 L 76 21"
            stroke="#93c5fd"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  )
}

function DocFileIcon(): React.JSX.Element {
  return (
    <div className="doc-file-icon">
      <svg width="38" height="46" viewBox="0 0 38 46" fill="none">
        <path
          d="M 3 3 C 3 1.34 4.34 0 6 0 L 25 0 L 35 10 L 35 43 C 35 44.66 33.66 46 32 46 L 6 46 C 4.34 46 3 44.66 3 43 Z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <path d="M 25 0 L 25 10 L 35 10 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
        <rect x="8" y="15" width="14" height="2.5" rx="1.2" fill="#3b82f6" />
        <rect x="8" y="21" width="22" height="2" rx="1" fill="#94a3b8" />
        <rect x="8" y="26" width="18" height="2" rx="1" fill="#cbd5e1" />
        <rect x="8" y="31" width="20" height="2" rx="1" fill="#cbd5e1" />
      </svg>
      <span className="doc-badge-pill">JSON</span>
    </div>
  )
}

function createInitialChartPoints(): RequestDataPoint[] {
  const points: RequestDataPoint[] = []
  const now = Date.now()
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 1000)
    const timeStr = timestamp.toTimeString().split(' ')[0]
    points.push({
      id: 25 - i,
      time: timeStr,
      requests: 0,
      latency: 0
    })
  }
  return points
}

export default function DashboardPage({ username, isSuperUser, onSignOut }: DashboardPageProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'overview' | 'databases' | 'cleaveql' | 'settings'>('overview')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [telemetry, setTelemetry] = useState<CleaveTelemetry | null>(null)
  const [databases, setDatabases] = useState<DatabaseItem[]>([])
  const [searchFilter, setSearchFilter] = useState('')

  // Bucket Explorer & Document Drill-Down State
  const [selectedBucket, setSelectedBucket] = useState<DatabaseItem | null>(null)
  const [bucketDocuments, setBucketDocuments] = useState<BucketDocument[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [bucketSearchFilter, setBucketSearchFilter] = useState('')
  const [docSearchFilter, setDocSearchFilter] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<BucketDocument | null>(null)
  const [docModalTab, setDocModalTab] = useState<'fields' | 'json'>('fields')
  const [docCopied, setDocCopied] = useState(false)

  // Supabase-Style Right Slide-Out Drawer State
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false)
  const [newBucketName, setNewBucketName] = useState('')
  const [newBucketDescription, setNewBucketDescription] = useState('')
  const [policyAudited, setPolicyAudited] = useState(true)
  const [policyVersioned, setPolicyVersioned] = useState(true)
  const [policyMaxDocsEnabled, setPolicyMaxDocsEnabled] = useState(false)
  const [policyMaxDocs, setPolicyMaxDocs] = useState<number>(500)
  const [policyTtlEnabled, setPolicyTtlEnabled] = useState(false)
  const [policyTtlValue, setPolicyTtlValue] = useState<number>(3600)
  const [policyTtlUnit, setPolicyTtlUnit] = useState<'SECONDS' | 'MINUTES' | 'HOURS' | 'DAYS'>('SECONDS')

  const [idStrategy, setIdStrategy] = useState<'RANDOM' | 'CUSTOM'>('RANDOM')
  const [customIdValue, setCustomIdValue] = useState('')

  const [columns, setColumns] = useState<ColumnField[]>([
    { id: 'col_1', name: 'created_at', type: 'date', defaultValue: '_dtz_' },
    { id: 'col_2', name: 'title', type: 'string', defaultValue: 'New Item' },
    { id: 'col_3', name: 'status', type: 'string', defaultValue: 'active' }
  ])

  const [drawerError, setDrawerError] = useState<string | null>(null)
  const [drawerSuccess, setDrawerSuccess] = useState<string | null>(null)
  const [isDrawerSubmitting, setIsDrawerSubmitting] = useState(false)
  const [showCqlPreview, setShowCqlPreview] = useState(true)

  // ESC key handler for Document Modal and Right Slide-out Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (selectedDoc) {
          setSelectedDoc(null)
        } else if (isNewDrawerOpen) {
          setIsNewDrawerOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDoc, isNewDrawerOpen])

  const handleAddColumn = (): void => {
    const newId = 'col_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
    setColumns((prev) => [
      ...prev,
      { id: newId, name: '', type: 'string', defaultValue: '' }
    ])
  }

  const handleRemoveColumn = (colId: string): void => {
    setColumns((prev) => prev.filter((c) => c.id !== colId))
  }

  const handleUpdateColumn = (colId: string, updates: Partial<ColumnField>): void => {
    setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, ...updates } : c)))
  }

  const generateCleaveQLStatements = (): { shapeQuery: string | null; pourQuery: string } => {
    const rawName = (newBucketName || (selectedBucket ? selectedBucket.name : 'my_bucket')).trim()
    const bName = rawName.replace(/[^a-zA-Z0-9_]/g, '_') || 'my_bucket'

    const policies: string[] = []
    if (policyAudited) policies.push('AUDITED')
    if (policyVersioned) policies.push('VERSIONED')
    if (policyMaxDocsEnabled && policyMaxDocs > 0) policies.push(`MAX DOCUMENTS ${policyMaxDocs}`)
    if (policyTtlEnabled && policyTtlValue > 0) policies.push(`TTL ${policyTtlValue} ${policyTtlUnit}`)

    const shapeQuery = policies.length > 0 ? `SHAPE BUCKET ${bName} ${policies.join(' ')}` : null

    const docObj: Record<string, any> = {}
    columns.forEach((col) => {
      const key = col.name.trim()
      if (!key) return
      const val = col.defaultValue
      if (col.type === 'integer') {
        const num = parseInt(val, 10)
        docObj[key] = isNaN(num) ? 0 : num
      } else if (col.type === 'float') {
        const f = parseFloat(val)
        docObj[key] = isNaN(f) ? 0.0 : f
      } else if (col.type === 'boolean') {
        docObj[key] = val.toLowerCase() === 'true'
      } else if (col.type === 'array') {
        try {
          docObj[key] = JSON.parse(val)
        } catch {
          docObj[key] = []
        }
      } else if (col.type === 'object') {
        try {
          docObj[key] = JSON.parse(val)
        } catch {
          docObj[key] = {}
        }
      } else {
        docObj[key] = val
      }
    })

    const idClause =
      idStrategy === 'RANDOM'
        ? 'RANDOM'
        : `"${(customIdValue.trim() || 'item_1').replace(/"/g, '\\"')}"`

    const pourQuery = `POUR INTO ${bName} ${idClause} ${JSON.stringify(docObj, null, 2)}`
    return { shapeQuery, pourQuery }
  }

  const handleSaveAndPour = async (): Promise<void> => {
    setDrawerError(null)
    setDrawerSuccess(null)

    const rawName = (newBucketName || (selectedBucket ? selectedBucket.name : '')).trim()
    if (!rawName) {
      setDrawerError('Please enter a bucket name.')
      return
    }

    const reservedWords = ['buckets', 'coordinator_nodes', 'raft_nodes', '_rubbish', '_bonds']
    if (reservedWords.includes(rawName.toLowerCase())) {
      setDrawerError(`"${rawName}" is a reserved system keyword in CleaveDB.`)
      return
    }

    if (idStrategy === 'CUSTOM' && !customIdValue.trim()) {
      setDrawerError('Please enter a custom Document ID, or select "RANDOM".')
      return
    }

    const { shapeQuery, pourQuery } = generateCleaveQLStatements()
    setIsDrawerSubmitting(true)

    try {
      if (window.api?.query) {
        if (shapeQuery) {
          const shapeRes = await window.api.query(shapeQuery)
          if (!shapeRes?.success && shapeRes?.error) {
            console.warn('Shape warning/error:', shapeRes.error)
          }
        }

        const pourRes = await window.api.query(pourQuery)
        if (!pourRes || (!pourRes.success && pourRes.error)) {
          setDrawerError(pourRes?.error || 'Failed to pour document into CleaveDB')
          setIsDrawerSubmitting(false)
          return
        }

        setDrawerSuccess(`Successfully poured document into bucket "${rawName}"!`)

        if (window.api?.getTelemetry) {
          const teleRes = await window.api.getTelemetry()
          if (teleRes?.scopedDatabases) {
            setDatabases(teleRes.scopedDatabases)
          }
        }

        if (selectedBucket && selectedBucket.name.toLowerCase() === rawName.toLowerCase()) {
          await loadBucketDocuments(rawName)
        }

        setTimeout(() => {
          setIsNewDrawerOpen(false)
          setDrawerSuccess(null)
          setIsDrawerSubmitting(false)
        }, 750)
      } else {
        setDrawerError('Database connection API is not available.')
        setIsDrawerSubmitting(false)
      }
    } catch (err: any) {
      setDrawerError(err?.message || 'Unexpected error occurred while querying CleaveDB.')
      setIsDrawerSubmitting(false)
    }
  }

  // Copy JSON inside modal
  const handleCopyDocJson = async (): Promise<void> => {
    if (!selectedDoc) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedDoc.body, null, 2))
      setDocCopied(true)
      setTimeout(() => setDocCopied(false), 1800)
    } catch (err) {
      console.error('Failed to copy JSON:', err)
    }
  }

  // Load documents inside a bucket via SCOOP <bucket>
  const loadBucketDocuments = async (bucketName: string): Promise<void> => {
    setIsLoadingDocs(true)
    try {
      if (window.api?.query) {
        const res = await window.api.query(`SCOOP ${bucketName}`)
        if (res && res.success && res.results) {
          const parsedDocs: BucketDocument[] = []
          const rawList = Array.isArray(res.results) ? res.results : [res.results]
          for (const item of rawList) {
            const docs = item.documents || (Array.isArray(item) ? item : [])
            for (const d of docs) {
              const gid = d.gid || `${bucketName}:${d.id || 'doc'}`
              const idPart = gid.includes(':') ? gid.substring(gid.indexOf(':') + 1) : (d.id || d.body?.id || 'record')
              const body = d.body !== undefined ? d.body : d
              const sizeStr = formatDocSize(JSON.stringify(body).length)
              parsedDocs.push({
                gid,
                id: idPart,
                body,
                size: sizeStr
              })
            }
          }
          setBucketDocuments(parsedDocs)
        } else {
          setBucketDocuments([])
        }
      }
    } catch (err) {
      console.error('Error fetching bucket documents:', err)
      setBucketDocuments([])
    } finally {
      setIsLoadingDocs(false)
    }
  }

  const handleOpenBucket = (b: DatabaseItem): void => {
    setSelectedBucket(b)
    setDocSearchFilter('')
    loadBucketDocuments(b.name)
  }

  // Live real computer storage
  const [systemStorage, setSystemStorage] = useState<SystemStorage>({
    totalGB: 256,
    freeGB: 64,
    usedGB: 192,
    percentUsed: 75,
    drive: 'C:'
  })

  // Real-time Line Chart Points
  const [chartPoints, setChartPoints] = useState<RequestDataPoint[]>(createInitialChartPoints)
  const [hoveredPoint, setHoveredPoint] = useState<RequestDataPoint | null>(null)
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Live Requests & Storage Tracking State
  const [dbStorageFormatted, setDbStorageFormatted] = useState('0 B')

  // CleaveQL State
  const [cqlQuery, setCqlQuery] = useState(`POUR INTO users "jane" {
  "name": "Jane",
  "age": 25,
  "city": "Manila"
}`)
  const [cqlResultTab, setCqlResultTab] = useState<'document' | 'raw' | 'metadata'>('document')
  const [cqlExecutionTime, setCqlExecutionTime] = useState('12 ms')
  const [cqlCopied, setCqlCopied] = useState(false)
  const [cqlResultData, setCqlResultData] = useState<any>(null)
  const [cqlStatus, setCqlStatus] = useState<'Success' | 'Error'>('Success')
  const [cqlHistory, setCqlHistory] = useState<Array<{ id: string; query: string; status: 'Success' | 'Error'; duration: string }>>([
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

  // Real CleaveQL Execution via window.api.query
  const handleRunCql = async (): Promise<void> => {
    const t0 = performance.now()
    try {
      if (window.api?.query) {
        const res = await window.api.query(cqlQuery)
        const lat = Math.round(performance.now() - t0) + ' ms'
        setCqlExecutionTime(lat)
        if (res.success) {
          setCqlStatus('Success')
          setCqlResultData(res.results)
          const normalized = cqlQuery.trim().replace(/\s+/g, ' ')
          const newHistItem = {
            id: 'h-' + Date.now(),
            query: normalized,
            status: 'Success' as const,
            duration: lat
          }
          setCqlHistory((prev) => [newHistItem, ...prev.filter((item) => item.query !== normalized)].slice(0, 8))
        } else {
          setCqlStatus('Error')
          setCqlResultData(res.error ? [{ status: 'error', message: res.error }] : res)
          const normalized = cqlQuery.trim().replace(/\s+/g, ' ')
          const newHistItem = {
            id: 'h-' + Date.now(),
            query: normalized,
            status: 'Error' as const,
            duration: lat
          }
          setCqlHistory((prev) => [newHistItem, ...prev.filter((item) => item.query !== normalized)].slice(0, 8))
        }
      }
    } catch (err: any) {
      const lat = Math.round(performance.now() - t0) + ' ms'
      setCqlExecutionTime(lat)
      setCqlStatus('Error')
      setCqlResultData([{ status: 'error', message: err?.message || 'Execution error' }])
    }
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

  // Fetch real CleaveDB telemetry metrics continuously (pure REST, 0 query pollution)
  useEffect(() => {
    let isMounted = true
    async function fetchTelemetry(): Promise<void> {
      try {
        if (window.api?.getTelemetry) {
          const res = await window.api.getTelemetry()
          if (res?.success && isMounted) {
            if (res.metrics) {
              setTelemetry(res.metrics)

              if (res.metrics.chart_history && res.metrics.chart_history.length > 0) {
                const livePts: RequestDataPoint[] = res.metrics.chart_history.slice(-25).map(([ts, rps, lat], idx) => ({
                  id: idx,
                  time: new Date(ts * 1000).toTimeString().split(' ')[0],
                  requests: rps || 0,
                  latency: parseFloat((lat || 0).toFixed(2))
                }))
                setChartPoints(livePts)
              }
            }

            if (res.dbStorageFormatted) {
              setDbStorageFormatted(res.dbStorageFormatted)
            }

            // Real scoped database buckets directly from server
            if (res.scopedDatabases !== undefined) {
              setDatabases(res.scopedDatabases)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching telemetry from CleaveDB:', err)
      }
    }

    fetchTelemetry()
    const timer = setInterval(fetchTelemetry, 1000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [username, isSuperUser])

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

  const currentRequests = telemetry ? (telemetry.requests_per_second || 0) : 0
  const peakRequests = Math.max(...chartPoints.map((p) => p.requests), currentRequests)
  const avgRequests = chartPoints.length > 0
    ? Math.round(chartPoints.reduce((acc, p) => acc + p.requests, 0) / chartPoints.length)
    : 0

  const totalHits = telemetry?.total_requests ?? 0
  const totalRecords = databases.reduce((acc, d) => acc + (d.records || 0), 0)

  const effectiveStorage = telemetry?.storage
    ? {
        totalGB: Math.round(telemetry.storage.total_gb),
        usedGB: Math.round(telemetry.storage.used_gb),
        freeGB: Math.round(telemetry.storage.free_gb * 10) / 10,
        percentUsed: Math.round(telemetry.storage.used_percent),
        drive: systemStorage.drive || 'C:'
      }
    : systemStorage

  // SVG Chart Dimensions for split layout
  const svgWidth = 560
  const svgHeight = 220
  const paddingX = 35
  const paddingY = 25
  const graphWidth = svgWidth - paddingX * 2
  const graphHeight = svgHeight - paddingY * 2

  const rawMin = Math.min(...chartPoints.map((p) => p.requests)) * 0.92
  const rawMax = Math.max(...chartPoints.map((p) => p.requests)) * 1.08
  const minReq = Math.max(0, rawMin)
  const maxReq = Math.max(rawMax, minReq + 10)
  const rangeReq = maxReq - minReq || 1

  // Calculate SVG point coordinates
  const coords = chartPoints.map((point, index) => {
    const x = paddingX + (index / Math.max(1, chartPoints.length - 1)) * graphWidth
    const y = svgHeight - paddingY - ((point.requests - minReq) / rangeReq) * graphHeight
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

  const getDocumentFields = (): Array<{ name: string; type: string; value: any; iconType?: string }> => {
    if (!cqlResultData) {
      return [
        { name: 'name', type: 'string', value: 'Jane', iconType: 'T' },
        { name: 'age', type: 'number', value: 25, iconType: '#' },
        { name: 'city', type: 'string', value: 'Manila', iconType: 'T' }
      ]
    }

    const first = Array.isArray(cqlResultData) ? cqlResultData[0] : cqlResultData
    if (first && first.documents && Array.isArray(first.documents) && first.documents.length > 0) {
      const doc = first.documents[0]
      const body = doc.body || doc
      return Object.entries(body)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => ({
          name: k,
          type: typeof v,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
          iconType: typeof v === 'number' ? '#' : 'T'
        }))
    }
    if (first && first.data && Array.isArray(first.data)) {
      return first.data.map((item: any, idx: number) => ({
        name: `bucket_${idx + 1}`,
        type: 'bucket',
        value: String(item),
        iconType: 'T'
      }))
    }
    if (first && typeof first === 'object') {
      return Object.entries(first)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => ({
          name: k,
          type: typeof v,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
          iconType: typeof v === 'number' ? '#' : 'T'
        }))
    }
    return [{ name: 'result', type: typeof first, value: String(first), iconType: 'T' }]
  }

  const getDocKey = (): string => {
    if (!cqlResultData) return 'users:jane'
    const first = Array.isArray(cqlResultData) ? cqlResultData[0] : cqlResultData
    if (first && first.documents && first.documents[0]?.gid) return first.documents[0].gid
    if (first && first.gid) return first.gid
    if (first && first.status) return `status:${first.status}`
    return 'response:ok'
  }

  const userInitial = (username || 'Developer').charAt(0).toUpperCase()

  return (
    <div className="dashboard-container">
      {/* Left Sidebar: Continuous Column with Brand, Navigation & Clickable Profile */}
      <aside className={`dashboard-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top-section">
          {/* Brand header with animated morphing collapse/open toggle icon */}
          <div className="sidebar-brand-section">
            <div className="sidebar-logo-group">
              <button
                type="button"
                className={`sidebar-logo-toggle-btn ${isSidebarCollapsed ? 'is-collapsed' : ''}`}
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                title={isSidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'}
                aria-label={isSidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'}
              >
                <div className="logo-icon-morph-box">
                  {/* Default: CleaveDB 3D Logo */}
                  <img src={cleaveLogo} alt="CleaveDB Logo" className="sidebar-logo morph-default" />
                  {/* Hover: Morph into Collapse or Open icon smoothly */}
                  <div className="sidebar-morph-icon morph-hover">
                    {isSidebarCollapsed ? (
                      /* Open sidebar icon (Panel Left Open) */
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 3v18" />
                        <path d="m14 9 3 3-3 3" />
                      </svg>
                    ) : (
                      /* Collapse sidebar icon (Panel Left Close) */
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M9 3v18" />
                        <path d="m16 15-3-3 3-3" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
              <span className="sidebar-brand-name">CleaveDB</span>
            </div>
            <span className="sidebar-badge">v4.0.2</span>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              title={isSidebarCollapsed ? 'Overview' : undefined}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              <span className="nav-label">Overview</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'databases' ? 'active' : ''}`}
              onClick={() => setActiveTab('databases')}
              title={isSidebarCollapsed ? `Databases (${databases.length})` : undefined}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
              <span className="nav-label">Databases</span>
              <span className="nav-count">{databases.length}</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'cleaveql' ? 'active' : ''}`}
              onClick={() => setActiveTab('cleaveql')}
              title={isSidebarCollapsed ? 'CleaveQL' : undefined}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 12 4 7" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span className="nav-label">CleaveQL</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Logged-in Profile (Click opens Settings) */}
        <div className="sidebar-footer">
          <div
            className="user-profile-card"
            onClick={isSidebarCollapsed ? () => setActiveTab('settings') : undefined}
            title={isSidebarCollapsed ? `${username || 'Developer'} (Settings)` : undefined}
            style={{ cursor: isSidebarCollapsed ? 'pointer' : 'default' }}
          >
            <div className="user-avatar-circle">{userInitial}</div>
            <div className="user-details">
              <span className="user-username">{username || 'Developer'}</span>
              <span className="user-status-pill">
                <span className="status-dot-green" />
                {isSuperUser ? 'Super User' : 'Connected'}
              </span>
            </div>
            <div className="user-profile-actions">
              <button
                type="button"
                className={`profile-action-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveTab('settings')
                }}
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
                onClick={(e) => {
                  e.stopPropagation()
                  onSignOut()
                }}
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
              <span className="cluster-header-title">
                {telemetry?.cluster?.is_leader ? 'Primary Leader Active' : 'Cluster Online'}
              </span>
              <span className="cluster-region-pill">
                {telemetry?.cluster?.leader ? `Leader: ${telemetry.cluster.leader}` : '127.0.0.1 (Local PC)'} · {telemetry?.cluster?.has_quorum ? 'Quorum 100%' : 'Syncing'}
              </span>
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
              <h1 className="welcome-title">
                {isSuperUser
                  ? `Welcome back, super user ${username || 'Developer'} 👋`
                  : `Welcome back, ${username || 'Developer'} 👋`}
              </h1>
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
              <span className="metric-footer">{totalHits.toLocaleString()} Total Hits Today</span>
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
              <div className="metric-value">{(telemetry?.latency_ms ?? 0.78).toFixed(2)} <span className="metric-unit">ms</span></div>
              <span className="metric-footer">p95: {(telemetry?.p95_latency_ms ?? 1.25).toFixed(2)} ms · p99: {(telemetry?.p99_latency_ms ?? 2.10).toFixed(2)} ms</span>
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
              <div className="metric-value">{filteredDatabases.length} <span className="metric-unit">Active</span></div>
              <span className="metric-footer">{totalRecords.toLocaleString()} Records · {dbStorageFormatted} Allocated</span>
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
              <div className="metric-value">1 <span className="metric-unit">Cluster ({(telemetry?.cluster?.peer_nodes?.length ?? 0) + 1} Node{((telemetry?.cluster?.peer_nodes?.length ?? 0) + 1) > 1 ? 's' : ''})</span></div>
              <span className="metric-footer">{telemetry?.cluster?.leader ? `Leader: ${telemetry.cluster.leader}` : 'clv-node-01 (Leader)'} · {telemetry?.cluster?.has_quorum ? 'Quorum Healthy' : 'Quorum Sync'}</span>
            </div>

            {/* 5. Computer Storage (Database Used / Free Storage Remaining on C:) */}
            <div className="metric-card storage-card-featured">
              <div className="metric-header">
                <span className="metric-label">Computer Storage ({effectiveStorage.drive})</span>
                <span className="metric-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="3" />
                    <line x1="2" y1="14" x2="22" y2="14" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </span>
              </div>
              <div className="metric-value">
                {dbStorageFormatted} <span className="metric-unit">/ {effectiveStorage.freeGB} GB Free</span>
              </div>
              <div className="metric-bar-container">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(12, Math.round(((effectiveStorage.totalGB - effectiveStorage.freeGB) / effectiveStorage.totalGB) * 100)))}%`,
                    backgroundColor: '#0284c7'
                  }}
                />
              </div>
              <span className="metric-footer">
                Database Footprint: {dbStorageFormatted} · {effectiveStorage.freeGB} GB Free on Drive
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
                    <span className="nodes-consensus-badge">
                      {telemetry?.cluster?.has_quorum ? 'Raft Consensus Active' : 'Consensus Active'}
                    </span>
                  </div>
                  <span className="local-host-pill">127.0.0.1 (Local PC)</span>
                </div>

                <div className="nodes-grid">
                  <div className="node-item">
                    <div className="node-top">
                      <div className="node-name-wrapper">
                        <span className="node-dot-online" />
                        <span className="node-name">
                          {telemetry?.cluster?.leader ? `clv-leader (${telemetry.cluster.leader})` : 'clv-node-01'}
                        </span>
                      </div>
                      <span className="node-role-badge leader">Primary Leader</span>
                    </div>
                    <div className="node-metrics-row">
                      <span className="node-stat-pill">Port {telemetry?.cluster?.active_ports?.raft || 8311} (Raft)</span>
                      <span className="node-stat-pill">Port {telemetry?.cluster?.active_ports?.gateway || 8300} (Gateway)</span>
                      <span className="node-stat-pill">Port {telemetry?.cluster?.active_ports?.http_rest || 8303} (REST)</span>
                      <span className="node-stat-pill">Port {telemetry?.cluster?.active_ports?.websocket || 8302} (WS)</span>
                    </div>
                  </div>

                  <div className="node-item">
                    <div className="node-top">
                      <div className="node-name-wrapper">
                        <span className="node-dot-online" />
                        <span className="node-name">clv-coordinator-01</span>
                      </div>
                      <span className="node-role-badge replica">Go Shard Coordinator</span>
                    </div>
                    <div className="node-metrics-row">
                      <span className="node-stat-pill">Port {telemetry?.cluster?.active_ports?.coordinator || 8305}</span>
                      <span className="node-stat-pill">Scatter-Gather</span>
                      <span className="node-stat-pill">Shard 127.0.0.1:8300</span>
                      <span className="node-stat-pill">Status: Online</span>
                    </div>
                  </div>

                  <div className="node-item">
                    <div className="node-top">
                      <div className="node-name-wrapper">
                        <span className="node-dot-online" />
                        <span className="node-name">clv-ipc-bridge</span>
                      </div>
                      <span className="node-role-badge replica">Loopback IPC</span>
                    </div>
                    <div className="node-metrics-row">
                      <span className="node-stat-pill">Port {telemetry?.cluster?.active_ports?.tcp || 8299}</span>
                      <span className="node-stat-pill">Internal IPC Bridge</span>
                      <span className="node-stat-pill">Status: Online</span>
                      <span className="node-stat-pill">0.00% Packet Loss</span>
                    </div>
                  </div>
                </div>

                <div className="node-engine-footer">
                  <div className="engine-status-left">
                    <span className="status-dot-green" />
                    <span>Engine IPC: \\.\pipe\cleavedb-ipc · Node: {telemetry?.cluster?.node_id || '127.0.0.1:8311'}</span>
                  </div>
                  <div className="engine-status-right">
                    <span>Active Ports: {Object.keys(telemetry?.cluster?.active_ports || {}).length || 6} · Quorum: {telemetry?.cluster?.has_quorum ? '100% Healthy' : 'Initializing'} · 0.00% Packet Loss</span>
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
                    {filteredDatabases.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <ellipse cx="12" cy="5" rx="9" ry="3" />
                              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                            </svg>
                            <span style={{ fontWeight: 600, color: '#334155', fontSize: '14px' }}>No Database Buckets Found</span>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              User <strong>{username || 'david'}</strong> has not created any buckets yet.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredDatabases.map((db) => (
                        <tr
                          key={db.id}
                          onClick={() => {
                            setActiveTab('databases')
                            handleOpenBucket(db)
                          }}
                          style={{ cursor: 'pointer' }}
                          title={`Click to inspect bucket "${db.name}" in Databases Explorer`}
                        >
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="catalogs-card-footer">
                <div className="footer-meta-left">
                  <span>Showing {filteredDatabases.length} databases</span>
                  <span>·</span>
                  <span>{dbStorageFormatted} local storage allocated</span>
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

      {/* TAB 2: DATABASES (Interactive Animated Bucket Folder Explorer) */}
      {activeTab === 'databases' && (
        <div className="tab-view-container tab-databases-view">
          {selectedBucket === null ? (
            /* --- LEVEL 1: ALL STORAGE BUCKETS (FOLDERS) VIEW --- */
            <>
              <div className="view-header">
                <div className="view-header-left">
                  <h1 className="view-title">Databases & Buckets</h1>
                  <p className="view-subtitle">Interactive storage explorer. Click any blue folder to browse its files and inspect documents.</p>
                </div>
                <div className="view-header-actions">
                  <button className="btn-secondary" onClick={() => setActiveTab('overview')} type="button">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9" />
                      <rect x="14" y="3" width="7" height="5" />
                      <rect x="14" y="12" width="7" height="9" />
                      <rect x="3" y="16" width="7" height="5" />
                    </svg>
                    <span>Overview Stats</span>
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setNewBucketName('')
                      setDrawerError(null)
                      setDrawerSuccess(null)
                      setIsNewDrawerOpen(true)
                    }}
                    type="button"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Breadcrumbs & Search Toolbar */}
              <div className="explorer-breadcrumbs-bar">
                <div className="breadcrumbs-left">
                  <span className="breadcrumb-current">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>All Storage Buckets</span>
                  </span>
                  <span className="breadcrumb-count-badge">
                    {filteredDatabases.filter((b) => !bucketSearchFilter || b.name.toLowerCase().includes(bucketSearchFilter.toLowerCase())).length} buckets
                  </span>
                  <span className="breadcrumb-separator">·</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {dbStorageFormatted} Local Storage
                  </span>
                </div>
                <div className="breadcrumbs-right">
                  <div className="explorer-search-bar">
                    <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      className="explorer-search-input"
                      placeholder="Filter buckets..."
                      value={bucketSearchFilter}
                      onChange={(e) => setBucketSearchFilter(e.target.value)}
                    />
                    {bucketSearchFilter && (
                      <button
                        type="button"
                        className="explorer-search-clear"
                        onClick={() => setBucketSearchFilter('')}
                        title="Clear filter"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Buckets Grid */}
              {(() => {
                const visibleBuckets = filteredDatabases.filter(
                  (b) => !bucketSearchFilter || b.name.toLowerCase().includes(bucketSearchFilter.toLowerCase())
                )
                if (visibleBuckets.length === 0) {
                  return (
                    <div className="empty-bucket-folder-state">
                      <BucketFolderIcon hasContent={false} />
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {bucketSearchFilter ? `No buckets match "${bucketSearchFilter}"` : 'No Database Buckets Found'}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: 0 }}>
                        {bucketSearchFilter
                          ? 'Try clearing your search query to see all available buckets.'
                          : `User ${username || 'david'} has not poured any documents yet. Use CleaveQL to create your first bucket.`}
                      </p>
                      <button
                        className="btn-primary"
                        onClick={() => {
                          setCqlQuery(`POUR INTO users "jane" {\n  "name": "Jane",\n  "age": 25,\n  "city": "Manila"\n}`)
                          setActiveTab('cleaveql')
                        }}
                        type="button"
                      >
                        <span>Pour Sample Data</span>
                      </button>
                    </div>
                  )
                }

                return (
                  <div className="bucket-folders-grid">
                    {visibleBuckets.map((db) => {
                      const recordsCount = db.records ?? 0
                      const hasContent = recordsCount > 0
                      return (
                        <div
                          key={db.id}
                          className="bucket-folder-card"
                          onClick={() => handleOpenBucket(db)}
                          title={`Click to open "${db.name}" folder`}
                        >
                          <span className={`folder-card-badge-top ${hasContent ? 'active' : 'empty'}`}>
                            {hasContent ? `${recordsCount} items` : 'Empty'}
                          </span>

                          {/* Blue Folder with sticking-out paper if hasContent, and 3D hover animation */}
                          <BucketFolderIcon hasContent={hasContent} />

                          <h4 className="folder-card-name" title={db.name}>
                            {db.name}
                          </h4>
                          <div className="folder-card-meta">
                            <span>{db.size}</span>
                            <span>·</span>
                            <span>{hasContent ? `${recordsCount} doc${recordsCount === 1 ? '' : 's'}` : '0 docs'}</span>
                          </div>
                          <div className="folder-card-footer">
                            <span className="folder-engine-badge">{db.engine}</span>
                            {db.is_system && <span className="folder-system-badge">System</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </>
          ) : (
            /* --- LEVEL 2: INSIDE A SPECIFIC BUCKET (FILES DRILL-DOWN) VIEW --- */
            <>
              <div className="view-header">
                <div className="view-header-left">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedBucket(null)}
                      type="button"
                      style={{ padding: '6px 12px' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                      <span>Back to Buckets</span>
                    </button>
                    <h1 className="view-title" style={{ margin: 0 }}>{selectedBucket.name}</h1>
                  </div>
                  <p className="view-subtitle" style={{ marginTop: '6px' }}>
                    Inspecting documents inside bucket <strong>{selectedBucket.name}</strong>. Click any file to view contents.
                  </p>
                </div>
                <div className="view-header-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => loadBucketDocuments(selectedBucket.name)}
                    type="button"
                    title="Refresh bucket documents"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setNewBucketName(selectedBucket.name)
                      setDrawerError(null)
                      setDrawerSuccess(null)
                      setIsNewDrawerOpen(true)
                    }}
                    type="button"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Breadcrumb Navigation & Document Search */}
              <div className="explorer-breadcrumbs-bar">
                <div className="breadcrumbs-left">
                  <button className="breadcrumb-btn" onClick={() => setSelectedBucket(null)} type="button">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Buckets</span>
                  </button>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{selectedBucket.name}</span>
                  </span>
                  <span className="breadcrumb-count-badge">
                    {bucketDocuments.length} document{bucketDocuments.length === 1 ? '' : 's'}
                  </span>
                  <span className="breadcrumb-separator">·</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {selectedBucket.size} · Engine: {selectedBucket.engine}
                  </span>
                </div>
                <div className="breadcrumbs-right">
                  <div className="explorer-search-bar">
                    <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      className="explorer-search-input"
                      placeholder="Search files by ID..."
                      value={docSearchFilter}
                      onChange={(e) => setDocSearchFilter(e.target.value)}
                    />
                    {docSearchFilter && (
                      <button
                        type="button"
                        className="explorer-search-clear"
                        onClick={() => setDocSearchFilter('')}
                        title="Clear search"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Files Grid or Loading/Empty State */}
              {isLoadingDocs ? (
                <div className="empty-bucket-folder-state">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb', fontWeight: 600 }}>
                    <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    <span>Retrieving documents from bucket "{selectedBucket.name}"...</span>
                  </div>
                </div>
              ) : (() => {
                const filteredDocs = bucketDocuments.filter((d) => {
                  if (!docSearchFilter) return true
                  const q = docSearchFilter.toLowerCase()
                  return (
                    d.id.toLowerCase().includes(q) ||
                    d.gid.toLowerCase().includes(q) ||
                    JSON.stringify(d.body).toLowerCase().includes(q)
                  )
                })

                if (filteredDocs.length === 0) {
                  if (bucketDocuments.length === 0) {
                    return (
                      <div className="empty-bucket-folder-state">
                        <BucketFolderIcon hasContent={false} />
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>This Folder is Empty</h3>
                        <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: 0 }}>
                          Bucket <strong>{selectedBucket.name}</strong> currently has no documents. You can pour documents into this bucket using CleaveQL.
                        </p>
                        <button
                          className="btn-primary"
                          onClick={() => {
                            setCqlQuery(`POUR INTO ${selectedBucket.name} "item_1" {\n  "message": "Hello from CleaveDB!"\n}`)
                            setActiveTab('cleaveql')
                          }}
                          type="button"
                        >
                          <span>Pour First Document</span>
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div className="empty-bucket-folder-state">
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: 0 }}>
                        No files matching "{docSearchFilter}"
                      </h3>
                      <button className="btn-secondary" onClick={() => setDocSearchFilter('')} type="button">
                        Clear Filter
                      </button>
                    </div>
                  )
                }

                return (
                  <div className="bucket-files-grid">
                    {filteredDocs.map((doc) => {
                      const keys = Object.keys(doc.body || {})
                      return (
                        <div
                          key={doc.gid}
                          className="doc-file-card"
                          onClick={() => setSelectedDoc(doc)}
                          title={`Click to inspect document "${doc.id}"`}
                        >
                          <div className="doc-file-header">
                            <DocFileIcon />
                            <span className="doc-file-keys-badge">{keys.length} fields</span>
                          </div>
                          <div className="doc-file-info">
                            {/* The title of each file is the ID of the data! */}
                            <div className="doc-file-title" title={doc.id}>
                              {doc.id}
                            </div>
                            <div className="doc-file-meta">
                              <span>{doc.size || '32 B'}</span>
                              <span>·</span>
                              <span>GID: {doc.gid}</span>
                            </div>
                            {keys.length > 0 && (
                              <div className="doc-file-preview-chips">
                                {keys.slice(0, 3).map((k) => (
                                  <span key={k} className="doc-preview-chip">
                                    {k}
                                  </span>
                                ))}
                                {keys.length > 3 && (
                                  <span className="doc-preview-chip" style={{ color: '#94a3b8' }}>
                                    +{keys.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </>
          )}
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
                <div className={`cql-${cqlStatus === 'Success' ? 'success' : 'error'}-pill`}>
                  <span className={cqlStatus === 'Success' ? 'cql-dot-green' : 'cql-dot-red'} />
                  <span>{cqlStatus} · {cqlExecutionTime}</span>
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
                      <span>{getDocKey()}</span>
                      <button
                        type="button"
                        className="cql-copy-btn"
                        onClick={() => handleCopyId(getDocKey())}
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
                    {getDocumentFields().map((field, fIdx) => (
                      <div className="cql-field-row" key={fIdx}>
                        <div className="cql-type-icon">{field.iconType || 'T'}</div>
                        <div className="cql-field-name-wrap">
                          <span className="cql-field-name">{field.name}</span>
                          <span className="cql-field-type">{field.type}</span>
                        </div>
                        <div className="cql-field-value">{String(field.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Content: Raw JSON */}
              {cqlResultTab === 'raw' && (
                <div className="cql-raw-json-view">
                  <pre>{JSON.stringify(cqlResultData || {
                    id: "users:jane",
                    document: {
                      name: "Jane",
                      age: 25,
                      city: "Manila"
                    },
                    _partition: "partition_primary_01",
                    _status: "committed",
                    _timestamp: new Date().toISOString()
                  }, null, 2)}</pre>
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
                    <span className="cql-meta-val">
                      {telemetry?.cluster?.has_quorum ? 'Healthy · 100% Quorum' : 'Active'} · Leader {telemetry?.cluster?.leader || '127.0.0.1:8311'}
                    </span>
                  </div>
                  <div className="cql-meta-row">
                    <span className="cql-meta-label">Write Journal</span>
                    <span className="cql-meta-val">Committed to WAL</span>
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
                  <span className="settings-badge-role">
                    {isSuperUser ? 'Super User (Developer Access)' : 'Local Cluster Administrator'}
                  </span>
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
                  <span className="settings-row-val font-mono">v4.0.2 (x64 Windows)</span>
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

      {/* SMOOTH ANIMATED DOCUMENT CONTENT MODAL */}
      {selectedDoc && (
        <div className="doc-modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="doc-modal-window" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="doc-modal-header">
              <div className="doc-modal-title-area">
                <div className="doc-modal-icon-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <div className="doc-modal-title">
                    <span className="doc-modal-title-label">Document:</span>
                    <span className="doc-modal-title-id">{selectedDoc.id}</span>
                  </div>
                  <div className="doc-modal-subtitle">
                    <span className="doc-modal-crumb">
                      Bucket: <strong>{selectedBucket?.name}</strong>
                    </span>
                    <span className="doc-modal-divider">·</span>
                    <span className="doc-modal-gid">
                      GID: <code>{selectedDoc.gid}</code>
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="doc-modal-close-btn"
                onClick={() => setSelectedDoc(null)}
                type="button"
                aria-label="Close modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Toolbar with view switch & copy button */}
            <div className="doc-modal-toolbar">
              <div className="doc-modal-tabs">
                <button
                  className={`doc-tab-btn ${docModalTab === 'fields' ? 'active' : ''}`}
                  onClick={() => setDocModalTab('fields')}
                  type="button"
                >
                  Fields & Values
                </button>
                <button
                  className={`doc-tab-btn ${docModalTab === 'json' ? 'active' : ''}`}
                  onClick={() => setDocModalTab('json')}
                  type="button"
                >
                  Raw JSON
                </button>
              </div>
              <div className="doc-modal-actions">
                <button className="doc-modal-copy-btn" onClick={handleCopyDocJson} type="button">
                  {docCopied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="doc-modal-body">
              {docModalTab === 'fields' ? (
                <div className="doc-fields-table-wrapper">
                  <table className="doc-fields-table">
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Type</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedDoc.body || {}).map(([key, val]) => (
                        <tr key={key}>
                          <td className="doc-field-key font-mono">{key}</td>
                          <td className="doc-field-type">
                            <span className={`type-tag type-${typeof val}`}>
                              {Array.isArray(val) ? 'array' : typeof val}
                            </span>
                          </td>
                          <td className="doc-field-value">
                            {typeof val === 'object' && val !== null ? (
                              <pre className="inline-json">{JSON.stringify(val, null, 2)}</pre>
                            ) : typeof val === 'boolean' ? (
                              <span className={`bool-badge ${val ? 'bool-true' : 'bool-false'}`}>{String(val)}</span>
                            ) : (
                              <span className="scalar-value">{String(val)}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="doc-json-viewer">
                  <pre className="doc-code-block font-mono">
                    {JSON.stringify(selectedDoc.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="doc-modal-footer">
              <div className="doc-footer-meta">
                <span>{Object.keys(selectedDoc.body || {}).length} fields</span>
                <span>·</span>
                <span>Approx. {selectedDoc.size || '32 B'}</span>
              </div>
              <div className="doc-footer-buttons">
                <button className="btn-secondary" onClick={() => setSelectedDoc(null)} type="button">
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setCqlQuery(`FIND ${selectedBucket?.name} "${selectedDoc.id}"`)
                    setActiveTab('cleaveql')
                    setSelectedDoc(null)
                  }}
                  type="button"
                >
                  Inspect in CleaveQL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPABASE-STYLE SLIDE-OUT DRAWER (RIGHT SIDEBAR) */}
      <div
        className={`supabase-drawer-backdrop ${isNewDrawerOpen ? 'open' : ''}`}
        onClick={() => {
          if (!isDrawerSubmitting) setIsNewDrawerOpen(false)
        }}
      />
      <div className={`supabase-drawer-panel ${isNewDrawerOpen ? 'open' : ''}`}>
        {/* Drawer Header */}
        <div className="supabase-drawer-header">
          <div className="supabase-drawer-header-left">
            <div className="supabase-drawer-title-row">
              <h3 className="supabase-drawer-title">
                {selectedBucket ? `Insert document under ${selectedBucket.name}` : 'Create a new bucket'}
              </h3>
              <span className="supabase-drawer-schema-pill">cleavedb</span>
            </div>
            <p className="supabase-drawer-subtitle">
              Configure bucket policies and define initial schema attributes according to CleaveDB specifications.
            </p>
          </div>
          <button
            className="supabase-drawer-close-btn"
            onClick={() => setIsNewDrawerOpen(false)}
            type="button"
            title="Close drawer (Esc)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="supabase-drawer-body">
          {drawerError && (
            <div className="drawer-banner-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{drawerError}</span>
            </div>
          )}

          {drawerSuccess && (
            <div className="drawer-banner-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{drawerSuccess}</span>
            </div>
          )}

          {/* Bucket Name */}
          <div className="drawer-field-group">
            <label className="drawer-field-label">
              <span>Bucket Name</span>
              <span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="drawer-field-input mono"
              placeholder="e.g. users, products, telemetry"
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
            />
            <span className="drawer-field-hint">
              Documents in CleaveDB are grouped into buckets. Names are alphanumeric with underscores.
            </span>
          </div>

          {/* Description (Optional) */}
          <div className="drawer-field-group">
            <label className="drawer-field-label">Description</label>
            <input
              type="text"
              className="drawer-field-input"
              placeholder="Optional schema description or notes"
              value={newBucketDescription}
              onChange={(e) => setNewBucketDescription(e.target.value)}
            />
          </div>

          {/* Policies Box */}
          <div className="drawer-policies-container">
            <div className="drawer-policies-header">
              <h4>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>CleaveDB Bucket Policies (SHAPE BUCKET)</span>
              </h4>
            </div>

            {/* AUDITED */}
            <div className="drawer-policy-item">
              <input
                type="checkbox"
                id="policy-audited"
                className="drawer-policy-checkbox"
                checked={policyAudited}
                onChange={(e) => setPolicyAudited(e.target.checked)}
              />
              <div className="drawer-policy-content">
                <label htmlFor="policy-audited" className="drawer-policy-title-row" style={{ cursor: 'pointer' }}>
                  <span className="drawer-policy-title">Enable Auditing (AUDITED)</span>
                  <span className="drawer-policy-badge">RECOMMENDED</span>
                </label>
                <div className="drawer-policy-desc">
                  Logs all document mutations into CleaveDB's internal <code>_audit_{'{bucket}'}</code> stream.
                </div>
              </div>
            </div>

            {/* VERSIONED */}
            <div className="drawer-policy-item">
              <input
                type="checkbox"
                id="policy-versioned"
                className="drawer-policy-checkbox"
                checked={policyVersioned}
                onChange={(e) => setPolicyVersioned(e.target.checked)}
              />
              <div className="drawer-policy-content">
                <label htmlFor="policy-versioned" className="drawer-policy-title-row" style={{ cursor: 'pointer' }}>
                  <span className="drawer-policy-title">Enable Versioning (VERSIONED)</span>
                </label>
                <div className="drawer-policy-desc">
                  Preserves document snapshots across writes, allowing time-travel queries via <code>REWIND</code>.
                </div>
              </div>
            </div>

            {/* MAX DOCUMENTS */}
            <div className="drawer-policy-item">
              <input
                type="checkbox"
                id="policy-max-docs"
                className="drawer-policy-checkbox"
                checked={policyMaxDocsEnabled}
                onChange={(e) => setPolicyMaxDocsEnabled(e.target.checked)}
              />
              <div className="drawer-policy-content">
                <label htmlFor="policy-max-docs" className="drawer-policy-title-row" style={{ cursor: 'pointer' }}>
                  <span className="drawer-policy-title">Document Capacity Limit (MAX DOCUMENTS)</span>
                </label>
                <div className="drawer-policy-desc">
                  Enforces a maximum document ceiling; automatically replaces least recently used documents.
                </div>
                {policyMaxDocsEnabled && (
                  <div className="drawer-policy-extra-input">
                    <span style={{ fontSize: '12px', color: '#475569' }}>Limit:</span>
                    <input
                      type="number"
                      min="1"
                      className="drawer-input-inline"
                      style={{ width: '110px' }}
                      value={policyMaxDocs}
                      onChange={(e) => setPolicyMaxDocs(parseInt(e.target.value, 10) || 100)}
                    />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>documents</span>
                  </div>
                )}
              </div>
            </div>

            {/* TTL */}
            <div className="drawer-policy-item">
              <input
                type="checkbox"
                id="policy-ttl"
                className="drawer-policy-checkbox"
                checked={policyTtlEnabled}
                onChange={(e) => setPolicyTtlEnabled(e.target.checked)}
              />
              <div className="drawer-policy-content">
                <label htmlFor="policy-ttl" className="drawer-policy-title-row" style={{ cursor: 'pointer' }}>
                  <span className="drawer-policy-title">Document Expiration (TTL)</span>
                </label>
                <div className="drawer-policy-desc">
                  CleaveDB automatically cleans up documents older than the specified duration.
                </div>
                {policyTtlEnabled && (
                  <div className="drawer-policy-extra-input">
                    <input
                      type="number"
                      min="1"
                      className="drawer-input-inline"
                      style={{ width: '90px' }}
                      value={policyTtlValue}
                      onChange={(e) => setPolicyTtlValue(parseInt(e.target.value, 10) || 60)}
                    />
                    <select
                      className="drawer-select-inline"
                      style={{ width: '120px' }}
                      value={policyTtlUnit}
                      onChange={(e) => setPolicyTtlUnit(e.target.value as any)}
                    >
                      <option value="SECONDS">SECONDS</option>
                      <option value="MINUTES">MINUTES</option>
                      <option value="HOURS">HOURS</option>
                      <option value="DAYS">DAYS</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Information Callout */}
          <div className="drawer-info-callout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <strong>CleaveDB Document Model:</strong> In CleaveDB, documents are JSON objects written via <code>POUR INTO</code>. You can generate a random unique ID with <code>RANDOM</code> or specify a custom document identifier. Dynamic macros like <code>_dtz_</code>, <code>_date_</code>, and <code>_time_</code> are evaluated on write.
            </div>
          </div>

          {/* Columns / Fields Table Section */}
          <div className="drawer-columns-section">
            <div className="drawer-columns-header-bar">
              <h4 className="drawer-columns-title">Columns / Document Fields</h4>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
                onClick={handleAddColumn}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add column</span>
              </button>
            </div>

            <div className="drawer-columns-table">
              <div className="drawer-columns-head">
                <div className="drawer-col-handle"></div>
                <div className="drawer-col-name">Name</div>
                <div className="drawer-col-type">Type</div>
                <div className="drawer-col-default">Default / Value</div>
                <div className="drawer-col-primary">Primary</div>
                <div className="drawer-col-action"></div>
              </div>

              {/* ROW 1: PRIMARY DOCUMENT ID ROW */}
              <div className="drawer-column-row is-primary">
                <div className="drawer-col-handle" title="Primary Key Identifier">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
                    <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5M7 11a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 0v8a3 3 0 0 0 3 3h3" />
                  </svg>
                </div>
                <div className="drawer-col-name">
                  <input
                    type="text"
                    className="drawer-input-inline"
                    value="id"
                    disabled
                    style={{ backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 600 }}
                  />
                </div>
                <div className="drawer-col-type">
                  <div className="drawer-id-strategy-pill">
                    <button
                      type="button"
                      className={`drawer-id-strategy-btn ${idStrategy === 'RANDOM' ? 'active' : ''}`}
                      onClick={() => setIdStrategy('RANDOM')}
                    >
                      RANDOM
                    </button>
                    <button
                      type="button"
                      className={`drawer-id-strategy-btn ${idStrategy === 'CUSTOM' ? 'active' : ''}`}
                      onClick={() => setIdStrategy('CUSTOM')}
                    >
                      Custom
                    </button>
                  </div>
                </div>
                <div className="drawer-col-default">
                  {idStrategy === 'RANDOM' ? (
                    <span style={{ fontSize: '12px', color: '#2563eb', fontFamily: 'monospace', fontWeight: 600 }}>
                      RANDOM (CleaveDB UUID)
                    </span>
                  ) : (
                    <input
                      type="text"
                      className="drawer-input-inline mono"
                      placeholder="e.g. user_101 or order_abc"
                      value={customIdValue}
                      onChange={(e) => setCustomIdValue(e.target.value)}
                    />
                  )}
                </div>
                <div className="drawer-col-primary">
                  <span className="drawer-primary-badge" title="Primary Key">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </span>
                </div>
                <div className="drawer-col-action"></div>
              </div>

              {/* DYNAMIC FIELD ROWS */}
              {columns.map((col) => (
                <div key={col.id} className="drawer-column-row">
                  <div className="drawer-col-handle" style={{ color: '#cbd5e1' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="6" r="1.5" />
                      <circle cx="15" cy="6" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="18" r="1.5" />
                      <circle cx="15" cy="18" r="1.5" />
                    </svg>
                  </div>
                  <div className="drawer-col-name">
                    <input
                      type="text"
                      className="drawer-input-inline"
                      placeholder="column_name"
                      value={col.name}
                      onChange={(e) => handleUpdateColumn(col.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="drawer-col-type">
                    <select
                      className="drawer-select-inline"
                      value={col.type}
                      onChange={(e) => handleUpdateColumn(col.id, { type: e.target.value as any })}
                    >
                      <option value="string">string</option>
                      <option value="integer">integer</option>
                      <option value="float">float</option>
                      <option value="boolean">boolean</option>
                      <option value="date">date</option>
                      <option value="array">array</option>
                      <option value="object">object</option>
                    </select>
                  </div>
                  <div className="drawer-col-default" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="text"
                      className="drawer-input-inline"
                      placeholder={col.type === 'date' ? '_dtz_, _date_, or _time_' : 'Default value'}
                      value={col.defaultValue}
                      onChange={(e) => handleUpdateColumn(col.id, { defaultValue: e.target.value })}
                    />
                    {col.type === 'date' && (
                      <button
                        type="button"
                        title="Use CleaveDB _dtz_ macro"
                        style={{
                          fontSize: '10px',
                          padding: '2px 5px',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderRadius: '4px',
                          color: '#2563eb',
                          cursor: 'pointer',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                        onClick={() => handleUpdateColumn(col.id, { defaultValue: '_dtz_' })}
                      >
                        _dtz_
                      </button>
                    )}
                  </div>
                  <div className="drawer-col-primary">
                    <input type="checkbox" disabled style={{ accentColor: '#cbd5e1', cursor: 'not-allowed' }} />
                  </div>
                  <div className="drawer-col-action">
                    <button
                      type="button"
                      className="drawer-del-btn"
                      onClick={() => handleRemoveColumn(col.id)}
                      title="Remove column"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="drawer-add-col-btn" onClick={handleAddColumn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add column</span>
            </button>
          </div>

          {/* Live CleaveQL Query Preview */}
          <div className="drawer-field-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="drawer-field-label" style={{ margin: 0 }}>
                <span>Generated CleaveQL Preview</span>
              </label>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setShowCqlPreview(!showCqlPreview)}
              >
                {showCqlPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            {showCqlPreview && (
              <div className="drawer-cql-preview-box">
                <pre className="drawer-cql-code">
                  {(() => {
                    const { shapeQuery, pourQuery } = generateCleaveQLStatements()
                    return `${shapeQuery ? shapeQuery + ';\n' : ''}${pourQuery};`
                  })()}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="supabase-drawer-footer">
          <button
            className="btn-secondary"
            onClick={() => setIsNewDrawerOpen(false)}
            disabled={isDrawerSubmitting}
            type="button"
          >
            Cancel
          </button>
          <div className="supabase-drawer-footer-right">
            <button
              className="btn-primary"
              onClick={handleSaveAndPour}
              disabled={isDrawerSubmitting}
              type="button"
              style={{ minWidth: '130px' }}
            >
              {isDrawerSubmitting ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  <span>Pouring...</span>
                </>
              ) : (
                <span>Save &amp; Pour</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}
