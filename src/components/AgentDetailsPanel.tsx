import { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import type { LogEntry } from '../types/agent'
import { PixelCharacter } from './PixelCharacter'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  idle:    { label: 'IDLE',    cls: 'badge badge-idle' },
  running: { label: 'RUNNING', cls: 'badge badge-running running-pulse' },
  done:    { label: 'DONE',    cls: 'badge badge-done' },
  error:   { label: 'ERROR',   cls: 'badge badge-error' },
}

const DEPT_COLOR: Record<string, string> = {
  Engineering: '#4a9eff',
  Executive:   '#a855f7',
  General:     '#22d3ee',
  Product:     '#f97316',
}

function LogLine({ entry }: { entry: LogEntry }) {
  const cls =
    entry.type === 'system' ? 'log-entry log-system'
    : entry.type === 'done'   ? 'log-entry log-done'
    : entry.type === 'error'  ? 'log-entry log-error'
    : 'log-entry'
  return (
    <div className={cls} style={{ marginBottom: '7px', lineHeight: '1.7' }}>
      <span style={{ color: '#333', fontSize: '6px', marginRight: '5px' }}>[{entry.timestamp}]</span>
      {entry.message}
    </div>
  )
}

export function AgentDetailsPanel() {
  const selectedAgent = useStore((s) => s.selectedAgent())
  const taskInput     = useStore((s) => s.taskInput)
  const setTaskInput  = useStore((s) => s.setTaskInput)
  const runTask       = useStore((s) => s.runTask)
  const openModal     = useStore((s) => s.openModal)
  const deleteAgent   = useStore((s) => s.deleteAgent)
  const selectAgent   = useStore((s) => s.selectAgent)
  const logRef        = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [selectedAgent?.logs])

  if (!selectedAgent) {
    return (
      <aside style={{
        width: '260px', minWidth: '260px',
        background: '#06060e',
        borderLeft: '2px solid #16162a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '10px', color: '#252545',
      }}>
        <div style={{ fontSize: '28px', opacity: 0.3 }}>👾</div>
        <div style={{ fontSize: '7px', textAlign: 'center', lineHeight: 2, letterSpacing: '1px' }}>
          CLICK AN AGENT<br/>TO BEGIN
        </div>
      </aside>
    )
  }

  const badge     = STATUS_BADGE[selectedAgent.status]
  const deptColor = DEPT_COLOR[selectedAgent.department] ?? '#4a9eff'
  const isRunning = selectedAgent.status === 'running'
  const logs      = [...selectedAgent.logs].reverse()

  const handleRun = () => {
    if (!taskInput.trim() || isRunning) return
    runTask(selectedAgent.id, taskInput.trim())
  }

  return (
    <aside
      className="slide-right"
      style={{
        width: '260px', minWidth: '260px',
        background: '#06060e',
        borderLeft: `2px solid ${deptColor}22`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: `1px solid ${deptColor}18`,
        background: `linear-gradient(180deg, ${deptColor}08 0%, transparent 100%)`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '44px',
            height: selectedAgent.avatar.startsWith('sprite:') ? '60px' : '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${deptColor}12`,
            border: `2px solid ${deptColor}44`,
            boxShadow: `0 0 12px ${deptColor}22`,
            flexShrink: 0,
          }}>
            {selectedAgent.avatar.startsWith('sprite:')
              ? <PixelCharacter
                  variant={parseInt(selectedAgent.avatar.split(':')[1], 10)}
                  width={40}
                  height={56}
                />
              : <span style={{ fontSize: '24px' }}>{selectedAgent.avatar}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '9px', color: '#d0d0e0', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedAgent.name}
            </div>
            <div style={{ fontSize: '6px', color: deptColor, letterSpacing: '1px' }}>{selectedAgent.department}</div>
            <div style={{ fontSize: '6px', color: '#444', marginTop: '2px' }}>{selectedAgent.role}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={badge.cls}>{badge.label}</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button className="pixel-btn pixel-btn-primary pixel-btn-sm" onClick={() => openModal(selectedAgent)}>EDIT</button>
            <button className="pixel-btn pixel-btn-danger pixel-btn-sm" onClick={() => {
              if (confirm(`Delete "${selectedAgent.name}"?`)) { deleteAgent(selectedAgent.id); selectAgent(null) }
            }}>DEL</button>
          </div>
        </div>
      </div>

      {/* Model + system prompt */}
      <div style={{ padding: '8px 12px', borderBottom: `1px solid #10101e`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '6px', color: '#333', letterSpacing: '1px' }}>MODEL</span>
          <span style={{ fontSize: '6px', color: '#555' }}>
            {selectedAgent.model.replace('claude-', '').replace('-20251001', '')}
          </span>
        </div>
        <div style={{ fontSize: '6px', color: '#2a2a44', lineHeight: '1.7', maxHeight: '32px', overflowY: 'auto', wordBreak: 'break-word' }}>
          {selectedAgent.systemPrompt}
        </div>
      </div>

      {/* Activity log */}
      <div style={{ padding: '5px 12px 3px', fontSize: '6px', color: '#252545', letterSpacing: '2px', flexShrink: 0 }}>
        ACTIVITY LOG
      </div>
      <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 8px', minHeight: 0 }}>
        {logs.length === 0
          ? <div style={{ fontSize: '7px', color: '#1a1a30' }}>No activity yet.</div>
          : logs.map((e) => <LogLine key={e.id} entry={e} />)
        }
      </div>

      {/* Task input */}
      <div style={{
        borderTop: `1px solid ${deptColor}18`,
        padding: '10px',
        background: `${deptColor}05`,
        display: 'flex', flexDirection: 'column', gap: '7px',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '6px', color: deptColor + '77', letterSpacing: '2px' }}>▸ ASSIGN TASK</div>
        <textarea
          className="pixel-textarea"
          style={{ height: '68px', fontSize: '7px', resize: 'none' }}
          placeholder={isRunning ? `${selectedAgent.name} is working...` : `Task for ${selectedAgent.name}... (Ctrl+Enter)`}
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun() }}
          disabled={isRunning}
        />
        <button
          className={`pixel-btn ${isRunning ? '' : 'pixel-btn-success'}`}
          style={{ width: '100%', fontSize: '7px' }}
          onClick={handleRun}
          disabled={isRunning || !taskInput.trim()}
        >
          {isRunning
            ? <span className="running-pulse">◉ RUNNING...</span>
            : '▶ RUN TASK'}
        </button>
      </div>
    </aside>
  )
}
