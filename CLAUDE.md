# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start both server (port 3001) + Vite dev server (port 5173) concurrently
npm run server    # Start only the WebSocket server (tsx watch)
npm run build     # Type-check and build for production (dist/)
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

No API key needed — agents use the locally installed `claude` CLI (Claude Code subscription). Requires `claude` to be in PATH and authenticated.

No test framework is configured.

## Architecture

AI Office is a React + TypeScript app where AI agents live in a visual "office" and are powered by real Claude API calls. It has two processes:

- **Frontend** — Vite + React SPA (port 5173)
- **Backend** — Node.js WebSocket server (`server/index.ts`, port 3001) that calls the Anthropic API with streaming

### Task Execution Flow

1. User selects an agent, types a prompt, hits Run
2. `useStore.runTask` creates a task entry and calls `runAgentTask` from `src/lib/wsClient.ts`
3. `wsClient` opens a WebSocket connection to `ws://localhost:3001` and sends `{ type: 'run', agentId, taskId, prompt, model, systemPrompt }`
4. Server calls `anthropic.messages.stream(...)` using the agent's own `model` and `systemPrompt`
5. Each text delta is sent back as `{ type: 'token', ... }` → `onToken` appends it to the task output in real-time
6. On `done`/`error`, agent status and logs are updated

Each agent is truly independent — they have different Claude models (Opus/Sonnet/Haiku) and system prompts that define their persona.

### State

Global state in a single Zustand store (`src/store/useStore.ts`), persisted to localStorage. Holds agents, tasks (capped at 50), selected agent, task input, and modal state.

### Key Files

- `src/lib/wsClient.ts` — singleton WebSocket client; queues sends if connection not yet open
- `server/index.ts` — Express + `ws` WebSocket server; streams Anthropic API responses
- `src/data/defaultAgents.ts` — four pre-built agents (Trinity, Morpheus, The Oracle, Mr. Yuro)
- `src/types/agent.ts` — `Agent` and `Task` type definitions

### Layout

```
App.tsx
├── Sidebar            — agent list, add/delete/reset controls
├── Center column
│   ├── TopBar         — title + instructions
│   ├── OfficeMap      — 2×2 room grid by department; agents are draggable sprites
│   └── TaskRunnerPanel — task prompt input + streaming output history
└── AgentDetailsPanel  — logs and properties for selected agent
└── AgentFormModal     — create/edit agent form
```

Departments map directly to rooms: Engineering, Executive, General, Product.

### Styling

Tailwind CSS (v4 via Vite plugin) plus custom classes in `src/index.css` — pixel/retro aesthetic using "Press Start 2P" font. Dark base (`#0a0a0a`), neon accents. Custom CSS classes like `.pixel-btn` and `.floor-tile` are defined globally.
