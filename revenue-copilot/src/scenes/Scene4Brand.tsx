import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T, eyebrow } from "../theme";
import { Backdrop, Pop, Rise, Shine } from "../components/ui";

/**
 * 第四幕:終極價值與 Branding(1350f / 45s)
 *  0–660   兩行價值主張
 *  660–1350 Logo + 副標 + 光暈
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
  const breathe = 0.75 + 0.25 * Math.sin(frame / 22);

  return (
    <AbsoluteFill
      style={{
        fontFamily: T.font,
        color: T.ink,
        background: "#050507",
      }}
    >
      <AbsoluteFill style={{ opacity: 0.55 }}>
        <Backdrop />
      </AbsoluteFill>

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
          <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.75 }}>
            AI 幫業務:更快找到<span style={{ color: T.aurora }}>對的人</span>、
            說<span style={{ color: T.aurora }}>對的話</span>、
            做<span style={{ color: T.aurora }}>對的跟進</span>。
          </div>
        </Rise>
        <Rise delay={300}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.75,
              marginTop: 44,
            }}
          >
            AI 不會取代業務,
            <br />
            但能讓每一位同仁都擁有{" "}
            <span
              style={{
                color: T.neon,
                textShadow: "0 0 34px rgba(0,255,157,0.5)",
                fontWeight: 800,
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
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: brandIn,
        }}
      >
        {/* 雙色光暈 */}
        <div
          style={{
            position: "absolute",
            width: 1100,
            height: 1100,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,255,157,0.10), transparent 60%)",
            opacity: breathe,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56,189,248,0.10), transparent 60%)",
            opacity: 1.5 - breathe,
          }}
        />

        <Pop delay={720} from={0.7}>
          <Shine delay={830}>
            <div
              style={{
                fontSize: 170,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              my
              <span
                style={{
                  background: `linear-gradient(120deg, ${T.neon}, ${T.aurora})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Claw
              </span>
            </div>
          </Shine>
        </Pop>

        <Rise delay={800}>
          <div
            style={{
              marginTop: 40,
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: T.ink,
            }}
          >
            【銷】Enterprise Revenue Copilot
          </div>
        </Rise>

        <Rise delay={880}>
          <div style={{ ...eyebrow, marginTop: 46, color: T.ink3 }}>
            金融保代電銷 AI · EVERY CALL BECOMES REVENUE
          </div>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
