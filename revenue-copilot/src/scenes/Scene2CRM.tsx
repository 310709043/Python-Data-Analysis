import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Baby, Lightbulb, PhoneCall, PiggyBank, Sparkles } from "lucide-react";
import { T } from "../theme";
import { CountUp, Pop, RingProgress, Rise, Waveform } from "../components/ui";
import { AppShell, Cursor, Panel, Waypoint } from "../components/AppChrome";

/**
 * 第二幕:來電接聽 + AI 即時分析(1350f / 45s)— 真實主控台操作
 *  0–70   來電通知彈出 → 游標點「接聽」
 *  70–..  通話主控台:逐字稿即時串流
 *  ..     右側 AI 自動分析:意圖、關鍵字、CRM 帶入、92% 推薦
 */
const CURSOR: Waypoint[] = [
  { t: 0, x: 1500, y: 500 },
  { t: 45, x: 1660, y: 232, click: true }, // 點接聽
  { t: 90, x: 1200, y: 500 },
  { t: 700, x: 1480, y: 760 },
  { t: 1050, x: 1480, y: 640 }, // 移到推薦卡
  { t: 1350, x: 1480, y: 640 },
];

export const Scene2CRM: React.FC = () => {
  const frame = useCurrentFrame();
  const answered = frame >= 45;

  const transcript = "客戶:「最近家裡剛添了第二個寶寶……保障好像不太夠,不過預算上有點吃緊……」";
  const typedN = Math.floor(
    interpolate(frame, [120, 430], [0, transcript.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill>
      <AppShell active="calls" clock="14:06">
        <div style={{ padding: "28px 36px", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>通話主控台</div>
              <div style={{ fontSize: 16, color: T.ink3, marginTop: 3 }}>MyAgent 全自動接聽與即時分析</div>
            </div>
            <AutoTag />
          </div>

          {/* 通話中主體 */}
          <div style={{ display: "flex", gap: 22, marginTop: 22, flex: 1, opacity: answered ? 1 : 0.25, transition: "opacity 0.3s" }}>
            {/* 左:來電者 + 逐字稿 */}
            <div style={{ flex: 1.15, display: "flex", flexDirection: "column", gap: 20 }}>
              <Panel>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 66, height: 66, borderRadius: "50%", background: "rgba(14,125,194,0.12)", border: "1.5px solid rgba(14,125,194,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: T.blue }}>張</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 26, fontWeight: 800 }}>張先生 <span style={{ fontSize: 18, color: T.ink3, fontWeight: 600 }}>0935-xxx-218</span></div>
                    <div style={{ fontSize: 15, color: T.green, fontWeight: 700, marginTop: 3 }}>● 通話中 · 00:{String(Math.min(Math.floor(frame / 30), 59)).padStart(2, "0")}</div>
                  </div>
                  <Waveform width={150} height={40} bars={16} />
                </div>
              </Panel>
              <Panel title="AI 即時逐字稿" style={{ flex: 1 }}>
                <div style={{ fontSize: 24, lineHeight: 1.8, minHeight: 120 }}>
                  {transcript.slice(0, typedN)}
                  <span style={{ display: "inline-block", width: 3, height: 24, background: T.orange, verticalAlign: -3, opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0 }} />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <span style={{ fontSize: 14, color: T.ink3, fontWeight: 700, alignSelf: "center" }}>AI 標記:</span>
                  <Pop delay={360}><Chip>二寶 · 家庭保障缺口</Chip></Pop>
                  <Pop delay={430}><Chip>預算疑慮</Chip></Pop>
                </div>
              </Panel>
            </div>

            {/* 右:AI 自動分析 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
              <Panel title="客戶輪廓 · AI 自 CRM 帶入">
                <Rise delay={230}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>張先生,35 歲</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    <Pop delay={280}><Tag icon={<Baby size={17} />}>剛升格二寶爸</Tag></Pop>
                    <Pop delay={320}><Tag icon={<PiggyBank size={17} />}>偏好儲蓄與保障</Tag></Pop>
                  </div>
                  <div style={{ marginTop: 16, borderRadius: 12, padding: "14px 16px", background: "rgba(255,183,0,0.13)", border: "1px solid rgba(245,91,0,0.35)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Lightbulb size={22} color={T.orange} style={{ flex: "none", marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 14, color: T.orange, fontWeight: 800, letterSpacing: "0.08em" }}>AI 建議切入點</div>
                      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>家庭責任期加款 / 兒童保障</div>
                    </div>
                  </div>
                </Rise>
              </Panel>

              <div style={{ position: "relative" }}>
                <Pop delay={640} from={0.7}>
                  <div style={{ background: "linear-gradient(160deg,#fff,#FFF3E6)", border: "1.5px solid rgba(245,91,0,0.5)", borderRadius: 18, padding: "22px 24px", boxShadow: "0 16px 40px rgba(245,91,0,0.18)", display: "flex", alignItems: "center", gap: 22, position: "relative" }}>
                    <div style={{ position: "absolute", top: -16, left: 22, background: `linear-gradient(90deg,${T.orange},${T.orange2})`, color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: T.mono, borderRadius: 999, padding: "6px 16px", boxShadow: "0 8px 20px rgba(245,91,0,0.4)" }}>
                      ⚡ 0.8s AI 自動推薦
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, lineHeight: 1.35 }}>雙寶安心<br />加額防護專案</div>
                      <div style={{ fontSize: 16, color: T.ink3, marginTop: 8 }}>歷史成交率</div>
                    </div>
                    <RingProgress pct={92} delay={670} size={132} stroke={13}>
                      <div style={{ fontSize: 40, fontWeight: 800, color: T.orange }}>
                        <CountUp to={92} delay={670} dur={50} />%
                      </div>
                    </RingProgress>
                  </div>
                </Pop>
              </div>
            </div>
          </div>
        </div>
      </AppShell>

      {/* 來電通知(接聽前) */}
      {frame < 60 && (
        <div style={{ position: "absolute", right: 40, top: 88, opacity: interpolate(frame, [0, 12, 48, 58], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ width: 340, background: "#fff", borderRadius: 16, border: "1px solid rgba(214,110,30,0.2)", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,158,108,0.14)", display: "flex", alignItems: "center", justifyContent: "center", animation: "" }}>
                <PhoneCall size={22} color={T.green} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>來電中…</div>
                <div style={{ fontSize: 14, color: T.ink3, fontFamily: T.mono }}>0935-xxx-218</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <div style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 10, background: T.green, color: "#fff", fontWeight: 800, fontSize: 15 }}>AI 接聽</div>
              <div style={{ padding: "10px 16px", borderRadius: 10, background: "#F3E7DA", color: T.ink3, fontWeight: 700, fontSize: 15 }}>忽略</div>
            </div>
          </div>
        </div>
      )}

      <Cursor path={CURSOR} />
    </AbsoluteFill>
  );
};

const AutoTag: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.7 + 0.3 * Math.abs(Math.sin(frame / 16));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9, borderRadius: 999, padding: "9px 18px", background: "rgba(0,158,108,0.12)", border: "1.5px solid rgba(0,158,108,0.55)", color: T.green, fontWeight: 800, fontSize: 17, boxShadow: `0 0 ${18 * pulse}px rgba(0,200,130,0.3)` }}>
      <Sparkles size={17} /> 100% AI 自動 · 無人工介入
    </span>
  );
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ borderRadius: 999, padding: "8px 16px", background: "rgba(245,91,0,0.1)", border: "1.5px solid rgba(245,91,0,0.5)", color: T.orange, fontWeight: 800, fontSize: 17 }}>{children}</span>
);

const Tag: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "8px 16px", background: "#FFF3E9", border: "1px solid rgba(214,110,30,0.3)", fontSize: 17, fontWeight: 700 }}>{icon}{children}</span>
);
