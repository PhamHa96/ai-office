import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Agent, Task, LogEntry, Department } from '../types/agent'
import { DEFAULT_AGENTS } from '../data/defaultAgents'
import { storage } from '../lib/storage'
import { runAgentTask } from '../lib/wsClient'

interface AppState {
  agents: Agent[]
  selectedAgentId: string | null
  tasks: Task[]
  taskInput: string
  isModalOpen: boolean
  editingAgent: Agent | null

  // selectors
  selectedAgent: () => Agent | null

  // agent actions
  selectAgent: (id: string | null) => void
  addAgent: (agent: Omit<Agent, 'id' | 'logs' | 'status'>) => void
  updateAgent: (id: string, patch: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  moveAgent: (id: string, x: number, y: number) => void
  resetToDefaults: () => void

  // task actions
  setTaskInput: (v: string) => void
  runTask: (agentId: string, prompt: string) => void

  // modal
  openModal: (agent?: Agent) => void
  closeModal: () => void
}

function ts(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false })
}

function makeLog(type: LogEntry['type'], message: string): LogEntry {
  return { id: nanoid(), timestamp: ts(), type, message }
}

const initialAgents = storage.loadAgents() ?? DEFAULT_AGENTS
const initialTasks = storage.loadTasks() ?? []
const initialSelected = storage.loadSelected()

export const useStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    agents: initialAgents,
    selectedAgentId: initialSelected,
    tasks: initialTasks,
    taskInput: '',
    isModalOpen: false,
    editingAgent: null,

    selectedAgent: () => {
      const { agents, selectedAgentId } = get()
      return agents.find((a) => a.id === selectedAgentId) ?? null
    },

    selectAgent: (id) => {
      set({ selectedAgentId: id })
      storage.saveSelected(id)
    },

    addAgent: (data) => {
      const agent: Agent = {
        ...data,
        id: `agent-${nanoid(8)}`,
        status: 'idle',
        logs: [makeLog('system', 'Agent initialized and ready.')],
      }
      set((s) => {
        const agents = [...s.agents, agent]
        storage.saveAgents(agents)
        return { agents }
      })
    },

    updateAgent: (id, patch) => {
      set((s) => {
        const agents = s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a))
        storage.saveAgents(agents)
        return { agents }
      })
    },

    deleteAgent: (id) => {
      set((s) => {
        const agents = s.agents.filter((a) => a.id !== id)
        const selectedAgentId = s.selectedAgentId === id ? null : s.selectedAgentId
        storage.saveAgents(agents)
        storage.saveSelected(selectedAgentId)
        return { agents, selectedAgentId }
      })
    },

    moveAgent: (id, x, y) => {
      set((s) => {
        const agents = s.agents.map((a) => (a.id === id ? { ...a, x, y } : a))
        storage.saveAgents(agents)
        return { agents }
      })
    },

    resetToDefaults: () => {
      storage.clear()
      set({ agents: DEFAULT_AGENTS, selectedAgentId: null, tasks: [], taskInput: '' })
    },

    setTaskInput: (v) => set({ taskInput: v }),

    runTask: (agentId, prompt) => {
      if (!prompt.trim()) return
      const agent = get().agents.find((a) => a.id === agentId)
      if (!agent) return

      const taskId = nanoid()
      const startedAt = new Date().toISOString()

      // set agent running + create task entry
      set((s) => {
        const agents = s.agents.map((a) =>
          a.id === agentId
            ? {
                ...a,
                status: 'running' as const,
                logs: [...a.logs, makeLog('task', `Task: "${prompt}"`)],
              }
            : a,
        )
        const tasks = [
          ...s.tasks,
          { id: taskId, agentId, agentName: agent.name, prompt, output: '', startedAt, status: 'running' as const },
        ].slice(-50)
        storage.saveAgents(agents)
        storage.saveTasks(tasks)
        return { agents, tasks, taskInput: '' }
      })

      runAgentTask({
        agentId,
        taskId,
        prompt,
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        onToken: (token) => {
          set((s) => ({
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, output: t.output + token } : t,
            ),
          }))
        },
        onDone: () => {
          const output = get().tasks.find((t) => t.id === taskId)?.output ?? ''
          set((s) => {
            const agents = s.agents.map((a) =>
              a.id === agentId
                ? { ...a, status: 'done' as const, logs: [...a.logs, makeLog('done', output)] }
                : a,
            )
            const tasks = s.tasks.map((t) =>
              t.id === taskId
                ? { ...t, finishedAt: new Date().toISOString(), status: 'done' as const }
                : t,
            )
            storage.saveAgents(agents)
            storage.saveTasks(tasks)
            return { agents, tasks }
          })
        },
        onError: (message) => {
          set((s) => {
            const agents = s.agents.map((a) =>
              a.id === agentId
                ? { ...a, status: 'error' as const, logs: [...a.logs, makeLog('error', message)] }
                : a,
            )
            const tasks = s.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    output: `Error: ${message}`,
                    finishedAt: new Date().toISOString(),
                    status: 'error' as const,
                  }
                : t,
            )
            storage.saveAgents(agents)
            storage.saveTasks(tasks)
            return { agents, tasks }
          })
        },
      })
    },

    openModal: (agent) => set({ isModalOpen: true, editingAgent: agent ?? null }),
    closeModal: () => set({ isModalOpen: false, editingAgent: null }),
  })),
)

// Re-export Department for convenience
export type { Department }
