import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import type { Department } from '../types/agent'
import { PixelCharacter, CHAR_PRESETS } from './PixelCharacter'

const DEPARTMENTS: Department[] = ['Engineering', 'Executive', 'General', 'Product']
const MODELS = [
  'claude-sonnet-4-6',
  'claude-opus-4-6',
  'claude-haiku-4-5-20251001',
  'gpt-4o',
  'gpt-4o-mini',
  'gemini-2.0-flash',
]
const AVATARS = ['👩‍💻', '👨‍💻', '🕶️', '🔮', '📊', '🤖', '🧠', '⚡', '🛠️', '📡', '🦾', '🎯']

interface FormData {
  name: string
  department: Department
  role: string
  model: string
  systemPrompt: string
  avatar: string
  x: number
  y: number
}

const BLANK: FormData = {
  name: '',
  department: 'Engineering',
  role: '',
  model: 'claude-sonnet-4-6',
  systemPrompt: '',
  avatar: '🤖',
  x: 50,
  y: 50,
}

export function AgentFormModal() {
  const isOpen = useStore((s) => s.isModalOpen)
  const editingAgent = useStore((s) => s.editingAgent)
  const closeModal = useStore((s) => s.closeModal)
  const addAgent = useStore((s) => s.addAgent)
  const updateAgent = useStore((s) => s.updateAgent)

  const [form, setForm] = useState<FormData>(BLANK)

  useEffect(() => {
    if (editingAgent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        name: editingAgent.name,
        department: editingAgent.department,
        role: editingAgent.role,
        model: editingAgent.model,
        systemPrompt: editingAgent.systemPrompt,
        avatar: editingAgent.avatar,
        x: editingAgent.x,
        y: editingAgent.y,
      })
    } else {
      setForm(BLANK)
    }
  }, [editingAgent, isOpen])

  if (!isOpen) return null

  const isEdit = Boolean(editingAgent)

  const handleSubmit = () => {
    if (!form.name.trim() || !form.role.trim()) return
    if (isEdit && editingAgent) {
      updateAgent(editingAgent.id, form)
    } else {
      addAgent(form)
    }
    closeModal()
  }

  const set = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }))

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        className="slide-right"
        style={{
          background: '#0d0d0d',
          border: '2px solid #333',
          width: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 0 40px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '2px solid #1e1e1e',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '9px', color: '#4a9eff', letterSpacing: '2px' }}>
            {isEdit ? '▸ EDIT AGENT' : '▸ NEW AGENT'}
          </div>
          <button className="pixel-btn pixel-btn-sm" onClick={closeModal} style={{ fontSize: '8px' }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Sprite picker */}
          <div>
            <Label>SPRITE CHARACTER</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {CHAR_PRESETS.map((_, i) => {
                const val = `sprite:${i}`
                const sel = form.avatar === val
                return (
                  <button
                    key={i}
                    onClick={() => set({ avatar: val })}
                    style={{
                      width: '40px', height: '64px',
                      background: sel ? '#0d2040' : '#111',
                      border: `2px solid ${sel ? '#4a9eff' : '#222'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    <PixelCharacter variant={i} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Emoji avatar picker */}
          <div>
            <Label>OR EMOJI AVATAR</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => set({ avatar: av })}
                  style={{
                    fontSize: '20px',
                    width: '36px',
                    height: '36px',
                    background: form.avatar === av ? '#0d2040' : '#111',
                    border: `2px solid ${form.avatar === av ? '#4a9eff' : '#222'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <FormRow>
            <div style={{ flex: 1 }}>
              <Label>NAME *</Label>
              <input
                className="pixel-input"
                placeholder="Agent name"
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                style={{ marginTop: '4px' }}
              />
            </div>
          </FormRow>

          <FormRow>
            <div style={{ flex: 1 }}>
              <Label>ROLE *</Label>
              <input
                className="pixel-input"
                placeholder="e.g. Lead Engineer"
                value={form.role}
                onChange={(e) => set({ role: e.target.value })}
                style={{ marginTop: '4px' }}
              />
            </div>
          </FormRow>

          <FormRow>
            <div style={{ flex: 1 }}>
              <Label>DEPARTMENT</Label>
              <select
                className="pixel-select"
                value={form.department}
                onChange={(e) => set({ department: e.target.value as Department })}
                style={{ marginTop: '4px' }}
              >
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <Label>MODEL</Label>
              <select
                className="pixel-select"
                value={form.model}
                onChange={(e) => set({ model: e.target.value })}
                style={{ marginTop: '4px' }}
              >
                {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </FormRow>

          <div>
            <Label>SYSTEM PROMPT</Label>
            <textarea
              className="pixel-textarea"
              rows={4}
              placeholder="Describe the agent's personality, role, and behaviors..."
              value={form.systemPrompt}
              onChange={(e) => set({ systemPrompt: e.target.value })}
              style={{ marginTop: '4px' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              className="pixel-btn pixel-btn-primary"
              style={{ flex: 1 }}
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.role.trim()}
            >
              {isEdit ? 'SAVE CHANGES' : 'CREATE AGENT'}
            </button>
            <button className="pixel-btn" onClick={closeModal} style={{ flex: 1 }}>
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '7px', color: '#555', letterSpacing: '1px', marginBottom: '2px' }}>{children}</div>
}

function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: '10px' }}>{children}</div>
}
