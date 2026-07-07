import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  PhoneCall,
  HeartPulse,
  Target,
  Sparkles,
  ArrowRight,
  Radio,
  BrainCircuit,
  Waves,
  Users,
} from 'lucide-react'
import { GlassCard, SectionLabel } from '../components/GlassCard'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { StatusDot } from '../components/StatusDot'
import type { PageId } from '../App'

// Small live-tick so the dashboard reads as a real-time monitor rather than
// a frozen mockup — nudges the value within +/- range every few seconds.
function useLiveNumber(base: number, range: number, intervalMs = 3800) {
  const [value, setValue] = useState(base)
  useEffect(() => {
    const t = setInterval(() => {
      setValue(base + Math.round((Math.random() - 0.5) * 2 * range))
    }, intervalMs)
    return () => clearInterval(t)
  }, [base, range, intervalMs])
  return value
}

const kpiBase = [
  {
    icon: Bot,
    label: 'AI Agents Online',
    value: 128,
    sub: '+12 vs 昨日',
    color: 'text-brand-400',
    live: 4,
  },
  {
    icon: PhoneCall,
    label: 'Active Calls',
    value: 342,
    sub: 'AI 同步輔助中',
    color: 'text-emerald-400',
    live: 14,
  },
  {
    icon: HeartPulse,
    label: 'Customer Sentiment',
    value: 87,
    suffix: '%',
    sub: 'Positive · 即時情緒指數',
    color: 'text-sky-400',
    live: 0,
  },
  {
    icon: Target,
    label: 'Resolution Rate',
    value: 94.2,
    decimals: 1,
    suffix: '%',
    sub: '首次來電解決率',
    color: 'text-brand-300',
    live: 0,
  },
]

const capabilities = [
  { icon: Radio, title: 'TAIPBX Telecom', desc: '電信級語音通訊骨幹，毫秒級接通' },
  { icon: BrainCircuit, title: 'Generative AI', desc: '企業知識驅動的生成式回應引擎' },
  { icon: Waves, title: 'Voice Intelligence', desc: '即時語音辨識、意圖與情緒分析' },
  { icon: Users, title: 'Customer Twin', desc: '360° 客戶數位分身與流失預測' },
]

export function CommandCenter({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10">
      {/* Hero */}
      <div className="relative mb-12 text-center">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,107,0,0.16), rgba(255,107,0,0.05) 55%, transparent)',
          }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="chip mx-auto mb-6 border-brand-400/25 bg-brand-400/10 text-brand-300"
        >
          <Sparkles size={13} />
          Enterprise AI Service Brain
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl"
        >
          MyVoca <span className="text-gradient">AI Service Intelligence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-ink-200 md:text-xl"
        >
          「每位客服，都擁有一位 AI 超能力搭檔」
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={() => onNavigate('voice')}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            體驗 AI Voice Demo
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => onNavigate('ops')}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-ink-100 backdrop-blur transition-colors hover:border-brand-400/40 hover:text-white"
          >
            查看營運洞察
          </button>
        </motion.div>
      </div>

      {/* KPI grid — Active Calls / AI Agents Online tick live to read as a real-time monitor */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiBase.map((kpi, i) => (
          <KpiTile key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>

      {/* Platform capabilities */}
      <GlassCard delay={0.7} hover={false} className="p-8">
        <SectionLabel>MyVoca = TAIPBX + GenAI + Voice Intelligence + Customer Twin + AI Workforce</SectionLabel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + i * 0.09, duration: 0.5 }}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-brand-500/30 hover:bg-brand-500/[0.06]"
            >
              <cap.icon
                size={22}
                className="mb-3 text-brand-400 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="text-sm font-semibold text-white">{cap.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-ink-300">{cap.desc}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function KpiTile({ kpi, index }: { kpi: (typeof kpiBase)[number]; index: number }) {
  const liveValue = useLiveNumber(kpi.value, kpi.live)
  return (
    <GlassCard delay={0.35 + index * 0.08} className="p-6">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl bg-white/[0.06] p-2.5 ${kpi.color}`}>
          <kpi.icon size={20} />
        </div>
        <StatusDot color={index === 0 ? 'orange' : 'green'} />
      </div>
      <div className="mt-4 text-3xl font-extrabold text-white">
        <AnimatedNumber value={liveValue} decimals={kpi.decimals ?? 0} suffix={kpi.suffix ?? ''} duration={0.9} />
      </div>
      <div className="mt-1 text-sm font-medium text-ink-200">{kpi.label}</div>
      <div className="mt-0.5 text-xs text-ink-300">{kpi.sub}</div>
    </GlassCard>
  )
}
