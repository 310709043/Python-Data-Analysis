import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Clock, Repeat, Target, TrendingUp } from "lucide-react";
import { T, eyebrow } from "../theme";
import { CountUp, Pop, Rise, Shine } from "../components/ui";
import { AppShell, Cursor, Panel, Waypoint } from "../components/AppChrome";

/**
 * 第四幕:成效報表 + 品牌收尾(1350f / 45s)
 *  0–640    報表視圖:轉換提升 + 四項成效
 *  690–1350 品牌收尾卡:MyAgent + 價值主張 + CTA
 */
const CURSOR: Waypoint[] = [
  { t: 0, x: 900, y: 500 },
  { t: 60, x: 120, y: 296, click: true }, // 側欄:報表
  { t: 150, x: 800, y: 450 },
  { t: 640, x: 800, y: 450 },
];

export const Scene4Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const reportsOut = interpolate(frame, [640, 688], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brandIn = interpolate(frame, [690, 740], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const breathe = 0.75 + 0.25 * Math.sin(frame / 22);

  return (
    <AbsoluteFill>
      {/* 報表視圖 */}
      <AbsoluteFill style={{ opacity: reportsOut }}>
        <AppShell active="reports" clock="18:40">
          <div style={{ padding: "30px 40px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Rise delay={6}>
              <div style={{ fontSize: 30, fontWeight: 800 }}>導入成效報表</div>
              <div style={{ fontSize: 16, color: T.ink3, marginTop: 3 }}>MyAgent 導入 30 天 · 與導入前對比</div>
            </Rise>

            <div style={{ display: "flex", gap: 20, marginTop: 26 }}>
              <Metric delay={40} icon={<Clock size={24} />} label="平均處理時間" value={<>↓ <CountUp to={40} delay={50} dur={40} />%</>} />
              <Metric delay={60} icon={<Target size={24} />} label="商機辨識率" value={<>↑ <CountUp to={3} delay={70} dur={40} />×</>} />
              <Metric delay={80} icon={<Repeat size={24} />} label="商機追蹤率" value={<><CountUp to={100} delay={90} dur={40} />%</>} />
              <Metric delay={100} icon={<TrendingUp size={24} />} label="商機轉換率" value={<>↑ <CountUp to={30} delay={110} dur={40} />%</>} />
            </div>

            <Panel title="每月成交轉換率 · 導入前後" style={{ marginTop: 22, flex: 1, display: "flex", flexDirection: "column" }}>
              <ConvChart />
            </Panel>
          </div>
        </AppShell>
        <Cursor path={CURSOR} />
      </AbsoluteFill>

      {/* 品牌收尾 */}
      <AbsoluteFill style={{ opacity: brandIn, background: "linear-gradient(165deg,#FFFDF9,#FFEAD6)", alignItems: "center", justifyContent: "center", fontFamily: T.font, color: T.ink }}>
        <div style={{ position: "absolute", width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,0,0.16), transparent 60%)", opacity: breathe }} />

        <div style={{ position: "relative", textAlign: "center" }}>
          <Rise delay={710}>
            <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.7, color: T.ink2 }}>
              AI 幫業務:更快找到<b style={{ color: T.blue }}>對的人</b>、說<b style={{ color: T.blue }}>對的話</b>、做<b style={{ color: T.blue }}>對的跟進</b>。
            </div>
          </Rise>

          <Pop delay={800} from={0.6} style={{ marginTop: 40 }}>
            <Shine delay={880}>
              <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
                <span style={{ color: T.ink }}>My</span>
                <span style={{ background: `linear-gradient(120deg,${T.orange},${T.amber})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Agent</span>
              </div>
            </Shine>
          </Pop>

          <Rise delay={870}>
            <div style={{ fontSize: 38, fontWeight: 800, marginTop: 28 }}>【銷】Enterprise Revenue Copilot</div>
          </Rise>
          <Rise delay={920}>
            <div style={{ ...eyebrow, marginTop: 30, color: T.ink3 }}>金融保代電銷 AI · EVERY CALL BECOMES REVENUE</div>
          </Rise>

          <Pop delay={1010} from={0.7}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginTop: 46, borderRadius: 999, padding: "18px 46px", background: `linear-gradient(90deg,${T.orange},${T.orange2})`, color: "#fff", fontSize: 28, fontWeight: 800, boxShadow: "0 18px 44px rgba(245,91,0,0.4)" }}>
              立即預約企業 Demo <span>→ myagent.ai</span>
            </div>
          </Pop>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Metric: React.FC<{ delay: number; icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ delay, icon, label, value }) => (
  <Rise delay={delay} style={{ flex: 1 }}>
    <div style={{ background: "#fff", border: "1px solid rgba(214,110,30,0.16)", borderRadius: 18, padding: "22px 24px", boxShadow: "0 10px 30px rgba(214,110,30,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.orange }}>{icon}<span style={{ fontSize: 15, color: T.ink3, fontWeight: 700 }}>{label}</span></div>
      <div style={{ fontSize: 56, fontWeight: 800, color: T.green, lineHeight: 1.1, marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  </Rise>
);

const ConvChart: React.FC = () => {
  const frame = useCurrentFrame();
  const before = [10, 11, 9, 11];
  const after = [18, 24, 31, 38];
  const labels = ["W1", "W2", "W3", "W4"];
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 46, padding: "20px 30px 0" }}>
      {labels.map((lb, i) => {
        const g = interpolate(frame, [120 + i * 20, 200 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 220 }}>
              <div style={{ width: 48, height: before[i] * 5 * g, borderRadius: "6px 6px 0 0", background: "#E4D2C0" }} />
              <div style={{ width: 48, height: after[i] * 5 * g, borderRadius: "6px 6px 0 0", background: `linear-gradient(180deg,${T.orange},${T.amber})`, boxShadow: "0 6px 18px rgba(245,91,0,0.25)" }} />
            </div>
            <div style={{ fontSize: 16, color: T.ink3, fontWeight: 700 }}>{lb}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 40, top: 24, display: "flex", gap: 20, fontSize: 15, fontWeight: 700 }}>
        <span style={{ color: T.ink3 }}>■ 導入前</span>
        <span style={{ color: T.orange }}>■ 導入後</span>
      </div>
    </div>
  );
};
