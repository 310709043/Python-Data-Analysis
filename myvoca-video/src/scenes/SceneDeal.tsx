import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Bg, Card, Chip, SceneFade, Typewriter } from '../components/shared'
import { colors } from '../theme'

// 0:38–0:50 — the money moment: hearing purchase intent, complaint becomes an order
export const SceneDeal: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headIn = spring({ frame, fps, config: { damping: 200 } })
  const signalIn = spring({ frame: frame - 105, fps, config: { damping: 16, stiffness: 120 } })
  const dealIn = spring({ frame: frame - 175, fps, config: { damping: 15, stiffness: 100 } })
  const smsIn = spring({ frame: frame - 245, fps, config: { damping: 200 } })

  return (
    <SceneFade duration={duration}>
      <Bg glow={0.16}>
        <AbsoluteFill style={{ padding: '100px 140px' }}>
          <div style={{ opacity: headIn, textAlign: 'center' }}>
            <div style={{ fontSize: 58, fontWeight: 900 }}>
              客戶隨口的一句話，<span style={{ color: colors.good }}>AI 聽出的是需求</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 44, marginTop: 56, flex: 1, alignItems: 'stretch' }}>
            {/* the utterance + signal */}
            <Card style={{ flex: 1.1, padding: 44, display: 'flex', flexDirection: 'column', gap: 30 }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: 22,
                  padding: '26px 32px',
                  fontSize: 31,
                  lineHeight: 1.7,
                }}
              >
                <div style={{ fontSize: 20, color: colors.ink400, marginBottom: 6 }}>王先生</div>
                <Typewriter
                  text="小孩最近都在家上線上課程，網路速度不太夠……"
                  startFrame={25}
                  charsPerFrame={0.32}
                />
              </div>

              <div style={{ opacity: signalIn, transform: `scale(${0.9 + signalIn * 0.1})` }}>
                <Chip size={30} color={colors.good} bg="rgba(52,211,153,0.10)" border="rgba(52,211,153,0.35)">
                  ✨ 偵測到購買訊號 — 升級 / 加購相關語意
                </Chip>
              </div>

              <div style={{ fontSize: 27, color: colors.ink300, lineHeight: 1.8 }}>
                一般系統聽到的是抱怨。
                <br />
                <span style={{ color: colors.ink100, fontWeight: 700 }}>
                  MyVoca 聽出的是頻寬需求 — 即時推薦最適合的升級方案。
                </span>
              </div>
            </Card>

            {/* deal card + M+ sms */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
              <Card
                style={{
                  padding: 40,
                  opacity: dealIn,
                  transform: `translateY(${(1 - dealIn) * 60}px)`,
                  border: '1.5px solid rgba(52,211,153,0.4)',
                }}
              >
                <div style={{ fontSize: 22, color: colors.ink400, letterSpacing: 4 }}>商機成立 · TM-20260707-001</div>
                <div style={{ fontSize: 40, fontWeight: 900, marginTop: 12 }}>家用光纖升速方案（500M）</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 14 }}>
                  <span style={{ fontSize: 56, fontWeight: 900, color: colors.good }}>+NT$300</span>
                  <span style={{ fontSize: 28, color: colors.ink300 }}>/ 月</span>
                </div>
              </Card>

              <Card style={{ padding: 32, opacity: smsIn, transform: `translateY(${(1 - smsIn) * 40}px)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, color: colors.ink300 }}>
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${colors.brand}, ${colors.brandDark})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    🔔
                  </span>
                  M+ · 台灣大哥大 <span style={{ marginLeft: 'auto', color: colors.ink400 }}>現在</span>
                </div>
                <div style={{ fontSize: 25, marginTop: 14, lineHeight: 1.7, color: colors.ink200 }}>
                  方案已生效，確認簡訊已發送 · 3 天後自動關懷 · 30 天後回訪追蹤
                </div>
              </Card>
            </div>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 40,
              fontSize: 46,
              fontWeight: 900,
              opacity: interpolate(frame, [290, 315], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            一通客訴電話，十分鐘，<span style={{ color: colors.brand }}>變成一筆訂單</span>
          </div>
        </AbsoluteFill>
      </Bg>
    </SceneFade>
  )
}
