import { useEffect, useRef, useState } from 'react'
import type { Agent } from '../types/agent'
import { useStore } from '../store/useStore'
import { PixelCharacter, type CharActivity } from './PixelCharacter'

const STATUS_RING: Record<string, string> = {
  idle:    '#333',
  running: '#facc15',
  done:    '#22c55e',
  error:   '#ef4444',
}

const IDLE_ACTIVITIES: Array<'stand' | 'sleep' | 'walk'> = [
  'stand', 'stand', 'stand',
  'sleep',
  'walk', 'walk',
]

interface Props {
  agent: Agent
  isSelected: boolean
  containerRef: { current: HTMLDivElement | null }
  roomColor: string
}

function LaptopSVG({ glowColor }: { glowColor: string }) {
  return (
    <svg
      width={54} height={32}
      viewBox="0 0 54 32"
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {/* ── Screen lid ── */}
      <rect x={3}  y={0}  width={48} height={20} fill="#1e2030" />
      <rect x={5}  y={2}  width={44} height={16} fill="#06080f" />
      {/* Code lines */}
      <rect x={8}  y={4}  width={18} height={2} fill={glowColor} opacity={0.8} />
      <rect x={8}  y={8}  width={28} height={2} fill={glowColor} opacity={0.5} />
      <rect x={8}  y={12} width={12} height={2} fill={glowColor} opacity={0.65} />
      <rect x={22} y={12} width={16} height={2} fill={glowColor} opacity={0.4} />
      {/* Blinking cursor */}
      <rect x={28} y={4}  width={3}  height={2} fill={glowColor} className="type-cursor" />
      {/* Screen glow reflection */}
      <rect x={5}  y={2}  width={44} height={16} fill={glowColor} opacity={0.03} />
      {/* ── Hinge ── */}
      <rect x={3}  y={20} width={48} height={2}  fill="#111120" />
      {/* ── Keyboard base ── */}
      <rect x={0}  y={22} width={54} height={10} fill="#16161e" />
      <rect x={2}  y={23} width={50} height={7}  fill="#0e0e18" />
      {/* Key rows */}
      <rect x={4}  y={24} width={5} height={3} fill="#1e1e2e" />
      <rect x={11} y={24} width={5} height={3} fill="#1e1e2e" />
      <rect x={18} y={24} width={5} height={3} fill="#1e1e2e" />
      <rect x={25} y={24} width={5} height={3} fill="#1e1e2e" />
      <rect x={32} y={24} width={5} height={3} fill="#1e1e2e" />
      <rect x={39} y={24} width={5} height={3} fill="#1e1e2e" />
      <rect x={46} y={24} width={5} height={3} fill="#1e1e2e" />
      {/* Spacebar */}
      <rect x={10} y={28} width={34} height={2} fill="#1e1e2e" />
    </svg>
  )
}

function ZzzOverlay() {
  return (
    <div style={{
      position: 'absolute',
      top: '-24px',
      right: '-10px',
      pointerEvents: 'none',
      fontFamily: '"Press Start 2P", monospace',
      lineHeight: 1,
    }}>
      <span className="zzz-a" style={{
        position: 'absolute', fontSize: '7px', color: '#aaaacc',
        top: 14, left: 0,
      }}>z</span>
      <span className="zzz-b" style={{
        position: 'absolute', fontSize: '9px', color: '#ccccee',
        top: 6, left: 5,
      }}>z</span>
      <span className="zzz-c" style={{
        position: 'absolute', fontSize: '11px', color: '#eeeeff',
        top: -4, left: 11,
      }}>z</span>
    </div>
  )
}

