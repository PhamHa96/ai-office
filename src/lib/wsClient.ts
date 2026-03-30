const WS_URL = 'ws://localhost:3001'

type ServerEvent =
  | { type: 'token'; agentId: string; taskId: string; token: string }
  | { type: 'done'; agentId: string; taskId: string }
  | { type: 'error'; agentId: string; taskId: string; message: string }

type TaskHandler = {
  onToken: (token: string) => void
  onDone: () => void
  onError: (message: string) => void
}

let ws: WebSocket | null = null
const pending: (() => void)[] = []
const handlers = new Map<string, TaskHandler>()

function getSocket(): WebSocket {
  if (ws && ws.readyState === WebSocket.OPEN) return ws

  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    pending.splice(0).forEach((fn) => fn())
  }

  ws.onmessage = (e) => {
    let event: ServerEvent
    try {
      event = JSON.parse(e.data)
    } catch {
      return
    }
    const key = `${event.agentId}:${event.taskId}`
    const h = handlers.get(key)
    if (!h) return

    if (event.type === 'token') {
      h.onToken(event.token)
    } else if (event.type === 'done') {
      handlers.delete(key)
      h.onDone()
    } else if (event.type === 'error') {
      handlers.delete(key)
      h.onError(event.message)
    }
  }

  ws.onclose = () => {
    ws = null
  }

  return ws
}

export interface RunAgentTaskParams {
  agentId: string
  taskId: string
  prompt: string
  model: string
  systemPrompt: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  onToken: (token: string) => void
  onDone: () => void
  onError: (message: string) => void
}

export function runAgentTask(params: RunAgentTaskParams): void {
  const { agentId, taskId, onToken, onDone, onError, ...rest } = params

  handlers.set(`${agentId}:${taskId}`, { onToken, onDone, onError })

  const payload = JSON.stringify({ type: 'run', agentId, taskId, ...rest })
  const send = () => ws!.send(payload)

  const socket = getSocket()
  if (socket.readyState === WebSocket.OPEN) {
    send()
  } else {
    pending.push(send)
  }
}
