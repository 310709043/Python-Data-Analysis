import { useState } from 'react'
import { motion } from 'framer-motion'

// Semicircular score gauge — single-value quality/compliance score (0-100).
export function ScoreGauge({ score, label, size = 140 }: { score: number; label?: string; size?: number }) {
  const clamped = Math.max(0, Math.min(100, score))
  const radius = size / 2 - 10
  const circumference = Math.PI * radius
  const offset = circumference * (1 - clamped / 100)
  const color = clamped >= 80 ? '#34D399' : clamped >= 60 ? '#FFA76B' : '#FB7185'

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <motion.path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="-mt-8 text-2xl font-extrabold text-white">{clamped}</div>
      {label && <div className="mt-0.5 text-[11px] text-ink-400">{label}</div>}
    </div>
  )
}

// Single-series emotion trend sparkline (SVG, area + line, brand orange on dark surface).
export function EmotionSparkline({ data, className = '' }: { data: number[]; className?: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const w = 320
  const h = 96
  const pad = 8
  const min = Math.min(...data)
  const max = Math.max(...data)
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2)
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2)
  const linePath = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')
  const areaPath = `${linePath} L${x(data.length - 1)},${h - pad} L${x(0)},${h - pad} Z`

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        role="img"
        aria-label={`情緒指數趨勢，由 ${data[0]} 降至 ${data[data.length - 1]}`}
      >
        <defs>
          <linearGradient id="emoArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8A38" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FF8A38" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#emoArea)" />
        <motion.path
          d={linePath}
          fill="none"
          stroke="#FF8A38"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
        {data.map((v, i) => (
          <g key={i}>
            {/* invisible hit target wider than the mark */}
            <rect
              x={x(i) - (w - pad * 2) / (data.length - 1) / 2}
              y={0}
              width={(w - pad * 2) / (data.length - 1)}
              height={h}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            <circle
              cx={x(i)}
              cy={y(v)}
              r={hover === i ? 5 : i === data.length - 1 ? 4 : 0}
              fill="#FF8A38"
              stroke="#16161F"
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-1 rounded-md border border-white/10 bg-ink-850 px-2 py-1 text-[11px] font-semibold text-white shadow-card"
          style={{ left: `${(x(hover) / w) * 100}%`, transform: 'translateX(-50%)' }}
        >
          {data[hover]}
        </div>
      )}
    </div>
  )
}

// Single-series hourly bar chart with rounded data-ends and hover tooltip.
export function HourlyBars({
  data,
  labels,
  className = '',
}: {
  data: number[]
  labels: string[]
  className?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...data)

  return (
    <div className={className}>
      <div className="flex h-36 items-end gap-[6px]" role="img" aria-label="每小時來電量長條圖">
        {data.map((v, i) => (
          <div
            key={i}
            className="relative flex h-full flex-1 cursor-default items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {hover === i && (
              <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-ink-850 px-2 py-1 text-[11px] font-semibold text-white shadow-card">
                {labels[i]} · {v} 通
              </div>
            )}
            <motion.div
              className="w-full rounded-t-[4px]"
              style={{
                background:
                  hover === i
                    ? 'linear-gradient(to top, #E85D00, #FFA76B)'
                    : 'linear-gradient(to top, rgba(232,93,0,0.75), rgba(255,138,56,0.75))',
              }}
              initial={{ height: 0 }}
              animate={{ height: `${(v / max) * 100}%` }}
              transition={{ duration: 0.9, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[6px] border-t border-white/[0.06] pt-1.5">
        {labels.map((l, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-ink-400">
            {i % 2 === 0 ? l : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
