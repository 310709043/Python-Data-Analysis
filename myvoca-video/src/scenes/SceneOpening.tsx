import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Bg, BrandBall, SceneFade, Wave } from '../components/shared'
import { colors } from '../theme'

// 0:00–0:08 — ringing pulse → brand ball → title + tagline
export const SceneOpening: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const ballScale = spring({ frame: frame - 30, fps, config: { damping: 14, stiffness: 80 } })
  const titleIn = spring({ frame: frame - 70, fps, config: { damping: 200 } })
  const tagOpacity = interpolate(frame, [110, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <SceneFade duration={duration}>
      <Bg glow={0.18}>
        {/* ringing pulse rings */}
        {[0, 1, 2].map((i) => {
          const t = (frame - i * 18) % 60
          const scale = interpolate(t, [0, 60], [1, 3.2])
          const op = interpolate(t, [0, 60], [0.5, 0])
          return (
            <AbsoluteFill key={i} style={{ justifyContent: 'center', alignItems: 'center' }}>
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  border: `2px solid ${colors.brandMid}`,
                  opacity: frame < 90 ? op : 0,
                  transform: `scale(${scale})`,
                }}
              />
            </AbsoluteFill>
          )
        })}

        <AbsoluteFill
          style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 44 }}
        >
          <div style={{ transform: `scale(${ballScale})` }}>
            <BrandBall size={190} />
          </div>

          <div style={{ opacity: titleIn, transform: `translateY(${(1 - titleIn) * 40}px)`, textAlign: 'center' }}>
            <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: -2 }}>
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
            <div style={{ fontSize: 30, color: colors.ink300, marginTop: 18, letterSpacing: 6 }}>
              MyClaw Enterprise AI Agent Platform · 台灣大哥大
            </div>
          </div>

          <div style={{ opacity: tagOpacity, textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: colors.ink100 }}>
              「每位客服，都擁有一位 AI 超能力搭檔」
            </div>
            <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
              <Wave bars={30} width={560} height={54} />
            </div>
          </div>
        </AbsoluteFill>
      </Bg>
    </SceneFade>
  )
}
