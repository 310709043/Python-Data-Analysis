import React from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { Bg, Card, Chip, Meter, SceneFade, Typewriter, Wave } from '../components/shared'
import { colors } from '../theme'

const recs = [
  { n: 1, t: '確認設備狀態', d: '遠端偵測數據機訊號，近 24 小時斷線 4 次' },
  { n: 2, t: '提供補償方案', d: 'VIP 符合補償資格，主動折抵當月費用' },
  { n: 3, t: '避免重複詢問', d: '昨日已排除基本故障，直接升級工程處理' },
]

// 0:20–0:38 — the live call: transcript types in → AI analysis → recommendations
export const SceneLiveCall: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headIn = spring({ frame, fps, config: { damping: 200 } })
  const leftIn = spring({ frame: frame - 20, fps, config: { damping: 200 } })
  const analysisIn = spring({ frame: frame - 230, fps, config: { damping: 200 } })

  return (
    <SceneFade duration={duration}>
      <Bg>
        <AbsoluteFill style={{ padding: '90px 120px' }}>
          <div style={{ opacity: headIn, display: 'flex', alignItems: 'center', gap: 26 }}>
            <Chip>來電接通 · TAIPBX</Chip>
            <div style={{ fontSize: 48, fontWeight: 900 }}>
              電話接起的<span style={{ color: colors.brand }}>第一秒</span>，AI 已經開始工作
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: 40, marginTop: 48, flex: 1 }}>
            {/* caller identity */}
            <Card
              style={{
                padding: 40,
                opacity: leftIn,
                transform: `translateX(${(1 - leftIn) * -60}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3D3D50, #16161F)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 44,
                  }}
                >
                  👤
                </div>
                <div>
                  <div style={{ fontSize: 40, fontWeight: 800 }}>王先生</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                    <Chip size={20} color={colors.warn} bg="rgba(251,191,36,0.1)" border="rgba(251,191,36,0.3)">
                      👑 VIP · 8 年
                    </Chip>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 34, fontSize: 25, lineHeight: 1.9, color: colors.ink200 }}>
                <div>90 天內第 3 次反映網路問題</div>
                <div>
                  情緒指數持續下降 · 流失風險 <span style={{ color: colors.risk, fontWeight: 800 }}>High</span>
                </div>
                <div style={{ color: colors.ink400, marginTop: 16, fontSize: 22 }}>
                  — AI 在你開口前，就把答案準備好了
                </div>
              </div>
              <div style={{ marginTop: 28 }}>
                <Wave bars={20} width={340} height={44} />
              </div>
            </Card>

            {/* transcript + analysis */}
            <Card style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 26 }}>
              <div
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: '82%',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: '24px 6px 24px 24px',
                  padding: '24px 30px',
                  fontSize: 30,
                  lineHeight: 1.7,
                }}
              >
                <div style={{ fontSize: 20, color: colors.ink400, marginBottom: 6 }}>王先生</div>
                <Typewriter
                  text="最近我的網路一直斷線，昨天說會處理，到現在還沒有改善！"
                  startFrame={50}
                  charsPerFrame={0.35}
                />
              </div>

              <div
                style={{
                  opacity: analysisIn,
                  transform: `translateY(${(1 - analysisIn) * 36}px)`,
                  display: 'flex',
                  gap: 44,
                }}
              >
                <Meter label="Intent · Network Issue" value="97%" pct={97} startFrame={240} width={380} />
                <Meter
                  label="Emotion · Frustrated"
                  value="84%"
                  pct={84}
                  startFrame={252}
                  color={colors.risk}
                  width={380}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {recs.map((r, i) => {
                  const s = spring({ frame: frame - 300 - i * 26, fps, config: { damping: 200 } })
                  return (
                    <div
                      key={r.n}
                      style={{
                        opacity: s,
                        transform: `translateX(${(1 - s) * 70}px)`,
                        display: 'flex',
                        gap: 22,
                        alignItems: 'center',
                        background: 'rgba(255,107,0,0.07)',
                        border: '1.5px solid rgba(255,107,0,0.25)',
                        borderRadius: 18,
                        padding: '20px 28px',
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: 'rgba(255,107,0,0.18)',
                          color: colors.brandLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 28,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {r.n}
                      </div>
                      <div>
                        <div style={{ fontSize: 29, fontWeight: 800 }}>{r.t}</div>
                        <div style={{ fontSize: 23, color: colors.ink300, marginTop: 4 }}>{r.d}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 36,
              fontSize: 36,
              fontWeight: 800,
              opacity: interpolate(frame, [420, 445], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            即時語音辨識 · 意圖判斷 · 情緒偵測 —{' '}
            <span style={{ color: colors.brand }}>客戶不必重述，客服不再盲飛</span>
          </div>
        </AbsoluteFill>
      </Bg>
    </SceneFade>
  )
}
