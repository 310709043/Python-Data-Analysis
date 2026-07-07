import React from 'react'
import { useThree } from '@react-three/fiber'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import * as THREE from 'three'
import { getCameraState } from '../camera'

export const CameraRig: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const { camera } = useThree()
  const t = frame / fps
  const state = getCameraState(t)

  camera.position.set(state.pos[0], state.pos[1], state.pos[2])
  camera.lookAt(state.look[0], state.look[1], state.look[2])
  const persp = camera as THREE.PerspectiveCamera
  if (persp.isPerspectiveCamera) {
    persp.fov = state.fov
    persp.updateProjectionMatrix()
  }
  return null
}
