import React from 'react'
import { AbsoluteFill } from 'remotion'
import { useVideoConfig } from 'remotion'
import { ThreeCanvas } from '@remotion/three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { ParticleUniverse } from './universe/ParticleUniverse'
import { CameraRig } from './universe/CameraRig'
import { TypographyLayer } from './TypographyLayer'
import { colors } from './theme'

export const CinematicFilm: React.FC = () => {
  const { width, height } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <ThreeCanvas linear width={width} height={height} camera={{ position: [0, 0, 9], fov: 34 }}>
        <color attach="background" args={[colors.black]} />
        <fog attach="fog" args={[colors.black, 8, 34]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[6, 4, 6]} intensity={2.2} color={colors.aiBlue} />
        <pointLight position={[-6, -3, 4]} intensity={1.4} color={colors.intelligencePurple} />
        <pointLight position={[0, -4, -10]} intensity={1.2} color={colors.warmGold} />
        <CameraRig />
        <ParticleUniverse />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.15} luminanceThreshold={0.12} luminanceSmoothing={0.4} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.75} />
        </EffectComposer>
      </ThreeCanvas>
      <TypographyLayer />
    </AbsoluteFill>
  )
}
