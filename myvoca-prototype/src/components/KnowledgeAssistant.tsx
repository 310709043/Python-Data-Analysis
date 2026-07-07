import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpenText, Send, FileText, HelpCircle } from 'lucide-react'
import { GlassCard, SectionLabel } from './GlassCard'
import { lookupKnowledge, type KnowledgeLookupResult } from '../data/knowledgeBase'
import { industries } from '../data/industries'
import { useAppActions, useAppState } from '../state/appStore'

export function KnowledgeAssistant() {
  const state = useAppState()
  const actions = useAppActions()
  const knowledgeBase = industries[state.industryId].knowledgeBase
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<KnowledgeLookupResult | null>(null)

  useEffect(() => setResult(null), [state.industryId])

  const ask = (text: string) => {
    const clean = text.trim()
    if (!clean) return
    const lookup = lookupKnowledge(clean, knowledgeBase)
    setResult(lookup)
    setQuery('')
    actions.recordKbLookup()
  }

  return (
    <GlassCard hover={false} className="p-6">
      <div className="flex items-center gap-1.5">
        <BookOpenText size={14} className="text-brand-400" />
        <SectionLabel>GenAIus · 企業知識問答</SectionLabel>
      </div>
      <p className="mb-3 text-xs text-ink-300">
        懂你的知識、懂你的流程 — 問任何企業內部政策，答案直接附來源文件
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {knowledgeBase.slice(0, 3).map((e) => (
          <button
            key={e.id}
            onClick={() => ask(e.question)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-ink-300 transition-colors hover:border-brand-400/40 hover:text-white"
          >
            {e.question}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(query)
        }}
        className="flex items-center gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="輸入問題，例如：帳單金額異常要怎麼處理？"
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-brand-400/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white transition-transform hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
        >
          <Send size={15} />
        </button>
      </form>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.entry?.id ?? 'miss'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-brand-400/25 bg-brand-500/[0.06] p-4"
          >
            {result.hit && result.entry ? (
              <>
                <p className="text-sm leading-relaxed text-white">{result.entry.answer}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-ink-300">
                  <FileText size={11} /> 來源：{result.entry.sourceDoc}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-ink-300">
                <HelpCircle size={14} className="text-ink-400" />
                目前知識庫沒有直接答案，建議轉真人客服協助確認。
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
