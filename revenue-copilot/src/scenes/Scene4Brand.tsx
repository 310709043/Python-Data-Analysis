import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, eyebrow, frostHot } from "../theme";
import {
  Backdrop,
  Burst,
  GlareSweep,
  Particles,
  Pop,
  Rise,
  Shine,
} from "../components/ui";
import { Lobster } from "../components/Lobster";

/**
 * 第四幕:終極價值與 Branding(1350f / 45s)MyAgent 亮色版
 *  0–660    兩行價值主張
 *  660–1350 金屬質感 MyAgent wordmark + 雙掃光 + 粒子高潮 + CTA(🦞 #4)
 */
export const Scene4Brand: React.FC = () => {
  const frame = useCurrentFrame();

  const linesOut = interpolate(frame, [640, 690], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brandIn = interpolate(frame, [690, 730], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const breathe = 0.7 + 0.3 * Math.sin(frame / 22);
  // 金屬 shimmer:背景位置緩慢流動
  const shimmer = ((frame * 0.7) % 200) - 50;

  return (
    <AbsoluteFill style={{ fontFamily: T.font, color: T.ink }}>
      <Backdrop energy={1.15} />
      <Particles n={44} opacity={brandIn} />

      {/* 價值主張 */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: linesOut,
          padding: "0 170px",
          textAlign: "center",
        }}
      >
        <Rise delay={50}>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.75 }}>
            AI 幫業務:更快找到<Em>對的人</Em>、說<Em>對的話</Em>、做
            <Em>對的跟進</Em>。
          </div>
        </Rise>
        <Rise delay={300}>
          <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.75, marginTop: 44 }}>
            AI 不會取代業務,
            <br />
            但能讓每一位同仁都擁有{" "}
            <span
              style={{
                color: T.orange,
                textShadow: "0 4px 34px rgba(245,91,0,0.45)",
              }}
            >
              Top Sales
            </span>{" "}
            的產值。
          </div>
        </Rise>
      </AbsoluteFill>

      {/* Branding */}
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", opacity: brandIn }}
      >
        {/* 雙色光暈呼吸 */}
        <div
          style={{
            position: "absolute",
            width: 1200,
            height: 1200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,138,0,0.20), transparent 60%)",
            opacity: breathe,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 860,
            height: 860,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,213,150,0.35), transparent 60%)",
            opacity: 1.4 - breathe,
          }}
        />

        {/* 品牌爆發 + 掃光 */}
        <Burst at={726} x="50%" y="42%" n={26} spread={520} />
        <GlareSweep at={830} strength={0.55} />
        <GlareSweep at={1030} strength={0.35} />

        <Pop delay={720} from={0.45} bouncy>
          <Shine delay={840}>
            <div
              style={{
                fontSize: 180,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              <span style={{ color: T.ink }}>My</span>
              <span
                style={{
                  background: `linear-gradient(105deg, #B33F00 ${shimmer - 40}%, ${T.orange} ${shimmer - 12}%, #FFE2B0 ${shimmer}%, ${T.orange2} ${shimmer + 14}%, #C64B00 ${shimmer + 42}%)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 10px 30px rgba(245,91,0,0.35))",
                }}
              >
                Agent
              </span>
            </div>
          </Shine>
        </Pop>

        <Rise delay={800}>
          <div
            style={{
              marginTop: 38,
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            【銷】Enterprise Revenue Copilot
          </div>
        </Rise>

        <Rise delay={880}>
          <div style={{ ...eyebrow, marginTop: 40, color: T.ink3 }}>
            金融保代電銷 AI · EVERY CALL BECOMES REVENUE
          </div>
        </Rise>

        {/* CTA */}
        <Pop delay={980} bouncy>
          <div
            style={{
              ...frostHot,
              marginTop: 52,
              borderRadius: 999,
              padding: "20px 52px",
              fontSize: 30,
              fontWeight: 800,
              color: T.ink,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            立即預約企業 Demo
            <span style={{ color: T.orange, fontWeight: 800 }}>→ myagent.ai</span>
          </div>
        </Pop>

        {/* 🦞 #4:品牌收尾,龍蝦在 wordmark 旁歡呼 */}
        <div style={{ position: "absolute", right: 250, top: 190 }}>
          <Lobster size={190} delay={780} mode="cheer" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: T.blue, fontWeight: 800 }}>{children}</span>
);
