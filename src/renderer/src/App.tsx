import TitleBar from './components/TitleBar'

function App(): React.JSX.Element {
  return (
    <div className="app-shell">
      <TitleBar title="Cleave GUI" />
      <main className="app-main"></main>
    </div>
  )
}

export default App
