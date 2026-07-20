import React from "react";
import { Composition } from "remotion";
import { RevenueCopilot } from "./RevenueCopilot";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="RevenueCopilot"
      component={RevenueCopilot}
      durationInFrames={5400}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
