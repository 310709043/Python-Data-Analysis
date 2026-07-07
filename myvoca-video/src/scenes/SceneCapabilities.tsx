import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Bg, SceneFade } from '../components/shared'
import { colors } from '../theme'

const nodes = [
  { icon: '📞', name: 'MyVoca', desc: '語音 AI 客服中心', angle: -90 },
  { icon: '💬', name: 'AI 智能客服', desc: '網頁 / App 全天候接單', angle: -18 },
  { icon: '🏬', name: '門市語音質檢', desc: '對話變服務品質資產', angle: 54 },
  { icon: '🧠', name: 'GenAIus', desc: '學會企業知識與流程', angle: 126 },
  { icon: '🤝', name: 'M+', desc: '成交後關係經營', angle: 198 },
]

const benefits = [
  { v: '72%', l: 'AI 首次解決率' },
  { v: '8 分鐘', l: '每通平均節省' },
  { v: '+MRR', l: '對話中生成商機' },
  { v: '-流失', l: '高風險客戶提前挽留' },
]

// 0:50–1:05 — the five capabilities orbiting one enterprise AI brain + benefits
export const SceneCapabilities: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headIn = spring({ frame, fps, config: { damping: 200 } })
  const coreIn = spring({ frame: frame - 25, fps, config: { damping: 13, stiffness: 90 } })
  const cx = 960
  const cy = 560
  const R = 330

  return (
    <SceneFade duration={duration}>
      <Bg glow={0.15}>
        <AbsoluteFill style={{ padding: '80px 120px' }}>
          <div style={{ textAlign: 'center', opacity: headIn }}>
            <div style={{ fontSize: 54, fontWeight: 900 }}>
              這不是五個產品，是<span style={{ color: colors.brand }}>一顆企業 AI 大腦</span>
            </div>
          </div>

          {/* spokes */}
          <svg
            width="1920"
            height="1080"
            style={{ position: 'absolute', top: 0, left: 0 }}
            viewBox="0 0 1920 1080"
          >
            {nodes.map((n, i) => {
              const rad = (n.angle * Math.PI) / 180
              const x = cx + Math.cos(rad) * R
              const y = cy + Math.sin(rad) * R * 0.78
              const p = interpolate(frame - 55 - i * 12, [0, 25], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              })
              return (
                <line
                  key={n.name}
                  x1={cx}
                  y1={cy}
                  x2={cx + (x - cx) * p}
                  y2={cy + (y - cy) * p}
                  stroke="rgba(255,138,56,0.35)"
                  strokeWidth={3}
                />
              )
            })}
          </svg>

          {/* core */}
          <div
            style={{
              position: 'absolute',
              left: cx - 130,
              top: cy - 130,
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${colors.brandLight}, ${colors.brand} 55%, ${colors.brandDark})`,
              boxShadow: '0 0 90px rgba(255,107,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              transform: `scale(${coreIn})`,
              color: 'white',
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 900 }}>企業 AI</div>
            <div style={{ fontSize: 18, letterSpacing: 4, opacity: 0.9 }}>SERVICE BRAIN</div>
          </div>

          {/* nodes */}
          {nodes.map((n, i) => {
            const rad = (n.angle * Math.PI) / 180
            const x = cx + Math.cos(rad) * R
            const y = cy + Math.sin(rad) * R * 0.78
            const s = spring({ frame: frame - 70 - i * 14, fps, config: { damping: 200 } })
            return (
              <div
                key={n.name}
                style={{
                  position: 'absolute',
                  left: x - 150,
                  top: y - 74,
                  width: 300,
                  textAlign: 'center',
                  opacity: s,
                  transform: `scale(${0.8 + s * 0.2})`,
                }}
              >
                <div
                  style={{
                    width: 92,
                    height: 92,
                    margin: '0 auto',
                    borderRadius: 24,
                    background: colors.bg2,
                    border: `2px solid ${colors.borderStrong}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 44,
                  }}
                >
                  {n.icon}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12 }}>{n.name}</div>
                <div style={{ fontSize: 22, color: colors.ink300, marginTop: 4 }}>{n.desc}</div>
              </div>
            )
          })}

          {/* benefits strip */}
          <div
            style={{
              position: 'absolute',
              bottom: 78,
              left: 120,
              right: 120,
              display: 'flex',
              gap: 28,
              justifyContent: 'center',
            }}
          >
            {benefits.map((b, i) => {
              const s = spring({ frame: frame - 250 - i * 15, fps, config: { damping: 200 } })
              return (
                <div
                  key={b.l}
                  style={{
                    opacity: s,
                    transform: `translateY(${(1 - s) * 40}px)`,
                    background: colors.surface,
                    border: `1.5px solid ${colors.border}`,
                    borderRadius: 20,
                    padding: '24px 44px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 44, fontWeight: 900, color: colors.brandLight }}>{b.v}</div>
                  <div style={{ fontSize: 22, color: colors.ink300, marginTop: 6 }}>{b.l}</div>
                </div>
              )
            })}
          </div>
        </AbsoluteFill>
      </Bg>
    </SceneFade>
  )
}
