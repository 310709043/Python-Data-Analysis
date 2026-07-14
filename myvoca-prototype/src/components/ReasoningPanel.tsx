import { motion } from 'framer-motion'
import { FlaskConical } from 'lucide-react'
import type { AnalysisResult } from '../data/aiEngine'

function CandidateBar({ label, score, matchedKeywords }: { label: string; score: number; matchedKeywords: string[] }) {
  const pct = Math.max(0, score)
  return (
    <div className="py-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-ink-200">{label}</span>
        <span className="tabular-nums text-ink-400">{score < 0 ? '—' : `${score}`}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {matchedKeywords.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {matchedKeywords.map((kw) => (
            <span key={kw} className="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] text-brand-300">
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function ReasoningPanel({ analysis }: { analysis: AnalysisResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-sky-400/20 bg-sky-500/[0.05] p-3.5"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-sky-300">
        <FlaskConical size={13} /> AI 推理依據（Dev 模式）
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wide text-ink-400">Intent 候選</div>
          {analysis.intentCandidates.map((c) => (
            <CandidateBar key={c.id} label={c.label} score={c.score} matchedKeywords={c.matchedKeywords} />
          ))}
        </div>
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wide text-ink-400">Emotion 候選</div>
          {analysis.emotionCandidates.map((c) => (
            <CandidateBar key={c.id} label={c.label} score={c.score} matchedKeywords={c.matchedKeywords} />
          ))}
        </div>
      </div>
      <div className="mt-2 text-[10px] leading-relaxed text-ink-400">
        簡化規則引擎示範版 — 正式環境由 GenAIus 大型語言模型取代
      </div>
    </motion.div>
  )
}
