import React from 'react'
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
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

// The grounded product moment the brief asked for: the real agent-assist
// platform floats into the universe as a lit panel — an actual screenshot of
// the working prototype, not a stylized mockup. Slight perspective tilt and a
// slow drift keep it cinematic rather than a hard cut to a demo recording.
const UiPanel: React.FC<{
  t: number
  start: number
  end: number
  src: string
  side: 'right' | 'left'
  label: string
  sub: string
}> = ({ t, start, end, src, side, label, sub }) => {
  const op = beatEnvelope(t, start, end, 0.9)
  if (op <= 0.001) return null
  const local = t - start
  const drift = local * 4 // slow upward drift, px
  const tilt = side === 'right' ? -7 : 7
  const x = side === 'right' ? '55.5%' : '8.5%'
  return (
    <div
      style={{
        position: 'absolute',
        top: `calc(50% - ${drift}px)`,
        left: x,
        transform: `translateY(-50%) perspective(1600px) rotateY(${tilt}deg) scale(${0.97 + 0.03 * op})`,
        opacity: op,
        width: 640,
      }}
    >
      <div
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          border: '1px solid rgba(120,160,255,0.35)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.65), 0 0 90px rgba(59,130,246,0.28)',
          background: '#0A0E1C',
        }}
      >
        <Img src={staticFile(src)} style={{ display: 'block', width: '100%' }} />
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily,
          textAlign: side === 'right' ? 'left' : 'left',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: 1,
            color: '#9DB8FF',
            border: '1px solid rgba(120,160,255,0.4)',
            background: 'rgba(59,130,246,0.14)',
            borderRadius: 999,
            padding: '6px 16px',
          }}
        >
          {label}
        </span>
        <div style={{ marginTop: 8, fontSize: 19, fontWeight: 500, color: colors.ink }}>{sub}</div>
      </div>
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
      {/* Act 1 — MyClaw appears */}
      <Beat t={t} start={5.2} end={8.8} top="70%" size={30} weight={500} tracking={2} color={colors.ink}>
        現在，第一個接起電話的，不是客服
      </Beat>

      {/* Act 2 — AI listens and understands first */}
      <Beat t={t} start={9.8} end={13.2} top="16%" size={32} weight={600} tracking={1}>
        它沒有急著回答——而是先理解
      </Beat>
      <Beat t={t} start={13.8} end={15.8} top="84%" size={26} weight={500} color={colors.aiBlue}>
        這位客戶是誰
      </Beat>
      <Beat t={t} start={16.0} end={17.8} top="84%" size={26} weight={500} color={colors.aiBlue}>
        過去發生過什麼
      </Beat>
      <Beat t={t} start={18.0} end={19.9} top="84%" size={26} weight={500} color={colors.aiBlue}>
        真正想完成什麼事情
      </Beat>

      {/* Act 3 — the grounded sales-highlight moment: real platform UI */}
      <Beat t={t} start={20.6} end={24.2} top="12%" size={32} weight={700}>
        答案，已經放在專員眼前
      </Beat>
      <UiPanel
        t={t}
        start={21}
        end={27.4}
        src="ui-assist.png"
        side="right"
        label="實際平台畫面 · AI 客服助手"
        sub="即時逐字稿 → 意圖 97% → 推薦話術自動跳出"
      />
      <UiPanel
        t={t}
        start={27.8}
        end={33.6}
        src="ui-deal.png"
        side="right"
        label="實際平台畫面 · 商機成立"
        sub="訂單 +NT$300/月 已生效 → M+ 通知同步送達客戶手機"
      />
      <Beat t={t} start={27.8} end={31} top="20%" left="8.5%" align="left" size={30} weight={700} maxWidth={760}>
        一般系統聽到抱怨
        <br />
        <span style={{ color: colors.successEmerald }}>MyClaw 聽出需求</span>
      </Beat>
      <Beat t={t} start={31.2} end={33.6} top="20%" left="8.5%" align="left" size={24} weight={500} color={colors.warmGold} maxWidth={760}>
        十分鐘，一通客訴，變成一筆訂單
      </Beat>

      {/* Act 4 — scenario: three industries, one brain */}
      <Beat t={t} start={35.5} end={40} top="18%" size={30} weight={600}>
        電信的斷線・銀行的轉帳・電商的出貨
      </Beat>
      <Beat t={t} start={41} end={45.4} top="18%" size={34} weight={700} color={colors.intelligencePurple}>
        場景不同，大腦相同——換產業，不用換 AI
      </Beat>

      {/* Act 5 — benefits around the AI core */}
      <Beat t={t} start={47.2} end={51.6} top="15%" size={34} weight={700}>
        不是五個產品，是一顆企業 AI 大腦
      </Beat>
      <Beat t={t} start={52.6} end={59.4} top="84%" size={22} weight={500} color={colors.ink} tracking={1} maxWidth={1600}>
        更高的解決率・更短的處理時間・提前挽留的客戶
      </Beat>
      <Beat t={t} start={54} end={59.4} top="50%" size={54} weight={900} color={colors.warmGold} tracking={1}>
        營收，在對話中發生
      </Beat>

      {/* Act 6 — convergence and close */}
      <Beat t={t} start={60.8} end={63.4} size={30} weight={600} maxWidth={1500}>
        這，就是把每一通電話完整接住的樣子
      </Beat>
      <Beat t={t} start={63.8} end={totalSeconds} top="42%" size={52} weight={900} tracking={2} fade={0.9}>
        MyClaw
      </Beat>
      <Beat t={t} start={64.2} end={totalSeconds} top="55%" size={26} weight={500} color={colors.ink} fade={0.9}>
        讓你的每一通電話，都成為下一筆訂單
      </Beat>
      <Beat t={t} start={64.6} end={totalSeconds} top="63%" size={18} weight={400} color={colors.inkDim} tracking={1} fade={0.9}>
        MyClaw Enterprise AI Agent Platform ・ 台灣大哥大 Taiwan Mobile
      </Beat>

      {/* Global fades to/from black bookend the film */}
      <AbsoluteFill style={{ backgroundColor: colors.black, opacity: Math.max(openFade, closeFade) }} />
    </AbsoluteFill>
  )
}
