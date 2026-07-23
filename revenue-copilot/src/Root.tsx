import React from "react";
import { Composition } from "remotion";
import { RevenueCopilot } from "./RevenueCopilot";
import { PromoVertical } from "./promo/Promo";
import {
  Fx1Transition,
  Fx2NumberBurst,
  Fx3SplitPlatform,
  Fx4AiThinking,
  Fx5Pipeline,
  Fx6Impact,
  Fx7AlertStorm,
  Fx8Reasoning,
  Fx9ParticleSphere,
} from "./fx";

const W = 1920;
const H = 1080;
const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="RevenueCopilot" component={RevenueCopilot} durationInFrames={5400} fps={FPS} width={W} height={H} />
      {/* 直式電影感宣傳片 9:16 */}
      <Composition id="PromoVertical" component={PromoVertical} durationInFrames={5400} fps={FPS} width={1080} height={1920} />
      {/* 7 支獨立特效示範片(各約 5–6 秒) */}
      <Composition id="Fx1Transition" component={Fx1Transition} durationInFrames={170} fps={FPS} width={W} height={H} />
      <Composition id="Fx2NumberBurst" component={Fx2NumberBurst} durationInFrames={150} fps={FPS} width={W} height={H} />
      <Composition id="Fx3SplitPlatform" component={Fx3SplitPlatform} durationInFrames={150} fps={FPS} width={W} height={H} />
      <Composition id="Fx4AiThinking" component={Fx4AiThinking} durationInFrames={160} fps={FPS} width={W} height={H} />
      <Composition id="Fx5Pipeline" component={Fx5Pipeline} durationInFrames={165} fps={FPS} width={W} height={H} />
      <Composition id="Fx6Impact" component={Fx6Impact} durationInFrames={150} fps={FPS} width={W} height={H} />
      <Composition id="Fx7AlertStorm" component={Fx7AlertStorm} durationInFrames={150} fps={FPS} width={W} height={H} />
      <Composition id="Fx8Reasoning" component={Fx8Reasoning} durationInFrames={175} fps={FPS} width={W} height={H} />
      <Composition id="Fx9ParticleSphere" component={Fx9ParticleSphere} durationInFrames={150} fps={FPS} width={W} height={H} />
    </>
  );
};
