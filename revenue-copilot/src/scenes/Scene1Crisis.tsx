import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AlertTriangle, PhoneOff, TrendingDown } from "lucide-react";
import { T } from "../theme";
import { CountUp, Rise } from "../components/ui";
import { AppShell, Cursor, Panel, Waypoint } from "../components/AppChrome";

/**
 * 第一幕:儀表板現況(900f / 30s)— 真實產品畫面
 * 打開 MyAgent 儀表板,呈現「89% 來電流失」的危機數據。
 */
const CURSOR: Waypoint[] = [
  { t: 0, x: 1500, y: 620 },
  { t: 90, x: 900, y: 300, click: true },
  { t: 200, x: 900, y: 300 },
  { t: 320, x: 620, y: 470 },
  { t: 900, x: 620, y: 470 },
];

export const Scene1Crisis: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.02 * Math.sin(frame / 10);

  return (
    <AbsoluteFill>
      <AppShell active="dashboard" clock="09:12">
        <div style={{ padding: "34px 40px", height: "100%", display: "flex", flexDirection: "column" }}>
          <Rise delay={6}>
            <div style={{ fontSize: 32, fontWeight: 800 }}>營運儀表板</div>
            <div style={{ fontSize: 17, color: T.ink3, marginTop: 4 }}>
              今日電銷概況 · 2026/02/18
            </div>
          </Rise>

          {/* KPI 卡列 */}
          <div style={{ display: "flex", gap: 22, marginTop: 28 }}>
            <Kpi delay={20} label="今日來電" value={<><CountUp to={1286} delay={26} dur={40} /></>} sub="全量自動接聽" tone="ink" />
            <Kpi delay={34} label="接通率" value={<><CountUp to={100} delay={40} dur={36} />%</>} sub="AI 24H 不漏接" tone="green" />
            <Kpi
              delay={48}
              label="拒絕 / 掛斷"
              value={<span style={{ transform: `scale(${pulse})`, display: "inline-block" }}><CountUp to={89} delay={54} dur={48} />%</span>}
              sub="⚠ 高價值客戶正在流失"
              tone="red"
              big
            />
            <Kpi delay={62} label="成交率" value={<><CountUp to={11} delay={68} dur={40} />%</>} sub="遠低於團隊目標" tone="muted" />
          </div>

          {/* 下方:趨勢圖 + 洞察 */}
          <div style={{ display: "flex", gap: 22, marginTop: 24, flex: 1 }}>
            <Panel title="近 14 日 來電結果趨勢" style={{ flex: 1.5, display: "flex", flexDirection: "column" }}>
              <FallChart />
            </Panel>
            <Panel style={{ flex: 1, background: "linear-gradient(160deg,#FFF6EC,#FFECD8)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Rise delay={120}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, color: T.red, fontWeight: 800, fontSize: 20 }}>
                  <AlertTriangle size={26} /> AI 洞察
                </div>
                <div style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.55, marginTop: 18 }}>
                  每天有近 <span style={{ color: T.red }}>9 成</span> 來電,
                  <br />
                  沒能在<span style={{ color: T.orange }}>對的時間</span>、對
                  <span style={{ color: T.orange }}>對的人</span>、
                  <br />
                  說<span style={{ color: T.orange }}>對的話</span>。
                </div>
                <div style={{ fontSize: 18, color: T.ink2, marginTop: 18, lineHeight: 1.6 }}>
                  商機在掛斷的那一刻,一起消失了。
                </div>
              </Rise>
            </Panel>
          </div>
        </div>
      </AppShell>
      <Cursor path={CURSOR} />
    </AbsoluteFill>
  );
};

const Kpi: React.FC<{
  delay: number;
  label: string;
  value: React.ReactNode;
  sub: string;
  tone: "ink" | "green" | "red" | "muted";
  big?: boolean;
}> = ({ delay, label, value, sub, tone, big }) => {
  const col =
    tone === "red" ? T.red : tone === "green" ? T.green : tone === "muted" ? T.ink3 : T.ink;
  return (
    <Rise delay={delay} style={{ flex: big ? 1.25 : 1 }}>
      <div
        style={{
          background: "#fff",
          border: `1px solid ${tone === "red" ? "rgba(224,45,60,0.4)" : "rgba(214,110,30,0.16)"}`,
          borderRadius: 18,
          padding: "22px 24px",
          boxShadow: tone === "red" ? "0 12px 34px rgba(224,45,60,0.14)" : "0 10px 30px rgba(214,110,30,0.06)",
        }}
      >
        <div style={{ fontSize: 15, color: T.ink3, fontWeight: 700, letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: big ? 76 : 52, fontWeight: 800, color: col, lineHeight: 1.1, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </div>
        <div style={{ fontSize: 14, color: tone === "red" ? T.red : T.ink3, marginTop: 6, fontWeight: tone === "red" ? 700 : 500 }}>
          {sub}
        </div>
      </div>
    </Rise>
  );
};

/* 下降趨勢長條圖(拒絕比例居高) */
const FallChart: React.FC = () => {
  const frame = useCurrentFrame();
  const data = [72, 78, 75, 81, 84, 80, 86, 83, 88, 85, 90, 87, 91, 89];
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 10, marginTop: 10, paddingBottom: 8 }}>
      {data.map((v, i) => {
        const grow = interpolate(frame, [30 + i * 5, 70 + i * 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: "100%",
                height: v * 2.4 * grow,
                borderRadius: "6px 6px 0 0",
                background:
                  i === data.length - 1
                    ? `linear-gradient(180deg, ${T.red}, rgba(224,45,60,0.5))`
                    : "linear-gradient(180deg, rgba(255,138,0,0.55), rgba(255,183,0,0.25))",
              }}
            />
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 30, top: 60, display: "flex", alignItems: "center", gap: 8, color: T.red, fontWeight: 800, fontSize: 17 }}>
        <TrendingDown size={20} /> 拒絕率持續攀升
      </div>
    </div>
  );
};
