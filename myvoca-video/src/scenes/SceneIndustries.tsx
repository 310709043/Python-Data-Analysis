import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Bg, Card, SceneFade } from '../components/shared'
import { colors } from '../theme'

const industries = [
  { icon: '📡', name: '電信', line: '「網路斷線」→ 光纖升級成交' },
  { icon: '🏦', name: '銀行金融', line: '「轉帳失敗」→ 理財方案升級' },
  { icon: '🛒', name: '零售電商', line: '「出貨延遲」→ 會員方案續約' },
]

// 1:05–1:18 — cross-industry: same brain, different knowledge — takeaway #1
export const SceneIndustries: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const headIn = spring({ frame, fps, config: { damping: 200 } })
  const bigIn = spring({ frame: frame - 215, fps, config: { damping: 200 } })

  return (
    <SceneFade duration={duration}>
      <Bg glow={0.1}>
        <AbsoluteFill style={{ padding: '110px 150px', alignItems: 'center' }}>
          <div style={{ opacity: headIn, textAlign: 'center' }}>
            <div style={{ fontSize: 34, color: colors.brandLight, fontWeight: 700, letterSpacing: 8 }}>
              給每一位產業決策者
            </div>
            <div style={{ fontSize: 60, fontWeight: 900, marginTop: 16 }}>
              換一個產業，<span style={{ color: colors.brand }}>不用換一套 AI</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 40, marginTop: 70 }}>
            {industries.map((ind, i) => {
              const s = spring({ frame: frame - 55 - i * 28, fps, config: { damping: 200 } })
              return (
                <Card
                  key={ind.name}
                  style={{
                    width: 460,
                    padding: '46px 40px',
                    textAlign: 'center',
                    opacity: s,
                    transform: `translateY(${(1 - s) * 60}px)`,
                  }}
                >
                  <div style={{ fontSize: 84 }}>{ind.icon}</div>
                  <div style={{ fontSize: 42, fontWeight: 900, marginTop: 16 }}>{ind.name}</div>
                  <div style={{ fontSize: 26, color: colors.ink300, marginTop: 14, lineHeight: 1.7 }}>
                    {ind.line}
                  </div>
                </Card>
              )
            })}
          </div>

          <div
            style={{
              marginTop: 78,
              textAlign: 'center',
              opacity: bigIn,
              transform: `translateY(${(1 - bigIn) * 40}px)`,
            }}
          >
            <div style={{ fontSize: 50, fontWeight: 900, lineHeight: 1.6 }}>
              同一套企業 AI ——
              <span
                style={{
                  background: `linear-gradient(90deg, ${colors.brandLight}, ${colors.brand})`,
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                懂你的知識、懂你的流程、更懂你的客戶
              </span>
            </div>
            <div
              style={{
                fontSize: 27,
                color: colors.ink300,
                marginTop: 20,
                opacity: interpolate(frame, [270, 295], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
              }}
            >
              換的只是它學的知識、接的流程、和它服務的客戶
            </div>
          </div>
        </AbsoluteFill>
      </Bg>
    </SceneFade>
  )
}
