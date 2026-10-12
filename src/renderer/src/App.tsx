import { useState } from 'react'
import TitleBar from './components/TitleBar'
import LoginPage from './components/LoginPage'
import DashboardPage from './components/DashboardPage'

function App(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard'>('login')
  const [loggedInUser, setLoggedInUser] = useState<string>('')
  const [isSuperUser, setIsSuperUser] = useState<boolean>(false)

  const handleSignInSuccess = async (username: string, superUser?: boolean): Promise<void> => {
    setLoggedInUser(username)
    setIsSuperUser(!!superUser)
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
    setIsSuperUser(false)
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
    <div className={`app-shell ${currentPage === 'dashboard' ? 'app-shell-dashboard' : ''}`}>
      <TitleBar title="CleaveDB" isDashboard={currentPage === 'dashboard'} />
      <main className={`app-main ${currentPage === 'dashboard' ? 'app-main-dashboard' : ''}`}>
        {currentPage === 'login' ? (
          <LoginPage onSignInSuccess={handleSignInSuccess} />
        ) : (
          <DashboardPage
            username={loggedInUser}
            isSuperUser={isSuperUser}
            onSignOut={handleSignOut}
          />
        )}
      </main>
    </div>
  )
}

export default App
