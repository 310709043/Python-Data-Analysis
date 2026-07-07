import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Bg, Card, SceneFade } from '../components/shared'
import { colors } from '../theme'

const pains = [
  { icon: '📞', title: '客戶重複陳述問題', detail: '每次轉接都要從頭再說一遍' },
  { icon: '🔥', title: '情緒在等待中升溫', detail: '客服接起電話時，信任已在流失' },
  { icon: '🧩', title: '資訊散落各系統', detail: '客服邊安撫、邊切換五個視窗查資料' },
  { icon: '💸', title: '商機在對話中溜走', detail: '客戶說出需求，卻沒有人聽出來' },
]

// 0:08–0:20 — the frontline pain, four cards stagger in
export const ScenePain: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const titleIn = spring({ frame, fps, config: { damping: 200 } })
  const punch = interpolate(frame, [250, 270], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <SceneFade duration={duration}>
      <Bg glow={0.08}>
        <AbsoluteFill style={{ padding: '110px 140px' }}>
          <div style={{ opacity: titleIn, transform: `translateY(${(1 - titleIn) * 30}px)` }}>
            <div style={{ fontSize: 30, color: colors.brandLight, fontWeight: 700, letterSpacing: 6 }}>
              一線客服，每天都在打一場看不見的仗
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, marginTop: 14 }}>
              客服的痛，就是企業的<span style={{ color: colors.risk }}>成本</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 34,
              marginTop: 64,
            }}
          >
            {pains.map((p, i) => {
              const s = spring({ frame: frame - 45 - i * 22, fps, config: { damping: 200 } })
              return (
                <Card
                  key={p.title}
                  style={{
                    padding: '38px 44px',
                    opacity: s,
                    transform: `translateY(${(1 - s) * 50}px)`,
                    display: 'flex',
                    gap: 28,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: 62 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: colors.ink100 }}>{p.title}</div>
                    <div style={{ fontSize: 26, color: colors.ink300, marginTop: 8 }}>{p.detail}</div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div
            style={{
              marginTop: 60,
              textAlign: 'center',
              fontSize: 42,
              fontWeight: 800,
              opacity: punch,
              transform: `scale(${0.94 + punch * 0.06})`,
            }}
          >
            如果，每位客服身邊都有一顆
            <span style={{ color: colors.brand }}>企業 AI 大腦</span>呢？
          </div>
        </AbsoluteFill>
      </Bg>
    </SceneFade>
  )
}
