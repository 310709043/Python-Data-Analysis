import * as THREE from 'three'

type Vec3 = [number, number, number]

interface CamKey {
  t: number // seconds
  pos: Vec3
  look: Vec3
  fov: number
}

// One continuous path for the whole 72s film. Every "cut" in the brief is
// actually just the camera moving on to the next keyframe — nothing ever
// mounts/unmounts, the world just keeps existing and the lens keeps moving.
// 0-9 logo forms · 9-20 listening ribbon · 20-34 sales highlight (camera calm,
// the real UI floats in the overlay) · 34-46 industry tunnel · 46-60 AI core
// orbit (benefits) · 60-72 convergence and pull-away.
const KEYS: CamKey[] = [
  { t: 0, pos: [0, 0, 9], look: [0, 0, 0], fov: 34 },
  { t: 4, pos: [0, 0.1, 6.4], look: [0, 0, 0], fov: 32 },
  { t: 7, pos: [0, 0.25, 4.6], look: [0, 0, 0], fov: 30 },
  { t: 9, pos: [0, 0.3, 0.9], look: [0, 0.1, -4.2], fov: 34 },
  { t: 15, pos: [0.5, 0.6, -0.6], look: [0.1, 0.15, -4.5], fov: 30 },
  { t: 20, pos: [0, 0.3, 5.5], look: [0, 0.1, 1.2], fov: 34 },
  { t: 27, pos: [0.9, 0.5, 4.4], look: [0.3, 0.2, 1.5], fov: 33 },
  { t: 33, pos: [-0.7, 0.6, 3.4], look: [0, 0.25, 1.6], fov: 35 },
  { t: 35, pos: [0, 0, 3], look: [0, 0, -1], fov: 50 },
  { t: 38, pos: [0, 0.3, -6], look: [0, 0, -14], fov: 60 },
  { t: 42, pos: [0, -0.2, -14], look: [0, 0, -22], fov: 62 },
  { t: 45.5, pos: [0, 0.2, -22], look: [0, 0, -30], fov: 58 },
  { t: 48.5, pos: [0, 1.2, 10.5], look: [0, 0, 0], fov: 45 },
  { t: 55, pos: [4.2, 1.5, 8], look: [0, 0, 0], fov: 40 },
  { t: 60, pos: [-3.2, 0.6, 5.4], look: [0, 0, 0], fov: 38 },
  { t: 65, pos: [0, 0.3, 4.4], look: [0, 0, 0], fov: 32 },
  { t: 72, pos: [0, 0, 7.6], look: [0, 0, 0], fov: 34 },
]

const smootherstep = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)

const lerpVec3 = (a: Vec3, b: Vec3, u: number): Vec3 => [
  THREE.MathUtils.lerp(a[0], b[0], u),
  THREE.MathUtils.lerp(a[1], b[1], u),
  THREE.MathUtils.lerp(a[2], b[2], u),
]

export interface CameraState {
  pos: Vec3
  look: Vec3
  fov: number
}

export function getCameraState(t: number): CameraState {
  const clamped = Math.max(KEYS[0].t, Math.min(KEYS[KEYS.length - 1].t, t))
  let i = 0
  while (i < KEYS.length - 2 && clamped > KEYS[i + 1].t) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const span = Math.max(1e-6, b.t - a.t)
  const u = smootherstep(Math.max(0, Math.min(1, (clamped - a.t) / span)))

  const pos = lerpVec3(a.pos, b.pos, u)
  const look = lerpVec3(a.look, b.look, u)
  const fov = THREE.MathUtils.lerp(a.fov, b.fov, u)

  // Subtle organic drift — a living camera, not a locked-off rig.
  const breatheX = Math.sin(t * 0.35) * 0.045 + Math.sin(t * 1.7) * 0.012
  const breatheY = Math.cos(t * 0.28) * 0.035 + Math.sin(t * 2.1) * 0.01
  const breatheZ = Math.sin(t * 0.22) * 0.03

  return {
    pos: [pos[0] + breatheX, pos[1] + breatheY, pos[2] + breatheZ],
    look,
    fov,
  }
}
