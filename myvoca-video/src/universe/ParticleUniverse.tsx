import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { buildSeeds } from './seeds'
import { getParticleState } from './shapes'
import { capabilityColors, hexToRgb } from './palette'
import { colors } from '../theme'

const PARTICLE_COUNT = 2600

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const smootherstep = (x: number) => x * x * x * (x * (x * 6 - 15) + 10)
const envelope = (t: number, inStart: number, inEnd: number, outStart: number, outEnd: number) => {
  const rise = smootherstep(clamp01((t - inStart) / Math.max(1e-6, inEnd - inStart)))
  const fall = 1 - smootherstep(clamp01((t - outStart) / Math.max(1e-6, outEnd - outStart)))
  return Math.min(rise, fall)
}

const ParticleField: React.FC<{ t: number }> = ({ t }) => {
  const seeds = useMemo(() => buildSeeds(PARTICLE_COUNT), [])
  const positions = useRef(new Float32Array(PARTICLE_COUNT * 3))
  const colorsArr = useRef(new Float32Array(PARTICLE_COUNT * 3))
  const geomRef = useRef<THREE.BufferGeometry>(null)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const st = getParticleState(i, PARTICLE_COUNT, seeds[i], t)
    positions.current[i * 3] = st.pos[0]
    positions.current[i * 3 + 1] = st.pos[1]
    positions.current[i * 3 + 2] = st.pos[2]
    colorsArr.current[i * 3] = st.color[0] * st.opacity
    colorsArr.current[i * 3 + 1] = st.color[1] * st.opacity
    colorsArr.current[i * 3 + 2] = st.color[2] * st.opacity
  }
  if (geomRef.current) {
    const posAttr = geomRef.current.getAttribute('position') as THREE.BufferAttribute | undefined
    if (posAttr) posAttr.needsUpdate = true
    const colAttr = geomRef.current.getAttribute('color') as THREE.BufferAttribute | undefined
    if (colAttr) colAttr.needsUpdate = true
  }

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colorsArr.current, 3]} count={PARTICLE_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.062}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// The AI core — a living brain the five capabilities orbit. Appears as the
// customer interaction's energy converges, dissolves as the camera dives
// into the industry tunnel.
const AiCore: React.FC<{ t: number }> = ({ t }) => {
  const growth = envelope(t, 46, 52, 65.5, 69)
  const coreRef = useRef<THREE.Mesh>(null)
  if (coreRef.current) {
    const s = growth * 1.5
    coreRef.current.scale.setScalar(Math.max(0.001, s))
    coreRef.current.rotation.y = t * 0.12
    coreRef.current.rotation.x = t * 0.05
  }
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: colors.aiBlue,
        emissive: colors.intelligencePurple,
        emissiveIntensity: 1.6,
        roughness: 0.25,
        metalness: 0.5,
        transparent: true,
      }),
    [],
  )
  mat.opacity = growth
  return (
    <mesh ref={coreRef} material={mat}>
      <icosahedronGeometry args={[1, 3]} />
    </mesh>
  )
}

const OrbitNode: React.FC<{ t: number; index: number; growth: number }> = ({ t, index, growth }) => {
  const ref = useRef<THREE.Mesh>(null)
  const radius = 2.7 + index * 0.32
  const speed = 0.32 + index * 0.05
  const tilt = index * 0.55
  const phase = index * ((Math.PI * 2) / 5)
  if (ref.current) {
    const a = t * speed + phase
    ref.current.position.set(
      Math.cos(a) * radius * Math.cos(tilt * 0.3),
      Math.sin(tilt) * radius * 0.4 + Math.sin(a * 0.7) * 0.2,
      Math.sin(a) * radius * Math.cos(tilt * 0.3),
    )
    ref.current.scale.setScalar(Math.max(0.001, growth))
  }
  const rgb = capabilityColors[index]
  const hex = new THREE.Color(rgb[0], rgb[1], rgb[2])
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.27, 16, 16]} />
      <meshStandardMaterial color={hex} emissive={hex} emissiveIntensity={3} transparent opacity={growth} />
    </mesh>
  )
}

const AiCoreCluster: React.FC<{ t: number }> = ({ t }) => {
  const growth = envelope(t, 46, 52, 65.5, 69)
  return (
    <group>
      <AiCore t={t} />
      {[0, 1, 2, 3, 4].map((i) => (
        <OrbitNode key={i} t={t} index={i} growth={growth} />
      ))}
    </group>
  )
}

// The purchase signal igniting, then crystallizing into a ring of value.
const SignalAndOrder: React.FC<{ t: number }> = ({ t }) => {
  const signalGrowth = envelope(t, 37.5, 39.5, 42.5, 44.5)
  const orderGrowth = envelope(t, 41.5, 44, 48, 49.5)
  const signalRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  if (signalRef.current) {
    const pulse = 1 + Math.sin(t * 8) * 0.12
    signalRef.current.scale.setScalar(Math.max(0.001, signalGrowth * 0.35 * pulse))
  }
  if (ringRef.current) {
    ringRef.current.scale.setScalar(Math.max(0.001, orderGrowth))
    ringRef.current.rotation.z = t * 0.6
    ringRef.current.rotation.x = Math.PI / 2.4
  }

  const emeraldColor = useMemo(() => new THREE.Color(colors.successEmerald), [])
  const goldColor = useMemo(() => new THREE.Color(colors.warmGold), [])

  return (
    <group position={[0, 0.15, 1.2]}>
      <mesh ref={signalRef}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial
          color={emeraldColor}
          emissive={emeraldColor}
          emissiveIntensity={2.2}
          transparent
          opacity={signalGrowth}
        />
      </mesh>
      <mesh ref={ringRef} position={[0.4, 0.1, 0.6]}>
        <torusGeometry args={[0.55, 0.055, 16, 48]} />
        <meshStandardMaterial
          color={goldColor}
          emissive={goldColor}
          emissiveIntensity={1.9}
          transparent
          opacity={orderGrowth}
        />
      </mesh>
    </group>
  )
}

export const ParticleUniverse: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = frame / fps

  return (
    <group>
      <ParticleField t={t} />
      <AiCoreCluster t={t} />
      <SignalAndOrder t={t} />
    </group>
  )
}
