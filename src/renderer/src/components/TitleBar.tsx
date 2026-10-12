import { useEffect, useState } from 'react'
import cleaveLogo from '../assets/cleavedb-logo.png'
import { TutorialModal, ContactDeveloperModal } from './HelpModals'

interface TitleBarProps {
  title?: string
  isDashboard?: boolean
}

export default function TitleBar({ title = 'CleaveDB', isDashboard = false }: TitleBarProps): React.JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [activeHelpModal, setActiveHelpModal] = useState<'tutorial' | 'contact' | null>(null)

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
            <div
              className={`titlebar-help-wrapper ${isHelpOpen && !activeHelpModal ? 'is-open' : ''}`}
              onMouseEnter={() => !activeHelpModal && setIsHelpOpen(true)}
              onMouseLeave={() => setIsHelpOpen(false)}
            >
              <button
                type="button"
                className="titlebar-help-btn"
                onClick={() => setIsHelpOpen((prev) => !prev)}
                aria-expanded={isHelpOpen && !activeHelpModal}
                aria-label="Help menu"
              >
                <span>Help</span>
                <svg
                  className="help-chevron"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {!activeHelpModal && (
                <div className="titlebar-help-dropdown">
                  <button
                    type="button"
                    className="help-dropdown-item"
                    onClick={() => {
                      setIsHelpOpen(false)
                      setActiveHelpModal('tutorial')
                    }}
                  >
                  <div className="help-item-icon-box tutorial-box">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <div className="help-item-text">
                    <span className="help-item-title">Tutorial</span>
                    <span className="help-item-desc">Interactive guide & tour</span>
                  </div>
                </button>

                <div className="help-dropdown-divider" />

                <button
                  type="button"
                  className="help-dropdown-item"
                  onClick={() => {
                    setIsHelpOpen(false)
                    setActiveHelpModal('contact')
                  }}
                >
                  <div className="help-item-icon-box contact-box">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div className="help-item-text">
                    <span className="help-item-title">Contact Developer</span>
                    <span className="help-item-desc">Support & email inquiries</span>
                  </div>
                </button>
              </div>
              )}
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

    {/* Help Modals */}
    <TutorialModal
      isOpen={activeHelpModal === 'tutorial'}
      onClose={() => setActiveHelpModal(null)}
    />
    <ContactDeveloperModal
      isOpen={activeHelpModal === 'contact'}
      onClose={() => setActiveHelpModal(null)}
    />
  </>
  )
}
