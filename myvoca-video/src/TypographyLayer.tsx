import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { colors, fontFamily } from './theme'

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const smootherstep = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)

function beatEnvelope(t: number, start: number, end: number, fade = 0.7) {
  const rise = smootherstep(clamp01((t - start) / fade))
  const fall = 1 - smootherstep(clamp01((t - (end - fade)) / fade))
  return Math.min(rise, fall)
}

interface BeatProps {
  t: number
  start: number
  end: number
  top?: string
  left?: string
  align?: 'center' | 'left'
  size?: number
  weight?: number
  color?: string
  tracking?: number
  maxWidth?: number
  fade?: number
}

const Beat: React.FC<React.PropsWithChildren<BeatProps>> = ({
  t,
  start,
  end,
  top = '50%',
  left = '50%',
  align = 'center',
  size = 40,
  weight = 700,
  color = colors.white,
  tracking = 0,
  maxWidth = 1400,
  fade = 0.7,
  children,
}) => {
  const op = beatEnvelope(t, start, end, fade)
  if (op <= 0.001) return null
  const rise = (1 - op) * 16
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        transform: `translate(${align === 'center' ? '-50%' : '0'}, calc(-50% + ${rise}px))`,
        opacity: op,
        color,
        fontFamily,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: tracking,
        textAlign: align,
        maxWidth,
        lineHeight: 1.5,
        textShadow: '0 2px 40px rgba(0,0,0,0.55)',
      }}
    >
      {children}
    </div>
  )
}

export const TypographyLayer: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()
  const t = frame / fps
  const totalSeconds = durationInFrames / fps

  const openFade = 1 - smootherstep(clamp01(t / 0.7))
  const closeFade = smootherstep(clamp01((t - (totalSeconds - 1.6)) / 1.6))

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Act 1 — tagline under the forming logo */}
      <Beat t={t} start={6.6} end={9.6} top="70%" size={30} weight={500} tracking={2} color={colors.ink}>
        每一通進線電話，都是一次信任的考驗——也可能，是一筆生意的開始
      </Beat>

      {/* Act 2 — four pain points, brief lower-left title cards */}
      <Beat t={t} start={11} end={13.2} top="82%" left="12%" align="left" size={26} weight={600} color={colors.ink}>
        客戶重複陳述
      </Beat>
      <Beat t={t} start={13.6} end={15.8} top="82%" left="12%" align="left" size={26} weight={600} color={colors.frustrationRed}>
        情緒在等待中升溫
      </Beat>
      <Beat t={t} start={16.2} end={18.4} top="82%" left="12%" align="left" size={26} weight={600} color={colors.ink}>
        資訊散落各系統
      </Beat>
      <Beat t={t} start={18.4} end={20} top="82%" left="12%" align="left" size={26} weight={600} color={colors.warmGold}>
        商機在對話中溜走
      </Beat>

      {/* Act 3 — AI starts listening */}
      <Beat t={t} start={20.8} end={24.5} top="16%" size={32} weight={600} tracking={1}>
        AI 在電話接起的第一秒，就開始工作
      </Beat>
      <Beat t={t} start={26.6} end={29.2} top="84%" size={26} weight={500} color={colors.aiBlue}>
        他是誰
      </Beat>
      <Beat t={t} start={29.6} end={32.2} top="84%" size={26} weight={500} color={colors.aiBlue}>
        發生過什麼、現在情緒如何
      </Beat>
      <Beat t={t} start={32.6} end={37} top="84%" size={26} weight={500} color={colors.aiBlue}>
        下一步該怎麼做，AI 已經把答案放在客服眼前
      </Beat>

      {/* Act 4 — purchase signal and the order */}
      <Beat t={t} start={39} end={43} top="18%" size={32} weight={600}>
        一般系統聽到抱怨，MyVoca 聽出需求
      </Beat>
      <Beat t={t} start={44} end={48.5} top="50%" size={64} weight={900} color={colors.warmGold} tracking={1}>
        +NT$300 / 月
      </Beat>
      <Beat t={t} start={45.5} end={49.5} top="63%" size={24} weight={500} color={colors.ink}>
        一通客訴電話，十分鐘，變成一筆訂單
      </Beat>

      {/* Act 5 — the AI brain */}
      <Beat t={t} start={53.5} end={58} top="15%" size={34} weight={700}>
        這不是五個產品，是一顆企業 AI 大腦
      </Beat>
      <Beat t={t} start={59.5} end={64.5} top="86%" size={22} weight={500} color={colors.ink} tracking={1} maxWidth={1600}>
        更高的解決率・更短的處理時間・對話中生成的營收・提前挽留的客戶
      </Beat>

      {/* Act 6 — industries, same brain */}
      <Beat t={t} start={66.5} end={71} top="18%" size={30} weight={600}>
        電信的斷線、銀行的轉帳、電商的出貨
      </Beat>
      <Beat t={t} start={72} end={77.5} top="18%" size={34} weight={700} color={colors.intelligencePurple}>
        場景不同，大腦相同
      </Beat>

      {/* Act 7 — the three takeaways */}
      <Beat t={t} start={78.6} end={82.2} size={38} weight={800} maxWidth={1500}>
        不是每個產業需要不同的 AI，而是同一套企業 AI
      </Beat>
      <Beat t={t} start={82.2} end={85} size={38} weight={800} maxWidth={1500}>
        不只接住客戶，而是聽出購買意願
      </Beat>
      <Beat t={t} start={85} end={87.6} size={38} weight={800} maxWidth={1500}>
        不只是回答問題，而是推薦下一個最適合的方案
      </Beat>
      <Beat t={t} start={87.6} end={totalSeconds} top="42%" size={52} weight={900} tracking={2} fade={0.9}>
        MyVoca
      </Beat>
      <Beat t={t} start={87.9} end={totalSeconds} top="55%" size={26} weight={500} color={colors.ink} fade={0.9}>
        讓你的每一通電話，都成為下一筆訂單
      </Beat>
      <Beat t={t} start={88.3} end={totalSeconds} top="63%" size={18} weight={400} color={colors.inkDim} tracking={1} fade={0.9}>
        MyClaw Enterprise AI Agent Platform ・ 台灣大哥大 Taiwan Mobile
      </Beat>

      {/* Global fades to/from black bookend the film */}
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: Math.max(openFade, closeFade) }} />
    </AbsoluteFill>
  )
}
