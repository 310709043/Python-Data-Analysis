import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/* ===== 直式電影感 · 深色暖橘 palette ===== */
export const P = {
  ink: "#FFF3E6",
  ink2: "#F0CBA4",
  ink3: "#B98A5E",
  o1: "#FF6B00",
  o2: "#FF8A00",
  gold: "#FFC13B",
  deep: "#C2410C",
  red: "#FF4530",
  redDim: "#7E241A",
  green: "#2FD08A",
  blue: "#3FA9F5",
  font: `'Noto Sans TC','PingFang TC','Microsoft JhengHei',-apple-system,'Segoe UI',sans-serif`,
  mono: `ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace`,
};
export const CX = 540;
export const CY = 960;
export const rnd = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ===== 深色暖橘背景 + 光暈 ===== */
export const DarkBg: React.FC<{ e?: number; red?: number }> = ({ e = 1, red = 0 }) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 70) * 40;
  const dy = Math.cos(frame / 90) * 40;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 34%, #21120A 0%, #140B06 55%, #0A0503 100%)" }}>
      <div style={{ position: "absolute", width: 1200, height: 1200, left: -260 + dx, top: 200 + dy, background: `radial-gradient(circle, rgba(255,107,0,${0.22 * e}), transparent 62%)` }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, right: -260 - dx, top: 900 - dy, background: `radial-gradient(circle, rgba(255,183,0,${0.16 * e}), transparent 62%)` }} />
      {red > 0 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 60% at 50% 40%, rgba(255,60,40,${0.16 * red}), transparent 70%)` }} />}
      {/* 暗角 */}
      <AbsoluteFill style={{ background: "radial-gradient(80% 60% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ===== 漂浮微粒子 ===== */
export const Motes: React.FC<{ n?: number; op?: number }> = ({ n = 40, op = 1 }) => {
  const frame = useCurrentFrame();
  const cols = [P.o1, P.o2, P.gold, "#FFD9A8"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: op }}>
      {Array.from({ length: n }).map((_, i) => {
        const sz = 2.5 + rnd(i + 9) * 4;
        const sp = 0.3 + rnd(i + 4 * n) * 0.7;
        const x = rnd(i) * 1080 + Math.sin(frame / (44 + rnd(i + n) * 40) + i) * 30;
        const y = (((rnd(i + 2 * n) * 2100 - frame * sp) % 2100) + 2100) % 2100 - 60;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(frame / 16 + i * 2));
        const c = cols[i % cols.length];
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", background: c, opacity: 0.5 * tw, boxShadow: `0 0 ${8 + sz * 2}px ${c}` }} />;
      })}
    </AbsoluteFill>
  );
};

/* ===== 粒子爆發 ===== */
export const Burst: React.FC<{ at: number; n?: number; spread?: number; x?: number; y?: number }> = ({ at, n = 26, spread = 400, x = CX, y = CY }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (p <= 0 || p >= 1) return null;
  const ease = 1 - Math.pow(1 - p, 2.4);
  const cols = [P.o1, P.o2, P.gold, "#FFD9A8", P.green];
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {Array.from({ length: n }).map((_, i) => {
        const ang = rnd(i) * Math.PI * 2;
        const dist = ease * spread * (0.45 + rnd(i + n) * 0.55);
        const sz = (7 + rnd(i + 2 * n) * 10) * (1 - p * 0.5);
        const c = cols[i % cols.length];
        return <div key={i} style={{ position: "absolute", left: Math.cos(ang) * dist - sz / 2, top: Math.sin(ang) * dist - sz / 2, width: sz, height: sz, borderRadius: "50%", background: c, opacity: 1 - p, boxShadow: `0 0 16px ${c}` }} />;
      })}
    </div>
  );
};

/* ===== 斜向掃光 ===== */
export const Glare: React.FC<{ at: number; dur?: number; s?: number }> = ({ at, dur = 45, s = 0.5 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (p <= -40 || p >= 140) return null;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "-20%", bottom: "-20%", left: `${p - 12}%`, width: "24%", transform: "rotate(12deg)", background: `linear-gradient(90deg,transparent,rgba(255,220,150,${s}),transparent)` }} />
    </AbsoluteFill>
  );
};

/* ===== 進場動畫 ===== */
export const Rise: React.FC<{ delay?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, y = 40, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 90, mass: 0.9 } });
  const o = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: o, transform: `translateY(${(1 - s) * y}px)`, filter: `blur(${(1 - s) * 6}px)`, ...style }}>{children}</div>;
};
export const Pop: React.FC<{ delay?: number; from?: number; bouncy?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, from = 0.6, bouncy, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: bouncy ? { damping: 9, stiffness: 190, mass: 0.7 } : { damping: 12, stiffness: 130, mass: 0.7 } });
  const o = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: o, transform: `scale(${from + (1 - from) * s})`, ...style }}>{children}</div>;
};

/* ===== 數字滾動 ===== */
export const CountUp: React.FC<{ to: number; delay?: number; dur?: number; fmt?: (n: number) => string; style?: React.CSSProperties }> = ({ to, delay = 0, dur = 40, fmt, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{fmt ? fmt(v) : v.toLocaleString("en-US")}</span>;
};

/* ===== 逐字打字 ===== */
export const Type: React.FC<{ text: string; start: number; cps?: number; style?: React.CSSProperties; caret?: boolean }> = ({ text, start, cps = 26, style, caret = true }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor(((frame - start) / 30) * cps)));
  return (
    <span style={style}>
      {text.slice(0, n)}
      {caret && n < text.length && n > 0 && <span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>▌</span>}
    </span>
  );
};

/* ===== 玻璃卡(深色) ===== */
export const glass: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(60,34,16,0.66), rgba(30,18,10,0.5))",
  border: "1px solid rgba(255,150,60,0.35)",
  borderRadius: 26,
  boxShadow: "0 30px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,140,0.15)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

/* ===== 場景淡入淡出 ===== */
export const Fade: React.FC<{ d: number; fi?: number; fo?: number; children: React.ReactNode }> = ({ d, fi = 12, fo = 12, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, fi, d - fo, d], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
