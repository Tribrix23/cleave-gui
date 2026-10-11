import { useState } from 'react'
import TitleBar from './components/TitleBar'
import LoginPage from './components/LoginPage'
import DashboardPage from './components/DashboardPage'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard'>('login')
  const [loggedInUser, setLoggedInUser] = useState<string>('')

  const handleSignInSuccess = async (username: string): Promise<void> => {
    setLoggedInUser(username)
    setCurrentPage('dashboard')

    // Trigger smooth window maximization
    try {
      if (window.api?.maximizeWindowSmooth) {
        await window.api.maximizeWindowSmooth()
      } else if (window.api?.maximizeWindow) {
        window.api.maximizeWindow()
      }
    } catch (err) {
      console.error('Error during smooth maximize:', err)
    }
  }

  const handleSignOut = async (): Promise<void> => {
    setLoggedInUser('')
    setCurrentPage('login')

    // Restore window dimensions smoothly upon sign out
    try {
      if (window.api?.restoreWindowSmooth) {
        await window.api.restoreWindowSmooth()
      }
    } catch (err) {
      console.error('Error during window restore:', err)
    }
  }

  return (
    <div className="app-shell">
      <TitleBar title="CleaveDB" />
      <main className={`app-main ${currentPage === 'dashboard' ? 'app-main-dashboard' : ''}`}>
        {currentPage === 'login' ? (
          <LoginPage onSignInSuccess={handleSignInSuccess} />
        ) : (
          <DashboardPage username={loggedInUser} onSignOut={handleSignOut} />
        )}
      </main>
    </div>
  )
}

export default App
