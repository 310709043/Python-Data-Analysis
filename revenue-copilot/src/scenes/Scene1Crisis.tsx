import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { T } from "../theme";
import { Backdrop, CountUp, Rise, SplitTitle } from "../components/ui";

/**
 * 第一幕:危機感(900f / 30s)
 *  0–300   開場金句
 *  300–620 89% vs 11% 對比
 *  620–900 結語:對的時間/對的人/對的話
 */
export const Scene1Crisis: React.FC = () => {
  const frame = useCurrentFrame();

  const beat1 = interpolate(frame, [286, 306], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beat2 = interpolate(frame, [302, 322, 598, 620], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beat3 = interpolate(frame, [616, 640], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: T.font, color: T.ink }}>
      <Backdrop tint="red" />

      {/* Beat 1:開場金句 */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: beat1,
          padding: "0 160px",
        }}
      >
        <div style={{ textAlign: "center", lineHeight: 1.5 }}>
          <SplitTitle
            text="每一天,"
            delay={20}
            per={3}
            style={{ fontSize: 76, fontWeight: 800, color: T.ink2 }}
          />
          <br />
          <SplitTitle
            text="你的保代與電銷團隊,"
            delay={70}
            per={3}
            style={{ fontSize: 88, fontWeight: 800 }}
          />
          <br />
          <span style={{ display: "inline-block", marginTop: 10 }}>
            <SplitTitle
              text="正在流失數百位"
              delay={140}
              per={3}
              style={{ fontSize: 88, fontWeight: 800 }}
            />
            <SplitTitle
              text="高價值客戶。"
              delay={175}
              per={3.4}
              style={{ fontSize: 88, fontWeight: 800, color: T.red }}
            />
          </span>
        </div>
      </AbsoluteFill>

      {/* Beat 2:89% / 11% */}
      <AbsoluteFill
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 120,
          opacity: beat2,
        }}
      >
        <Rise delay={314}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 260,
                fontWeight: 800,
                lineHeight: 1,
                color: T.red,
                letterSpacing: "-0.03em",
                textShadow: "0 0 90px rgba(255,59,78,0.45)",
              }}
            >
              <CountUp to={89} delay={322} dur={55} />
              <span style={{ fontSize: 120 }}>%</span>
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 40,
                fontWeight: 700,
                color: T.ink,
                letterSpacing: "0.1em",
              }}
            >
              掛斷/拒絕
            </div>
          </div>
        </Rise>

        <div
          style={{
            width: 2,
            height: 320,
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.25), transparent)",
          }}
        />

        <Rise delay={352}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 170,
                fontWeight: 800,
                lineHeight: 1,
                color: T.ink3,
                letterSpacing: "-0.02em",
              }}
            >
              <CountUp to={11} delay={360} dur={45} />
              <span style={{ fontSize: 84 }}>%</span>
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 34,
                fontWeight: 700,
                color: T.ink3,
                letterSpacing: "0.1em",
              }}
            >
              成交率
            </div>
          </div>
        </Rise>
      </AbsoluteFill>

      {/* Beat 3:結語 */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: beat3,
          padding: "0 150px",
        }}
      >
        <div style={{ textAlign: "center", lineHeight: 1.7 }}>
          <Rise delay={636}>
            <div style={{ fontSize: 56, fontWeight: 700, color: T.ink2 }}>
              原因不是產品不好,
            </div>
          </Rise>
          <Rise delay={676}>
            <div style={{ fontSize: 62, fontWeight: 800, marginTop: 18 }}>
              而是業務沒有在
              <Hi t="『對的時間』" d={720} />
              ,對
              <Hi t="『對的人』" d={762} />
              ,
              <br />
              說
              <Hi t="『對的話』" d={804} />
              。
            </div>
          </Rise>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* 螢光綠關鍵詞:延遲點亮 */
const Hi: React.FC<{ t: string; d: number }> = ({ t, d }) => {
  const frame = useCurrentFrame();
  const on = interpolate(frame, [d, d + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span
      style={{
        color: on > 0.5 ? T.neon : T.ink,
        textShadow: `0 0 ${34 * on}px rgba(0,255,157,0.55)`,
      }}
    >
      {t}
    </span>
  );
};
