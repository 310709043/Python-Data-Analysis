import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * MyAgent 龍蝦卡通吉祥物(戴客服耳機,可愛科技風)
 * mode:
 *  - "wave"   揮手打招呼(左右搖擺)
 *  - "point"  指向左側(微傾)
 *  - "cheer"  舉螯歡呼(上下彈跳)
 */
export const Lobster: React.FC<{
  size?: number;
  delay?: number;
  mode?: "wave" | "point" | "cheer";
  bubble?: string;
  style?: React.CSSProperties;
}> = ({ size = 190, delay = 0, mode = "wave", bubble, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 170, mass: 0.7 },
  });
  const o = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const t = Math.max(frame - delay, 0);
  const sway =
    mode === "wave"
      ? Math.sin(t / 12) * 7
      : mode === "point"
        ? -6 + Math.sin(t / 20) * 2
        : Math.sin(t / 15) * 4;
  const hop = mode === "cheer" ? Math.abs(Math.sin(t / 11)) * -14 : Math.sin(t / 26) * -6;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        opacity: o,
        transform: `translateY(${hop + (1 - s) * 40}px) scale(${0.4 + 0.6 * s}) rotate(${sway}deg)`,
        transformOrigin: "50% 90%",
        filter: "drop-shadow(0 14px 26px rgba(214,110,30,0.35))",
        ...style,
      }}
    >
      {bubble && (
        <div
          style={{
            position: "absolute",
            top: -size * 0.28,
            left: size * 0.62,
            whiteSpace: "nowrap",
            background: "rgba(255,255,255,0.92)",
            border: "1.5px solid rgba(245,91,0,0.5)",
            borderRadius: "18px 18px 18px 4px",
            padding: "10px 18px",
            fontSize: size * 0.115,
            fontWeight: 800,
            color: "#26160A",
            boxShadow: "0 12px 30px rgba(214,110,30,0.25)",
          }}
        >
          {bubble}
        </div>
      )}
      <svg width={size} height={size} viewBox="0 0 240 240">
        <defs>
          <radialGradient id="lobHead" cx="40%" cy="32%" r="82%">
            <stop offset="0%" stopColor="#FF8266" />
            <stop offset="58%" stopColor="#F14E38" />
            <stop offset="100%" stopColor="#D93A26" />
          </radialGradient>
        </defs>
        {/* 觸鬚 */}
        <path d="M98 62 C84 40 66 34 50 40" fill="none" stroke="#E8503A" strokeWidth={9} strokeLinecap="round" />
        <path d="M142 62 C156 40 174 34 190 40" fill="none" stroke="#E8503A" strokeWidth={9} strokeLinecap="round" />
        <circle cx={48} cy={39} r={7} fill="#FF6B4A" />
        <circle cx={192} cy={39} r={7} fill="#FF6B4A" />
        {/* 大螯 */}
        <path
          d="M46 168 q-16 14 -6 32 q10 16 32 12 q16 -3 22 -18 l-16 -6 l12 -12 q-6 -14 -22 -15 q-13 -1 -22 7 Z"
          fill="#E8503A" stroke="#B23520" strokeWidth={4} strokeLinejoin="round"
        />
        <path
          d="M194 168 q16 14 6 32 q-10 16 -32 12 q-16 -3 -22 -18 l16 -6 l-12 -12 q6 -14 22 -15 q13 -1 22 7 Z"
          fill="#E8503A" stroke="#B23520" strokeWidth={4} strokeLinejoin="round"
        />
        {/* 尾巴/身體底 */}
        <ellipse cx={120} cy={196} rx={42} ry={22} fill="#E8503A" stroke="#B23520" strokeWidth={4} />
        {/* 頭 */}
        <ellipse cx={120} cy={118} rx={62} ry={58} fill="url(#lobHead)" />
        <ellipse cx={100} cy={94} rx={26} ry={14} fill="#fff" opacity={0.2} />
        {/* 眉/眼 */}
        <path d="M94 92 q10 -8 22 -4" fill="none" stroke="#B23520" strokeWidth={5} strokeLinecap="round" />
        <path d="M146 92 q-10 -8 -22 -4" fill="none" stroke="#B23520" strokeWidth={5} strokeLinecap="round" />
        <circle cx={101} cy={114} r={13.5} fill="#2A1810" />
        <circle cx={139} cy={114} r={13.5} fill="#2A1810" />
        <circle cx={105.5} cy={109} r={4.6} fill="#fff" />
        <circle cx={143.5} cy={109} r={4.6} fill="#fff" />
        <circle cx={98} cy={119} r={2.2} fill="#fff" opacity={0.85} />
        <circle cx={136} cy={119} r={2.2} fill="#fff" opacity={0.85} />
        {/* 腮紅 + 微笑 */}
        <ellipse cx={87} cy={132} rx={8.5} ry={5.5} fill="#FF9C82" opacity={0.9} />
        <ellipse cx={153} cy={132} rx={8.5} ry={5.5} fill="#FF9C82" opacity={0.9} />
        <path d="M107 140 q13 11 26 0" fill="none" stroke="#8E2914" strokeWidth={5.5} strokeLinecap="round" />
        {/* 客服耳機 */}
        <path d="M62 106 C64 68 88 46 120 46 C152 46 176 68 178 106" fill="none" stroke="#4A4238" strokeWidth={11} strokeLinecap="round" />
        <rect x={50} y={98} width={22} height={34} rx={10} fill="#33291D" />
        <rect x={168} y={98} width={22} height={34} rx={10} fill="#33291D" />
        <circle cx={61} cy={115} r={3.2} fill="#FF8A00" />
        <circle cx={179} cy={115} r={3.2} fill="#FF8A00" />
        <path d="M62 130 C58 150 74 160 92 158" fill="none" stroke="#4A4238" strokeWidth={7} strokeLinecap="round" />
        <ellipse cx={98} cy={158} rx={9} ry={6.5} fill="#33291D" />
        <circle cx={98} cy={158} r={2.6} fill="#FF8A00" />
      </svg>
    </div>
  );
};
