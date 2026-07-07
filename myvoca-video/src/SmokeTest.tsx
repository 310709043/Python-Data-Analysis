import React, { useRef } from 'react'
import { AbsoluteFill } from 'remotion'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { ThreeCanvas } from '@remotion/three'
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

const Spinner: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.Mesh>(null)
  if (ref.current) {
    ref.current.rotation.y = t * 0.8
    ref.current.rotation.x = t * 0.3
  }
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.4, 1]} />
      <meshStandardMaterial
        color="#3B82F6"
        emissive="#7C3AED"
        emissiveIntensity={1.4}
        wireframe={false}
        roughness={0.2}
        metalness={0.6}
      />
    </mesh>
  )
}

const ParticleField: React.FC<{ t: number }> = ({ t }) => {
  const count = 800
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])
  const ref = useRef<THREE.Points>(null)
  if (ref.current) {
    ref.current.rotation.y = t * 0.15
  }
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#34D399" transparent opacity={0.85} sizeAttenuation />
    </points>
  )
}

export const SmokeTest: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()
  const t = frame / fps

  return (
    <AbsoluteFill style={{ backgroundColor: '#07070B' }}>
      <ThreeCanvas linear width={width} height={height} camera={{ position: [0, 0, 7], fov: 40 }}>
        <color attach="background" args={['#07070B']} />
        <fog attach="fog" args={['#07070B', 6, 16]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 3, 5]} intensity={2} color="#3B82F6" />
        <pointLight position={[-4, -2, 3]} intensity={1.2} color="#E4007F" />
        <Spinner t={t} />
        <ParticleField t={t} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
          <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={3} />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>
      </ThreeCanvas>
    </AbsoluteFill>
  )
}
