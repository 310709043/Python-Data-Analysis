import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Headset,
  Sparkles,
  TrendingDown,
  HeartHandshake,
  MessageSquareQuote,
  Copy,
  Check,
  User,
  Ear,
} from 'lucide-react'
import { GlassCard, SectionLabel } from '../components/GlassCard'
import { VoiceWave } from '../components/VoiceWave'
import { StatusDot } from '../components/StatusDot'
import { whisperSuggestedReply, whisperTips } from '../data/mock'

const tipIcons = { alert: TrendingDown, coach: HeartHandshake }
const tipStyles = {
  alert: 'border-rose-400/25 bg-rose-500/[0.08] text-rose-200',
  coach: 'border-sky-400/25 bg-sky-500/[0.08] text-sky-200',
}

export function WhisperCopilot() {
  const [visibleTips, setVisibleTips] = useState(0)
  const [showReply, setShowReply] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleTips(1), 1200),
      setTimeout(() => setVisibleTips(2), 2400),
      setTimeout(() => setShowReply(true), 3600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const copyReply = () => {
    navigator.clipboard?.writeText(whisperSuggestedReply).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl font-extrabold text-white md:text-3xl">
          AI Whisper <span className="text-gradient">Copilot</span>
        </h2>
        <p className="mt-1 text-sm text-ink-300">
          客服的第二大腦 — 通話中即時耳語提示，只有客服看得見
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        {/* Live call panel */}
        <GlassCard hover={false} className="relative overflow-hidden p-6">
          <div className="flex items-center justify-between">
            <SectionLabel>Live Call · 通話進行中</SectionLabel>
            <div className="chip border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
              <StatusDot color="green" /> On Call · 03:42
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-10 py-8 md:flex-row md:justify-around">
            {/* Customer */}
            <CallPartyAvatar
              name="王先生"
              role="VIP 客戶"
              icon={<User size={30} />}
              ringColor="rgba(244,63,94,0.5)"
            />

            {/* Waveform between */}
            <div className="flex flex-col items-center gap-2">
              <VoiceWave bars={28} className="h-10" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
                TAIPBX Voice Stream
              </span>
            </div>

            {/* Agent */}
            <CallPartyAvatar
              name="客服 Eric"
              role="真人客服 · AI 輔助中"
              icon={<Headset size={30} />}
              ringColor="rgba(255,107,0,0.55)"
              highlight
            />
          </div>

          {/* Conversation context strip */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm leading-relaxed text-ink-200">
            <span className="mr-2 rounded bg-rose-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-rose-300">
              客戶
            </span>
            「我昨天就反映過了，為什麼今天還是一直斷線？你們到底有沒有在處理？」
          </div>
        </GlassCard>

        {/* Whisper panel */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass relative overflow-hidden p-5"
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
              style={{ background: 'radial-gradient(closest-side, rgba(255,107,0,0.22), transparent)' }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow-sm">
                  <Ear size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">AI Whisper</div>
                  <div className="text-[11px] text-ink-300">即時耳語 · 僅客服可見</div>
                </div>
              </div>
              <div className="chip border-brand-400/25 bg-brand-400/10 text-brand-300">
                <Sparkles size={12} /> Listening
              </div>
            </div>

            {/* Tips appear sequentially */}
            <div className="relative mt-5 space-y-3">
              <AnimatePresence>
                {whisperTips.slice(0, visibleTips).map((tip) => {
                  const Icon = tipIcons[tip.type as keyof typeof tipIcons]
                  return (
                    <motion.div
                      key={tip.text}
                      initial={{ opacity: 0, y: 14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${
                        tipStyles[tip.type as keyof typeof tipStyles]
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {tip.text}
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Suggested reply */}
              <AnimatePresence>
                {showReply && (
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-brand-400/30 bg-gradient-to-br from-brand-500/[0.12] to-brand-600/[0.06] p-4"
                  >
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-300">
                      <MessageSquareQuote size={14} /> 推薦回答
                    </div>
                    <p className="text-sm leading-relaxed text-white">
                      「{whisperSuggestedReply}」
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.1]">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                            initial={{ width: 0 }}
                            animate={{ width: '96%' }}
                            transition={{ duration: 1.1, delay: 0.3 }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-brand-300">
                          AI Confidence 96%
                        </span>
                      </div>
                      <button
                        onClick={copyReply}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1.5 text-[11px] font-bold text-white transition-transform hover:scale-105 active:scale-95"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? '已複製' : '採用'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function CallPartyAvatar({
  name,
  role,
  icon,
  ringColor,
  highlight = false,
}: {
  name: string
  role: string
  icon: React.ReactNode
  ringColor: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 3px ${ringColor}` }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white ${
            highlight
              ? 'bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow'
              : 'bg-gradient-to-br from-ink-600 to-ink-800'
          }`}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="text-sm font-bold text-white">{name}</div>
        <div className="text-xs text-ink-300">{role}</div>
      </div>
    </div>
  )
}
