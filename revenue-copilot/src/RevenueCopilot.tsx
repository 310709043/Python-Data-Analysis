import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneFade } from "./components/ui";
import { Scene1Crisis } from "./scenes/Scene1Crisis";
import { Scene2CRM } from "./scenes/Scene2CRM";
import { Scene3Pipeline } from "./scenes/Scene3Pipeline";
import { Scene4Brand } from "./scenes/Scene4Brand";
import { T } from "./theme";

/** 180s / 5400f @30fps
 *  Scene1  0–900
 *  Scene2  900–2250
 *  Scene3  2250–4050
 *  Scene4  4050–5400
 */
export const RevenueCopilot: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <Sequence from={0} durationInFrames={900}>
        <SceneFade durationInFrames={900}>
          <Scene1Crisis />
        </SceneFade>
      </Sequence>
      <Sequence from={900} durationInFrames={1350}>
        <SceneFade durationInFrames={1350}>
          <Scene2CRM />
        </SceneFade>
      </Sequence>
      <Sequence from={2250} durationInFrames={1800}>
        <SceneFade durationInFrames={1800}>
          <Scene3Pipeline />
        </SceneFade>
      </Sequence>
      <Sequence from={4050} durationInFrames={1350}>
        <SceneFade durationInFrames={1350} fadeOut={30}>
          <Scene4Brand />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};
