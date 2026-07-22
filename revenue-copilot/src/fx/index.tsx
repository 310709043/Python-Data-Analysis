import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  AlertTriangle,
  Bot,
  Database,
  FileText,
  Phone,
  PhoneOff,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { T } from "../theme";

const rnd = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const F = T.font;

/* 亮橘底 */
const Bg: React.FC<{ e?: number; dark?: boolean }> = ({ e = 1 }) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 60) * 40;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(165deg,#FFFDF9,${T.bg} 45%,${T.bg2})` }}>
      <div style={{ position: "absolute", width: 1400, height: 1400, left: -400 + dx, top: -560, background: `radial-gradient(circle,rgba(255,107,0,${0.16 * e}),transparent 65%)` }} />
      <div style={{ position: "absolute", width: 1200, height: 1200, right: -420 - dx, bottom: -520, background: `radial-gradient(circle,rgba(255,183,0,${0.18 * e}),transparent 65%)` }} />
    </AbsoluteFill>
  );
};

/* ============ FX1 · 橘色漸層轉場換場 ============ */
export const Fx1Transition: React.FC = () => {
  const frame = useCurrentFrame();
  // 兩次掃場:A→(橘漸層 wipe)→B→(再 wipe)→A
  const p1 = interpolate(frame, [20, 70], [-40, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2 = interpolate(frame, [95, 145], [-40, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showB = frame >= 45 && frame < 120;
  return (
    <AbsoluteFill style={{ fontFamily: F, overflow: "hidden" }}>
      {/* 底層畫面 A / B */}
      {!showB ? <Screen label="場景 A · 儀表板" tone="a" /> : <Screen label="場景 B · 通話主控台" tone="b" />}
      {/* 漸層橘掃場帶 */}
      {[p1, p2].map((p, i) => (
        <div key={i} style={{ position: "absolute", inset: "-15% -30%", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${p - 30}%`, width: "46%", transform: "rotate(9deg)", background: `linear-gradient(90deg,transparent,${T.amber},${T.orange},${T.orange2},transparent)`, filter: "blur(2px)", boxShadow: `0 0 80px ${T.orange}` }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${p + 17}%`, width: 10, transform: "rotate(9deg)", background: "#fff", boxShadow: `0 0 50px 12px rgba(255,255,255,0.9)` }} />
        </div>
      ))}
    </AbsoluteFill>
  );
};
const Screen: React.FC<{ label: string; tone: "a" | "b" }> = ({ label, tone }) => (
  <AbsoluteFill>
    <Bg e={tone === "a" ? 0.8 : 1.1} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div style={{ width: 120, height: 120, borderRadius: 30, background: `linear-gradient(135deg,${T.orange},${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 60, fontWeight: 800, boxShadow: "0 20px 50px rgba(245,91,0,0.4)" }}>M</div>
      <div style={{ fontSize: 42, fontWeight: 800, color: T.ink }}>{label}</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ============ FX2 · 重點數字爆出 ============ */
export const Fx2NumberBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const target = 2_000_000;
  const p = interpolate(frame, [10, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eased = 1 - Math.pow(1 - p, 4);
  const val = Math.round(target * eased);
  const burstT = 96;
  const punch = spring({ frame: frame - burstT, fps, config: { damping: 7, stiffness: 200 } });
  const scale = frame < burstT ? 1 + 0.12 * eased : 1.12 + 0.22 * punch;
  const shake = frame > 40 && frame < burstT ? Math.sin(frame * 3) * (p * 4) : 0;
  return (
    <AbsoluteFill style={{ fontFamily: F, alignItems: "center", justifyContent: "center" }}>
      <Bg e={1.1} />
      <div style={{ position: "absolute", top: 320, fontSize: 26, letterSpacing: "0.4em", color: T.ink3, fontWeight: 800 }}>AI 全量分析通話數</div>
      <div style={{ position: "relative", transform: `scale(${scale}) translateX(${shake}px)` }}>
        <div style={{ fontSize: 220, fontWeight: 800, color: T.orange, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em", textShadow: `0 8px ${60 * (frame > burstT ? 1 : eased)}px rgba(245,91,0,0.5)` }}>
          {val.toLocaleString("en-US")}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 340, fontSize: 34, fontWeight: 800, color: T.ink2, opacity: frame > burstT ? 1 : 0 }}>通 / 月 · 100% 覆蓋</div>
      <Burst at={burstT} n={34} spread={640} />
      {/* 衝擊環 */}
      {frame >= burstT && (
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: `${8 * (1 - punch)}px solid ${T.orange}`, transform: `scale(${1 + punch * 4})`, opacity: 1 - punch }} />
      )}
    </AbsoluteFill>
  );
};

const Burst: React.FC<{ at: number; n?: number; spread?: number; x?: string; y?: string }> = ({ at, n = 26, spread = 400, x = "50%", y = "50%" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (p <= 0 || p >= 1) return null;
  const ease = 1 - Math.pow(1 - p, 2.4);
  const cols = [T.orange, T.orange2, T.amber, "#FFD9A8", T.green];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        const ang = rnd(i) * Math.PI * 2;
        const dist = ease * spread * (0.45 + rnd(i + n) * 0.55);
        const sz = (7 + rnd(i + 2 * n) * 10) * (1 - p * 0.5);
        const c = cols[i % cols.length];
        return <div key={i} style={{ position: "absolute", left: Math.cos(ang) * dist - sz / 2, top: Math.sin(ang) * dist * 0.72 - sz / 2, width: sz, height: sz, borderRadius: "50%", background: c, opacity: 1 - p, boxShadow: `0 0 16px ${c}` }} />;
      })}
    </div>
  );
};

/* ============ FX3 · 平台介面 左右概念 ============ */
export const Fx3SplitPlatform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const li = spring({ frame: frame - 8, fps, config: { damping: 16, stiffness: 90 } });
  const ri = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 90 } });
  const flow = (frame % 40) / 40;
  return (
    <AbsoluteFill style={{ fontFamily: F, alignItems: "center", justifyContent: "center" }}>
      <Bg />
      <div style={{ display: "flex", alignItems: "center", gap: 0, width: 1640 }}>
        {/* 左:真人客戶 */}
        <div style={{ flex: 1, transform: `translateX(${(1 - li) * -80}px)`, opacity: li }}>
          <Card title="客戶來電" icon={<Phone size={30} color={T.blue} />} tone="blue">
            <Avatar t="張" /> <BubbleLine w="80%" /> <BubbleLine w="60%" /><BubbleLine w="70%" />
          </Card>
        </div>
        {/* 中:串流箭頭 */}
        <div style={{ width: 160, position: "relative", height: 6 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(214,110,30,0.2)", borderRadius: 3 }} />
          <div style={{ position: "absolute", left: `${flow * 100}%`, top: -6, width: 16, height: 16, borderRadius: "50%", background: T.orange, boxShadow: `0 0 18px ${T.orange}` }} />
          <div style={{ position: "absolute", left: `${((flow + 0.5) % 1) * 100}%`, top: -3, width: 10, height: 10, borderRadius: "50%", background: T.amber }} />
        </div>
        {/* 右:AI 平台 */}
        <div style={{ flex: 1, transform: `translateX(${(1 - ri) * 80}px)`, opacity: ri }}>
          <Card title="MyAgent AI" icon={<Sparkles size={30} color={T.orange} />} tone="orange">
            <Row lit={frame > 46}>意圖辨識</Row>
            <Row lit={frame > 62}>需求分析</Row>
            <Row lit={frame > 78}>方案推薦 92%</Row>
          </Card>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Card: React.FC<{ title: string; icon: React.ReactNode; tone: "blue" | "orange"; children: React.ReactNode }> = ({ title, icon, tone, children }) => (
  <div style={{ background: "#fff", border: `1.5px solid ${tone === "orange" ? "rgba(245,91,0,0.4)" : "rgba(14,125,194,0.35)"}`, borderRadius: 24, padding: 34, boxShadow: "0 24px 60px rgba(214,110,30,0.12)", minHeight: 380 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 800 }}>{icon}{title}</div>
    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
  </div>
);
const Avatar: React.FC<{ t: string }> = ({ t }) => <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(14,125,194,0.12)", border: "1.5px solid rgba(14,125,194,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: T.blue }}>{t}</div>;
const BubbleLine: React.FC<{ w: string }> = ({ w }) => <div style={{ height: 16, width: w, borderRadius: 8, background: "#EFE3D6" }} />;
const Row: React.FC<{ lit: boolean; children: React.ReactNode }> = ({ lit, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, padding: "12px 16px", borderRadius: 12, background: lit ? "rgba(245,91,0,0.1)" : "#FBF3EA", border: `1px solid ${lit ? "rgba(245,91,0,0.4)" : "rgba(214,110,30,0.12)"}`, color: lit ? T.orange : T.ink3, transition: "none" }}>
    <span style={{ width: 22, height: 22, borderRadius: "50%", background: lit ? T.orange : "#E4D2C0", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>{lit ? "✓" : ""}</span>
    {children}
  </div>
);

/* ============ FX4 · AI 思考與分析 ============ */
export const Fx4AiThinking: React.FC = () => {
  const frame = useCurrentFrame();
  const conf = Math.round(interpolate(frame, [55, 120], [0, 92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const tokens = ["二寶", "家庭保障", "預算", "儲蓄", "新生兒", "加保", "責任期"];
  const scan = (frame % 50) / 50;
  return (
    <AbsoluteFill style={{ fontFamily: F, alignItems: "center", justifyContent: "center" }}>
      <Bg e={1.1} />
      {/* 中央 AI 核心 */}
      <div style={{ position: "relative", width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {[0, 1, 2].map((i) => {
          const ph = ((frame / 30 + i / 3) % 1);
          return <div key={i} style={{ position: "absolute", width: 160 + ph * 220, height: 160 + ph * 220, borderRadius: "50%", border: `2px solid rgba(245,91,0,${0.5 * (1 - ph)})` }} />;
        })}
        <div style={{ width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(circle,${T.amber},${T.orange})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 60px rgba(245,91,0,0.5)`, transform: `scale(${1 + 0.05 * Math.sin(frame / 6)})` }}>
          <Bot size={72} color="#fff" />
        </div>
      </div>
      {/* 飛入的 token */}
      {tokens.map((tk, i) => {
        const st = 15 + i * 9;
        const pr = interpolate(frame, [st, st + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const ang = (i / tokens.length) * Math.PI * 2;
        const r = (1 - pr) * 520 + 200;
        return (
          <div key={i} style={{ position: "absolute", left: `calc(50% + ${Math.cos(ang) * r}px)`, top: `calc(50% + ${Math.sin(ang) * r * 0.7}px)`, transform: "translate(-50%,-50%)", opacity: pr < 1 ? pr : interpolate(frame, [st + 40, st + 55], [1, 0.25], { extrapolateRight: "clamp" }), fontSize: 22, fontWeight: 800, color: T.orange, background: "#fff", border: "1.5px solid rgba(245,91,0,0.4)", borderRadius: 999, padding: "8px 18px", boxShadow: "0 8px 20px rgba(245,91,0,0.18)" }}>
            {tk}
          </div>
        );
      })}
      {/* 底部信心度 */}
      <div style={{ position: "absolute", bottom: 150, width: 640, textAlign: "center" }}>
        <div style={{ fontSize: 22, color: T.ink3, fontWeight: 800, letterSpacing: "0.2em" }}>AI 分析信心度</div>
        <div style={{ fontSize: 76, fontWeight: 800, color: T.orange, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{conf}%</div>
        <div style={{ height: 14, borderRadius: 8, background: "rgba(214,110,30,0.15)", marginTop: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${conf}%`, background: `linear-gradient(90deg,${T.orange},${T.amber})`, boxShadow: `0 0 20px ${T.orange}` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============ FX5 · 流程 + CRM 串接 ============ */
export const Fx5Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = [
    { icon: Phone, label: "來電", d: 10 },
    { icon: Bot, label: "AI 分析", d: 34 },
    { icon: Database, label: "CRM", d: 58 },
    { icon: FileText, label: "Ticket", d: 82 },
    { icon: Send, label: "Sales", d: 106 },
  ];
  return (
    <AbsoluteFill style={{ fontFamily: F, alignItems: "center", justifyContent: "center" }}>
      <Bg />
      <div style={{ position: "absolute", top: 240, fontSize: 30, fontWeight: 800, color: T.ink2, letterSpacing: "0.1em" }}>掛斷即觸發 · 全自動串接</div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {nodes.map((n, i) => {
          const Icon = n.icon;
          const lit = frame >= n.d;
          const beam = interpolate(frame, [n.d + 4, n.d + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pop = interpolate(frame, [n.d, n.d + 12], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <React.Fragment key={i}>
              <div style={{ transform: `scale(${pop})`, opacity: interpolate(frame, [n.d, n.d + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
                <div style={{ width: 150, height: 150, borderRadius: 26, background: "#fff", border: `2px solid ${lit ? "rgba(245,91,0,0.5)" : "rgba(214,110,30,0.16)"}`, boxShadow: lit ? `0 16px 40px rgba(245,91,0,0.2)` : "0 10px 30px rgba(214,110,30,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <Icon size={50} color={lit ? T.orange : T.ink3} />
                  <div style={{ fontSize: 22, fontWeight: 800, color: lit ? T.ink : T.ink3 }}>{n.label}</div>
                </div>
                {lit && <div style={{ textAlign: "center", marginTop: 10, fontSize: 15, fontFamily: T.mono, color: T.green, fontWeight: 800 }}>✓ DONE</div>}
              </div>
              {i < nodes.length - 1 && (
                <div style={{ width: 70, height: 6, position: "relative", margin: "0 4px", marginBottom: 34 }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(214,110,30,0.18)", borderRadius: 3 }} />
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${beam * 100}%`, background: `linear-gradient(90deg,${T.orange},${T.amber})`, boxShadow: `0 0 14px ${T.orange}`, borderRadius: 3 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 230, display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 800, color: T.green, opacity: frame > 120 ? 1 : 0 }}>
        <Zap size={24} /> 全流程 0 人工 · AI 自動完成
      </div>
    </AbsoluteFill>
  );
};

/* ============ FX6 · 成效體現 ============ */
export const Fx6Impact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stats = [
    { label: "平均處理時間", val: 40, pre: "↓", d: 12 },
    { label: "商機辨識率", val: 3, pre: "↑", suf: "×", d: 26 },
    { label: "商機追蹤率", val: 100, pre: "", suf: "%", d: 40 },
    { label: "商機轉換率", val: 30, pre: "↑", suf: "%", d: 54 },
  ];
  return (
    <AbsoluteFill style={{ fontFamily: F, alignItems: "center", justifyContent: "center" }}>
      <Bg e={1.1} />
      <div style={{ position: "absolute", top: 200, fontSize: 32, fontWeight: 800, color: T.ink, letterSpacing: "0.08em" }}>導入 30 天 · 成效</div>
      <div style={{ display: "flex", gap: 30 }}>
        {stats.map((s, i) => {
          const g = spring({ frame: frame - s.d, fps, config: { damping: 13, stiffness: 110 } });
          const shown = Math.round(s.val * g);
          const bar = interpolate(frame, [s.d + 10, s.d + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ width: 300, background: "#fff", border: "1px solid rgba(214,110,30,0.16)", borderRadius: 22, padding: "28px 30px", boxShadow: "0 16px 40px rgba(214,110,30,0.08)", transform: `translateY(${(1 - g) * 40}px)`, opacity: g }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.orange, fontWeight: 800 }}><TrendingUp size={22} /><span style={{ fontSize: 16, color: T.ink3 }}>{s.label}</span></div>
              <div style={{ fontSize: 72, fontWeight: 800, color: T.green, lineHeight: 1.1, marginTop: 10, fontVariantNumeric: "tabular-nums" }}>{s.pre}{s.pre ? " " : ""}{shown}{s.suf || ""}</div>
              <div style={{ height: 12, borderRadius: 6, background: "rgba(0,158,108,0.12)", marginTop: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${bar * 100}%`, background: `linear-gradient(90deg,${T.green},#38d9a9)` }} />
              </div>
            </div>
          );
        })}
      </div>
      <Burst at={95} n={30} spread={620} y="46%" />
    </AbsoluteFill>
  );
};

/* ============ FX7 · 資訊框狂蹦(業績警示) ============ */
export const Fx7AlertStorm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const alerts = [
    { icon: TrendingDown, txt: "本月業績 -32%", sub: "未達標", x: 130, y: 150, d: 8 },
    { icon: PhoneOff, txt: "客戶已掛斷", sub: "89% 拒絕率", x: 1180, y: 120, d: 20 },
    { icon: AlertTriangle, txt: "高價值商機流失", sub: "3 筆 / 今日", x: 220, y: 560, d: 34 },
    { icon: Users, txt: "跟進逾期", sub: "27 位客戶", x: 1240, y: 520, d: 48 },
    { icon: TrendingDown, txt: "成交率 11%", sub: "低於目標 60%", x: 620, y: 340, d: 62 },
    { icon: AlertTriangle, txt: "漏接關鍵訊號", sub: "抽聽僅 20 通", x: 760, y: 720, d: 76 },
    { icon: PhoneOff, txt: "專員負荷過載", sub: "+240 通待處理", x: 300, y: 800, d: 90 },
  ];
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Bg e={0.7} />
      {/* 中央標題 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: T.ink2, opacity: interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), textAlign: "center" }}>
          每一天,危機<span style={{ color: T.red }}>不斷跳出</span>——
          <br />
          <span style={{ fontSize: 28, color: T.ink3 }}>但你只能看到冰山一角。</span>
        </div>
      </AbsoluteFill>
      {alerts.map((a, i) => {
        const s = spring({ frame: frame - a.d, fps, config: { damping: 9, stiffness: 200, mass: 0.7 } });
        const Icon = a.icon;
        const shake = Math.sin((frame - a.d) / 3) * Math.max(0, 3 - (frame - a.d) / 10);
        return (
          <div key={i} style={{ position: "absolute", left: a.x, top: a.y, transform: `scale(${s}) translateX(${shake}px)`, opacity: interpolate(frame, [a.d, a.d + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: `1.5px solid rgba(224,45,60,0.45)`, borderRadius: 16, padding: "16px 22px", boxShadow: "0 18px 44px rgba(224,45,60,0.2)" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(224,45,60,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                <Icon size={26} color={T.red} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.red }}>{a.txt}</div>
                <div style={{ fontSize: 15, color: T.ink3, fontWeight: 600 }}>{a.sub}</div>
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ============ FX8 · Reasoning AI 推理過程 ============ */
export const Fx8Reasoning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps = [
    { txt: "解析語音語意與情緒訊號", note: "偵測到：家庭責任、預算敏感", d: 14 },
    { txt: "比對 CRM 歷史與相似客群", note: "相似 1,204 位客戶成交路徑", d: 40 },
    { txt: "評估 12 項方案適配度", note: "逐一計算保障缺口與負擔比", d: 66 },
    { txt: "排除預算不符方案", note: "保留 3 項高適配方案", d: 92 },
  ];
  const concludeAt = 120;
  return (
    <AbsoluteFill style={{ fontFamily: F }}>
      <Bg e={1.05} />
      {/* 標題 + 思考中指示 */}
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 20, letterSpacing: "0.4em", color: T.ink3, fontWeight: 800 }}>MYAGENT · REASONING</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: T.ink, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 14 }}>
          <Bot size={38} color={T.orange} /> AI 正在推理最適方案
          <span style={{ display: "inline-flex", gap: 6, marginLeft: 4 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: T.orange, opacity: 0.3 + 0.7 * Math.abs(Math.sin(frame / 6 - i * 0.7)) }} />
            ))}
          </span>
        </div>
      </div>

      {/* 推理鏈 */}
      <div style={{ position: "absolute", left: 520, top: 240, width: 880 }}>
        {steps.map((s, i) => {
          const app = spring({ frame: frame - s.d, fps, config: { damping: 16, stiffness: 110 } });
          const done = frame >= s.d + 22;
          const thinking = frame >= s.d && frame < s.d + 22;
          return (
            <div key={i} style={{ display: "flex", gap: 22, opacity: app, transform: `translateX(${(1 - app) * -40}px)`, marginBottom: 22 }}>
              {/* 節點 + 連線 */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", flex: "none", background: done ? T.green : "#fff", border: `2px solid ${done ? T.green : "rgba(245,91,0,0.5)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: done ? "#fff" : T.orange, fontWeight: 800, fontSize: 18, boxShadow: thinking ? `0 0 ${16 + 8 * Math.sin(frame / 4)}px rgba(245,91,0,0.5)` : "none" }}>
                  {done ? "✓" : i + 1}
                </div>
                {i < steps.length && <div style={{ width: 2, flex: 1, minHeight: 40, background: "rgba(214,110,30,0.25)" }} />}
              </div>
              {/* 內容 */}
              <div style={{ flex: 1, background: "#fff", border: `1px solid ${done ? "rgba(0,158,108,0.3)" : "rgba(214,110,30,0.18)"}`, borderRadius: 14, padding: "16px 22px", boxShadow: "0 10px 26px rgba(214,110,30,0.08)" }}>
                <div style={{ fontSize: 23, fontWeight: 800, color: T.ink }}>{s.txt}</div>
                <div style={{ fontSize: 17, color: thinking ? T.orange : T.ink3, marginTop: 6, fontWeight: thinking ? 700 : 500 }}>
                  {thinking ? "思考中…" : s.note}
                </div>
              </div>
            </div>
          );
        })}

        {/* 結論 */}
        <div style={{ opacity: interpolate(frame, [concludeAt, concludeAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${interpolate(frame, [concludeAt, concludeAt + 18], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, marginLeft: 66, marginTop: 6 }}>
          <div style={{ background: `linear-gradient(135deg,#fff,#FFF3E6)`, border: `2px solid rgba(245,91,0,0.5)`, borderRadius: 18, padding: "22px 28px", boxShadow: "0 20px 50px rgba(245,91,0,0.2)", display: "flex", alignItems: "center", gap: 20 }}>
            <Sparkles size={34} color={T.orange} style={{ flex: "none" }} />
            <div>
              <div style={{ fontSize: 16, color: T.orange, fontWeight: 800, letterSpacing: "0.1em" }}>結論 · 推薦方案</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: T.ink, marginTop: 2 }}>雙寶安心加額防護專案 <span style={{ color: T.orange }}>92%</span></div>
            </div>
          </div>
        </div>
      </div>
      <Burst at={concludeAt + 4} n={22} spread={360} x="52%" y="80%" />
    </AbsoluteFill>
  );
};

/* ============ FX9 · 顆粒球聚合轉場 ============ */
export const Fx9ParticleSphere: React.FC = () => {
  const frame = useCurrentFrame();
  const N = 420;
  const cols = ["#F5541E", "#FF8A00", "#FFB700", "#E4007F", "#009E6C", "#7C3AED", "#0E7DC2"];
  // 相位:0-30 飛入散布 → 30-100 聚合旋轉球 → 112-140 塌縮爆閃
  const conv = interpolate(frame, [24, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const convE = 1 - Math.pow(1 - conv, 3);
  const collapse = interpolate(frame, [112, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rot = frame * 0.045;
  const flash = interpolate(frame, [118, 130, 150], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = 960, cy = 540;
  const R = 320 * (1 - collapse) * (0.55 + 0.45 * convE);
  return (
    <AbsoluteFill style={{ fontFamily: F, overflow: "hidden", background: "#FFFDF9" }}>
      <Bg e={0.7} />
      {/* 球體光暈底 */}
      <div style={{ position: "absolute", left: cx, top: cy, width: 720, height: 720, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, rgba(255,138,0,${0.22 * convE}), rgba(255,183,0,${0.08 * convE}) 45%, transparent 68%)` }} />
      {Array.from({ length: N }).map((_, i) => {
        const th = Math.acos(2 * rnd(i) - 1);
        const ph = rnd(i + N) * Math.PI * 2 + rot;
        const sx = Math.sin(th) * Math.cos(ph);
        const sy = Math.cos(th);
        const sz = Math.sin(th) * Math.sin(ph);
        const start = { x: (rnd(i + 2 * N) - 0.5) * 2400, y: (rnd(i + 3 * N) - 0.5) * 1500 };
        const px = start.x * (1 - convE) + sx * R * convE;
        const py = start.y * (1 - convE) + sy * R * convE;
        const pz = sz * R * convE;
        const per = 1 / (1.5 - (pz / 340) * 0.55);
        const base = 4.5 + rnd(i + 4 * N) * 6;
        const sz2 = base * per * (1 - collapse * 0.7);
        const depth = (pz / (R || 1)) * 0.5 + 0.5; // 0(後)~1(前)
        const op = (0.55 + 0.45 * depth) * (1 - collapse * 0.4);
        const c = cols[i % cols.length];
        return (
          <div key={i} style={{ position: "absolute", left: cx + px * per, top: cy + py * per, width: sz2, height: sz2, marginLeft: -sz2 / 2, marginTop: -sz2 / 2, borderRadius: "50%", background: c, opacity: op, boxShadow: `0 0 ${sz2 * 1.6}px ${c}` }} />
        );
      })}
      {/* 塌縮爆閃 */}
      <div style={{ position: "absolute", left: cx, top: cy, width: 60, height: 60, transform: `translate(-50%,-50%) scale(${1 + collapse * 34})`, borderRadius: "50%", background: "#fff", opacity: flash, boxShadow: `0 0 140px 70px rgba(255,170,60,${flash})` }} />
    </AbsoluteFill>
  );
};
