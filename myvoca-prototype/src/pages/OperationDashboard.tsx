import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PhoneCall,
  Bot,
  Smile,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  FileText,
  Copy,
  Check,
} from 'lucide-react'
import { GlassCard, SectionLabel } from '../components/GlassCard'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { StatusDot } from '../components/StatusDot'
import { HourlyBars } from '../components/charts'
import { hourlyCalls, opsInsights, teamAgents } from '../data/mock'

type ReportState = 'idle' | 'generating' | 'ready'

const reportExtras = [
  '尖峰時段落在 17:00–18:00，建議提前 30 分鐘增派 AI Agent 容量',
  'Eric Chen 的 AI 輔助採用率達 96%，可作為團隊標竿案例分享',
  '本週網路類問題整體較上週上升 12%，建議通知網路工程部門追蹤',
]

const todayKpis = [
  { icon: PhoneCall, label: 'Calls Handled', value: 1284, delta: '+8.2%', up: true },
  { icon: Bot, label: 'AI Resolution Rate', value: 72.4, decimals: 1, suffix: '%', delta: '+4.1%', up: true },
  { icon: Smile, label: 'Customer Satisfaction', value: 4.8, decimals: 1, suffix: ' / 5', delta: '+0.2', up: true },
  { icon: AlertTriangle, label: 'Risk Alerts', value: 5, delta: '+2', up: false },
]

const hourLabels = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']

const severityStyle: Record<string, string> = {
  high: 'border-rose-400/25 bg-rose-500/[0.07]',
  medium: 'border-amber-400/25 bg-amber-500/[0.07]',
}

const agentStatusColor: Record<string, string> = {
  online: 'green',
  busy: 'orange',
  away: 'gray',
}

export function OperationDashboard() {
  const [reportState, setReportState] = useState<ReportState>('idle')
  const [copied, setCopied] = useState(false)

  const generateReport = () => {
    if (reportState !== 'idle') return
    setReportState('generating')
    setTimeout(() => setReportState('ready'), 1500)
  }

  const copyReport = () => {
    const lines = [
      '台灣大哥大 MyVoca — 今日營運報告',
      ...opsInsights.map((ins) => `${ins.rank}. ${ins.text}：${ins.detail}`),
      ...reportExtras.map((e) => `· ${e}`),
    ]
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
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
            AI Operation <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="mt-1 text-sm text-ink-300">主管視角 — 今日營運全貌與 AI 生成洞察</p>
        </div>
        <div className="chip border-white/10 bg-white/[0.04] text-ink-200">
          <StatusDot color="green" /> 即時更新 · 2026/07/07
        </div>
      </motion.div>

      {/* Today KPIs */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {todayKpis.map((k, i) => (
          <GlassCard key={k.label} delay={0.08 + i * 0.07} className="p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-white/[0.06] p-2 text-brand-400">
                <k.icon size={18} />
              </div>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  k.up ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {k.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {k.delta}
              </span>
            </div>
            <div className="mt-3 text-3xl font-extrabold text-white">
              <AnimatedNumber value={k.value} decimals={k.decimals ?? 0} suffix={k.suffix ?? ''} />
            </div>
            <div className="mt-0.5 text-sm text-ink-300">{k.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          {/* Hourly call volume */}
          <GlassCard delay={0.3} hover={false} className="p-6">
            <SectionLabel>今日每小時來電量</SectionLabel>
            <HourlyBars data={hourlyCalls} labels={hourLabels.map((h) => `${h}:00`)} />
          </GlassCard>

          {/* Team status */}
          <GlassCard delay={0.4} hover={false} className="p-6">
            <SectionLabel>客服團隊 · AI 協作狀態</SectionLabel>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-ink-400">
                    <th className="pb-2 font-medium">客服</th>
                    <th className="pb-2 font-medium">狀態</th>
                    <th className="pb-2 text-right font-medium">今日通數</th>
                    <th className="pb-2 text-right font-medium">CSAT</th>
                    <th className="pb-2 text-right font-medium">AI 輔助率</th>
                  </tr>
                </thead>
                <tbody>
                  {teamAgents.map((a, i) => (
                    <motion.tr
                      key={a.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="border-t border-white/[0.05] transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="py-2.5 font-medium text-ink-100">{a.name}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs capitalize text-ink-300">
                          <StatusDot color={agentStatusColor[a.status]} pulse={a.status === 'online'} />
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-ink-100">{a.calls}</td>
                      <td className="py-2.5 text-right tabular-nums text-ink-100">{a.csat}</td>
                      <td className="py-2.5 text-right tabular-nums text-brand-300">{a.aiAssist}%</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* AI Generated Insight */}
        <GlassCard delay={0.35} hover={false} className="relative h-fit overflow-hidden p-6">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full"
            style={{ background: 'radial-gradient(closest-side, rgba(255,107,0,0.2), transparent)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <div className="relative flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow-sm">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">AI Generated Insight</div>
              <div className="text-[11px] text-ink-300">由 MyVoca AI Brain 於 5 分鐘前生成</div>
            </div>
          </div>

          <div className="relative mt-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-300">
              今日主要問題
            </div>
            <div className="space-y-3">
              {opsInsights.map((ins, i) => (
                <motion.div
                  key={ins.rank}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                  className={`rounded-xl border p-4 ${severityStyle[ins.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-bold text-white">
                      {ins.rank}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white">{ins.text}</div>
                      <div className="mt-1 text-xs leading-relaxed text-ink-300">{ins.detail}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {reportState === 'idle' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                onClick={generateReport}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-bold text-white shadow-glow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                生成完整營運報告
              </motion.button>
            )}

            {reportState === 'generating' && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-brand-400/20 bg-brand-500/[0.06] px-4 py-3 text-sm font-medium text-brand-300">
                <Loader2 size={15} className="animate-spin" /> AI 正在彙整今日所有對話與數據…
              </div>
            )}

            <AnimatePresence>
              {reportState === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <FileText size={13} className="text-brand-400" /> 完整營運報告 · 已生成
                    </div>
                    <button
                      onClick={copyReport}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-ink-200 transition-colors hover:bg-white/[0.1] hover:text-white"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? '已複製' : '複製文字'}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {reportExtras.map((e, i) => (
                      <motion.div
                        key={e}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.12 }}
                        className="flex items-start gap-2 text-xs leading-relaxed text-ink-200"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                        {e}
                      </motion.div>
                    ))}
                  </div>
                  <button
                    onClick={() => setReportState('idle')}
                    className="text-[11px] font-medium text-ink-400 underline-offset-2 hover:text-white hover:underline"
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
  )
}
