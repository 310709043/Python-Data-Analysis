import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Baby,
  Database,
  Lightbulb,
  PiggyBank,
  Sparkles,
  Zap,
} from "lucide-react";
import { T, frost, frostHot, eyebrow } from "../theme";
import {
  AIBadge,
  Backdrop,
  Burst,
  FrostIn,
  Particles,
  Pop,
  RingProgress,
  Rise,
  Waveform,
} from "../components/ui";
import { Lobster } from "../components/Lobster";

/**
 * 第二幕:CRM 串接與客戶輪廓(1350f / 45s)MyAgent 亮色版
 *  0–240   CRM 多光束連線 + API Connected(🦞 揮手 #1)
 *  240–..  客戶 Profile 毛玻璃卡
 *  560–..  通話音波 + AI 逐字稿 + 關鍵字 chip
 *  950–..  AI 推薦卡 + 92% 圓環(🦞 指引 #2)
 */
export const Scene2CRM: React.FC = () => {
  const frame = useCurrentFrame();

  const beams = [0, 1, 2]; // 三條錯落光束
  const connected = frame >= 165;
  const nodePulse = 0.6 + 0.4 * Math.abs(Math.sin(frame / 14));

  const transcript = "客戶:「最近家裡剛添了第二個寶寶……不過預算上有點吃緊……」";
  const typedN = Math.floor(
    interpolate(frame, [610, 860], [0, transcript.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill style={{ fontFamily: T.font, color: T.ink, padding: 90 }}>
      <Backdrop />
      <Particles n={30} opacity={0.7} />

      {/* 頂部標題 + AI 自動徽章 */}
      <Rise delay={12}>
        <div style={{ ...eyebrow, color: T.orange }}>STEP 01 · CRM CONNECTED</div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 14 }}>
          <div style={{ fontSize: 54, fontWeight: 800 }}>
            接上你現有的 CRM,AI 開始認識每一位客戶
          </div>
          <AIBadge delay={210} />
        </div>
      </Rise>

      {/* 左:CRM 多光束連線圖 */}
      <div style={{ position: "absolute", left: 90, top: 300, width: 640 }}>
        <FrostIn delay={40} rot={-3}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              style={{
                ...frost,
                padding: "30px 38px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Database size={40} color={T.blue} />
              <div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>企業 CRM</div>
                <div style={{ fontSize: 16, color: T.ink3, fontFamily: T.mono }}>
                  customers · policies
                </div>
              </div>
            </div>

            {/* 三條錯落光束 */}
            <div style={{ position: "relative", width: 150, height: 60 }}>
              {beams.map((b) => {
                const p = interpolate(frame, [60 + b * 18, 150 + b * 18], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const flow = ((frame * 3 + b * 40) % 60) / 60;
                return (
                  <div key={b} style={{ position: "absolute", top: 12 + b * 16, left: 0, right: 0, height: 4 }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderTop: "2.5px dashed rgba(214,110,30,0.3)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: `${p * 100}%`,
                        borderTop: `3px solid ${T.orange}`,
                        boxShadow: `0 0 12px ${T.orange2}`,
                      }}
                    />
                    {p >= 1 && (
                      <div
                        style={{
                          position: "absolute",
                          left: `${flow * 100}%`,
                          top: -3,
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: T.amber,
                          boxShadow: `0 0 12px ${T.amber}`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                ...frostHot,
                padding: "30px 38px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: connected
                  ? `0 30px 70px rgba(214,110,30,0.22), 0 0 ${40 * nodePulse}px rgba(255,138,0,0.4), inset 0 1px 0 rgba(255,255,255,0.95)`
                  : (frostHot.boxShadow as string),
              }}
            >
              <Sparkles size={40} color={T.orange} />
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, whiteSpace: "nowrap" }}>
                  MyAgent AI
                </div>
                <div style={{ fontSize: 16, color: T.ink3, fontFamily: T.mono }}>
                  revenue copilot
                </div>
              </div>
            </div>
          </div>
        </FrostIn>

        <Burst at={168} x={520} y={40} n={20} spread={190} />
        <Pop delay={170} bouncy>
          <div
            style={{
              marginTop: 26,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 999,
              padding: "12px 26px",
              background: "rgba(0,158,108,0.12)",
              border: "1.5px solid rgba(0,158,108,0.6)",
              color: T.green,
              fontWeight: 800,
              fontSize: 22,
              fontFamily: T.mono,
            }}
          >
            <Zap size={22} /> API CONNECTED ✓
          </div>
        </Pop>

        {/* 🦞 #1:連線成功,龍蝦揮手登場 */}
        <div style={{ position: "absolute", right: -64, top: 116 }}>
          <Lobster size={168} delay={190} mode="wave" bubble="交給我!" />
        </div>

        {/* 通話分析卡 */}
        <FrostIn delay={560} rot={3}>
          <div style={{ ...frost, marginTop: 46, padding: "30px 34px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontSize: 19,
                  letterSpacing: "0.16em",
                  color: T.orange,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                LIVE CALL · AI 語音串流分析
              </div>
              <Waveform width={200} height={40} bars={18} />
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 26,
                lineHeight: 1.7,
                minHeight: 90,
              }}
            >
              {transcript.slice(0, typedN)}
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: 26,
                  background: T.orange,
                  verticalAlign: -3,
                  opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
              <Pop delay={715} bouncy>
                <Chip>二寶</Chip>
              </Pop>
              <Pop delay={835} bouncy>
                <Chip>預算疑慮</Chip>
              </Pop>
            </div>
          </div>
        </FrostIn>
      </div>

      {/* 右:Profile 卡 + AI 推薦 */}
      <div style={{ position: "absolute", right: 90, top: 300, width: 560 }}>
        <FrostIn delay={250} rot={4}>
          <div style={{ ...frost, padding: "36px 42px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  background: "rgba(14,125,194,0.12)",
                  border: "1.5px solid rgba(14,125,194,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  fontWeight: 800,
                  color: T.blue,
                }}
              >
                張
              </div>
              <div>
                <div style={{ fontSize: 40, fontWeight: 800 }}>
                  張先生{" "}
                  <span style={{ fontSize: 26, color: T.ink2, fontWeight: 600 }}>
                    (35歲)
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: T.ink3,
                    fontFamily: T.mono,
                    marginTop: 6,
                  }}
                >
                  CUSTOMER PROFILE · from CRM
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
              <Pop delay={320} bouncy>
                <Tag icon={<Baby size={20} />}>剛升格二寶爸</Tag>
              </Pop>
              <Pop delay={360} bouncy>
                <Tag icon={<PiggyBank size={20} />}>偏好儲蓄與保障</Tag>
              </Pop>
            </div>

            <Rise delay={420}>
              <div
                style={{
                  marginTop: 26,
                  borderRadius: 18,
                  padding: "20px 26px",
                  background: "rgba(255,183,0,0.14)",
                  border: "1.5px solid rgba(245,91,0,0.4)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <Lightbulb size={30} color={T.orange} style={{ flex: "none", marginTop: 4 }} />
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      letterSpacing: "0.2em",
                      color: T.orange,
                      fontWeight: 800,
                    }}
                  >
                    建議切入點(AI 自動判讀)
                  </div>
                  <div style={{ fontSize: 27, fontWeight: 800, marginTop: 8, lineHeight: 1.55 }}>
                    家庭責任期加款 / 兒童保障
                  </div>
                </div>
              </div>
            </Rise>
          </div>
        </FrostIn>

        {/* AI 推薦卡 + 92% 圓環 */}
        <Burst at={952} x={280} y={520} n={22} spread={280} />
        <FrostIn delay={950} rot={-4}>
          <div
            style={{
              ...frostHot,
              marginTop: 34,
              padding: "32px 38px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 30,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                left: 34,
                borderRadius: 999,
                padding: "8px 20px",
                background: `linear-gradient(90deg, ${T.orange}, ${T.orange2})`,
                color: "#fff",
                fontWeight: 800,
                fontSize: 19,
                fontFamily: T.mono,
                boxShadow: "0 10px 26px rgba(245,91,0,0.4)",
              }}
            >
              ⚡ 0.8s AI 自動推薦
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, lineHeight: 1.35 }}>
                雙寶安心加額
                <br />
                防護專案
              </div>
              <div style={{ fontSize: 20, color: T.ink2, marginTop: 10 }}>
                歷史成交率
              </div>
            </div>
            <RingProgress pct={92} delay={975} size={168} stroke={15}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 800,
                    color: T.orange,
                    lineHeight: 1,
                  }}
                >
                  <CountUpPct delay={975} />
                </div>
              </div>
            </RingProgress>
          </div>
        </FrostIn>

      </div>

      {/* 🦞 #2:AI 推薦出爐,龍蝦在中下空白區指向卡片 */}
      <div style={{ position: "absolute", left: 850, top: 800 }}>
        <Lobster size={158} delay={1010} mode="point" bubble="0.8 秒就找到了!" />
      </div>
    </AbsoluteFill>
  );
};

const CountUpPct: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = 1 - Math.pow(1 - p, 3);
  return <>{Math.round(92 * eased)}%</>;
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: "inline-block",
      borderRadius: 999,
      padding: "10px 22px",
      background: "rgba(245,91,0,0.10)",
      border: "1.5px solid rgba(245,91,0,0.55)",
      color: T.orange,
      fontWeight: 800,
      fontSize: 24,
      boxShadow: "0 0 20px rgba(255,138,0,0.25)",
    }}
  >
    [{children}]
  </span>
);

const Tag: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      borderRadius: 999,
      padding: "10px 20px",
      background: "rgba(255,255,255,0.65)",
      border: "1.5px solid rgba(214,110,30,0.35)",
      fontSize: 22,
      fontWeight: 700,
      color: T.ink,
    }}
  >
    {icon}
    {children}
  </span>
);