export function AgentSprite({ agent, isSelected, containerRef, roomColor }: Props) {
  const selectAgent = useStore((s) => s.selectAgent)
  const moveAgent   = useStore((s) => s.moveAgent)
  const dragging    = useRef(false)
  const dragStart   = useRef({ mx: 0, my: 0, ax: 0, ay: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const [idleActivity, setIdleActivity] = useState<'stand' | 'sleep' | 'walk'>('stand')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Randomly cycle through idle activities when not running
  useEffect(() => {
    if (agent.status === 'running') {
      setIdleActivity('stand')
      return
    }

    const schedule = () => {
      const delay = 6000 + Math.random() * 10000   // 6–16 s
      timerRef.current = setTimeout(() => {
        const next = IDLE_ACTIVITIES[Math.floor(Math.random() * IDLE_ACTIVITIES.length)]
        setIdleActivity(next)
        schedule()
      }, delay)
    }

    schedule()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [agent.status])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    dragging.current = true
    setIsDragging(true)
    dragStart.current = { mx: e.clientX, my: e.clientY, ax: agent.x, ay: agent.y }

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const dx = ev.clientX - dragStart.current.mx
      const dy = ev.clientY - dragStart.current.my
      const newX = Math.min(90, Math.max(5, dragStart.current.ax + (dx / rect.width) * 100))
      const newY = Math.min(88, Math.max(12, dragStart.current.ay + (dy / rect.height) * 100))
      moveAgent(agent.id, newX, newY)
    }

    const onUp = (ev: MouseEvent) => {
      if (!dragging.current) return
      dragging.current = false
      setIsDragging(false)
      const dist = Math.abs(ev.clientX - dragStart.current.mx) + Math.abs(ev.clientY - dragStart.current.my)
      if (dist < 5) selectAgent(isSelected ? null : agent.id)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const ringColor = STATUS_RING[agent.status]
  const isRunning = agent.status === 'running'
  const selColor  = roomColor

  const isSprite     = agent.avatar.startsWith('sprite:')
  const spriteVariant = isSprite ? parseInt(agent.avatar.split(':')[1], 10) : 0

  // Derive CharActivity
  const activity: CharActivity = isRunning ? 'type' : idleActivity

  // CSS class for the outer animation wrapper
  const characterClass =
    isRunning                ? 'pixel-typing' :
    idleActivity === 'sleep' ? 'pixel-sleep'  :
    'pixel-idle'

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${agent.x}%`,
        top: `${agent.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'pointer',
        userSelect: 'none',
        zIndex: isSelected ? 10 : 5,
      }}
    >
      {isSprite ? (
        /* ── Walk wrapper – handles horizontal pacing ───── */
        <div
          className={idleActivity === 'walk' && !isRunning ? 'agent-walk-across' : ''}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {/* Character + laptop – single animated wrapper so they move together */}
          <div
            className={characterClass}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {/* Character sprite – glow instead of spinning ring */}
            <div style={{
              position: 'relative',
              filter: isSelected
                ? `drop-shadow(0 0 4px ${selColor}) drop-shadow(0 0 8px ${selColor}88)`
                : isRunning
                ? `drop-shadow(0 0 6px ${ringColor}) drop-shadow(0 0 12px ${ringColor}66)`
                : 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
              transition: 'filter 0.2s',
            }}>
              <PixelCharacter variant={spriteVariant} activity={activity} />
              {/* ZZZ when sleeping */}
              {idleActivity === 'sleep' && !isRunning && <ZzzOverlay />}
            </div>

            {/* Laptop sits flush below character */}
            {isRunning && <LaptopSVG glowColor={ringColor} />}
          </div>

          {/* Shadow */}
          <div style={{
            position: 'absolute',
            bottom: isRunning ? '-2px' : '-2px',
            width: isRunning ? '54px' : '28px',
            height: '5px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            filter: 'blur(3px)',
            transition: 'all 0.3s',
          }} />

          {/* Small status dot top-right when running */}
          {isRunning && (
            <div className="running-pulse" style={{
              position: 'absolute', top: '-3px', right: '-3px',
              width: '6px', height: '6px', borderRadius: '50%',
              background: ringColor,
              boxShadow: `0 0 6px ${ringColor}`,
            }} />
          )}

          {/* Name tag */}
          <div style={{
            fontSize: '6px',
            background: isSelected ? `${selColor}22` : '#0a0a16',
            border: `1px solid ${isSelected ? selColor + '88' : '#1e1e32'}`,
            color: isSelected ? selColor : '#888',
            padding: '2px 6px',
            whiteSpace: 'nowrap',
            maxWidth: '84px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
          }}>
            {agent.name}
          </div>
        </div>
      ) : (
        /* ── Emoji avatar fallback ─────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          {/* Shadow */}
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            width: '36px', height: '6px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            filter: 'blur(3px)',
          }} />

          {/* Emoji avatar */}
          <div
            className={isRunning ? 'agent-bounce' : ''}
            style={{
              width: '44px', height: '44px',
              background: isSelected ? `${selColor}15` : '#10101e',
              border: `2px solid ${isSelected ? selColor : ringColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              position: 'relative',
              boxShadow: isSelected
                ? `0 0 0 2px ${selColor}44, 0 0 16px ${selColor}44`
                : isRunning
                ? `0 0 10px ${ringColor}66`
                : `0 2px 8px rgba(0,0,0,0.6)`,
              transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
          >
            {agent.avatar}
            {isRunning && (
              <div className="running-pulse" style={{
                position: 'absolute', inset: '-4px',
                border: `2px solid ${ringColor}`,
                borderTopColor: 'transparent',
                borderRadius: '0',
                animation: 'spin 1s linear infinite',
              }} />
            )}
          </div>

          {/* Name tag */}
          <div style={{
            fontSize: '6px',
            background: isSelected ? `${selColor}22` : '#0a0a16',
            border: `1px solid ${isSelected ? selColor + '88' : '#1e1e32'}`,
            color: isSelected ? selColor : '#888',
            padding: '2px 6px',
            whiteSpace: 'nowrap',
            maxWidth: '84px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '0.5px',
            transition: 'all 0.2s',
          }}>
            {agent.name}
          </div>
        </div>
      )}
    </div>
  )
}
