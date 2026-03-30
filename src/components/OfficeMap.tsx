import { useRef } from 'react'
import { useStore } from '../store/useStore'
import { AgentSprite } from './AgentSprite'
import type { Department } from '../types/agent'

const ROOMS: { dept: Department; label: string; color: string; icon: string }[] = [
  { dept: 'Engineering', label: 'Engineering', color: '#4a9eff', icon: '⚙' },
  { dept: 'Executive',   label: 'Executive',   color: '#a855f7', icon: '◆' },
  { dept: 'General',     label: 'General',     color: '#22d3ee', icon: '◎' },
  { dept: 'Product',     label: 'Product',     color: '#f97316', icon: '▲' },
]

function Monitor({ glow }: { glow: string }) {
  return (
    <div style={{
      width: '32px', height: '22px',
      background: '#06060e',
      border: `1px solid ${glow}55`,
      position: 'relative',
      boxShadow: `0 0 6px ${glow}33`,
    }}>
      <div style={{ position: 'absolute', top: '3px', left: '3px', right: '3px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ height: '2px', background: `${glow}88`, borderRadius: '1px' }} />
        <div style={{ height: '2px', background: `${glow}55`, borderRadius: '1px', width: '70%' }} />
        <div style={{ height: '2px', background: `${glow}33`, borderRadius: '1px', width: '85%' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '4px', background: '#1a1a2e' }} />
    </div>
  )
}

function Desk({ x, y, color, wide = false }: { x: number; y: number; color: string; wide?: boolean }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`, top: `${y}%`,
      width: wide ? '70px' : '54px', height: '34px',
      background: 'linear-gradient(180deg, #1e1a2e 0%, #14102a 100%)',
      border: `1px solid ${color}22`,
      boxShadow: `2px 3px 0 #04040c, inset 0 1px 0 ${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '2px',
      pointerEvents: 'none',
    }}>
      <Monitor glow={color} />
    </div>
  )
}

function Bookshelf({ x, y, color }: { x: number; y: number; color: string }) {
  const spines = ['#ef4444', '#4a9eff', '#22c55e', '#f97316', '#a855f7', '#22d3ee']
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      width: '40px', height: '44px',
      background: '#0e0c1a',
      border: `1px solid ${color}22`,
      boxShadow: `2px 2px 0 #04040c`,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '3px 3px 0', gap: '2px',
      pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
        {spines.map((c, i) => (
          <div key={i} style={{ width: '4px', height: `${8 + (i % 3) * 5}px`, background: c, opacity: 0.6 }} />
        ))}
      </div>
    </div>
  )
}

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: '18px', lineHeight: 1, pointerEvents: 'none' }}>
      🪴
    </div>
  )
}

function RoomFurniture({ dept, color }: { dept: Department; color: string }) {
  switch (dept) {
    case 'Engineering':
      return <>
        <Desk x={8} y={18} color={color} />
        <Desk x={48} y={18} color={color} />
        <Desk x={8} y={54} color={color} />
        <Desk x={48} y={54} color={color} />
        <Bookshelf x={82} y={8} color={color} />
        <Plant x={84} y={72} />
      </>
    case 'Executive':
      return <>
        <Desk x={28} y={28} color={color} wide />
        <Bookshelf x={6} y={10} color={color} />
        <Bookshelf x={6} y={54} color={color} />
        <Plant x={78} y={10} />
        <Plant x={78} y={68} />
      </>
    case 'General':
      return <>
        <Desk x={8} y={18} color={color} />
        <Desk x={48} y={18} color={color} />
        <Desk x={28} y={56} color={color} />
        <Plant x={82} y={8} />
        <Plant x={82} y={68} />
        <Plant x={4} y={72} />
      </>
    case 'Product':
      return <>
        <Desk x={16} y={32} color={color} />
        <Desk x={52} y={32} color={color} />
        <Bookshelf x={82} y={12} color={color} />
        <Plant x={6} y={10} />
        <Plant x={6} y={68} />
      </>
  }
}

export function OfficeMap() {
  const agents = useStore((s) => s.agents)
  const selectedAgentId = useStore((s) => s.selectedAgentId)
  // Pre-create stable mutable ref holders (not React.RefObject — current is writable here)
  const roomRefs = useRef<Record<Department, { current: HTMLDivElement | null }>>({
    Engineering: { current: null },
    Executive:   { current: null },
    General:     { current: null },
    Product:     { current: null },
  })

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: '3px',
      padding: '6px',
      background: '#04040c',
      boxSizing: 'border-box',
    }}>
      {ROOMS.map(({ dept, label, color, icon }) => {
        const roomAgents = agents.filter((a) => a.department === dept)
        const hasRunning = roomAgents.some((a) => a.status === 'running')

        return (
          <div
            key={dept}
            ref={(el) => { roomRefs.current[dept].current = el }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${hasRunning ? color + 'aa' : color + '28'}`,
              background: `radial-gradient(ellipse at 25% 25%, ${color}0a 0%, #0a0a18 70%)`,
              transition: 'border-color 0.3s',
              boxShadow: hasRunning ? `inset 0 0 60px ${color}0a, 0 0 0 1px ${color}22` : 'none',
            }}
          >
            {/* Floor grid */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: `
                linear-gradient(${color}07 1px, transparent 1px),
                linear-gradient(90deg, ${color}07 1px, transparent 1px)
              `,
              backgroundSize: '28px 28px',
            }} />

            {/* Top accent wall */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: `linear-gradient(90deg, transparent, ${color}55, transparent)`,
            }} />

            {/* Room label */}
            <div style={{
              position: 'absolute', top: '7px', left: '9px',
              display: 'flex', alignItems: 'center', gap: '5px', zIndex: 2,
              background: `${color}0a`, padding: '2px 7px',
              border: `1px solid ${color}22`,
            }}>
              <span style={{ fontSize: '8px', color }}>{icon}</span>
              <span style={{ fontSize: '6px', color: color + 'cc', letterSpacing: '2px' }}>{label.toUpperCase()}</span>
            </div>

            {/* Running pulse dot */}
            {hasRunning && (
              <div className="running-pulse" style={{
                position: 'absolute', top: '10px', right: '10px', zIndex: 2,
                width: '6px', height: '6px', borderRadius: '50%', background: color,
                boxShadow: `0 0 6px ${color}`,
              }} />
            )}

            <RoomFurniture dept={dept} color={color} />

            {roomAgents.map((agent) => (
              <AgentSprite
                key={agent.id}
                agent={agent}
                isSelected={agent.id === selectedAgentId}
                containerRef={roomRefs.current[dept]}
                roomColor={color}
              />
            ))}

            {roomAgents.length === 0 && (
              <div style={{
                position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '6px', color: color + '20', letterSpacing: '3px', whiteSpace: 'nowrap',
              }}>
                · · VACANT · ·
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
