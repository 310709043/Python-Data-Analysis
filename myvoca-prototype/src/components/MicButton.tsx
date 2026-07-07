import { AnimatePresence, motion } from 'framer-motion'
import { Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

export function MicButton({
  onResult,
  disabled = false,
}: {
  onResult: (text: string) => void
  disabled?: boolean
}) {
  const { supported, isListening, interimText, error, start, stop } = useSpeechRecognition(onResult)

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="此瀏覽器不支援語音輸入，請使用 Chrome 或 Edge"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-ink-500"
      >
        <MicOff size={15} />
      </button>
    )
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {(isListening || error) && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className={`absolute bottom-full right-0 mb-2 w-56 rounded-lg border px-3 py-2 text-[11px] shadow-card ${
              error
                ? 'border-rose-400/30 bg-ink-900 text-rose-300'
                : 'border-brand-400/30 bg-ink-900 text-ink-200'
            }`}
          >
            {error ?? (interimText || '正在聆聽…請開始說話')}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => (isListening ? stop() : start())}
        whileTap={{ scale: 0.94 }}
        title={isListening ? '點擊停止錄音' : '點擊開始語音輸入'}
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
          isListening
            ? 'bg-rose-500 text-white'
            : 'border border-white/10 bg-white/[0.03] text-ink-300 hover:border-brand-400/40 hover:text-white'
        }`}
      >
        {isListening && (
          <motion.span
            className="absolute inset-0 rounded-lg border-2 border-rose-400"
            animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <Mic size={15} />
      </motion.button>
    </div>
  )
}
