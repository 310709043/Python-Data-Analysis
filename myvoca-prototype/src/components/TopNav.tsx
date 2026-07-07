import { motion } from 'framer-motion'
import { Network } from 'lucide-react'
import { BrandLockup } from './Logo'
import { StatusDot } from './StatusDot'
import type { PageId } from '../App'

export interface NavItem {
  id: PageId
  label: string
  zh: string
}

export const navItems: NavItem[] = [
  { id: 'command', label: 'Command Center', zh: '指揮中心' },
  { id: 'voice', label: 'Voice Demo', zh: '語音體驗' },
  { id: 'whisper', label: 'Whisper Copilot', zh: 'AI 耳語' },
  { id: 'twin', label: 'Service Twin', zh: 'AI 分身' },
  { id: 'customer', label: 'Customer 360', zh: '客戶智慧' },
  { id: 'ops', label: 'Operations', zh: '營運洞察' },
]

interface TopNavProps {
  page: PageId
  onNavigate: (page: PageId) => void
}

export function TopNav({ page, onNavigate }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-3">
        <button onClick={() => onNavigate('command')} className="shrink-0 text-left">
          <BrandLockup />
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1 lg:flex">
          {navItems.map((item) => {
            const active = page === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  active ? 'text-white' : 'text-ink-300 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 shadow-glow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{item.zh}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="chip border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
            <Network size={13} />
            <span className="hidden sm:inline">TAIPBX</span> Connected
          </div>
          <div className="chip border-brand-400/25 bg-brand-400/10 text-brand-300">
            <StatusDot color="orange" />
            <span className="hidden sm:inline">AI Agents</span> Active
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
              page === item.id
                ? 'bg-brand-500 text-white'
                : 'bg-white/[0.05] text-ink-300'
            }`}
          >
            {item.zh}
          </button>
        ))}
      </div>
    </header>
  )
}
