import { Bot, Clock, TrendingUp, HeartHandshake } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'
import { useAppState } from '../state/appStore'

export function AiValueTicker() {
  const { metrics } = useAppState()
  const totalHandled = metrics.aiResolutionCount + metrics.humanTransferCount
  const aiRate = totalHandled === 0 ? 0 : Math.round((metrics.aiResolutionCount / totalHandled) * 100)

  const items = [
    { icon: Bot, value: aiRate, suffix: '%', label: 'AI 輔助率' },
    { icon: Clock, value: metrics.minutesSavedEstimate, suffix: ' 分', label: '預估節省時間' },
    { icon: TrendingUp, value: metrics.dealsMrrTotal, prefix: 'NT$', suffix: '/月', label: '今日新增 MRR' },
    { icon: HeartHandshake, value: metrics.retentionPlansTriggered, label: '挽留客戶數' },
  ]

  return (
    <div className="flex items-center gap-4 overflow-x-auto px-6 py-1.5 text-[11px] text-ink-300">
      <span className="shrink-0 font-semibold uppercase tracking-wider text-brand-400">今日 AI 效益</span>
      {items.map((item) => (
        <div key={item.label} className="flex shrink-0 items-center gap-1.5">
          <item.icon size={12} className="text-ink-400" />
          <span className="font-bold text-white">
            <AnimatedNumber value={item.value} prefix={item.prefix ?? ''} suffix={item.suffix ?? ''} duration={0.7} />
          </span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
