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
  Send,
  Loader2,
} from 'lucide-react'
import { GlassCard, SectionLabel } from '../components/GlassCard'
import { VoiceWave } from '../components/VoiceWave'
import { StatusDot } from '../components/StatusDot'
import { ReasoningPanel } from '../components/ReasoningPanel'
import { MicButton } from '../components/MicButton'
import { analyzeUtterance, quickReplies, type AnalysisResult } from '../data/aiEngine'
import type { CustomerId } from '../data/customers'
import { industries } from '../data/industries'
import { useAppActions, useAppState } from '../state/appStore'

const tipIcons = { alert: TrendingDown, coach: HeartHandshake }
const tipStyles = {
  alert: 'border-rose-400/25 bg-rose-500/[0.08] text-rose-200',
  coach: 'border-sky-400/25 bg-sky-500/[0.08] text-sky-200',
}

export function WhisperCopilot() {
  const state = useAppState()
  const actions = useAppActions()
  const customerIds = Object.keys(state.customers) as CustomerId[]
  const serviceOverride = industries[state.industryId].serviceOverride

  const [selectedId, setSelectedId] = useState<CustomerId>('wang')
  const [customerLine, setCustomerLine] = useState(() => state.customers.wang.customerLine)
  const [inputValue, setInputValue] = useState('')
  const [thinking, setThinking] = useState(true)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [visibleTips, setVisibleTips] = useState(0)
  const [showReply, setShowReply] = useState(false)
  const [copied, setCopied] = useState(false)

  const runAnalysis = (text: string, customerId: CustomerId) => {
    setCustomerLine(text)
    setThinking(true)
    setAnalysis(null)
    setVisibleTips(0)
    setShowReply(false)

    const customerName = state.customers[customerId].name
    const result = analyzeUtterance(text, customerName, serviceOverride)
    const t0 = setTimeout(() => {
      setThinking(false)
      setAnalysis(result)
      actions.recordUtteranceAnalyzed(customerId, result, 'voice')
    }, 900)
    const t1 = setTimeout(() => setVisibleTips(1), 1500)
    const t2 = setTimeout(() => setVisibleTips(2), 2300)
    const t3 = setTimeout(() => setShowReply(true), 3100)
    return () => [t0, t1, t2, t3].forEach(clearTimeout)
  }

  useEffect(() => {
    const cleanup = runAnalysis(state.customers.wang.customerLine, 'wang')
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = (text: string) => {
    const clean = text.trim()
    if (!clean || thinking) return
    runAnalysis(clean, selectedId)
    setInputValue('')
  }

  const copyReply = () => {
    if (!analysis) return
    navigator.clipboard?.writeText(analysis.suggestedReply).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            AI Whisper <span className="text-gradient">Copilot</span>
          </h2>
          <p className="mt-1 text-sm text-ink-300">
            客服的第二大腦 — 通話中即時耳語提示，只有客服看得見。輸入任意客戶說的話，現場測試 AI 反應。
          </p>
        </div>
        <div className="flex gap-2">
          {customerIds.map((id) => (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                id === selectedId
                  ? 'bg-brand-500 text-white'
                  : 'border border-white/10 bg-white/[0.04] text-ink-300 hover:text-white'
              }`}
            >
              {state.customers[id].name}
            </button>
          ))}
        </div>
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
            <CallPartyAvatar
              name={state.customers[selectedId].name}
              role="來電中"
              icon={<User size={30} />}
              ringColor="rgba(244,63,94,0.5)"
            />
            <div className="flex flex-col items-center gap-2">
              <VoiceWave bars={28} className="h-10" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-ink-400">TAIPBX Voice Stream</span>
            </div>
            <CallPartyAvatar
              name="客服 Eric"
              role="真人客服 · AI 輔助中"
              icon={<Headset size={30} />}
              ringColor="rgba(255,107,0,0.55)"
              highlight
            />
          </div>

          {/* Conversation context strip — now shows whatever line was analyzed */}
          <div className="min-h-[64px] rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm leading-relaxed text-ink-200">
            <span className="mr-2 rounded bg-rose-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-rose-300">
              {state.customers[selectedId].name}
            </span>
            「{customerLine}」
          </div>

          {/* Live input */}
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              現場模擬 · 輸入或說出客戶正在說的話
            </div>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickReplies.map((q) => (
                <button
                  key={q.label}
                  disabled={thinking}
                  onClick={() => submit(q.text)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-ink-300 transition-colors hover:border-brand-400/40 hover:text-white disabled:opacity-40"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit(inputValue)
              }}
              className="flex items-center gap-2"
            >
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={thinking}
                placeholder={thinking ? 'AI 正在生成耳語提示…' : '輸入客戶說的話，按 Enter 送出…'}
                className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-brand-400/50 focus:outline-none disabled:opacity-50"
              />
              <MicButton onResult={submit} disabled={thinking} />
              <button
                type="submit"
                disabled={thinking || !inputValue.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white transition-transform hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
              >
                <Send size={15} />
              </button>
            </form>
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
                {thinking ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {thinking ? 'Analyzing' : 'Listening'}
              </div>
            </div>

            <div className="relative mt-5 min-h-[220px] space-y-3">
              {thinking && (
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
                  <Loader2 size={14} className="animate-spin text-brand-400" />
                  AI 正在解析語意與情緒…
                </div>
              )}

              <AnimatePresence>
                {analysis && analysis.whisperTips.slice(0, visibleTips).map((tip) => {
                  const Icon = tipIcons[tip.type]
                  return (
                    <motion.div
                      key={tip.text}
                      initial={{ opacity: 0, y: 14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${tipStyles[tip.type]}`}
                    >
                      <Icon size={16} className="shrink-0" />
                      {tip.text}
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              <AnimatePresence>
                {analysis && showReply && (
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-brand-400/30 bg-gradient-to-br from-brand-500/[0.12] to-brand-600/[0.06] p-4"
                  >
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-300">
                      <MessageSquareQuote size={14} /> 推薦回答
                    </div>
                    <p className="text-sm leading-relaxed text-white">「{analysis.suggestedReply}」</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.1]">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.intentConfidence}%` }}
                            transition={{ duration: 1.1, delay: 0.3 }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-brand-300">
                          AI Confidence {analysis.intentConfidence}%
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

              {analysis && showReply && state.showReasoning && <ReasoningPanel analysis={analysis} />}
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
