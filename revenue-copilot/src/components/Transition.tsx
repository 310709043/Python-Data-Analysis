import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Burst } from "./ui";

/**
 * 幕間轉場(60f):毛玻璃 wipe 橫掃 + 前緣光束 + 中點橘色粒子爆發
 * 疊在兩幕交界之上(交界點約在第 30 幀)。
 */
export const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 60], [-55, 155], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {/* 毛玻璃帶 */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          bottom: "-15%",
          left: `${x - 20}%`,
          width: "40%",
          transform: "rotate(10deg)",
          background:
            "linear-gradient(90deg, rgba(255,183,0,0.05), rgba(255,138,0,0.22), rgba(255,183,0,0.05))",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
        }}
      />
      {/* 前緣光束 */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          bottom: "-15%",
          left: `${x + 19}%`,
          width: 8,
          transform: "rotate(10deg)",
          background:
            "linear-gradient(180deg, transparent, #FFB700, #F55B00, #FFB700, transparent)",
          boxShadow: "0 0 44px rgba(255,138,0,0.9)",
        }}
      />
      {/* 中點粒子爆發 */}
      <Burst at={24} x="50%" y="46%" n={26} spread={430} />
    </AbsoluteFill>
  );
};
