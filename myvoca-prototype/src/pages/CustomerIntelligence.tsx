import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Crown,
  Wallet,
  History,
  Heart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Repeat,
  Sparkles,
  Loader2,
  CheckCircle2,
  Phone,
  Gift,
  CalendarClock,
} from 'lucide-react'
import { GlassCard, SectionLabel } from '../components/GlassCard'
import { EmotionSparkline } from '../components/charts'
import { churnRiskLabel, type CustomerId } from '../data/customers'
import { useAppActions, useAppState } from '../state/appStore'

type PlanState = 'idle' | 'generating' | 'ready'

const retentionSteps = [
  { icon: Phone, title: '24 小時內主動關懷電話', detail: '由客戶關懷專員致電，確認問題是否已徹底排除' },
  { icon: Gift, title: '個人化補償 / 升級方案', detail: '依會員等級與歷史貢獻，主動提出對等優惠' },
  { icon: CalendarClock, title: '排定 30 天後回訪', detail: '追蹤處理後滿意度，避免問題復發造成二次流失' },
]

const insightIcons = { history: Repeat, risk: AlertTriangle, strategy: Lightbulb }
const insightStyles = {
  history: 'border-sky-400/25 bg-sky-500/[0.07] text-sky-200',
  risk: 'border-rose-400/25 bg-rose-500/[0.07] text-rose-200',
  strategy: 'border-brand-400/30 bg-brand-500/[0.09] text-brand-200',
}

const statusStyle: Record<string, string> = {
  處理中: 'bg-amber-400/15 text-amber-300',
  已升級工程: 'bg-brand-400/15 text-brand-300',
  已結案: 'bg-emerald-400/15 text-emerald-300',
}

function statusColorFor(status: string): string {
  if (statusStyle[status]) return statusStyle[status]
  if (status.includes('已結案') || status.includes('已建立')) return statusStyle['已結案']
  if (status.includes('升級')) return statusStyle['已升級工程']
  return statusStyle['處理中']
}

