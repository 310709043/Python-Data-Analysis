import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Phone,
  PhoneIncoming,
  User,
  Crown,
  Clock,
  Frown,
  BrainCircuit,
  Loader2,
  Router,
  Gift,
  ShieldCheck,
  Zap,
  Headset,
  CheckCircle2,
  AudioLines,
} from 'lucide-react'
import { GlassCard, SectionLabel } from '../components/GlassCard'
import { Typewriter } from '../components/Typewriter'
import { VoiceWave } from '../components/VoiceWave'
import { StatusDot } from '../components/StatusDot'
import { aiRecommendations, customerProfile, demoTranscript } from '../data/mock'

type CallStage = 'incoming' | 'connecting' | 'live'
type FlowStep = 0 | 1 | 2 | 3 | 4
// 0 idle · 1 AI greeting typing · 2 customer typing · 3 AI analyzing · 4 recommendations ready

const recIcons = { router: Router, gift: Gift, shield: ShieldCheck }

export function VoiceDemo() {
  const [stage, setStage] = useState<CallStage>('incoming')
  const [step, setStep] = useState<FlowStep>(0)
  const [resolved, setResolved] = useState<'ai' | 'human' | null>(null)

  useEffect(() => {
    if (stage === 'connecting') {
      const t = setTimeout(() => {
        setStage('live')
        setStep(1)
      }, 1400)
      return () => clearTimeout(t)
    }
  }, [stage])

  useEffect(() => {
    if (step === 3) {
      const t = setTimeout(() => setStep(4), 2200)
      return () => clearTimeout(t)
    }
  }, [step])

  const restart = () => {
    setStage('incoming')
    setStep(0)
    setResolved(null)
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            AI Voice <span className="text-gradient">Experience Demo</span>
          </h2>
          <p className="mt-1 text-sm text-ink-300">
            TAIPBX 來電 → 即時語音辨識 → AI 意圖 / 情緒分析 → AI Brain 決策建議
          </p>
        </div>
        <button
          onClick={restart}
          className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-ink-200 transition-colors hover:border-brand-400/40 hover:text-white"
        >
          重播 Demo
        </button>
      </motion.div>

      {/* Incoming call overlay */}
      <AnimatePresence>
        {stage !== 'live' && (
          <motion.div
            key="incoming"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="glass relative mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center overflow-hidden p-10 text-center"
          >
            <motion.div
              aria-hidden
              className="absolute inset-0 -z-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, rgba(255,107,0,0.14), transparent 60%)',
              }}
            />
            <div className="relative mb-8">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border border-brand-400/50"
                  animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                animate={stage === 'incoming' ? { rotate: [0, -8, 8, -8, 0] } : {}}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.2 }}
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow"
              >
                <PhoneIncoming size={36} className="text-white" />
              </motion.div>
            </div>

            <div className="relative text-sm font-medium uppercase tracking-[0.2em] text-brand-300">
              Incoming Call · TAIPBX
            </div>
            <div className="relative mt-2 text-3xl font-extrabold text-white">王先生</div>
            <div className="relative mt-1 text-sm text-ink-300">
              {customerProfile.phone} · VIP 會員 · 已識別身分
            </div>

            {stage === 'incoming' ? (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setStage('connecting')}
                className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-[0_0_30px_-6px_rgba(16,185,129,0.6)]"
              >
                <Phone size={16} /> 接聽來電
              </motion.button>
            ) : (
              <div className="relative mt-8 flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Loader2 size={16} className="animate-spin" /> 接通中… AI Agent 同步啟動
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live call 3-column layout */}
      {stage === 'live' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_1fr_340px]">
          {/* Left — Customer Call */}
          <GlassCard delay={0.05} className="p-5">
            <SectionLabel>Customer Call</SectionLabel>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-ink-600 to-ink-800 text-white">
                  <User size={24} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-ink-900 p-0.5">
                  <StatusDot color="green" />
                </span>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{customerProfile.name}</div>
                <div className="chip mt-1 border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <Crown size={12} /> {customerProfile.tier}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-xs text-ink-300">
                <AudioLines size={13} className="text-emerald-400" /> 通話中
              </span>
              <CallTimer />
            </div>

            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold text-ink-200">目前情緒</div>
              <div className="chip border-rose-400/30 bg-rose-400/10 text-rose-300">
                <Frown size={13} /> {customerProfile.emotion}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-200">
                <Clock size={13} /> 歷史互動
              </div>
              <div className="space-y-2">
                {customerProfile.history.map((h) => (
                  <div
                    key={h.date + h.summary}
                    className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5 text-xs"
                  >
                    <div className="flex justify-between text-ink-300">
                      <span>{h.date}</span>
                      <span>{h.channel}</span>
                    </div>
                    <div className="mt-0.5 text-ink-100">{h.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Center — Real-time Transcript */}
          <GlassCard delay={0.12} hover={false} className="flex flex-col p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>Real-time Transcript</SectionLabel>
              <VoiceWave bars={18} className="h-6" />
            </div>

            <div className="flex-1 space-y-4">
              {step >= 1 && (
                <TranscriptBubble
                  side="left"
                  name="MyVoca AI"
                  ai
                  text={demoTranscript[0].text}
                  typing={step === 1}
                  onDone={() => setStep(2)}
                />
              )}
              {step >= 2 && (
                <TranscriptBubble
                  side="right"
                  name="王先生"
                  text={demoTranscript[1].text}
                  typing={step === 2}
                  onDone={() => setStep(3)}
                />
              )}

              {/* AI analyzing */}
              <AnimatePresence>
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-brand-400/20 bg-brand-500/[0.07] px-4 py-3 text-sm text-brand-300"
                  >
                    <Loader2 size={16} className="animate-spin" />
                    AI 即時分析中 — 語意解析 · 意圖判斷 · 情緒偵測…
                  </motion.div>
                )}
              </AnimatePresence>

              {step >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-300">
                    <BrainCircuit size={14} className="text-brand-400" /> AI 即時分析
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex-1 rounded-lg bg-white/[0.04] p-3">
                      <div className="text-[11px] text-ink-300">Intent</div>
                      <div className="mt-1 text-sm font-bold text-white">Network Issue</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                          initial={{ width: 0 }}
                          animate={{ width: '92%' }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <div className="mt-1 text-[11px] text-brand-300">Confidence 92%</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/[0.04] p-3">
                      <div className="text-[11px] text-ink-300">Emotion</div>
                      <div className="mt-1 text-sm font-bold text-rose-300">Frustrated</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-300"
                          initial={{ width: 0 }}
                          animate={{ width: '84%' }}
                          transition={{ duration: 1, delay: 0.35 }}
                        />
                      </div>
                      <div className="mt-1 text-[11px] text-rose-300">Intensity 84%</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </GlassCard>

          {/* Right — AI Brain Recommendation */}
          <GlassCard delay={0.2} hover={false} className="p-5">
            <div className="flex items-center justify-between">
              <SectionLabel>AI Brain Recommendation</SectionLabel>
              <StatusDot color="orange" />
            </div>

            {step < 4 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-sm text-ink-300">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  <BrainCircuit size={32} className="text-brand-500/60" />
                </motion.div>
                等待對話分析完成…
              </div>
            ) : resolved ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-64 flex-col items-center justify-center gap-3 text-center"
              >
                <CheckCircle2 size={40} className="text-emerald-400" />
                <div className="text-sm font-semibold text-white">
                  {resolved === 'ai'
                    ? 'AI 已自動建立處理流程'
                    : '已轉接真人客服 Eric，AI 同步交接完整脈絡'}
                </div>
                <div className="text-xs text-ink-300">
                  {resolved === 'ai'
                    ? '設備遠端診斷已啟動 · 補償方案已送出審核 · 客戶簡訊已通知'
                    : '客戶不需重述問題 — AI 已將意圖、情緒與建議傳給客服'}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((rec, i) => {
                  const Icon = recIcons[rec.icon as keyof typeof recIcons]
                  return (
                    <motion.div
                      key={rec.step}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="group flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5 transition-all hover:border-brand-400/40 hover:bg-brand-500/[0.06]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {rec.step}. {rec.title}
                        </div>
                        <div className="mt-0.5 text-xs leading-relaxed text-ink-300">
                          {rec.detail}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="grid grid-cols-2 gap-2 pt-2"
                >
                  <button
                    onClick={() => setResolved('ai')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-2.5 text-xs font-bold text-white shadow-glow-sm transition-transform hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Zap size={14} /> AI 自動處理
                  </button>
                  <button
                    onClick={() => setResolved('human')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 text-xs font-bold text-ink-100 transition-colors hover:border-brand-400/40 hover:text-white"
                  >
                    <Headset size={14} /> 轉真人客服
                  </button>
                </motion.div>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  )
}

function TranscriptBubble({
  side,
  name,
  text,
  typing,
  ai = false,
  onDone,
}: {
  side: 'left' | 'right'
  name: string
  text: string
  typing: boolean
  ai?: boolean
  onDone?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          side === 'right'
            ? 'rounded-tr-sm border border-white/[0.08] bg-white/[0.06] text-ink-100'
            : 'rounded-tl-sm border border-brand-400/20 bg-brand-500/[0.08] text-ink-100'
        }`}
      >
        <div className={`mb-1 text-[11px] font-semibold ${ai ? 'text-brand-300' : 'text-ink-300'}`}>
          {name}
        </div>
        {typing ? <Typewriter text={text} speed={55} onDone={onDone} /> : text}
      </div>
    </motion.div>
  )
}

function CallTimer() {
  const [sec, setSec] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const mm = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')
  return <span className="text-xs font-semibold tabular-nums text-white">{mm}:{ss}</span>
}
