import { Seed } from './seeds'
import {
  RGB,
  lerpRgb,
  brandFacetColors,
  industryBandColors,
  capabilityColors,
  white,
  ink,
  inkDim,
  aiBlue,
  emerald,
  gold,
  red,
  purple,
} from './palette'

export interface ParticleState {
  pos: [number, number, number]
  color: RGB
  opacity: number
}

const smootherstep = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const lerp = (a: number, b: number, u: number) => a + (b - a) * u

// Fibonacci sphere — used for both the opening logo formation and the closing
// convergence, so the particles return to exactly where they started.
function facetPosition(i: number, count: number, radius: number): [number, number, number] {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (i / Math.max(1, count - 1)) * 2
  const r = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = golden * i
  return [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius]
}

function facetColor(i: number): RGB {
  return brandFacetColors[i % brandFacetColors.length]
}

// ---------- Act 1: ringtone ripples -> logo formation ----------
function actRingtoneLogo(i: number, N: number, s: Seed, t: number): ParticleState {
  const ring = i % 5
  const baseR = 0.3 + ring * 0.25
  const speed = 0.32
  const radius = baseR + t * speed
  const rippleFade = clamp01(1 - (radius - 0.5) / 3)
  const ripplePos: [number, number, number] = [
    Math.cos(s.angle) * radius,
    Math.sin(s.angle) * radius * 0.55,
    Math.sin(s.angle * 1.3 + s.phase) * 0.4,
  ]
  const rippleColor = lerpRgb(white, aiBlue, 0.5 + 0.5 * Math.sin(s.phase + t))

  const facet = facetPosition(i, N, 1.6)
  const fColor = facetColor(i)

  const u = smootherstep(clamp01((t - 1.5) / 4.5))
  const pos: [number, number, number] = [
    lerp(ripplePos[0], facet[0], u),
    lerp(ripplePos[1], facet[1], u),
    lerp(ripplePos[2], facet[2], u),
  ]
  const color = lerpRgb(rippleColor, fColor, u)
  const opacity = lerp(Math.max(0.15, rippleFade), 0.95, u)
  return { pos, color, opacity }
}

// ---------- Act 2: chaos — four living pain points ----------
const clusterCenters: [number, number, number][] = [
  [-2.4, 0.6, -3.2],
  [2.6, -0.4, -6.5],
  [-1.6, 0.9, -9.5],
  [-3.2, -0.8, -11.5],
]
const clusterColors: RGB[] = [ink, red, inkDim, gold]

function actPainChaos(i: number, N: number, s: Seed, t: number): ParticleState {
  const t2 = t - 8
  const c = s.cluster
  const center = clusterCenters[c]
  let pos: [number, number, number]
  let color = clusterColors[c]
  let opacity = 0.85

  if (c === 0) {
    // repeated complaints — small orbiting loop, going in circles
    const r = 0.9 + s.radiusJitter * 0.3
    const a = s.angle + t2 * 1.4 * s.speed
    pos = [center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r * 0.7, center[2] + Math.sin(a * 0.5) * 0.5]
  } else if (c === 1) {
    // frustration — jagged red bursts
    const jag = Math.sin(t2 * 6 + s.phase) * Math.sign(Math.sin(t2 * 2.3 + s.phase))
    const r = 0.6 + Math.abs(jag) * 0.9 + s.radiusJitter * 0.3
    pos = [
      center[0] + Math.cos(s.angle) * r,
      center[1] + Math.sin(s.angle) * r + jag * 0.3,
      center[2] + Math.sin(s.angle2) * r * 0.6,
    ]
    opacity = 0.65 + Math.abs(jag) * 0.3
  } else if (c === 2) {
    // scattered, disconnected information — loosely drifting fragments
    const drift = Math.sin(t2 * 0.6 + s.phase) * 0.4
    const r = 1.1 + s.radiusJitter * 0.6
    pos = [
      center[0] + Math.cos(s.angle) * r + drift,
      center[1] + Math.sin(s.angle2) * r * 0.8,
      center[2] + Math.sin(s.angle) * r * 0.5,
    ]
    opacity = 0.5
  } else {
    // opportunity, slowly drifting away and fading
    const drift = Math.min(t2, 10) * 0.5
    const r = 0.8 + s.radiusJitter * 0.4
    pos = [
      center[0] + Math.cos(s.angle) * r - drift * 0.6,
      center[1] + Math.sin(s.angle) * r - drift * 0.15,
      center[2] + Math.sin(s.angle2) * r * 0.5 - drift,
    ]
    opacity = Math.max(0.08, 0.75 - t2 / 16)
  }
  return { pos, color, opacity }
}

// ---------- Act 3: AI listening — a living waveform ----------
function actListening(i: number, N: number, s: Seed, t: number): ParticleState {
  const t3 = t - 20
  const envelope = clamp01(t3 / 2)
  const lane = Math.floor(s.lane * 5) - 2
  const x = (((i % 520) / 520) - 0.5) * 11
  const speechWave =
    Math.sin(x * 2.1 + t3 * 2.6 + lane) * 0.5 +
    Math.sin(x * 5.2 - t3 * 4.1 + s.phase) * 0.22 +
    Math.sin(x * 1.1 + t3 * 1.3) * 0.3
  const amp = envelope * (0.55 + 0.25 * Math.sin(t3 * 1.7 + lane))
  const pos: [number, number, number] = [x, speechWave * amp + lane * 0.32, -4.2 + lane * 0.4 + s.radiusJitter * 0.2]
  const color = lerpRgb(aiBlue, purple, clamp01(Math.abs(speechWave)))
  const opacity = 0.35 + Math.min(0.55, Math.abs(speechWave) * envelope)
  return { pos, color, opacity }
}

