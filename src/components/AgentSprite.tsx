import { useRef, useState } from 'react'
import type { Agent } from '../types/agent'
import { useStore } from '../store/useStore'
import { PixelCharacter } from './PixelCharacter'

const STATUS_RING: Record<string, string> = {
  idle:    '#333',
  running: '#facc15',
  done:    '#22c55e',
  error:   '#ef4444',
}

interface Props {
  agent: Agent
  isSelected: boolean
  containerRef: { current: HTMLDivElement | null }
  roomColor: string
}

export function AgentSprite({ agent, isSelected, containerRef, roomColor }: Props) {
  const selectAgent = useStore((s) => s.selectAgent)
  const moveAgent = useStore((s) => s.moveAgent)
  const dragging = useRef(false)
  const dragStart = useRef({ mx: 0, my: 0, ax: 0, ay: 0 })
  const [isDragging, setIsDragging] = useState(false)

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
  const selColor = roomColor

  const isSprite = agent.avatar.startsWith('sprite:')
  const spriteVariant = isSprite ? parseInt(agent.avatar.split(':')[1], 10) : 0

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {isSprite ? (
        <>
          {/* Pixel character */}
          <div
            className={isRunning ? 'agent-bounce' : 'pixel-idle'}
            style={{
              position: 'relative',
              filter: isSelected
                ? `drop-shadow(0 0 4px ${selColor}) drop-shadow(0 0 8px ${selColor}88)`
                : isRunning
                ? `drop-shadow(0 0 3px ${ringColor})`
                : 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
              transition: 'filter 0.2s',
            }}
          >
            <PixelCharacter variant={spriteVariant} isRunning={isRunning} />

            {/* Running ring */}
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

          {/* Shadow */}
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            width: '28px', height: '5px',
            background: 'rgba(0,0,0,0.45)',
            borderRadius: '50%',
            filter: 'blur(2px)',
          }} />

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
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
