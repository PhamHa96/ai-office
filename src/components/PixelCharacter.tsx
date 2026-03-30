import React from 'react'

const PS = 3  // SVG units per pixel

export type HairStyle = 'short' | 'long' | 'afro'

export interface CharPreset {
  hair: string
  skin: string
  shirt: string
  pants: string
  boots: string
  style: HairStyle
}

export const CHAR_PRESETS: CharPreset[] = [
  { hair: '#8B5E3C', skin: '#FDBCB4', shirt: '#4a9eff', pants: '#2d3a6b', boots: '#4a3728', style: 'short' },
  { hair: '#D4A96A', skin: '#FDBCB4', shirt: '#ffb3c6', pants: '#7b5ea7', boots: '#4a3728', style: 'long'  },
  { hair: '#1a1a1a', skin: '#8D5524', shirt: '#F97316', pants: '#1e3a5f', boots: '#111111', style: 'afro'  },
  { hair: '#1a1a1a', skin: '#FDBCB4', shirt: '#ef4444', pants: '#1e1e2e', boots: '#4a3728', style: 'long'  },
  { hair: '#d8d8e8', skin: '#ffe4d0', shirt: '#e8e8f0', pants: '#9090a8', boots: '#787890', style: 'short' },
  { hair: '#7B4F2E', skin: '#FDBCB4', shirt: '#f0f0f0', pants: '#3a8eff', boots: '#4a3728', style: 'short' },
  { hair: '#c0392b', skin: '#FDBCB4', shirt: '#1abc9c', pants: '#2c3e50', boots: '#2c1a0e', style: 'long'  },
  { hair: '#2c2c2c', skin: '#d4a574', shirt: '#3498db', pants: '#1a1a2e', boots: '#1a1a1a', style: 'short' },
]

interface Props {
  variant?: number     // 0–5
  isRunning?: boolean
  width?: number       // display width (default 30)
  height?: number      // display height (default 54)
}

export function PixelCharacter({ variant = 0, isRunning = false, width, height }: Props) {
  const p = CHAR_PRESETS[Math.max(0, Math.min(CHAR_PRESETS.length - 1, variant))]
  const { hair: H, skin: S, shirt: T, pants: P, boots: B } = p
  const E = '#1a1a2a'

  const W = 10 * PS
  const HT = 18 * PS

  return (
    <svg
      width={width ?? W}
      height={height ?? HT}
      viewBox={`0 0 ${W} ${HT}`}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {/* ── Hair ─────────────────────────────────────── */}
      {p.style === 'afro' ? (
        <>
          <R row={0} cols={[0,1,2,3,4,5,6,7,8,9]} c={H} />
          <R row={1} cols={[0,1,2,3,4,5,6,7,8,9]} c={H} />
          <R row={2} cols={[0,1,8,9]}              c={H} />
          <R row={3} cols={[0,1,8]}                c={H} />
          <R row={4} cols={[0,1,8]}                c={H} />
          <R row={5} cols={[1,7]}                  c={H} />
        </>
      ) : (
        <>
          <R row={0} cols={[2,3,4,5,6,7]}     c={H} />
          <R row={1} cols={[1,2,3,4,5,6,7,8]} c={H} />
          <R row={2} cols={[1,2,7,8]}          c={H} />
          <R row={3} cols={[1,8]}              c={H} />
          <R row={4} cols={[1,8]}              c={H} />
          <R row={5} cols={[2,7]}              c={H} />
          {p.style === 'long' && [7,8,9,10,11].map(r => (
            <R key={r} row={r} cols={[0,1,8,9]} c={H} />
          ))}
        </>
      )}

      {/* ── Face ─────────────────────────────────────── */}
      <R row={2} cols={[3,4,5,6]}         c={S} />
      <R row={3} cols={[2,4,5,7]}         c={S} />
      <R row={4} cols={[2,3,4,5,6,7]}     c={S} />
      <R row={5} cols={[3,4,5,6]}         c={S} />
      {/* Eyes */}
      <R row={3} cols={[3,6]}             c={E} />
      {/* Neck */}
      <R row={6} cols={[4,5]}             c={S} />

      {/* ── Shirt ────────────────────────────────────── */}
      <R row={7}  cols={[2,3,4,5,6,7]}     c={T} />
      <R row={8}  cols={[1,2,3,4,5,6,7,8]} c={T} />
      <R row={9}  cols={[1,2,3,4,5,6,7,8]} c={T} />
      <R row={10} cols={[2,3,4,5,6,7]}     c={T} />
      <R row={11} cols={[2,3,4,5,6,7]}     c={T} />

      {/* ── Pants waist ──────────────────────────────── */}
      <R row={12} cols={[2,3,4,5,6,7]} c={P} />

      {/* ── Left leg ─────────────────────────────────── */}
      <g className={isRunning ? 'pixel-walk-l' : ''}>
        <R row={13} cols={[2,3]} c={P} />
        <R row={14} cols={[2,3]} c={P} />
        <R row={15} cols={[2,3]} c={P} />
        <R row={16} cols={[2,3]} c={B} />
        <R row={17} cols={[1,2,3]} c={B} />
      </g>

      {/* ── Right leg ────────────────────────────────── */}
      <g className={isRunning ? 'pixel-walk-r' : ''}>
        <R row={13} cols={[6,7]} c={P} />
        <R row={14} cols={[6,7]} c={P} />
        <R row={15} cols={[6,7]} c={P} />
        <R row={16} cols={[6,7]} c={B} />
        <R row={17} cols={[6,7,8]} c={B} />
      </g>
    </svg>
  )
}

function R({ row, cols, c }: { row: number; cols: number[]; c: string }) {
  return (
    <>
      {cols.map(col => (
        <rect key={col} x={col * PS} y={row * PS} width={PS} height={PS} fill={c} />
      ))}
    </>
  )
}
