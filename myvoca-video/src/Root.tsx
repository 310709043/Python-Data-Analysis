import React from 'react'
import { Composition, Series } from 'remotion'
import { SceneOpening } from './scenes/SceneOpening'
import { ScenePain } from './scenes/ScenePain'
import { SceneLiveCall } from './scenes/SceneLiveCall'
import { SceneDeal } from './scenes/SceneDeal'
import { SceneCapabilities } from './scenes/SceneCapabilities'
import { SceneIndustries } from './scenes/SceneIndustries'
import { SceneClosing } from './scenes/SceneClosing'
import { FPS } from './theme'

// 90 seconds at 30fps — scene lengths must sum to 2700.
const SCENES = {
  opening: 240,
  pain: 360,
  liveCall: 540,
  deal: 360,
  capabilities: 450,
  industries: 390,
  closing: 360,
}
const TOTAL = Object.values(SCENES).reduce((a, b) => a + b, 0)

const MyVocaIntro: React.FC = () => (
  <Series>
    <Series.Sequence durationInFrames={SCENES.opening}>
      <SceneOpening duration={SCENES.opening} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENES.pain}>
      <ScenePain duration={SCENES.pain} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENES.liveCall}>
      <SceneLiveCall duration={SCENES.liveCall} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENES.deal}>
      <SceneDeal duration={SCENES.deal} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENES.capabilities}>
      <SceneCapabilities duration={SCENES.capabilities} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENES.industries}>
      <SceneIndustries duration={SCENES.industries} />
    </Series.Sequence>
    <Series.Sequence durationInFrames={SCENES.closing}>
      <SceneClosing duration={SCENES.closing} />
    </Series.Sequence>
  </Series>
)

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MyVocaIntro"
    component={MyVocaIntro}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1920}
    height={1080}
  />
)
