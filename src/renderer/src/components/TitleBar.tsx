import { useEffect, useState } from 'react'
import CleaveLogo from './CleaveLogo'

interface TitleBarProps {
  title?: string
}

export default function TitleBar({ title = 'CleaveDB' }: TitleBarProps): React.JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)

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
    <header className="custom-titlebar">
      <div className="titlebar-drag-region">
        <div className="titlebar-branding">
          <CleaveLogo size={16} />
          <span className="titlebar-title">{title}</span>
        </div>
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
  )
}
