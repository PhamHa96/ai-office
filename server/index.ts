import express from 'express'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { spawn } from 'child_process'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

app.get('/health', (_, res) => res.json({ ok: true }))

interface RunMessage {
  type: 'run'
  agentId: string
  taskId: string
  prompt: string
  model: string
  systemPrompt: string
}

interface StreamEvent {
  type: string
  event?: {
    type: string
    delta?: { type: string; text?: string }
  }
}

// Map full model IDs → claude CLI aliases
function toModelAlias(model: string): string {
  if (model.includes('opus')) return 'opus'
  if (model.includes('haiku')) return 'haiku'
  return 'sonnet'
}

wss.on('connection', (ws) => {
  console.log('[ws] client connected')

  ws.on('message', (raw) => {
    let msg: RunMessage
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }

    if (msg.type !== 'run') return

    const { agentId, taskId, prompt, model, systemPrompt } = msg
    console.log(`[${agentId}] "${prompt.slice(0, 60)}..."`)

    const proc = spawn('claude', [
      '-p', prompt,
      '--model', toModelAlias(model),
      '--append-system-prompt', systemPrompt,
      '--output-format', 'stream-json',
      '--include-partial-messages',
      '--verbose',
      '--dangerously-skip-permissions', // allow tools to run without prompting
    ])

    proc.stdin.end() // không cần stdin, đóng ngay để tránh warning

    let buf = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      buf += chunk.toString()
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const ev: StreamEvent = JSON.parse(line)
          if (
            ev.type === 'stream_event' &&
            ev.event?.type === 'content_block_delta' &&
            ev.event.delta?.type === 'text_delta' &&
            ev.event.delta.text
          ) {
            ws.send(JSON.stringify({ type: 'token', agentId, taskId, token: ev.event.delta.text }))
          }
        } catch {
          // skip non-JSON lines
        }
      }
    })

    proc.stderr.on('data', (chunk: Buffer) => {
      const txt = chunk.toString().trim()
      if (txt) console.error(`[${agentId}] stderr: ${txt}`)
    })

    proc.on('close', (code) => {
      if (code === 0) {
        ws.send(JSON.stringify({ type: 'done', agentId, taskId }))
        console.log(`[${agentId}] done`)
      } else {
        ws.send(JSON.stringify({ type: 'error', agentId, taskId, message: `claude exited ${code}` }))
      }
    })

    proc.on('error', (err) => {
      ws.send(JSON.stringify({ type: 'error', agentId, taskId, message: err.message }))
    })
  })

  ws.on('close', () => console.log('[ws] client disconnected'))
})

const PORT = process.env.PORT ?? 3001
server.listen(PORT, () => console.log(`AI Office server on :${PORT}`))
