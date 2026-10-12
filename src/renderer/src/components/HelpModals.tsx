import { useEffect, useState } from 'react'

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps): React.JSX.Element | null {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="help-modal-backdrop" onClick={onClose}>
      <div className="help-modal-card tutorial-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="help-modal-header">
          <div className="help-modal-title-group">
            <div className="help-modal-icon-badge tutorial-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <div className="help-modal-title-row">
                <h3 className="help-modal-title">CleaveDB Tutorial & Quick Guide</h3>
                <span className="tutorial-version-pill">v4.0.1</span>
              </div>
              <p className="help-modal-subtitle">Quick interactive overview to get the most out of CleaveDB</p>
            </div>
          </div>
          <button type="button" className="help-modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="help-modal-body">
          <div className="tutorial-grid">
            {/* Guide Card 1 */}
            <div className="tutorial-card">
              <div className="tutorial-card-header">
                <div className="tutorial-card-number">1</div>
                <h4 className="tutorial-card-title">Real-Time Cluster Telemetry</h4>
              </div>
              <p className="tutorial-card-text">
                The <strong>Overview</strong> dashboard streams real-time request rates, p95/p99 latency metrics, active clusters, and live host disk drive utilization.
              </p>
              <div className="tutorial-card-tip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Hover over the live request curve to inspect exact real-time telemetry timestamps.</span>
              </div>
            </div>

            {/* Guide Card 2 */}
            <div className="tutorial-card">
              <div className="tutorial-card-header">
                <div className="tutorial-card-number">2</div>
                <h4 className="tutorial-card-title">Multi-Model Database Engines</h4>
              </div>
              <p className="tutorial-card-text">
                CleaveDB powers 9 multi-engine catalogs, including <strong>Columnar LSM</strong>, <strong>Document Vector</strong>, <strong>In-Memory KeyValue</strong>, and <strong>Append-Only Log</strong>.
              </p>
              <div className="tutorial-card-tip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Filter catalogs instantly with the search bar to view collection schemas and sizes.</span>
              </div>
            </div>

            {/* Guide Card 3 */}
            <div className="tutorial-card">
              <div className="tutorial-card-header">
                <div className="tutorial-card-number">3</div>
                <h4 className="tutorial-card-title">CleaveQL Query Language (CQL)</h4>
              </div>
              <p className="tutorial-card-text">
                Query high-speed datasets using native CQL statements. Try out commands like:
              </p>
              <div className="tutorial-code-snippets">
                <code>POUR INTO users "jane" {'{ "name": "Jane", "age": 25 }'}</code>
                <code>SCOOP users</code>
                <code>SHOW BUCKETS</code>
              </div>
              <div className="tutorial-card-tip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> inside the CleaveQL editor to execute queries immediately.</span>
              </div>
            </div>

            {/* Guide Card 4 */}
            <div className="tutorial-card">
              <div className="tutorial-card-header">
                <div className="tutorial-card-number">4</div>
                <h4 className="tutorial-card-title">Sidebar Collapsing & Expansion</h4>
              </div>
              <p className="tutorial-card-text">
                The sidebar is <strong>collapsed by default</strong> for a clean workspace. Hover the top-left CleaveDB icon to smoothly reveal the open/collapse toggle.
              </p>
              <div className="tutorial-card-tip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>Clicking your avatar at the bottom of the collapsed sidebar opens Settings directly.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="help-modal-footer">
          <button type="button" className="help-modal-primary-btn" onClick={onClose}>
            Got It, Let&apos;s Build!
          </button>
        </div>
      </div>
    </div>
  )
}

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ContactDeveloperModal({ isOpen, onClose }: ContactModalProps): React.JSX.Element | null {
  const [copiedType, setCopiedType] = useState<'email' | 'repo' | null>(null)
  const [topic, setTopic] = useState('bug')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setIsSent(false)
    setMessage('')
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const copyToClipboard = (text: string, type: 'email' | 'repo'): void => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => {
      setCopiedType(null)
    }, 2000)
  }

  const handleSendMessage = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!message.trim()) return
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setIsSent(true)
      setMessage('')
    }, 600)
  }

  if (!isOpen) return null

  return (
    <div className="help-modal-backdrop" onClick={onClose}>
      <div className="help-modal-card contact-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="help-modal-header">
          <div className="help-modal-title-group">
            <div className="help-modal-icon-badge contact-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3 className="help-modal-title">Contact CleaveDB Developer</h3>
              <p className="help-modal-subtitle">Direct channels & feedback for the core engineering team</p>
            </div>
          </div>
          <button type="button" className="help-modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="help-modal-body">
          {/* Direct channels */}
          <div className="contact-channels">
            <div className="contact-channel-card">
              <div className="channel-icon-col">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="channel-info-col">
                <span className="channel-label">Developer Email</span>
                <span className="channel-value">dev@cleavedb.internal</span>
              </div>
              <button
                type="button"
                className="channel-action-btn"
                onClick={() => copyToClipboard('dev@cleavedb.internal', 'email')}
              >
                {copiedType === 'email' ? 'Copied ✓' : 'Copy'}
              </button>
            </div>

            <div className="contact-channel-card">
              <div className="channel-icon-col">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </div>
              <div className="channel-info-col">
                <span className="channel-label">Repository & Issues</span>
                <span className="channel-value">github.com/cleavedb/cleave-gui</span>
              </div>
              <button
                type="button"
                className="channel-action-btn"
                onClick={() => copyToClipboard('https://github.com/cleavedb/cleave-gui', 'repo')}
              >
                {copiedType === 'repo' ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick message form */}
          <form className="contact-form" onSubmit={handleSendMessage}>
            <div className="contact-form-row">
              <label htmlFor="contact-topic" className="contact-label">Subject</label>
              <select
                id="contact-topic"
                className="contact-select"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="bug">Bug Report / Defect</option>
                <option value="feature">Feature Request</option>
                <option value="perf">Performance / Latency</option>
                <option value="general">General Feedback</option>
              </select>
            </div>

            <div className="contact-form-row">
              <label htmlFor="contact-message" className="contact-label">Message</label>
              <textarea
                id="contact-message"
                className="contact-textarea"
                rows={3}
                placeholder="Describe your issue, idea, or questions for the CleaveDB developer team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {isSent && (
              <div className="contact-success-banner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>Message received! Thank you for helping improve CleaveDB.</span>
              </div>
            )}

            <div className="contact-form-actions">
              <button
                type="submit"
                className="contact-submit-btn"
                disabled={isSending || !message.trim()}
              >
                {isSending ? 'Sending...' : 'Send to Developer'}
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="help-modal-footer">
          <button type="button" className="help-modal-secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