// ---------- Act 4: purchase signal + order + network ----------
function actPurchaseSignal(i: number, N: number, s: Seed, t: number): ParticleState {
  const t4 = t - 38
  const toward = clamp01(t4 / 6)
  // Field gently converges from the listening ribbon toward the signal point,
  // then streams outward again as the network notification.
  const x = lerp((((i % 520) / 520) - 0.5) * 11, Math.cos(s.angle) * (1.2 + s.radiusJitter * 0.4), toward)
  const y = lerp(0, Math.sin(s.angle) * (1.2 + s.radiusJitter * 0.4) * 0.6, toward)
  const z = lerp(-4.2, 1.5 + s.radiusJitter * 0.3, toward)

  const stream = clamp01((t4 - 6) / 6)
  const streamDist = stream * (2 + s.lane * 9)
  const pos: [number, number, number] = [
    x + Math.cos(s.angle2) * streamDist * 0.3,
    y + Math.sin(s.angle2) * streamDist * 0.15,
    z + streamDist,
  ]
  const color = lerpRgb(purple, emerald, clamp01(toward + stream * 0.4))
  const opacity = lerp(0.4, 0.75, toward) * (1 - stream * 0.5)
  return { pos, color, opacity }
}

// ---------- Act 5: the AI core, a nebula of five living capabilities ----------
function actAiCore(i: number, N: number, s: Seed, t: number): ParticleState {
  const t5 = t - 50
  const radius = 2.3 + s.radiusJitter * 1.1
  const a = s.angle + t5 * 0.16 * s.speed
  const tilt = s.angle2
  const pos: [number, number, number] = [
    Math.cos(a) * radius * Math.cos(tilt * 0.3),
    Math.sin(tilt) * radius * 0.5,
    Math.sin(a) * radius * Math.cos(tilt * 0.3),
  ]
  const color = capabilityColors[i % capabilityColors.length]
  const opacity = 0.4 + 0.25 * Math.sin(s.phase + t5 * 0.5)
  return { pos, color, opacity }
}

// ---------- Act 6: tunnel of light — same tunnel, three industries ----------
function actIndustryTunnel(i: number, N: number, s: Seed, t: number): ParticleState {
  const z = -(s.lane * 42) + 4
  const radius = 2.0 + s.radiusJitter * 0.35
  const spin = z * -0.08
  const a = s.angle + spin
  const pos: [number, number, number] = [Math.cos(a) * radius, Math.sin(a) * radius, z]

  let color: RGB
  if (z > -12) color = industryBandColors[0]
  else if (z > -26) {
    const u = smootherstep(clamp01((-12 - z) / 4))
    color = lerpRgb(industryBandColors[0], industryBandColors[1], u)
  } else {
    const u = smootherstep(clamp01((-26 - z) / 6))
    color = lerpRgb(industryBandColors[1], industryBandColors[2], u)
  }
  const opacity = 0.55
  return { pos, color, opacity }
}

// ---------- Act 7: convergence — everything becomes light, becomes the logo ----------
function actConvergence(i: number, N: number, s: Seed, t: number): ParticleState {
  const t7 = t - 78
  const facet = facetPosition(i, N, 1.6)
  const fColor = facetColor(i)
  const u = smootherstep(clamp01(t7 / 5))
  const from: [number, number, number] = [Math.cos(s.angle) * 2.4, Math.sin(s.angle) * 2.4, -6 + s.radiusJitter * 4]
  const pos: [number, number, number] = [
    lerp(from[0], facet[0], u),
    lerp(from[1], facet[1], u),
    lerp(from[2], facet[2], u),
  ]
  const color = lerpRgb(aiBlue, fColor, u)
  const opacity = lerp(0.5, 0.95, u) * clamp01(1 - Math.max(0, t7 - 10) / 2)
  return { pos, color, opacity }
}

const ACT_FNS = [
  actRingtoneLogo,
  actPainChaos,
  actListening,
  actPurchaseSignal,
  actAiCore,
  actIndustryTunnel,
  actConvergence,
]
const BOUNDARIES = [0, 8, 20, 38, 50, 65, 78, 90]
const TRANSITION_SECONDS = 2.2

export function getParticleState(i: number, N: number, s: Seed, t: number): ParticleState {
  let k = 0
  while (k < BOUNDARIES.length - 2 && t > BOUNDARIES[k + 1]) k++
  const isLast = k === ACT_FNS.length - 1
  const current = ACT_FNS[k](i, N, s, t)
  if (isLast) return current

  const nextBoundary = BOUNDARIES[k + 1]
  const start = nextBoundary - TRANSITION_SECONDS / 2
  const blend = smootherstep(clamp01((t - start) / TRANSITION_SECONDS))
  if (blend <= 0) return current
  const next = ACT_FNS[k + 1](i, N, s, t)
  if (blend >= 1) return next

  return {
    pos: [
      lerp(current.pos[0], next.pos[0], blend),
      lerp(current.pos[1], next.pos[1], blend),
      lerp(current.pos[2], next.pos[2], blend),
    ],
    color: lerpRgb(current.color, next.color, blend),
    opacity: lerp(current.opacity, next.opacity, blend),
  }
}
