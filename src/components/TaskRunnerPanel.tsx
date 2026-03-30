import { useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'

export function TaskRunnerPanel() {
  const selectedAgent = useStore((s) => s.selectedAgent())
  const taskInput = useStore((s) => s.taskInput)
  const tasks = useStore((s) => s.tasks)
  const setTaskInput = useStore((s) => s.setTaskInput)
  const runTask = useStore((s) => s.runTask)

  const logRef = useRef<HTMLDivElement>(null)

  // auto scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [tasks])

  const handleRun = () => {
    if (!selectedAgent || !taskInput.trim()) return
    runTask(selectedAgent.id, taskInput.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun()
  }

  const recentTasks = [...tasks].reverse().slice(0, 20)

  return (
    <div
      style={{
        height: '180px',
        minHeight: '180px',
        borderTop: '2px solid #1e1e1e',
        background: '#080808',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '5px 12px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: '8px', color: '#4a9eff', letterSpacing: '2px' }}>▸ TASK RUNNER</div>
        {selectedAgent && (
          <div style={{ fontSize: '7px', color: '#555' }}>
            Agent:{' '}
            <span style={{ color: '#aaa' }}>
              {selectedAgent.avatar} {selectedAgent.name}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Input area */}
        <div
          style={{
            width: '320px',
            minWidth: '320px',
            borderRight: '2px solid #1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            padding: '8px',
            gap: '6px',
          }}
        >
          {!selectedAgent ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', color: '#333' }}>
              Select an agent to run tasks
            </div>
          ) : (
            <>
              <textarea
                className="pixel-textarea"
                style={{ flex: 1, minHeight: 0, fontSize: '8px' }}
                placeholder={`Task for ${selectedAgent.name}... (Ctrl+Enter to run)`}
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={selectedAgent.status === 'running'}
              />
              <button
                className={`pixel-btn ${selectedAgent.status === 'running' ? 'pixel-btn' : 'pixel-btn-success'}`}
                style={{ width: '100%', fontSize: '8px' }}
                onClick={handleRun}
                disabled={selectedAgent.status === 'running' || !taskInput.trim()}
              >
                {selectedAgent.status === 'running' ? (
                  <span className="running-pulse">◉ RUNNING...</span>
                ) : (
                  '▶ RUN TASK'
                )}
              </button>
            </>
          )}
        </div>

        {/* Output log */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '4px 10px', fontSize: '7px', color: '#333', letterSpacing: '1px', borderBottom: '1px solid #111' }}>
            OUTPUT LOG ({tasks.length})
          </div>
          <div
            ref={logRef}
            style={{ flex: 1, overflowY: 'auto', padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            {recentTasks.length === 0 && (
              <div style={{ fontSize: '7px', color: '#2a2a2a', marginTop: '8px' }}>
                No task output yet. Select an agent and run a task.
              </div>
            )}
            {recentTasks.map((task) => (
              <div key={task.id} style={{ borderBottom: '1px solid #111', paddingBottom: '6px' }}>
                {/* Task header */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '3px', alignItems: 'center' }}>
                  <span style={{ fontSize: '6px', color: '#555' }}>
                    {new Date(task.startedAt).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                  <span style={{ fontSize: '7px', color: '#888' }}>{task.agentName}</span>
                  <span
                    style={{ fontSize: '6px' }}
                    className={
                      task.status === 'done' ? 'text-green-400'
                      : task.status === 'error' ? 'text-red-400'
                      : 'text-yellow-400 running-pulse'
                    }
                  >
                    [{task.status}]
                  </span>
                </div>
                {/* Prompt */}
                <div style={{ fontSize: '7px', color: '#555', marginBottom: '3px', fontStyle: 'italic' }}>
                  &gt; {task.prompt}
                </div>
                {/* Output */}
                {task.output && (
                  <div style={{ fontSize: '7px', color: '#22c55e', lineHeight: '1.8', wordBreak: 'break-word' }}>
                    {task.output}
                  </div>
                )}
                {task.status === 'running' && !task.output && (
                  <div className="running-pulse" style={{ fontSize: '7px', color: '#facc15' }}>
                    Processing...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
