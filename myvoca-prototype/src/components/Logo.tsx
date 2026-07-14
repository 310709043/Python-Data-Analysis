// Taiwan Mobile brand mark — the classic 12-faceted "彩球" (colorful sphere),
// redrawn as SVG after the 2020 5G-era identity: vibrant orange with momo pink,
// green (sustainability) and blue-purple (unity) facets.
// Swap for the official logo asset when brand files are available.
export function BrandMark({ size = 36 }: { size?: number }) {
  // Geometry: central pentagon (r=20) + 5 inner triangles + 5 outer arc facets
  // on a circle of r=47, all centered at (50,50).
  const P = [
    [50, 30],
    [69.02, 43.82],
    [61.76, 66.18],
    [38.24, 66.18],
    [30.98, 43.82],
  ]
  const M = [
    [77.64, 11.98],
    [94.7, 64.52],
    [50, 97],
    [5.3, 64.52],
    [22.36, 11.98],
  ]
  const triColors = ['#FFB600', '#FF7300', '#E4007F', '#8DC63F', '#5C4E9E']
  const outerColors = ['#FF9E1B', '#FF6B00', '#F0417F', '#A6CE39', '#7C6BB5']
  const gap = { stroke: '#0C0C12', strokeWidth: 1.6, strokeLinejoin: 'round' as const }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-label="Taiwan Mobile logo">
      {/* outer arc facets */}
      {M.map((m, i) => {
        const prev = M[(i + 4) % 5]
        const p = P[i]
        return (
          <path
            key={`o${i}`}
            d={`M ${prev[0]} ${prev[1]} A 47 47 0 0 1 ${m[0]} ${m[1]} L ${p[0]} ${p[1]} Z`}
            fill={outerColors[i]}
            {...gap}
          />
        )
      })}
      {/* inner triangles */}
      {P.map((p, i) => {
        const next = P[(i + 1) % 5]
        const m = M[i]
        return (
          <path
            key={`t${i}`}
            d={`M ${p[0]} ${p[1]} L ${m[0]} ${m[1]} L ${next[0]} ${next[1]} Z`}
            fill={triColors[i]}
            {...gap}
          />
        )
      })}
      {/* central pentagon */}
      <path
        d={`M ${P.map((p) => `${p[0]} ${p[1]}`).join(' L ')} Z`}
        fill="#FF7300"
        {...gap}
      />
    </svg>
  )
}

export function BrandLockup() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark size={38} />
      <div className="leading-tight">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-white">MyVoca</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-400">
            AI Contact Center
          </span>
        </div>
        <div className="text-[11px] text-ink-300">
          MyClaw Enterprise AI Agent Platform · 台灣大哥大 Taiwan Mobile
        </div>
      </div>
    </div>
  )
}
