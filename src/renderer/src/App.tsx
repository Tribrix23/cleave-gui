import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Cleave GUI</div>
      <div className="text">
        Powered by <span className="react">Vite</span> &amp; <span className="ts">Electron</span>
      </div>
      <p className="tip">
        High-performance desktop app template ready for development.
      </p>
      <div className="actions">
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Test IPC Ping
          </a>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
