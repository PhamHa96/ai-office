import type { Agent, Task } from '../types/agent'

const AGENTS_KEY = 'aioffice_agents'
const SELECTED_KEY = 'aioffice_selected'
const TASKS_KEY = 'aioffice_tasks'

export const storage = {
  loadAgents(): Agent[] | null {
    try {
      const raw = localStorage.getItem(AGENTS_KEY)
      return raw ? (JSON.parse(raw) as Agent[]) : null
    } catch {
      return null
    }
  },
  saveAgents(agents: Agent[]): void {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents))
  },

  loadSelected(): string | null {
    return localStorage.getItem(SELECTED_KEY)
  },
  saveSelected(id: string | null): void {
    if (id) localStorage.setItem(SELECTED_KEY, id)
    else localStorage.removeItem(SELECTED_KEY)
  },

  loadTasks(): Task[] | null {
    try {
      const raw = localStorage.getItem(TASKS_KEY)
      return raw ? (JSON.parse(raw) as Task[]) : null
    } catch {
      return null
    }
  },
  saveTasks(tasks: Task[]): void {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks.slice(-50))) // keep last 50
  },

  clear(): void {
    localStorage.removeItem(AGENTS_KEY)
    localStorage.removeItem(SELECTED_KEY)
    localStorage.removeItem(TASKS_KEY)
  },
}
