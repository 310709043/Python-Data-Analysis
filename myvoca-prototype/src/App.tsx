import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TopNav } from './components/TopNav'
import { AiServiceChatWidget } from './components/AiServiceChatWidget'
import { CommandCenter } from './pages/CommandCenter'
import { VoiceDemo } from './pages/VoiceDemo'
import { WhisperCopilot } from './pages/WhisperCopilot'
import { ServiceTwin } from './pages/ServiceTwin'
import { CustomerIntelligence } from './pages/CustomerIntelligence'
import { OperationDashboard } from './pages/OperationDashboard'

export type PageId = 'command' | 'voice' | 'whisper' | 'twin' | 'customer' | 'ops'

export default function App() {
  const [page, setPage] = useState<PageId>('command')

  return (
    <div className="min-h-screen">
      <TopNav page={page} onNavigate={setPage} />

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {page === 'command' && <CommandCenter onNavigate={setPage} />}
            {page === 'voice' && <VoiceDemo />}
            {page === 'whisper' && <WhisperCopilot />}
            {page === 'twin' && <ServiceTwin />}
            {page === 'customer' && <CustomerIntelligence />}
            {page === 'ops' && <OperationDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mx-auto max-w-[1440px] px-6 pb-8 pt-4 text-center text-xs text-ink-400">
        MyVoca · MyClaw Enterprise AI Agent Platform · Taiwan Mobile — Interactive Prototype (mock
        data for demo purposes)
      </footer>

      <AiServiceChatWidget />
    </div>
  )
}
