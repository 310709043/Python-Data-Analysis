import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { TranscriptBubble } from './TranscriptBubble'
import { analyzeUtterance, quickReplies } from '../data/aiEngine'
import type { CustomerId } from '../data/customers'
import { industries } from '../data/industries'
import { useAppActions, useAppState } from '../state/appStore'

interface ChatTurn {
  id: number
  speaker: 'ai' | 'customer'
  name: string
  text: string
}

export function AiServiceChatWidget() {
  const state = useAppState()
  const actions = useAppActions()
  const customerIds = Object.keys(state.customers) as CustomerId[]
  const serviceOverride = industries[state.industryId].serviceOverride

  const [open, setOpen] = useState(false)
  const [customerId, setCustomerId] = useState<CustomerId>('wang')
  const [turns, setTurns] = useState<ChatTurn[]>(() => [
    { id: 0, speaker: 'ai', name: 'AI 智能客服', text: state.customers.wang.openingLine },
  ])
  const [thinking, setThinking] = useState(false)
  const [input, setInput] = useState('')
  const turnIdRef = useRef(1)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns, thinking, open])

  const submit = (text: string) => {
    const clean = text.trim()
    if (!clean || thinking) return
    const customerName = state.customers[customerId].name
    turnIdRef.current += 1
    setTurns((t) => [...t, { id: turnIdRef.current, speaker: 'customer', name: customerName, text: clean }])
    setInput('')
    setThinking(true)

    setTimeout(() => {
      const result = analyzeUtterance(clean, customerName, serviceOverride)
      turnIdRef.current += 1
      setTurns((t) => [...t, { id: turnIdRef.current, speaker: 'ai', name: 'AI 智能客服', text: result.suggestedReply }])
      setThinking(false)
      actions.recordUtteranceAnalyzed(customerId, result, 'chat')
    }, 1300)
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass mb-3 flex h-[500px] w-[340px] flex-col overflow-hidden p-0 sm:w-[380px]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div>
                <div className="text-sm font-bold text-white">AI 智能客服</div>
                <div className="text-[11px] text-ink-300">網頁 / App 自助服務 · 同一套 MyVoca 大腦</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-1.5 border-b border-white/[0.06] px-4 py-2">
              {customerIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setCustomerId(id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    id === customerId
                      ? 'bg-brand-500 text-white'
                      : 'border border-white/10 bg-white/[0.03] text-ink-300 hover:text-white'
                  }`}
                >
                  {state.customers[id].name}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {turns.map((turn) => (
                <TranscriptBubble
                  key={turn.id}
                  side={turn.speaker === 'customer' ? 'right' : 'left'}
                  name={turn.name}
                  ai={turn.speaker === 'ai'}
                  text={turn.text}
                  typing={false}
                />
              ))}
              {thinking && (
                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <Loader2 size={12} className="animate-spin" /> AI 正在輸入…
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-white/[0.06] p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {quickReplies.slice(0, 3).map((q) => (
                  <button
                    key={q.label}
                    disabled={thinking}
                    onClick={() => submit(q.text)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-ink-300 transition-colors hover:border-brand-400/40 hover:text-white disabled:opacity-40"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  submit(input)
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={thinking}
                  placeholder="輸入訊息…"
                  className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-400 focus:border-brand-400/50 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={thinking || !input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white transition-transform hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink-950" />
        )}
      </motion.button>
    </div>
  )
}
