import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Store, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { GlassCard, SectionLabel } from './GlassCard'
import { TranscriptBubble } from './TranscriptBubble'
import { ScoreGauge } from './charts'
import { complianceChecklist, storeTranscripts } from '../data/storeTranscripts'
import { analyzeUtterance } from '../data/aiEngine'
import { useAppActions } from '../state/appStore'

export function StoreQualityCheck() {
  const actions = useAppActions()
  const [index, setIndex] = useState(0)
  const [checkId, setCheckId] = useState(0)
  const transcript = storeTranscripts[index]

  const agentText = useMemo(
    () => transcript.lines.filter((l) => l.speaker === 'agent').map((l) => l.text).join(' '),
    [transcript],
  )

  const results = useMemo(
    () =>
      complianceChecklist.map((item) => ({
        ...item,
        pass: item.keywords.some((kw) => agentText.includes(kw)),
      })),
    [agentText],
  )

  const overallScore = Math.round((results.filter((r) => r.pass).length / results.length) * 100)

  const lastCustomerLine = [...transcript.lines].reverse().find((l) => l.speaker === 'customer')
  const emotionAnalysis = useMemo(
    () => (lastCustomerLine ? analyzeUtterance(lastCustomerLine.text) : null),
    [lastCustomerLine],
  )

  const runCheck = () => {
    actions.recordQualityCheck({
      id: `qc-${Date.now()}`,
      transcriptLabel: transcript.storeName,
      overallScore,
      checkedAt: Date.now(),
    })
    setIndex((i) => (i + 1) % storeTranscripts.length)
    setCheckId((c) => c + 1)
  }

  return (
    <GlassCard hover={false} className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Store size={14} className="text-brand-400" />
          <SectionLabel>門市語音質檢 · {transcript.storeName}</SectionLabel>
        </div>
        <button
          onClick={runCheck}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-ink-200 transition-colors hover:border-brand-400/40 hover:text-white"
        >
          <RefreshCw size={12} /> 重新檢測
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto_220px]">
        {/* Transcript */}
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {transcript.lines.map((line, i) => (
            <TranscriptBubble
              key={checkId + '-' + i}
              side={line.speaker === 'customer' ? 'right' : 'left'}
              name={line.name}
              ai={false}
              text={line.text}
              typing={false}
            />
          ))}
        </div>

        {/* Divider on desktop */}
        <div className="hidden w-px bg-white/[0.06] md:block" />

        {/* Score + checklist */}
        <div className="flex flex-col items-center gap-3">
          <ScoreGauge score={overallScore} label="合規總分" />
          {emotionAnalysis && (
            <div className="text-center text-[11px] text-ink-400">
              客戶最終情緒：<span className="font-semibold text-ink-200">{emotionAnalysis.emotionLabel}</span>
            </div>
          )}
          <div className="w-full space-y-1.5">
            {results.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-xs"
              >
                {r.pass ? (
                  <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
                ) : (
                  <XCircle size={13} className="shrink-0 text-rose-400" />
                )}
                <span className={r.pass ? 'text-ink-200' : 'text-rose-300'}>{r.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
