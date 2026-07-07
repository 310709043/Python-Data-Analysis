// Deterministic per-particle identity. Every shape function reads the same
// seed for a given particle index, so a particle morphing from a ripple ring
// into a logo facet into a tunnel wall is a continuous journey, not a swap.
export interface Seed {
  angle: number // 0..2π, stable "which direction" for this particle
  angle2: number
  radiusJitter: number // -1..1
  phase: number // 0..2π, for oscillation offsets
  speed: number // 0.7..1.3
  cluster: number // 0..3, which pain-point cluster this particle belongs to
  lane: number // 0..1, which ribbon lane / tunnel band this particle favors
  drop: number // 0..1, general-purpose random for scatter/opacity variance
}

function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildSeeds(count: number): Seed[] {
  const seeds: Seed[] = []
  for (let i = 0; i < count; i++) {
    const rand = mulberry32(i * 9781 + 17)
    seeds.push({
      angle: rand() * Math.PI * 2,
      angle2: rand() * Math.PI * 2,
      radiusJitter: rand() * 2 - 1,
      phase: rand() * Math.PI * 2,
      speed: 0.7 + rand() * 0.6,
      cluster: i % 4,
      lane: rand(),
      drop: rand(),
    })
  }
  return seeds
}
