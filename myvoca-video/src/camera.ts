import * as THREE from 'three'

type Vec3 = [number, number, number]

interface CamKey {
  t: number // seconds
  pos: Vec3
  look: Vec3
  fov: number
}

// One continuous path for the whole 90s film. Every "cut" in the brief is
// actually just the camera moving on to the next keyframe — nothing ever
// mounts/unmounts, the world just keeps existing and the lens keeps moving.
const KEYS: CamKey[] = [
  { t: 0, pos: [0, 0, 9], look: [0, 0, 0], fov: 34 },
  { t: 4, pos: [0, 0.1, 6.4], look: [0, 0, 0], fov: 32 },
  { t: 6.5, pos: [0, 0.25, 4.4], look: [0, 0, 0], fov: 30 },
  { t: 8, pos: [0, 0.3, 3.3], look: [0, 0, 0], fov: 29 },
  { t: 10, pos: [1.1, 0.4, 2.1], look: [0, 0, 0], fov: 42 },
  { t: 12.5, pos: [-2.4, 0.6, -3.2], look: [-1.2, 0.1, -6], fov: 54 },
  { t: 15.5, pos: [2.6, -0.4, -6.5], look: [1.8, 0, -9.5], fov: 50 },
  { t: 18.5, pos: [-1.6, 0.9, -9.5], look: [-2.2, 0.4, -12.5], fov: 42 },
  { t: 20, pos: [0, 0.2, -4.2], look: [0, 0, -8], fov: 36 },
  { t: 27, pos: [0, 1.0, -2.2], look: [0, 0.2, -6], fov: 32 },
  { t: 34, pos: [0.6, 0.4, -1], look: [0, 0, -4], fov: 30 },
  { t: 38, pos: [0, 0.2, 1.2], look: [0, 0, -2], fov: 30 },
  { t: 42, pos: [1.0, 0.6, 3.2], look: [0.5, 0, 0], fov: 34 },
  { t: 47, pos: [-1.0, 0.8, 6.2], look: [0, 0.3, 2], fov: 40 },
  { t: 50, pos: [0, 1.2, 10.5], look: [0, 0, 0], fov: 45 },
  { t: 57, pos: [4.2, 1.5, 8], look: [0, 0, 0], fov: 40 },
  { t: 65, pos: [-3.2, 0.5, 5], look: [0, 0, 0], fov: 38 },
  { t: 68, pos: [0, 0, 3], look: [0, 0, -1], fov: 50 },
  { t: 71, pos: [0, 0.3, -6], look: [0, 0, -14], fov: 60 },
  { t: 74.5, pos: [0, -0.2, -14], look: [0, 0, -22], fov: 62 },
  { t: 78, pos: [0, 0.2, -22], look: [0, 0, -30], fov: 58 },
  { t: 81, pos: [0, 0.4, -14], look: [0, 0, -6], fov: 45 },
  { t: 85, pos: [0, 0.2, 3.6], look: [0, 0, 0], fov: 32 },
  { t: 90, pos: [0, 0, 7.6], look: [0, 0, 0], fov: 34 },
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
