import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily } from '../theme'

export const Bg: React.FC<{ children?: React.ReactNode; glow?: number }> = ({
  children,
  glow = 0.14,
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.bg,
      backgroundImage: `radial-gradient(ellipse 70% 50% at 20% -10%, rgba(255,107,0,${glow}), transparent 60%), radial-gradient(ellipse 55% 45% at 90% 105%, rgba(255,138,56,${glow * 0.6}), transparent 55%)`,
      fontFamily,
      color: colors.ink100,
    }}
  >
    {children}
  </AbsoluteFill>
)

// Enter with spring slide-up + fade, exit with fade — pass scene length.
export const useEnter = (delay = 0) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 90 } })
  return {
    opacity: interpolate(frame - delay, [0, 12], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    transform: `translateY(${interpolate(s, [0, 1], [36, 0])}px)`,
  }
}

export const SceneFade: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 12, duration - 14, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

export const Chip: React.FC<{
  children: React.ReactNode
  color?: string
  bg?: string
  border?: string
  size?: number
}> = ({ children, color = colors.brandLight, bg = 'rgba(255,107,0,0.10)', border = 'rgba(255,107,0,0.30)', size = 26 }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: `${size * 0.35}px ${size * 0.85}px`,
      borderRadius: 999,
      fontSize: size,
      fontWeight: 600,
      color,
      background: bg,
      border: `1.5px solid ${border}`,
    }}
  >
    {children}
  </span>
)

export const Card: React.FC<{ style?: React.CSSProperties; children: React.ReactNode }> = ({
  style,
  children,
}) => (
  <div
    style={{
      background: colors.surface,
      border: `1.5px solid ${colors.border}`,
      borderRadius: 26,
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      ...style,
    }}
  >
    {children}
  </div>
)

// Taiwan Mobile faceted-sphere brand mark (same geometry as the prototype).
export const BrandBall: React.FC<{ size?: number }> = ({ size = 120 }) => {
  const P = [
    [50, 30],
    [69.02, 43.82],
    [61.76, 66.18],
    [38.24, 66.18],
    [30.98, 43.82],
  ]
  const M = [
    [77.64, 11.98],
    [94.7, 64.52],
    [50, 97],
    [5.3, 64.52],
    [22.36, 11.98],
  ]
  const tri = ['#FFB600', '#FF7300', '#E4007F', '#8DC63F', '#5C4E9E']
  const outer = ['#FF9E1B', '#FF6B00', '#F0417F', '#A6CE39', '#7C6BB5']
  const gap = { stroke: colors.bg2, strokeWidth: 1.6, strokeLinejoin: 'round' as const }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {M.map((m, i) => {
        const prev = M[(i + 4) % 5]
        const p = P[i]
        return (
          <path
            key={`o${i}`}
            d={`M ${prev[0]} ${prev[1]} A 47 47 0 0 1 ${m[0]} ${m[1]} L ${p[0]} ${p[1]} Z`}
            fill={outer[i]}
            {...gap}
          />
        )
      })}
      {P.map((p, i) => {
        const next = P[(i + 1) % 5]
        const m = M[i]
        return (
          <path
            key={`t${i}`}
            d={`M ${p[0]} ${p[1]} L ${m[0]} ${m[1]} L ${next[0]} ${next[1]} Z`}
            fill={tri[i]}
            {...gap}
          />
        )
      })}
      <path d={`M ${P.map((p) => `${p[0]} ${p[1]}`).join(' L ')} Z`} fill="#FF7300" {...gap} />
    </svg>
  )
}

// Animated voice waveform bars.
export const Wave: React.FC<{ bars?: number; width?: number; height?: number; active?: boolean }> = ({
  bars = 26,
  width = 420,
  height = 64,
  active = true,
}) => {
  const frame = useCurrentFrame()
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', width, height, justifyContent: 'center' }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = active
          ? height * (0.2 + 0.75 * Math.abs(Math.sin(frame / 7 + i * 0.9)))
          : height * 0.12
        return (
          <div
            key={i}
            style={{
              width: 6,
              height: h,
              borderRadius: 3,
              background: `linear-gradient(to top, ${colors.brandDark}, ${colors.brandLight})`,
            }}
          />
        )
      })}
    </div>
  )
}

// Character-by-character typewriter.
export const Typewriter: React.FC<{
  text: string
  startFrame: number
  charsPerFrame?: number
  style?: React.CSSProperties
}> = ({ text, startFrame, charsPerFrame = 0.7, style }) => {
  const frame = useCurrentFrame()
  const chars = Math.max(0, Math.floor((frame - startFrame) * charsPerFrame))
  return <span style={style}>{text.slice(0, chars)}</span>
}

// Animated progress bar filling to a target percentage.
export const Meter: React.FC<{
  label: string
  value: string
  pct: number
  startFrame: number
  color?: string
  width?: number
}> = ({ label, value, pct, startFrame, color = colors.brand, width = 360 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: frame - startFrame, fps, config: { damping: 200 } }) * pct
  return (
    <div style={{ width }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, marginBottom: 8 }}>
        <span style={{ color: colors.ink300 }}>{label}</span>
        <span style={{ color: colors.ink100, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${p}%`,
            borderRadius: 5,
            background: `linear-gradient(90deg, ${color}, ${colors.brandLight})`,
          }}
        />
      </div>
    </div>
  )
}
