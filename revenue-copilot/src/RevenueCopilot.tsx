import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneFade } from "./components/ui";
import { Scene1Crisis } from "./scenes/Scene1Crisis";
import { Scene2CRM } from "./scenes/Scene2CRM";
import { Scene3Pipeline } from "./scenes/Scene3Pipeline";
import { Scene4Brand } from "./scenes/Scene4Brand";

/** MyAgent · 產品實錄 · 180s / 5400f @30fps
 *  Scene1  0–900     儀表板現況(危機數據)
 *  Scene2  900–2250  來電接聽 + AI 即時分析
 *  Scene3  2250–4050 掛斷自動化 + 商機 pipeline
 *  Scene4  4050–5400 成效報表 + 品牌收尾
 *  四幕共用同一 App 外殼,以短溶接銜接,呈現連續的產品操作。
 */
export const RevenueCopilot: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#FFFDFA" }}>
      <Sequence from={0} durationInFrames={900}>
        <SceneFade durationInFrames={900} fadeIn={10} fadeOut={8}>
          <Scene1Crisis />
        </SceneFade>
      </Sequence>
      <Sequence from={900} durationInFrames={1350}>
        <SceneFade durationInFrames={1350} fadeIn={8} fadeOut={8}>
          <Scene2CRM />
        </SceneFade>
      </Sequence>
      <Sequence from={2250} durationInFrames={1800}>
        <SceneFade durationInFrames={1800} fadeIn={8} fadeOut={8}>
          <Scene3Pipeline />
        </SceneFade>
      </Sequence>
      <Sequence from={4050} durationInFrames={1350}>
        <SceneFade durationInFrames={1350} fadeIn={8} fadeOut={24}>
          <Scene4Brand />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};
