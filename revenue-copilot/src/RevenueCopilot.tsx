import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneFade } from "./components/ui";
import { Wipe } from "./components/Transition";
import { Scene1Crisis } from "./scenes/Scene1Crisis";
import { Scene2CRM } from "./scenes/Scene2CRM";
import { Scene3Pipeline } from "./scenes/Scene3Pipeline";
import { Scene4Brand } from "./scenes/Scene4Brand";
import { T } from "./theme";

/** MyAgent · 180s / 5400f @30fps
 *  Scene1  0–900      危機感
 *  Scene2  900–2250   CRM 串接(🦞 ×2)
 *  Scene3  2250–4050  0 秒自動化(🦞 ×1)
 *  Scene4  4050–5400  品牌收尾(🦞 ×1)
 *  幕間:毛玻璃 wipe + 光束 + 粒子爆發(870 / 2220 / 4020)
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

      {/* 幕間轉場 */}
      <Sequence from={870} durationInFrames={62}>
        <Wipe />
      </Sequence>
      <Sequence from={2220} durationInFrames={62}>
        <Wipe />
      </Sequence>
      <Sequence from={4020} durationInFrames={62}>
        <Wipe />
      </Sequence>
    </AbsoluteFill>
  );
};
