import { motion } from 'framer-motion'
import { Typewriter } from './Typewriter'

export function TranscriptBubble({
  side,
  name,
  text,
  typing,
  ai = false,
  onDone,
}: {
  side: 'left' | 'right'
  name: string
  text: string
  typing: boolean
  ai?: boolean
  onDone?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          side === 'right'
            ? 'rounded-tr-sm border border-white/[0.08] bg-white/[0.06] text-ink-100'
            : 'rounded-tl-sm border border-brand-400/20 bg-brand-500/[0.08] text-ink-100'
        }`}
      >
        <div className={`mb-1 text-[11px] font-semibold ${ai ? 'text-brand-300' : 'text-ink-300'}`}>
          {name}
        </div>
        {typing ? <Typewriter text={text} speed={45} onDone={onDone} /> : text}
      </div>
    </motion.div>
  )
}
