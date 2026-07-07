const colors: Record<string, { dot: string; ring: string }> = {
  green: { dot: 'bg-emerald-400', ring: 'bg-emerald-400/40' },
  orange: { dot: 'bg-brand-400', ring: 'bg-brand-400/40' },
  red: { dot: 'bg-rose-400', ring: 'bg-rose-400/40' },
  gray: { dot: 'bg-ink-400', ring: 'bg-ink-400/30' },
}

export function StatusDot({ color = 'green', pulse = true }: { color?: string; pulse?: boolean }) {
  const c = colors[color] ?? colors.green
  return (
    <span className="relative flex h-2.5 w-2.5">
      {pulse && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${c.ring} animate-ping`} />
      )}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${c.dot}`} />
    </span>
  )
}
