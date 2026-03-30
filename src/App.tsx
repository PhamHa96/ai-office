import { Sidebar } from './components/Sidebar'
import { OfficeMap } from './components/OfficeMap'
import { AgentDetailsPanel } from './components/AgentDetailsPanel'
import { AgentFormModal } from './components/AgentFormModal'

function App() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#080810' }}>
      <Sidebar />

      {/* Center: full-height map */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{
          padding: '5px 14px',
          borderBottom: '2px solid #16162a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#06060e',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '9px', color: '#4a9eff', letterSpacing: '3px' }}>▸ OFFICE MAP</span>
            <span style={{ fontSize: '6px', color: '#252545' }}>Click agent to select · Drag to move · Ctrl+Enter to run</span>
          </div>
          <span style={{ fontSize: '6px', color: '#252545' }}>Fleet Hall v2.0</span>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <OfficeMap />
        </div>
      </div>

      {/* Right: per-agent command panel */}
      <AgentDetailsPanel />

      <AgentFormModal />
    </div>
  )
}

export default App
