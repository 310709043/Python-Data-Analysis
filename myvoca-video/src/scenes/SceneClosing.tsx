import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Bg, BrandBall, SceneFade } from '../components/shared'
import { colors } from '../theme'

const takeaways = [
  { n: '01', text: '不是每個產業需要不同的 AI，而是同一套企業 AI', em: '懂你的知識、懂你的流程、更懂你的客戶' },
  { n: '02', text: '不只接住客戶', em: '而是聽出購買意願' },
  { n: '03', text: '不只是回答問題', em: '而是推薦下一個最適合的方案' },
]

// 1:18–1:30 — the three takeaways, then logo + closing line
export const SceneClosing: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const headIn = spring({ frame, fps, config: { damping: 200 } })
  const logoIn = spring({ frame: frame - 235, fps, config: { damping: 14, stiffness: 90 } })
  const finalOp = interpolate(frame, [265, 290], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <SceneFade duration={duration}>
      <Bg glow={0.18}>
        <AbsoluteFill style={{ padding: '90px 200px', alignItems: 'center' }}>
          <div style={{ opacity: headIn, fontSize: 46, fontWeight: 900 }}>
            請帶走<span style={{ color: colors.brand }}>這三句話</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginTop: 46, width: '100%' }}>
            {takeaways.map((t, i) => {
              const s = spring({ frame: frame - 35 - i * 42, fps, config: { damping: 200 } })
              return (
                <div
                  key={t.n}
                  style={{
                    opacity: s,
                    transform: `translateX(${(1 - s) * -80}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 30,
                    background: colors.surface,
                    border: `1.5px solid ${colors.border}`,
                    borderRadius: 22,
                    padding: '28px 40px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      color: colors.brandLight,
                      border: '2px solid rgba(255,107,0,0.4)',
                      background: 'rgba(255,107,0,0.1)',
                      borderRadius: 14,
                      width: 74,
                      height: 74,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {t.n}
                  </div>
                  <div style={{ fontSize: 33, fontWeight: 700, lineHeight: 1.55 }}>
                    {t.text}
                    <span style={{ color: colors.brandLight }}> — {t.em}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              marginTop: 52,
              display: 'flex',
              alignItems: 'center',
              gap: 34,
              transform: `scale(${logoIn})`,
            }}
          >
            <BrandBall size={110} />
            <div>
              <div style={{ fontSize: 52, fontWeight: 900 }}>
                MyVoca{' '}
                <span
                  style={{
                    background: `linear-gradient(90deg, ${colors.brandLight}, ${colors.brand})`,
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  AI Service Intelligence
                </span>
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, color: colors.ink100, marginTop: 8, opacity: finalOp }}>
                讓你的每一通電話，都成為下一筆訂單
              </div>
            </div>
          </div>

          <div style={{ marginTop: 26, fontSize: 22, color: colors.ink400, opacity: finalOp }}>
            MyClaw Enterprise AI Agent Platform · 台灣大哥大 Taiwan Mobile
          </div>
        </AbsoluteFill>
      </Bg>
    </SceneFade>
  )
}
