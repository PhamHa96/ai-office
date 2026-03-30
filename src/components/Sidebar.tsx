import { useStore } from '../store/useStore'
import { PixelCharacter } from './PixelCharacter'

const STATUS_ICON: Record<string, string> = {
  idle: '○',
  running: '◉',
  done: '●',
  error: '✕',
}

const STATUS_COLOR: Record<string, string> = {
  idle: 'text-gray-500',
  running: 'text-yellow-400 running-pulse',
  done: 'text-green-400',
  error: 'text-red-400',
}

const DEPT_COLOR: Record<string, string> = {
  Engineering: 'text-blue-400',
  Executive: 'text-purple-400',
  General: 'text-purple-300',
  Product: 'text-red-400',
}

export function Sidebar() {
  const agents = useStore((s) => s.agents)
  const selectedAgentId = useStore((s) => s.selectedAgentId)
  const tasks = useStore((s) => s.tasks)
  const selectAgent = useStore((s) => s.selectAgent)
  const openModal = useStore((s) => s.openModal)
  const resetToDefaults = useStore((s) => s.resetToDefaults)

  const recentTasks = [...tasks].reverse().slice(0, 6)

  return (
    <aside
      className="flex flex-col h-full overflow-hidden"
      style={{ background: '#0a0a0a', borderRight: '2px solid #1e1e1e', width: '200px', minWidth: '200px' }}
    >
      {/* Header */}
      <div style={{ padding: '12px', borderBottom: '2px solid #1e1e1e' }}>
        <div style={{ fontSize: '9px', color: '#4a9eff', marginBottom: '4px', letterSpacing: '2px' }}>
          ▸ FLEET HALL
        </div>
        <div style={{ fontSize: '7px', color: '#444' }}>AI Agent Manager</div>
      </div>

      {/* Agent count */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#e0e0e0' }}>{agents.length}</div>
          <div style={{ fontSize: '6px', color: '#555' }}>AGENTS</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#facc15' }}>
            {agents.filter((a) => a.status === 'running').length}
          </div>
          <div style={{ fontSize: '6px', color: '#555' }}>ACTIVE</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#22c55e' }}>
            {tasks.filter((t) => t.status === 'done').length}
          </div>
          <div style={{ fontSize: '6px', color: '#555' }}>DONE</div>
        </div>
      </div>

      {/* Agents list */}
      <div style={{ padding: '8px 12px 4px', fontSize: '7px', color: '#555', letterSpacing: '1px' }}>
        AGENTS
      </div>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgentId
          return (
            <button
              key={agent.id}
              onClick={() => selectAgent(isSelected ? null : agent.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                background: isSelected ? '#0d2040' : 'transparent',
                border: 'none',
                borderLeft: isSelected ? '3px solid #4a9eff' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#151515'
              }}
              onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <div style={{ width: '20px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {agent.avatar.startsWith('sprite:')
                  ? <PixelCharacter variant={parseInt(agent.avatar.split(':')[1], 10)} width={20} height={36} />
                  : <span style={{ fontSize: '14px' }}>{agent.avatar}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '8px', color: isSelected ? '#4a9eff' : '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.name}
                </div>
                <div className={DEPT_COLOR[agent.department]} style={{ fontSize: '6px', marginTop: '2px' }}>
                  {agent.department}
                </div>
              </div>
              <span
                className={`${STATUS_COLOR[agent.status]} ${agent.status === 'running' ? 'running-pulse' : ''}`}
                style={{ fontSize: '8px' }}
              >
                {STATUS_ICON[agent.status]}
              </span>
            </button>
          )
        })}
      </div>

      {/* New agent button */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #1a1a1a' }}>
        <button className="pixel-btn pixel-btn-primary" style={{ width: '100%', fontSize: '7px' }} onClick={() => openModal()}>
          + NEW AGENT
        </button>
      </div>

      {/* Recent tasks */}
      <div style={{ padding: '8px 12px 4px', fontSize: '7px', color: '#555', letterSpacing: '1px', borderTop: '2px solid #1e1e1e' }}>
        RECENT TASKS
      </div>
      <div style={{ maxHeight: '140px', overflowY: 'auto', paddingBottom: '4px' }}>
        {recentTasks.length === 0 && (
          <div style={{ padding: '8px 12px', fontSize: '7px', color: '#333' }}>No tasks yet.</div>
        )}
        {recentTasks.map((task) => (
          <div key={task.id} style={{ padding: '5px 12px', borderBottom: '1px solid #111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '7px', color: '#666' }}>{task.agentName}</span>
              <span
                style={{ fontSize: '6px' }}
                className={task.status === 'done' ? 'text-green-400' : task.status === 'error' ? 'text-red-400' : 'text-yellow-400 running-pulse'}
              >
                {task.status}
              </span>
            </div>
            <div style={{ fontSize: '7px', color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {task.prompt}
            </div>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #1a1a1a' }}>
        <button
          className="pixel-btn pixel-btn-danger pixel-btn-sm"
          style={{ width: '100%', fontSize: '6px' }}
          onClick={() => {
            if (confirm('Reset all agents to defaults? This clears all data.')) {
              resetToDefaults()
            }
          }}
        >
          ↺ RESET DEFAULTS
        </button>
      </div>
    </aside>
  )
}
