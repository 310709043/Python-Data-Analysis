import { motion } from 'framer-motion'
import { Crown, MessageSquareQuote, Sparkles, ArrowRight } from 'lucide-react'
import type { AnalysisResult } from '../data/aiEngine'
import type { CustomerRecord } from '../data/customers'
import { churnRiskLabel } from '../data/customers'

const riskChipStyle: Record<string, string> = {
  High: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  Medium: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  Low: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
}

export function HandoffBriefing({
  customer,
  analysis,
  lastUtterance,
}: {
  customer: CustomerRecord
  analysis: AnalysisResult
  lastUtterance: string
}) {
  const risk = churnRiskLabel(customer.churnScore)
  const topRecommendation = analysis.recommendations[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-3 text-left"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300">
        <Sparkles size={13} /> AI 交接摘要 · 客戶不需重述問題
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-bold text-white">{customer.name}</span>
          <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-300">
            <Crown size={11} /> {customer.tier}
          </span>
          <span className={`chip ${riskChipStyle[risk]}`}>流失風險 {risk}</span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-3 text-xs">
          <div>
            <span className="text-ink-400">意圖：</span>
            <span className="font-semibold text-ink-100">{analysis.intentLabel}</span>
          </div>
          <div>
            <span className="text-ink-400">情緒：</span>
            <span className="font-semibold text-ink-100">{analysis.emotionLabel}</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-white/[0.03] p-2.5 text-xs italic text-ink-200">
          <MessageSquareQuote size={13} className="mt-0.5 shrink-0 text-ink-400" />
          「{lastUtterance}」
        </div>
      </div>

      {topRecommendation && (
        <div className="flex items-start gap-2.5 rounded-xl border border-brand-400/25 bg-brand-500/[0.07] p-3.5">
          <ArrowRight size={15} className="mt-0.5 shrink-0 text-brand-400" />
          <div>
            <div className="text-xs font-semibold text-brand-300">建議切入點</div>
            <div className="mt-0.5 text-sm font-semibold text-white">{topRecommendation.title}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-ink-300">{topRecommendation.detail}</div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
