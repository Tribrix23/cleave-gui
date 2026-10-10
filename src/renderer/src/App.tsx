import TitleBar from './components/TitleBar'
import LoginPage from './components/LoginPage'

function App(): React.JSX.Element {
  return (
    <div className="app-shell">
      <TitleBar title="CleaveDB" />
      <main className="app-main">
        <LoginPage />
      </main>
    </div>
  )
}

export default App
