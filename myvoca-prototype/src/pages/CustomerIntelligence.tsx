import { motion } from 'framer-motion'
import {
  User,
  Crown,
  Wallet,
  History,
  Heart,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Repeat,
  Sparkles,
} from 'lucide-react'
import { GlassCard, SectionLabel } from '../components/GlassCard'
import { EmotionSparkline } from '../components/charts'
import { customer360, customerProfile } from '../data/mock'

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

export function CustomerIntelligence() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl font-extrabold text-white md:text-3xl">
          Customer <span className="text-gradient">Intelligence 360</span>
        </h2>
        <p className="mt-1 text-sm text-ink-300">
          Customer Twin — 每位客戶的數位分身：價值、歷史、偏好、情緒與 AI 策略
        </p>
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
              <div className="text-xl font-extrabold text-white">{customerProfile.name}</div>
              <div className="mt-1 flex gap-2">
                <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <Crown size={12} /> VIP
                </span>
                <span className="chip border-white/10 bg-white/[0.05] text-ink-200">
                  {customerProfile.tenureYears} 年客戶
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-5 space-y-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center gap-1.5 text-xs text-ink-300">
                <Wallet size={13} /> Lifetime Value
              </div>
              <div className="mt-1 text-2xl font-extrabold text-white">
                {customer360.lifetimeValue}
              </div>
              <div className="text-xs text-ink-300">近 12 個月貢獻 {customer360.clv12m}</div>
            </div>

            <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-200">
                  <TrendingDown size={13} /> 流失風險 Churn Risk
                </div>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-300">
                  {customer360.churnRisk}
                </span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${customer360.churnScore}%` }}
                  transition={{ duration: 1.2, delay: 0.4 }}
                />
              </div>
              <div className="mt-1 text-right text-[11px] font-semibold text-rose-300">
                {customer360.churnScore} / 100
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs text-ink-300">
                <Heart size={13} /> Preference 偏好
              </div>
              <div className="flex flex-wrap gap-1.5">
                {customer360.preferences.map((p) => (
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
              <SectionLabel>Emotion Trend · 近 7 次互動情緒指數</SectionLabel>
              <span className="chip border-rose-400/25 bg-rose-400/10 text-rose-300">
                <TrendingDown size={12} /> 持續下降
              </span>
            </div>
            <EmotionSparkline data={customer360.emotionTrend} />
            <div className="mt-1 flex justify-between text-[11px] text-ink-400">
              <span>90 天前</span>
              <span>今日</span>
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
                {customer360.serviceHistory.map((s, i) => (
                  <motion.div
                    key={s.date + s.type}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-ink-400">{s.date}</span>
                      <span className="font-medium text-ink-100">{s.type}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle[s.status]}`}>
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
                {customer360.insights.map((ins, i) => {
                  const Icon = insightIcons[ins.icon as keyof typeof insightIcons]
                  return (
                    <motion.div
                      key={ins.text}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.15 }}
                      className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm leading-relaxed ${
                        insightStyles[ins.icon as keyof typeof insightStyles]
                      }`}
                    >
                      <Icon size={16} className="mt-0.5 shrink-0" />
                      「{ins.text}」
                    </motion.div>
                  )
                })}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-bold text-white shadow-glow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  一鍵啟動 AI 挽留方案
                </motion.button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