export function CustomerIntelligence() {
  const state = useAppState()
  const actions = useAppActions()
  const customerIds = Object.keys(state.customers) as CustomerId[]

  const [selectedId, setSelectedId] = useState<CustomerId>(state.activeCustomerId)
  const customer = state.customers[selectedId]

  const [planState, setPlanState] = useState<PlanState>('idle')

  const startPlan = () => {
    if (planState !== 'idle') return
    setPlanState('generating')
    setTimeout(() => {
      setPlanState('ready')
      actions.recordRetentionPlanTriggered(selectedId)
    }, 1400)
  }

  const selectCustomer = (id: CustomerId) => {
    setSelectedId(id)
    setPlanState('idle')
  }

  const churnRisk = churnRiskLabel(customer.churnScore)
  const churnBadgeColor =
    churnRisk === 'High' ? 'bg-rose-500/20 text-rose-300' : churnRisk === 'Medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'

  const trend = customer.emotionTrend
  const trendImproving = trend.length >= 2 && trend[trend.length - 1] >= trend[trend.length - 2]

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            Customer <span className="text-gradient">Intelligence 360</span>
          </h2>
          <p className="mt-1 text-sm text-ink-300">
            Customer Twin — 每位客戶的數位分身：價值、歷史、偏好、情緒與 AI 策略
          </p>
        </div>
        <div className="flex gap-2">
          {customerIds.map((id) => (
            <button
              key={id}
              onClick={() => selectCustomer(id)}
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
        {/* Customer Twin card */}
        <GlassCard delay={0.05} hover={false} className="relative overflow-hidden p-6">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full"
            style={{ background: 'radial-gradient(closest-side, rgba(255,107,0,0.18), transparent)' }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <SectionLabel>Customer Twin</SectionLabel>
          <div className="relative flex items-center gap-4">
            <div className="relative">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border border-brand-400/40"
                  animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, delay: i * 1.4, ease: 'easeOut' }}
                />
              ))}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-ink-500 to-ink-800 text-white">
                <User size={28} />
              </div>
            </div>
            <div>
              <div className="text-xl font-extrabold text-white">{customer.name}</div>
              <div className="mt-1 flex gap-2">
                <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <Crown size={12} /> {customer.tier}
                </span>
                <span className="chip border-white/10 bg-white/[0.05] text-ink-200">
                  {customer.tenureYears} 年客戶
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-5 space-y-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center gap-1.5 text-xs text-ink-300">
                <Wallet size={13} /> Lifetime Value
              </div>
              <div className="mt-1 text-2xl font-extrabold text-white">{customer.lifetimeValue}</div>
              <div className="text-xs text-ink-300">近 12 個月貢獻 {customer.clv12m}</div>
            </div>

            <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-200">
                  <TrendingDown size={13} /> 流失風險 Churn Risk
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${churnBadgeColor}`}>
                  {churnRisk}
                </span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div
                  key={customer.churnScore}
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${customer.churnScore}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="mt-1 text-right text-[11px] font-semibold text-rose-300">
                {customer.churnScore} / 100
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs text-ink-300">
                <Heart size={13} /> Preference 偏好
              </div>
              <div className="flex flex-wrap gap-1.5">
                {customer.preferences.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-ink-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Right column */}
        <div className="space-y-4">
          {/* Emotion trend */}
          <GlassCard delay={0.12} hover={false} className="p-6">
            <div className="flex items-center justify-between">
              <SectionLabel>Emotion Trend · 近期互動情緒指數</SectionLabel>
              <span
                className={`chip ${
                  trendImproving ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/25 bg-rose-400/10 text-rose-300'
                }`}
              >
                {trendImproving ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trendImproving ? '持續改善' : '持續下降'}
              </span>
            </div>
            <EmotionSparkline data={customer.emotionTrend} />
            <div className="mt-1 flex justify-between text-[11px] text-ink-400">
              <span>較早互動</span>
              <span>最新</span>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Service history */}
            <GlassCard delay={0.2} hover={false} className="p-6">
              <div className="flex items-center gap-1.5">
                <History size={14} className="text-ink-300" />
                <SectionLabel>Service History</SectionLabel>
              </div>
              <div className="space-y-2.5">
                {customer.serviceHistory.map((s, i) => (
                  <motion.div
                    key={s.date + s.type + i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-ink-400">{s.date}</span>
                      <span className="font-medium text-ink-100">{s.type}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusColorFor(s.status)}`}>
                      {s.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {/* AI Insight */}
            <GlassCard delay={0.28} hover={false} className="p-6">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-400" />
                <SectionLabel>AI Insight</SectionLabel>
              </div>
              <div className="space-y-3">
                {/* Risk line is always recomputed live from the current churn score —
                    never trust a stored "risk" insight, it goes stale the moment
                    churnScore changes elsewhere (e.g. after a retention plan). */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm leading-relaxed ${insightStyles.risk}`}
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  「流失風險：{churnRisk}（{customer.churnScore} / 100）」
                </motion.div>
                {customer.insights
                  .filter((ins) => ins.icon !== 'risk')
                  .map((ins, i) => {
                    const Icon = insightIcons[ins.icon]
                    return (
                      <motion.div
                        key={ins.text + i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.15 }}
                        className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm leading-relaxed ${insightStyles[ins.icon]}`}
                      >
                        <Icon size={16} className="mt-0.5 shrink-0" />
                        「{ins.text}」
                      </motion.div>
                    )
                  })}

                {planState === 'idle' && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={startPlan}
                    className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-bold text-white shadow-glow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    一鍵啟動 AI 挽留方案
                  </motion.button>
                )}

                {planState === 'generating' && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-brand-400/20 bg-brand-500/[0.06] px-4 py-3 text-sm font-medium text-brand-300">
                    <Loader2 size={15} className="animate-spin" /> AI 正在生成個人化挽留方案…
                  </div>
                )}

                <AnimatePresence>
                  {planState === 'ready' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2.5 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4"
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 size={14} /> 挽留方案已生成 · 追蹤任務已建立 · 流失風險已下降
                      </div>
                      {retentionSteps.map((s, i) => (
                        <motion.div
                          key={s.title}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.12 }}
                          className="flex items-start gap-2.5 text-xs text-ink-200"
                        >
                          <s.icon size={14} className="mt-0.5 shrink-0 text-emerald-300" />
                          <div>
                            <div className="font-semibold text-white">{s.title}</div>
                            <div className="mt-0.5 text-ink-300">{s.detail}</div>
                          </div>
                        </motion.div>
                      ))}
                      <button
                        onClick={() => setPlanState('idle')}
                        className="mt-1 text-[11px] font-medium text-ink-400 underline-offset-2 hover:text-white hover:underline"
                      >
                        重新生成
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
