import React from 'react'
import { Composition } from 'remotion'
import { CinematicFilm } from './CinematicFilm'
import { FPS, DURATION_FRAMES } from './theme'

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MyVocaIntro"
    component={CinematicFilm}
    durationInFrames={DURATION_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
)
