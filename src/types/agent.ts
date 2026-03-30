export type AgentStatus = 'idle' | 'running' | 'done' | 'error'

export type Department = 'Engineering' | 'Executive' | 'General' | 'Product'

export interface Agent {
  id: string
  name: string
  department: Department
  role: string
  model: string
  systemPrompt: string
  status: AgentStatus
  x: number // position within room (0-100%)
  y: number
  logs: LogEntry[]
  avatar: string // emoji avatar
}

export interface LogEntry {
  id: string
  timestamp: string
  type: 'system' | 'task' | 'done' | 'error'
  message: string
}

export interface Task {
  id: string
  agentId: string
  agentName: string
  prompt: string
  output: string
  startedAt: string
  finishedAt?: string
  status: 'running' | 'done' | 'error'
}
