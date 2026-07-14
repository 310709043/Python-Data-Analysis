import { motion } from 'framer-motion'
import { Bell, Check, Clock } from 'lucide-react'
import type { Deal } from '../data/deals'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}

const timelineSteps = (deal: Deal) => [
  { label: `${formatTime(deal.createdAt)} 發送方案確認簡訊`, done: true },
  { label: '3 天後 自動關懷簡訊，確認使用狀況', done: false },
  { label: '30 天後 M+ 排定回訪，追蹤滿意度', done: false },
]

export function MPlusNotification({ deal }: { deal: Deal }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Simulated lock-screen push notification */}
      <div className="mx-auto max-w-[280px] rounded-2xl border border-white/10 bg-ink-900/90 p-3 shadow-card">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-300">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700">
            <Bell size={11} className="text-white" />
          </div>
          M+ · 台灣大哥大
          <span className="ml-auto text-ink-400">現在</span>
        </div>
        <div className="mt-1.5 text-xs font-semibold text-white">方案確認</div>
        <div className="mt-0.5 text-[11px] leading-relaxed text-ink-200">
          {deal.customerName} 您好，{deal.planName} 已生效，訂單編號 {deal.id}，每月加收 NT${deal.mrrDelta}。
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          M+ 追蹤時間軸
        </div>
        <div className="space-y-2">
          {timelineSteps(deal).map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
              className="flex items-start gap-2 text-xs text-ink-200"
            >
              {step.done ? (
                <Check size={13} className="mt-0.5 shrink-0 text-emerald-400" />
              ) : (
                <Clock size={13} className="mt-0.5 shrink-0 text-ink-400" />
              )}
              <span className={step.done ? 'text-white' : 'text-ink-300'}>{step.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
