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
import { T, glass, eyebrow } from "../theme";
import { Backdrop, Pop, Rise, Waveform } from "../components/ui";

/**
 * 第二幕:CRM 串接與客戶輪廓(1350f / 45s)
 *  0–240   CRM 連線 + API Connected
 *  240–..  客戶 Profile 卡
 *  560–..  通話音波 + 關鍵字
 *  950–..  AI 推薦方案卡(0.8s 徽章)
 */
export const Scene2CRM: React.FC = () => {
  const frame = useCurrentFrame();

  // API 連線虛線 → 完成
  const linkP = interpolate(frame, [70, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const connected = frame >= 165;

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

      {/* 頂部標題 */}
      <Rise delay={12}>
        <div style={{ ...eyebrow, color: T.aurora }}>
          STEP 01 · CRM CONNECTED
        </div>
        <div style={{ fontSize: 54, fontWeight: 800, marginTop: 14 }}>
          接上你現有的 CRM,AI 開始認識每一位客戶
        </div>
      </Rise>

      {/* 左:CRM 連線圖 */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 300,
          width: 640,
        }}
      >
        <Rise delay={45}>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              style={{
                ...glass,
                padding: "30px 38px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Database size={40} color={T.aurora} />
              <div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>企業 CRM</div>
                <div style={{ fontSize: 16, color: T.ink3, fontFamily: T.mono }}>
                  customers · policies
                </div>
              </div>
            </div>

            {/* 連線 */}
            <div style={{ position: "relative", width: 150, height: 4 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderTop: "3px dashed rgba(255,255,255,0.18)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: `${linkP * 100}%`,
                  borderTop: `3px solid ${T.neon}`,
                  boxShadow: `0 0 14px ${T.neon}`,
                }}
              />
            </div>

            <div
              style={{
                ...glass,
                padding: "30px 38px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                border: connected
                  ? `1px solid rgba(0,255,157,0.45)`
                  : (glass.border as string),
              }}
            >
              <Sparkles size={40} color={T.neon} />
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, whiteSpace: "nowrap" }}>myClaw AI</div>
                <div style={{ fontSize: 16, color: T.ink3, fontFamily: T.mono }}>
                  revenue copilot
                </div>
              </div>
            </div>
          </div>
        </Rise>

        <Pop delay={170}>
          <div
            style={{
              marginTop: 26,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 999,
              padding: "12px 26px",
              background: "rgba(0,255,157,0.10)",
              border: "1px solid rgba(0,255,157,0.45)",
              color: T.neon,
              fontWeight: 800,
              fontSize: 22,
              fontFamily: T.mono,
            }}
          >
            <Zap size={22} /> API CONNECTED ✓
          </div>
        </Pop>

        {/* 通話分析 */}
        <Rise delay={560} y={40}>
          <div style={{ ...glass, marginTop: 40, padding: "30px 34px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 19, letterSpacing: "0.18em", color: T.aurora, fontWeight: 800, whiteSpace: "nowrap" }}>
                LIVE CALL · AI 語音串流分析
              </div>
              <Waveform width={200} height={40} bars={18} />
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 26,
                lineHeight: 1.7,
                color: T.ink,
                minHeight: 90,
              }}
            >
              {transcript.slice(0, typedN)}
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: 26,
                  background: T.aurora,
                  verticalAlign: -3,
                  opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
              <Pop delay={715}>
                <Chip>二寶</Chip>
              </Pop>
              <Pop delay={835}>
                <Chip>預算疑慮</Chip>
              </Pop>
            </div>
          </div>
        </Rise>
      </div>

      {/* 右:Profile 卡 */}
      <div style={{ position: "absolute", right: 90, top: 300, width: 560 }}>
        <Rise delay={250} y={54}>
          <div style={{ ...glass, padding: "38px 42px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  background: "rgba(56,189,248,0.12)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  fontWeight: 800,
                  color: T.aurora,
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

            <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
              <Pop delay={320}>
                <Tag icon={<Baby size={20} />}>剛升格二寶爸</Tag>
              </Pop>
              <Pop delay={360}>
                <Tag icon={<PiggyBank size={20} />}>偏好儲蓄與保障</Tag>
              </Pop>
            </div>

            <Rise delay={420}>
              <div
                style={{
                  marginTop: 28,
                  borderRadius: 18,
                  padding: "22px 26px",
                  background: "rgba(0,255,157,0.07)",
                  border: "1px solid rgba(0,255,157,0.30)",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <Lightbulb size={30} color={T.neon} style={{ flex: "none", marginTop: 4 }} />
                <div>
                  <div style={{ fontSize: 18, letterSpacing: "0.2em", color: T.neon, fontWeight: 800 }}>
                    建議切入點
                  </div>
                  <div style={{ fontSize: 27, fontWeight: 700, marginTop: 8, lineHeight: 1.55 }}>
                    家庭責任期加款 / 兒童保障
                  </div>
                </div>
              </div>
            </Rise>
          </div>
        </Rise>

        {/* AI 推薦方案卡 */}
        <Pop delay={950} from={0.55}>
          <div
            style={{
              ...glass,
              marginTop: 34,
              padding: "34px 40px",
              border: "1px solid rgba(0,255,157,0.5)",
              boxShadow:
                "0 40px 90px rgba(0,0,0,0.55), 0 0 70px rgba(0,255,157,0.18), inset 0 1px 0 rgba(255,255,255,0.1)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                left: 34,
                borderRadius: 999,
                padding: "8px 20px",
                background: T.neon,
                color: "#05230F",
                fontWeight: 800,
                fontSize: 19,
                fontFamily: T.mono,
              }}
            >
              ⚡ 0.8s AI RECOMMENDATION
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, marginTop: 8 }}>
              雙寶安心加額防護專案
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 14,
                marginTop: 14,
              }}
            >
              <span style={{ fontSize: 22, color: T.ink2 }}>歷史成交率</span>
              <span
                style={{
                  fontSize: 64,
                  fontWeight: 800,
                  color: T.neon,
                  lineHeight: 1,
                  textShadow: "0 0 40px rgba(0,255,157,0.4)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                92%
              </span>
            </div>
          </div>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: "inline-block",
      borderRadius: 999,
      padding: "10px 22px",
      background: "rgba(56,189,248,0.12)",
      border: "1px solid rgba(56,189,248,0.5)",
      color: "#BAE6FD",
      fontWeight: 800,
      fontSize: 24,
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
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.16)",
      fontSize: 22,
      fontWeight: 700,
      color: T.ink,
    }}
  >
    {icon}
    {children}
  </span>
);
