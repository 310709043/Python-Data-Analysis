import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T } from "../theme";

/* ---------- 背景:深空 + 雙色光暈 + 暗角 ---------- */
export const Backdrop: React.FC<{ tint?: "neutral" | "red" | "neon" }> = ({
  tint = "neutral",
}) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 90) * 40;
  const dy = Math.cos(frame / 110) * 30;
  const auroraAlpha = tint === "red" ? 0.05 : 0.09;
  const accent =
    tint === "red" ? "rgba(255,59,78,0.10)" : "rgba(0,255,157,0.07)";
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          left: -300 + dx,
          top: -500 + dy,
          background: `radial-gradient(circle, rgba(56,189,248,${auroraAlpha}), transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          right: -350 - dx,
          bottom: -520 - dy,
          background: `radial-gradient(circle, ${accent}, transparent 65%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Spring 進場包裝:上浮 + 淡入 + 去模糊 ---------- */
export const Rise: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 46, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 90, mass: 0.9 },
  });
  const o = interpolate(frame - delay, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: o,
        transform: `translateY(${(1 - s) * y}px)`,
        filter: `blur(${(1 - s) * 8}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Spring pop:縮放彈出 ---------- */
export const Pop: React.FC<{
  delay?: number;
  from?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, from = 0.6, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 130, mass: 0.7 },
  });
  const o = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: o,
        transform: `scale(${from + (1 - from) * s})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- 逐字 spring 大標題 ---------- */
export const SplitTitle: React.FC<{
  text: string;
  delay?: number;
  per?: number; // 每字間隔 frames
  style?: React.CSSProperties;
  highlight?: Record<string, string>; // 子字串 → 顏色
}> = ({ text, delay = 0, per = 2, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = Array.from(text);
  return (
    <div style={{ display: "inline-block", ...style }}>
      {chars.map((c, i) => {
        const s = spring({
          frame: frame - delay - i * per,
          fps,
          config: { damping: 14, stiffness: 120, mass: 0.6 },
        });
        const o = interpolate(frame - delay - i * per, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: o,
              transform: `translateY(${(1 - s) * 60}px)`,
              whiteSpace: "pre",
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- CountUp 數字 ---------- */
export const CountUp: React.FC<{
  to: number;
  delay?: number;
  dur?: number;
  format?: (n: number) => string;
  style?: React.CSSProperties;
}> = ({ to, delay = 0, dur = 40, format, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = 1 - Math.pow(1 - p, 3);
  const v = Math.round(to * eased);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {format ? format(v) : v.toLocaleString("en-US")}
    </span>
  );
};

/* ---------- 通話音波 ---------- */
export const Waveform: React.FC<{
  bars?: number;
  color?: string;
  width?: number;
  height?: number;
  active?: boolean;
}> = ({ bars = 24, color = T.aurora, width = 320, height = 56, active = true }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        width,
        height,
      }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const h = active
          ? height *
            (0.18 +
              0.82 *
                Math.abs(
                  Math.sin(frame / 4.5 + i * 0.9) * Math.sin(frame / 13 + i)
                ))
          : height * 0.12;
        return (
          <div
            key={i}
            style={{
              width: (width - 5 * (bars - 1)) / bars,
              height: h,
              borderRadius: 4,
              background: `linear-gradient(180deg, ${color}, ${color}88)`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------- 掃光 wordmark ---------- */
export const Shine: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame - delay, [0, 55], [-120, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(110deg, transparent ${x - 18}%, rgba(255,255,255,0.85) ${x}%, transparent ${x + 18}%)`,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

/* ---------- 場景整體淡入淡出 ---------- */
export const SceneFade: React.FC<{
  durationInFrames: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({ durationInFrames, fadeIn = 12, fadeOut = 14, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [1.02, 1, 1, 0.99],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};
