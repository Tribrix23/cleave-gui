import { useEffect, useRef, useState } from 'react'
import cleaveLogo from '../assets/cleavedb-logo.png'
import { TutorialModal, ContactDeveloperModal, CheckUpdateModal } from './HelpModals'

interface TitleBarProps {
  title?: string
  isDashboard?: boolean
}

export default function TitleBar({ title = 'CleaveDB', isDashboard = false }: TitleBarProps): React.JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  const [openMenu, setOpenMenu] = useState<'cleavedb' | 'help' | null>(null)
  const [activeHelpModal, setActiveHelpModal] = useState<'tutorial' | 'contact' | 'update' | null>(null)
  const menubarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.api?.isMaximized?.().then((max) => {
      setIsMaximized(max)
    })

    const unsubscribe = window.api?.onMaximizeChange?.((max) => {
      setIsMaximized(max)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  // Close open dropdown when clicking outside
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent): void => {
      if (menubarRef.current && !menubarRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    if (openMenu) {
      document.addEventListener('mousedown', handlePointerDown)
    }
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [openMenu])

  // Close open dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpenMenu(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMinimize = (): void => {
    window.api?.minimizeWindow?.()
  }

  const handleMaximize = (): void => {
    window.api?.maximizeWindow?.()
  }

  const handleClose = (): void => {
    window.api?.closeWindow?.()
  }

  return (
    <>
      <header className={`custom-titlebar ${isDashboard ? 'titlebar-dashboard' : ''}`}>
        <div className="titlebar-drag-region">
          {!isDashboard ? (
            <div className="titlebar-branding">
              <img src={cleaveLogo} alt="CleaveDB Logo" className="titlebar-icon" />
              <span className="titlebar-title">{title}</span>
            </div>
          ) : (
            <div className="titlebar-menubar" ref={menubarRef}>
              {/* 1. CleaveDB Menu */}
              <div className="titlebar-menu-item-wrap">
                <button
                  type="button"
                  className={`titlebar-menu-btn ${openMenu === 'cleavedb' ? 'active' : ''}`}
                  onClick={() => setOpenMenu((prev) => (prev === 'cleavedb' ? null : 'cleavedb'))}
                  aria-expanded={openMenu === 'cleavedb'}
                  aria-label="CleaveDB menu"
                >
                  CleaveDB
                </button>

                {openMenu === 'cleavedb' && !activeHelpModal && (
                  <div className="titlebar-dropdown-panel animate-in">
                    <div className="dropdown-version-row">
                      <svg className="dropdown-item-black-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <div className="dropdown-item-text">
                        <span className="item-title">Current version: 4.0.2</span>
                        <span className="item-desc">Production release</span>
                      </div>
                    </div>

                    <div className="titlebar-dropdown-divider" />

                    <button
                      type="button"
                      className="titlebar-dropdown-item"
                      onClick={() => {
                        setOpenMenu(null)
                        setActiveHelpModal('update')
                      }}
                    >
                      <svg className="dropdown-item-black-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 21h5v-5" />
                      </svg>
                      <div className="dropdown-item-text">
                        <span className="item-title">Check for Updates</span>
                        <span className="item-desc">Check for new releases</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Help Menu */}
              <div className="titlebar-menu-item-wrap">
                <button
                  type="button"
                  className={`titlebar-menu-btn ${openMenu === 'help' ? 'active' : ''}`}
                  onClick={() => setOpenMenu((prev) => (prev === 'help' ? null : 'help'))}
                  aria-expanded={openMenu === 'help'}
                  aria-label="Help menu"
                >
                  Help
                </button>

                {openMenu === 'help' && !activeHelpModal && (
                  <div className="titlebar-dropdown-panel animate-in">
                    <button
                      type="button"
                      className="titlebar-dropdown-item"
                      onClick={() => {
                        setOpenMenu(null)
                        setActiveHelpModal('tutorial')
                      }}
                    >
                      <svg className="dropdown-item-black-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                      <div className="dropdown-item-text">
                        <span className="item-title">Tutorial</span>
                        <span className="item-desc">Interactive guide & tour</span>
                      </div>
                    </button>

                    <div className="titlebar-dropdown-divider" />

                    <button
                      type="button"
                      className="titlebar-dropdown-item"
                      onClick={() => {
                        setOpenMenu(null)
                        setActiveHelpModal('contact')
                      }}
                    >
                      <svg className="dropdown-item-black-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <div className="dropdown-item-text">
                        <span className="item-title">Contact Developer</span>
                        <span className="item-desc">Support & email inquiries</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="titlebar-controls">
          <button
            type="button"
            aria-label="Minimize"
            title="Minimize"
            className="titlebar-btn minimize-btn"
            onClick={handleMinimize}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            title={isMaximized ? 'Restore' : 'Maximize'}
            className="titlebar-btn maximize-btn"
            onClick={handleMaximize}
          >
            {isMaximized ? (
              /* Restore icon - two overlapping rounded squares */
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M3 2.2V1.8C3 1.35 3.35 1 3.8 1H8.2C8.65 1 9 1.35 9 1.8V6.2C9 6.65 8.65 7 8.2 7H7.8"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
                <rect
                  x="1"
                  y="3"
                  width="6"
                  height="6"
                  rx="0.8"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
            ) : (
              /* Maximize icon - single square */
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="8"
                  height="8"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            aria-label="Close"
            title="Close"
            className="titlebar-btn close-btn"
            onClick={handleClose}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Help & Update Modals */}
      <TutorialModal
        isOpen={activeHelpModal === 'tutorial'}
        onClose={() => setActiveHelpModal(null)}
      />
      <ContactDeveloperModal
        isOpen={activeHelpModal === 'contact'}
        onClose={() => setActiveHelpModal(null)}
      />
      <CheckUpdateModal
        isOpen={activeHelpModal === 'update'}
        onClose={() => setActiveHelpModal(null)}
      />
    </>
  )
}
