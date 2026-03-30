# ⚡ Pixel Agents Runtime (Claude CLI Orchestration)

This system runs multiple AI agents by spawning **real Claude CLI
processes**, streaming their output in real-time to the browser.

It is not a simulation --- each agent is an actual running process with
its own model, context, and behavior.

------------------------------------------------------------------------

## 🧠 Architecture Overview

Browser → WebSocket → Node.js Server → Claude CLI → Claude Code\
(spawned process) (subscription)

------------------------------------------------------------------------

## 🚀 How It Works

### 1. User triggers a task

Click "RUN TASK"

### 2. Browser sends a WebSocket request

{ "type": "run", "prompt": "review this code", "model": "sonnet",
"systemPrompt": "You are Trinity..." }

### 3. Server spawns a Claude CLI process

``` ts
import { spawn } from 'child_process'

const proc = spawn('claude', [
  '-p', 'review this code',
  '--model', 'sonnet',
  '--system-prompt', 'You are Trinity...',
  '--output-format', 'stream-json',
  '--verbose',
  '--bare',
])
```

Equivalent terminal command:

``` bash
claude -p "review this code" --model sonnet ...
```

### 4. Claude streams output via stdout

``` json
{
  "type": "stream_event",
  "event": {
    "type": "content_block_delta",
    "delta": {
      "type": "text_delta",
      "text": "After"
    }
  }
}
```

### 5. Server forwards tokens

``` ts
proc.stdout.on('data', (chunk) => {
  const token = extractText(chunk)
  ws.send(JSON.stringify({ type: 'token', token }))
})
```

### 6. Browser renders output

After → reviewing → the → code → ...

------------------------------------------------------------------------

## 🔌 Process Model

Each agent = one independent CLI process

  Agent      Model    Role
  ---------- -------- -----------------
  Trinity    sonnet   Lead Engineer
  Morpheus   opus     CEO
  Yuro       haiku    Product Manager

------------------------------------------------------------------------

## 🔁 Streams

-   stdin → input\
-   stdout → output (streamed tokens)\
-   stderr → errors

------------------------------------------------------------------------

## 🔐 Authentication

No API key required. Claude CLI uses local subscription.

------------------------------------------------------------------------

# ⭐ Why This Architecture Is Powerful

## Real Agents

Each agent is a real process with isolated context.

## Parallel Execution

Multiple agents run simultaneously.

## Model Flexibility

Different models per role.

## Real-time Streaming

Live token-by-token updates.

## Stateless Execution

Clean, predictable runs.

## No API Complexity

No API keys or SDK overhead.

## Production-like Behavior

Easy to debug and extend.

------------------------------------------------------------------------

## 🧩 Summary

-   each agent = real process\
-   each task = isolated execution\
-   each response = streamed live

👉 A scalable and realistic multi-agent system.

## Setup

- git clone
- npm i
- npm run dev