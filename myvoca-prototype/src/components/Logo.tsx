// MyClaw brand mark — placeholder SVG in Taiwan Mobile orange.
// Swap the <svg> below for the official logo asset when available.
export function ClawMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="MyClaw logo">
      <defs>
        <linearGradient id="clawGrad" x1="8" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFA76B" />
          <stop offset="0.5" stopColor="#FF6B00" />
          <stop offset="1" stopColor="#E85D00" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#clawGrad)" />
      {/* stylized claw / signal mark */}
      <path
        d="M14 33c0-8 3.5-16 10-16s10 8 10 16"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="15" r="2.6" fill="white" />
      <circle cx="24" cy="11" r="2.6" fill="white" />
      <circle cx="34" cy="15" r="2.6" fill="white" />
      <circle cx="24" cy="33" r="3" fill="white" opacity="0.9" />
    </svg>
  )
}

export function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <ClawMark size={36} />
      <div className="leading-tight">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-white">MyVoca</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400">
            AI Contact Center
          </span>
        </div>
        <div className="text-[11px] text-ink-300">
          MyClaw Enterprise AI Agent Platform · Taiwan Mobile
        </div>
      </div>
    </div>
  )
}
