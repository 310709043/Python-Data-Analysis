import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T, rnd } from "../theme";

/* ---------- 亮色背景:暖白底 + 橘色漸層光暈(充滿能量) ---------- */
export const Backdrop: React.FC<{ energy?: number }> = ({ energy = 1 }) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 95) * 46;
  const dy = Math.cos(frame / 115) * 34;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, #FFFDF9 0%, ${T.bg} 45%, ${T.bg2} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          left: -420 + dx,
          top: -640 + dy,
          background: `radial-gradient(circle, rgba(255,107,0,${0.16 * energy}), rgba(255,149,0,${0.07 * energy}) 45%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1300,
          height: 1300,
          right: -430 - dx,
          bottom: -560 - dy,
          background: `radial-gradient(circle, rgba(255,183,0,${0.18 * energy}), rgba(255,138,0,${0.07 * energy}) 45%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: "50%",
          top: -520,
          transform: "translateX(-50%)",
          background: `radial-gradient(circle, rgba(255,213,150,${0.30 * energy}), transparent 65%)`,
        }}
      />
      {/* 極淡暖色 vignette,聚焦中央 */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 100% at 50% 45%, transparent 60%, rgba(214,110,30,0.10) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- 微粒子漂浮(種子化,逐幀確定) ---------- */
export const Particles: React.FC<{ n?: number; opacity?: number }> = ({
  n = 42,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const cols = [T.orange2, T.amber, T.orange, "#FFD9A8", T.green, T.blue];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {Array.from({ length: n }).map((_, i) => {
        const sz = 3.5 + rnd(i + 9) * 5;
        const speed = 0.25 + rnd(i + 4 * n) * 0.6;
        const x =
          rnd(i) * 1920 + Math.sin(frame / (46 + rnd(i + n) * 44) + i * 1.7) * 34;
        const y = (((rnd(i + 2 * n) * 1180 - frame * speed) % 1180) + 1180) % 1180 - 50;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / 17 + i * 2.3));
        const c = cols[i % cols.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: sz,
              height: sz,
              borderRadius: "50%",
              background: c,
              opacity: 0.5 * tw,
              boxShadow: `0 0 ${10 + sz * 2}px ${c}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------- 一次性粒子爆發 ---------- */
export const Burst: React.FC<{
  at: number; // 觸發 frame(場景相對)
  x?: number | string;
  y?: number | string;
  n?: number;
  spread?: number;
  size?: number;
}> = ({ at, x = "50%", y = "50%", n = 24, spread = 300, size = 1 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (p <= 0 || p >= 1) return null;
  const ease = 1 - Math.pow(1 - p, 2.4);
  const cols = [T.orange, T.orange2, T.amber, "#FFD9A8", T.green];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
    >
      {/* 中心閃光環 */}
      <div
        style={{
          position: "absolute",
          left: -spread * ease * 0.5,
          top: -spread * ease * 0.5,
          width: spread * ease,
          height: spread * ease,
          borderRadius: "50%",
          border: `${3 * (1 - p)}px solid rgba(255,138,0,${0.7 * (1 - p)})`,
        }}
      />
      {Array.from({ length: n }).map((_, i) => {
        const ang = rnd(i) * Math.PI * 2;
        const dist = ease * spread * (0.45 + rnd(i + n) * 0.55);
        const sz = (5 + rnd(i + 2 * n) * 8) * size * (1 - p * 0.5);
        const c = cols[i % cols.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: Math.cos(ang) * dist - sz / 2,
              top: Math.sin(ang) * dist * 0.72 - sz / 2,
              width: sz,
              height: sz,
              borderRadius: "50%",
              background: c,
              opacity: 1 - p,
              boxShadow: `0 0 14px ${c}`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------- 全幅斜向掃光 ---------- */
export const GlareSweep: React.FC<{ at: number; dur?: number; strength?: number }> = ({
  at,
  dur = 55,
  strength = 0.5,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [-35, 135], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (p <= -35 || p >= 135) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          bottom: "-20%",
          left: `${p - 14}%`,
          width: "28%",
          transform: "rotate(14deg)",
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,${strength}), rgba(255,213,150,${strength * 0.8}), transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- 毛玻璃卡進場:模糊→清晰 + scale + 微傾斜 + 呼吸浮動 ---------- */
export const FrostIn: React.FC<{
  delay?: number;
  rot?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  float?: boolean;
}> = ({ delay = 0, rot = -4, children, style, float = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 95, mass: 0.9 },
  });
  const o = interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settled = frame - delay > 40 ? 1 : 0;
  const breathe = float ? Math.sin((frame - delay) / 40) * 5 * settled : 0;
  return (
    <div
      style={{
        opacity: o,
        transform: `translateY(${(1 - s) * 60 + breathe}px) scale(${0.82 + 0.18 * s}) rotate(${rot * (1 - s)}deg)`,
        filter: `blur(${(1 - s) * 22}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Spring 進場(輕量版,行內元素) ---------- */
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

/* ---------- Spring pop:縮放彈出(overshoot 強) ---------- */
export const Pop: React.FC<{
  delay?: number;
  from?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  bouncy?: boolean;
}> = ({ delay = 0, from = 0.6, children, style, bouncy = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: bouncy
      ? { damping: 9, stiffness: 190, mass: 0.7 }
      : { damping: 12, stiffness: 130, mass: 0.7 },
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
  per?: number;
  style?: React.CSSProperties;
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
          config: { damping: 13, stiffness: 130, mass: 0.6 },
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
              transform: `translateY(${(1 - s) * 60}px) scale(${0.7 + 0.3 * s})`,
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

/* ---------- CountUp ---------- */
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

/* ---------- 通話音波(橘色) ---------- */
export const Waveform: React.FC<{
  bars?: number;
  color?: string;
  width?: number;
  height?: number;
}> = ({ bars = 24, color = T.orange, width = 320, height = 56 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, width, height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h =
          height *
          (0.18 +
            0.82 *
              Math.abs(Math.sin(frame / 4.5 + i * 0.9) * Math.sin(frame / 13 + i)));
        return (
          <div
            key={i}
            style={{
              width: (width - 5 * (bars - 1)) / bars,
              height: h,
              borderRadius: 4,
              background: `linear-gradient(180deg, ${T.amber}, ${color})`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ---------- 圓環進度(92%) ---------- */
export const RingProgress: React.FC<{
  pct: number;
  delay?: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}> = ({ pct, delay = 0, size = 150, stroke = 13, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 55], [0, pct / 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = 1 - Math.pow(1 - p / (pct / 100 || 1), 3);
  const shown = (pct / 100) * eased;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(214,110,30,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - shown)}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={T.orange} />
            <stop offset="100%" stopColor={T.amber} />
          </linearGradient>
        </defs>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- 掃光文字 ---------- */
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
          background: `linear-gradient(110deg, transparent ${x - 16}%, rgba(255,255,255,0.9) ${x}%, transparent ${x + 16}%)`,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

/* ---------- AI 自動徽章(全程 AI · 無人工介入) ---------- */
export const AIBadge: React.FC<{ delay?: number; label?: string }> = ({
  delay = 0,
  label = "100% AI 自動 · 無人工介入",
}) => {
  const frame = useCurrentFrame();
  const pulse = 0.7 + 0.3 * Math.abs(Math.sin((frame - delay) / 16));
  return (
    <Pop delay={delay} bouncy>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          borderRadius: 999,
          padding: "10px 22px",
          background: `rgba(0,158,108,0.12)`,
          border: `1.5px solid rgba(0,158,108,0.55)`,
          color: T.green,
          fontWeight: 800,
          fontSize: 21,
          boxShadow: `0 0 ${22 * pulse}px rgba(0,200,130,0.35)`,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: T.green,
            boxShadow: `0 0 ${10 * pulse}px ${T.green}`,
          }}
        />
        🤖 {label}
      </span>
    </Pop>
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
