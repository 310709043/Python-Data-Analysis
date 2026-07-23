import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BadgeCheck, Bot, CheckCircle2, MessageCircle, Radar, Sparkles,
  TrendingUp, UserRound,
} from "lucide-react";
import { P, CX, CY, rnd, DarkBg, Motes, Burst, Glare, Rise, Pop, CountUp, Type, glass } from "./kit";
import { Lobster } from "../components/Lobster";

/* ============ S1 · 壓迫與混亂(0–20s / 600f) ============ */
export const S1Chaos: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = frame < 520 ? Math.sin(frame * 2.3) * 5 + Math.cos(frame * 1.7) * 4 : 0;
  const bubbles = Array.from({ length: 16 });
  const unread = frame < 300 ? 1000 + Math.floor(interpolate(frame, [40, 300], [0, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) : 1000 + Math.floor(interpolate(frame, [300, 560], [1000, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) + Math.floor(interpolate(frame, [300, 560], [0, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const labels = ["LINE", "Messenger", "Web Chat", "IG DM"];
  return (
    <AbsoluteFill style={{ fontFamily: P.font, transform: `translate(${shake}px,${shake * 0.5}px)` }}>
      <DarkBg e={0.7} red={1} />
      {/* 混亂聊天窗 */}
      {bubbles.map((_, i) => {
        const lane = rnd(i) * 1080;
        const sp = 1.4 + rnd(i + 20) * 1.8;
        const y = (((rnd(i + 40) * 2200 - (frame - i * 6) * sp * 3) % 2400) + 2400) % 2400 - 200;
        const w = 240 + rnd(i + 60) * 130;
        const lb = labels[i % labels.length];
        const col = lb === "LINE" ? "#06C755" : lb === "Messenger" ? "#0084FF" : lb === "IG DM" ? "#E4007F" : P.o2;
        return (
          <div key={i} style={{ position: "absolute", left: lane - w / 2, top: y, width: w, opacity: 0.9, transform: `rotate(${(rnd(i + 80) - 0.5) * 8}deg)` }}>
            <div style={{ background: "rgba(30,18,10,0.86)", border: `1px solid ${col}66`, borderRadius: 14, padding: "12px 14px", boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, color: col }}>
                <MessageCircle size={16} /> {lb}
                <span style={{ marginLeft: "auto", background: P.red, color: "#fff", borderRadius: 999, fontSize: 12, padding: "1px 8px", fontWeight: 800 }}>{1 + (i % 9)}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,220,180,0.22)", marginTop: 10, width: "88%" }} />
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,220,180,0.14)", marginTop: 7, width: "60%" }} />
            </div>
          </div>
        );
      })}

      {/* 中央未讀數 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontSize: 30, letterSpacing: "0.3em", color: P.ink3, fontWeight: 800 }}>未讀訊息</div>
        <div style={{ fontSize: 210, fontWeight: 800, lineHeight: 1, color: P.red, fontVariantNumeric: "tabular-nums", textShadow: `0 0 ${50 + Math.abs(Math.sin(frame / 5)) * 40}px rgba(255,60,40,0.7)` }}>
          {unread.toLocaleString("en-US")}
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: P.red, marginTop: 4 }}>+ 未讀 · 還在暴增</div>
      </AbsoluteFill>

      {/* 左右對照文字 */}
      <div style={{ position: "absolute", left: 60, top: 1360, transform: `rotate(-3deg)` }}>
        <Rise delay={30}><div style={{ fontSize: 52, fontWeight: 800, color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>客服忙著回覆</div></Rise>
      </div>
      <div style={{ position: "absolute", right: 60, top: 1500, textAlign: "right", transform: `rotate(3deg)` }}>
        <Rise delay={80}><div style={{ fontSize: 52, fontWeight: 800, color: P.red, opacity: 0.85 }}>商機悄悄流失</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

/* ============ S2 · 急停 Glitch(20–30s / 300f) ============ */
export const S2Freeze: React.FC = () => {
  const frame = useCurrentFrame();
  const g = frame < 26; // glitch 期
  const gx = g ? (rnd(frame) - 0.5) * 40 : 0;
  const slice = g ? Math.floor(rnd(frame + 5) * 6) : 0;
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={0.5} red={g ? 1 : 0} />
      {/* glitch 殘影條 */}
      {g && Array.from({ length: slice }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: rnd(i + frame) * 1920, height: 8 + rnd(i) * 40, background: i % 2 ? "rgba(255,107,0,0.4)" : "rgba(255,60,40,0.35)", transform: `translateX(${(rnd(i + frame + 1) - 0.5) * 120}px)` }} />
      ))}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 80px", transform: `translateX(${gx}px)` }}>
        <div style={{ opacity: interpolate(frame, [26, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${interpolate(frame, [26, 60], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, textAlign: "center" }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.5, color: "#fff", textShadow: `0 0 46px rgba(255,138,0,0.7)` }}>
            客戶帶來的,<br />到底是「<span style={{ color: P.gold }}>問題</span>」,<br />還是「<span style={{ color: P.o1 }}>訂單</span>」?
          </div>
        </div>
      </AbsoluteFill>
      <Glare at={50} s={0.4} />
    </AbsoluteFill>
  );
};

/* ============ S3 · 傳統 vs MyAgent(30–50s / 600f) ============ */
export const S3Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const converge = interpolate(frame, [430, 520], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const trad = ["客戶提問", "AI / 客服回覆", "對話結束"];
  const mine = ["客戶提問", "AI 回覆", "AI 理解意圖", "AI 擷取需求", "標記商機"];
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={0.7} />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontSize: 34, fontWeight: 800, color: P.ink2, letterSpacing: "0.1em", opacity: 1 - converge }}>同一通對話,兩種結局</div>

      {/* 左:傳統(灰) */}
      <div style={{ position: "absolute", left: 40, top: 200, width: 470, opacity: 1 - converge * 0.9, filter: "grayscale(0.85)", transform: `translateX(${converge * 120}px)` }}>
        <Panel title="傳統模式" tone="gray">
          {trad.map((t, i) => <Step key={i} delay={20 + i * 22} n={i + 1} txt={t} tone="gray" last={i === trad.length - 1} />)}
          <Foot ok txt="服務完成" rate="商機轉化率 3%" tone="gray" delay={110} />
        </Panel>
      </div>

      {/* 右:MyAgent(橘金) */}
      <div style={{ position: "absolute", right: 40, top: 200, width: 470, transform: `translateX(${-converge * 120}px)` }}>
        <Panel title="MyAgent 模式" tone="hot">
          {mine.map((t, i) => <Step key={i} delay={30 + i * 20} n={i + 1} txt={t} tone="hot" last={i === mine.length - 1} />)}
          <Foot txt="商機發現" rate="商機轉化率 18%" tone="hot" delay={150} />
        </Panel>
      </div>

      {/* 匯聚 → Logo */}
      {converge > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Pop delay={430} from={0.4} bouncy>
            <div style={{ opacity: converge }}>
              <Wordmark size={110} plus />
              <div style={{ textAlign: "center", marginTop: 20, fontSize: 30, color: P.ink2, fontWeight: 700 }}>把「服務」變成「營收」</div>
            </div>
          </Pop>
        </AbsoluteFill>
      )}
      <Burst at={430} n={30} spread={520} y={CY} />
      <Glare at={452} s={0.5} />
    </AbsoluteFill>
  );
};
const Panel: React.FC<{ title: string; tone: "gray" | "hot"; children: React.ReactNode }> = ({ title, tone, children }) => (
  <div style={{ ...glass, padding: 26, border: tone === "hot" ? "1.5px solid rgba(255,138,0,0.55)" : "1px solid rgba(180,150,120,0.3)", boxShadow: tone === "hot" ? "0 30px 70px rgba(255,107,0,0.2)" : (glass.boxShadow as string) }}>
    <div style={{ fontSize: 26, fontWeight: 800, color: tone === "hot" ? P.o1 : P.ink3, marginBottom: 18 }}>{title}</div>
    {children}
  </div>
);
const Step: React.FC<{ delay: number; n: number; txt: string; tone: "gray" | "hot"; last?: boolean }> = ({ delay, n, txt, tone, last }) => (
  <Rise delay={delay} y={20}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: last ? 0 : 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", flex: "none", background: tone === "hot" ? P.o1 : "#5b4a3a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>{n}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: tone === "hot" ? P.ink : P.ink3 }}>{txt}</div>
    </div>
  </Rise>
);
const Foot: React.FC<{ ok?: boolean; txt: string; rate: string; tone: "gray" | "hot"; delay: number }> = ({ ok, txt, rate, tone, delay }) => (
  <Rise delay={delay}>
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,200,150,0.18)" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: tone === "hot" ? P.gold : P.ink3 }}>{ok ? "✅" : "💡"} {txt}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: tone === "hot" ? P.o1 : P.ink3, marginTop: 6 }}>{rate}</div>
    </div>
  </Rise>
);

/* ============ 品牌字標 ============ */
export const Wordmark: React.FC<{ size?: number; plus?: boolean }> = ({ size = 100, plus }) => (
  <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, textAlign: "center" }}>
    <span style={{ color: "#fff" }}>My</span>
    <span style={{ background: `linear-gradient(120deg,${P.o1},${P.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Agent</span>
    {plus && <span style={{ color: P.gold }}>+</span>}
  </div>
);

/* ============ S4 · 核心價值鏈(50–70s / 600f) ============ */
export const S4Core: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = ["服務接觸", "意圖理解", "商機預測", "行動匹配", "成交轉化"];
  const pulse = 1 + 0.06 * Math.sin(frame / 6);
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={1} />
      <Motes n={30} op={0.7} />
      {/* 中央 AI 球 */}
      <div style={{ position: "absolute", left: CX, top: 620, transform: "translate(-50%,-50%)" }}>
        {[0, 1, 2].map((i) => {
          const ph = (frame / 30 + i / 3) % 1;
          return <div key={i} style={{ position: "absolute", left: "50%", top: "50%", width: 220 + ph * 260, height: 220 + ph * 260, transform: "translate(-50%,-50%)", borderRadius: "50%", border: `2px solid rgba(255,138,0,${0.5 * (1 - ph)})` }} />;
        })}
        <div style={{ width: 210, height: 210, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${P.gold}, ${P.o1})`, boxShadow: `0 0 90px rgba(255,120,0,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pulse})` }}>
          <Bot size={100} color="#fff" />
        </div>
      </div>
      {/* 五節點(垂直鏈) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {nodes.map((n, i) => {
          const d = 40 + i * 30;
          const lit = frame >= d;
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 3, height: 30, background: frame >= d - 10 ? `linear-gradient(${P.o1},${P.gold})` : "rgba(255,150,60,0.2)" }} />}
              <Pop delay={d} from={0.6} bouncy>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 30px", borderRadius: 999, background: lit ? "linear-gradient(90deg,rgba(255,107,0,0.22),rgba(255,183,0,0.12))" : "rgba(40,26,16,0.6)", border: `1.5px solid ${lit ? "rgba(255,150,60,0.6)" : "rgba(150,110,70,0.3)"}`, boxShadow: lit ? "0 0 30px rgba(255,120,0,0.25)" : "none", minWidth: 360, justifyContent: "center" }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: lit ? P.gold : "#5b4a3a", boxShadow: lit ? `0 0 14px ${P.gold}` : "none" }} />
                  <span style={{ fontSize: 30, fontWeight: 800, color: lit ? P.ink : P.ink3 }}>{n}</span>
                </div>
              </Pop>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1720, textAlign: "center" }}>
        <Rise delay={220}>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "0.04em" }}>
            <span style={{ color: P.o1 }}>AI Service</span> <span style={{ color: P.ink3 }}>→</span> <span style={{ color: P.o2 }}>AI Intelligence</span> <span style={{ color: P.ink3 }}>→</span> <span style={{ color: P.gold }}>AI Sales</span>
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

/* ============ S5 · 客戶洞察 + 雷達(70–85s / 450f) ============ */
export const S5Insight: React.FC = () => {
  const frame = useCurrentFrame();
  const scanA = (frame % 60) / 60;
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={0.8} />
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", fontSize: 30, letterSpacing: "0.3em", color: P.ink3, fontWeight: 800 }}>AI 客戶洞察</div>

      {/* 客戶卡 */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 220 }}>
        <Pop delay={10} from={0.8}>
          <div style={{ ...glass, padding: 30, display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ width: 130, height: 130, borderRadius: "50%", flex: "none", background: "linear-gradient(135deg,#3FA9F5,#2b6fa8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70 }}>👨‍🍼</div>
            <div>
              <div style={{ fontSize: 40, fontWeight: 800, color: P.ink }}>王先生 <span style={{ fontSize: 24, color: P.ink3 }}>35 歲</span></div>
              <div style={{ fontSize: 22, color: P.ink2, marginTop: 6 }}>已婚 · 育有新生兒 · 房貸中</div>
            </div>
          </div>
        </Pop>
      </div>

      {/* 聊天窗 */}
      <div style={{ position: "absolute", left: 90, right: 160, top: 470 }}>
        <Rise delay={40}>
          <div style={{ background: "rgba(30,18,10,0.9)", border: "1px solid rgba(255,150,60,0.3)", borderRadius: "18px 18px 18px 4px", padding: "20px 24px", fontSize: 30, lineHeight: 1.6, color: P.ink }}>
            <Type text="醫療險有理賠某某手術嗎?" start={45} style={{}} />
          </div>
        </Rise>
      </div>

      {/* 雷達掃描 */}
      <div style={{ position: "absolute", left: CX, top: 1160, transform: "translate(-50%,-50%)", width: 440, height: 440 }}>
        {[1, 2, 3].map((r) => <div key={r} style={{ position: "absolute", left: "50%", top: "50%", width: r * 140, height: r * 140, transform: "translate(-50%,-50%)", borderRadius: "50%", border: "1px solid rgba(255,107,0,0.3)" }} />)}
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 440, height: 440, transform: `translate(-50%,-50%) rotate(${scanA * 360}deg)`, borderRadius: "50%", background: `conic-gradient(from 0deg, transparent 0deg, rgba(255,107,0,0.35) 40deg, transparent 60deg)` }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 90, height: 90, borderRadius: "50%", background: `radial-gradient(circle,${P.gold},${P.o1})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px rgba(255,120,0,0.6)` }}>
          <Radar size={44} color="#fff" />
        </div>
        {/* 命中點 */}
        <div style={{ position: "absolute", left: "72%", top: "34%", width: 22, height: 22, borderRadius: "50%", background: P.red, boxShadow: `0 0 20px ${P.red}`, opacity: Math.abs(Math.sin(frame / 6)) }} />
      </div>

      {/* 雷達結果 */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 1560 }}>
        <Pop delay={120} from={0.6} bouncy>
          <div style={{ background: "linear-gradient(135deg,rgba(255,60,40,0.16),rgba(255,138,0,0.12))", border: "1.5px solid rgba(255,90,60,0.6)", borderRadius: 20, padding: "24px 28px", textAlign: "center", boxShadow: "0 0 50px rgba(255,90,40,0.3)" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: P.red }}>🔴 AI 雷達:發現高價值需求!</div>
            <div style={{ fontSize: 56, fontWeight: 800, color: P.gold, marginTop: 8 }}>購買意願 <CountUp to={87} delay={130} dur={40} />%</div>
          </div>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};

/* ============ S6 · Next Best Action(85–105s / 600f) ============ */
export const S6NBA: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = ["主動提供免費家庭保障檢視", "客戶接受後補充家庭資訊", "需求確認,升級為高潛力線索"];
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={0.8} />
      {/* 劃掉錯誤選項 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center" }}>
        <Rise delay={10}>
          <div style={{ position: "relative", display: "inline-block", fontSize: 42, fontWeight: 800, color: P.ink3 }}>
            ❌ 立即推銷保單
            <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 5, background: P.red, transform: `scaleX(${interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, transformOrigin: "left", boxShadow: `0 0 12px ${P.red}` }} />
          </div>
        </Rise>
      </div>

      {/* 標題 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center" }}>
        <Pop delay={60} from={0.6} bouncy>
          <div style={{ fontSize: 60, fontWeight: 800, background: `linear-gradient(120deg,${P.o1},${P.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", letterSpacing: "0.06em" }}>NEXT BEST ACTION</div>
        </Pop>
      </div>

      {/* 客戶旅程逐步亮 */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 480, display: "flex", flexDirection: "column", gap: 20 }}>
        {steps.map((s, i) => {
          const d = 100 + i * 55;
          const lit = frame >= d;
          return (
            <Rise key={i} delay={d - 12} y={24}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 26px", borderRadius: 18, background: lit ? "linear-gradient(90deg,rgba(255,107,0,0.18),rgba(255,183,0,0.08))" : "rgba(40,26,16,0.6)", border: `1.5px solid ${lit ? "rgba(255,150,60,0.6)" : "rgba(150,110,70,0.3)"}` }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", flex: "none", background: lit ? P.o1 : "#5b4a3a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20 }}>{i + 1}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: lit ? P.ink : P.ink3 }}>{s}</div>
                {lit && <BadgeCheck size={28} color={P.green} style={{ marginLeft: "auto" }} />}
              </div>
            </Rise>
          );
        })}
      </div>

      {/* Lead Score 62 → 92 */}
      <div style={{ position: "absolute", left: 70, right: 70, top: 1180 }}>
        <Rise delay={230}>
          <div style={{ ...glass, padding: 34, textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: P.ink3, letterSpacing: "0.2em" }}>LEAD SCORE</div>
            <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1, color: P.gold, marginTop: 6, textShadow: `0 0 50px rgba(255,150,0,0.5)` }}>
              <CountUp to={92} delay={250} dur={55} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 10, fontSize: 26, color: P.green, fontWeight: 800 }}>
              <TrendingUp size={26} /> 62 → 92 · 高潛力線索
            </div>
          </div>
        </Rise>
      </div>
      <Burst at={250} n={22} spread={360} x={CX} y={1360} />
    </AbsoluteFill>
  );
};

/* ============ S7 · 智慧銷售匹配(105–120s / 450f) ============ */
export const S7Match: React.FC = () => {
  const frame = useCurrentFrame();
  const reps = [
    { n: "Sales A", m: 96, tag: "擅長家庭保險 · 同齡共鳴度高", best: true },
    { n: "Sales B", m: 78, tag: "醫療險專精", best: false },
    { n: "Sales C", m: 64, tag: "一般業務", best: false },
  ];
  const scan = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={0.8} />
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
        <Rise delay={6}><div style={{ fontSize: 44, fontWeight: 800, color: P.ink }}>高意向商機 · <span style={{ color: P.gold }}>Score 92</span></div></Rise>
        <Rise delay={26}><div style={{ fontSize: 26, color: P.ink3, marginTop: 10 }}>系統掃描 · 自動匹配最適業務 {Math.round(scan * 100)}%</div></Rise>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 420, display: "flex", flexDirection: "column", gap: 26 }}>
        {reps.map((r, i) => (
          <Pop key={i} delay={60 + i * 24} from={0.7}>
            <div style={{ position: "relative", padding: "28px 30px", borderRadius: 22, background: r.best ? "linear-gradient(135deg,rgba(255,107,0,0.2),rgba(255,183,0,0.1))" : "rgba(40,26,16,0.6)", border: `2px solid ${r.best ? "rgba(255,160,60,0.8)" : "rgba(150,110,70,0.3)"}`, boxShadow: r.best ? "0 0 50px rgba(255,120,0,0.3)" : "none", display: "flex", alignItems: "center", gap: 22, filter: r.best ? "none" : "grayscale(0.4) opacity(0.8)" }}>
              {r.best && <div style={{ position: "absolute", top: -16, left: 26, background: P.o1, color: "#fff", fontSize: 16, fontWeight: 800, borderRadius: 999, padding: "5px 16px" }}>★ 最佳匹配</div>}
              <div style={{ width: 76, height: 76, borderRadius: "50%", flex: "none", background: r.best ? `linear-gradient(135deg,${P.o1},${P.gold})` : "#4a3c2e", display: "flex", alignItems: "center", justifyContent: "center" }}><UserRound size={38} color="#fff" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: P.ink }}>{r.n}</div>
                <div style={{ fontSize: 20, color: P.ink2, marginTop: 4 }}>{r.tag}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, color: P.ink3, fontWeight: 700 }}>Match</div>
                <div style={{ fontSize: 52, fontWeight: 800, color: r.best ? P.gold : P.ink3, lineHeight: 1 }}>{r.best ? <CountUp to={r.m} delay={90} dur={40} /> : r.m}%</div>
              </div>
            </div>
          </Pop>
        ))}
      </div>
      <Glare at={90} s={0.4} />
    </AbsoluteFill>
  );
};

/* ============ S8 · 即時 Copilot(120–150s / 900f) ============ */
export const S8Copilot: React.FC = () => {
  const frame = useCurrentFrame();
  const tasks = [
    { t: "通話摘要自動生成", d: 300 },
    { t: "CRM 資訊自動更新", d: 400 },
    { t: "後續跟進任務自動建立", d: 500 },
  ];
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={0.85} />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", fontSize: 34, fontWeight: 800, color: P.ink, letterSpacing: "0.08em" }}>
        <Sparkles size={30} color={P.o1} style={{ verticalAlign: -4, marginRight: 8 }} />即時 AI Copilot · 真人通話中
      </div>

      {/* 上:客戶 360 */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 180 }}>
        <Rise delay={10}>
          <div style={{ ...glass, padding: 24 }}>
            <div style={{ fontSize: 18, color: P.ink3, fontWeight: 800, letterSpacing: "0.2em" }}>CUSTOMER 360</div>
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {["王先生 · 35 歲", "已婚 · 二寶家庭", "房貸中 · 月付 3.2 萬", "既有:醫療險"].map((c, i) => (
                <span key={i} style={{ fontSize: 22, fontWeight: 700, color: P.ink2, background: "rgba(255,150,60,0.1)", border: "1px solid rgba(255,150,60,0.3)", borderRadius: 999, padding: "8px 18px" }}>{c}</span>
              ))}
            </div>
          </div>
        </Rise>
      </div>

      {/* 中:AI Copilot 對話 */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 430 }}>
        <Rise delay={30}>
          <div style={{ ...glass, padding: 26, border: "1.5px solid rgba(255,138,0,0.5)" }}>
            <div style={{ fontSize: 18, color: P.o1, fontWeight: 800, letterSpacing: "0.16em", display: "flex", alignItems: "center", gap: 8 }}><Bot size={22} /> AI REAL-TIME COPILOT</div>
            {/* 客戶語句 */}
            <div style={{ marginTop: 18, fontSize: 28, fontWeight: 700, color: P.ink }}>
              客戶:「<Type text="我覺得保費有點高……" start={70} style={{ color: P.gold }} />」
            </div>
            {/* AI 建議逐條 */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <Sugg delay={150} icon="⚠️" label="客戶異議" txt="價格顧慮" tone="warn" />
              <Sugg delay={185} icon="💡" label="應對建議" txt="先強調家庭保障缺口,再談每日成本" tone="tip" />
              <Sugg delay={220} icon="👉" label="下一步" txt="預約二次規劃溝通" tone="go" />
            </div>
          </div>
        </Rise>
      </div>

      {/* 下:自動任務清單 */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1180 }}>
        <Rise delay={260}>
          <div style={{ ...glass, padding: 24 }}>
            <div style={{ fontSize: 18, color: P.ink3, fontWeight: 800, letterSpacing: "0.16em" }}>AUTO TASKS · 全自動</div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              {tasks.map((t, i) => {
                const done = frame >= t.d;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 700 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, flex: "none", background: done ? P.green : "rgba(255,255,255,0.06)", border: done ? "none" : "1px solid rgba(255,200,150,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>{done && <CheckCircle2 size={22} color="#fff" />}</span>
                    <span style={{ color: done ? P.ink : P.ink3 }}>{t.t}</span>
                    {done && <span style={{ marginLeft: "auto", fontSize: 16, color: P.green, fontFamily: P.mono, fontWeight: 800 }}>DONE</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};
const Sugg: React.FC<{ delay: number; icon: string; label: string; txt: string; tone: "warn" | "tip" | "go" }> = ({ delay, icon, label, txt, tone }) => {
  const col = tone === "warn" ? P.red : tone === "tip" ? P.gold : P.green;
  return (
    <Pop delay={delay} from={0.7}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 14, background: `${col}1a`, border: `1px solid ${col}66` }}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: col, flex: "none" }}>{label}</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: P.ink }}>{txt}</span>
      </div>
    </Pop>
  );
};

/* ============ S9 · 價值鏈回顧(150–170s / 600f) ============ */
export const S9Chain: React.FC = () => {
  const frame = useCurrentFrame();
  const chain = ["客戶接觸", "AI 服務", "意圖理解", "商機發現", "行動匹配", "銷售匹配", "真人成交", "營收增長"];
  // 前段快閃 montage 0-160,後段組成價值鏈 160+
  const flashIdx = Math.floor(frame / 14);
  const cards = ["混亂客服", "AI 分析", "雷達 87%", "Score 92", "最佳匹配", "Copilot", "任務自動化"];
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={0.9} />
      <Motes n={26} op={0.6} />
      {frame < 165 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          {[0, 1, 2].map((k) => {
            const idx = (flashIdx + k) % cards.length;
            const local = frame % 14;
            const op = interpolate(local, [0, 3, 11, 14], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={k} style={{ position: "absolute", left: `${20 + k * 28 + rnd(flashIdx + k) * 8}%`, top: `${30 + rnd(flashIdx + k + 5) * 40}%`, opacity: op * (0.5 + 0.5 * (k === 1 ? 1 : 0.6)), transform: `scale(${0.8 + k * 0.2})` }}>
                <div style={{ ...glass, padding: "22px 30px", fontSize: 34, fontWeight: 800, color: P.gold }}>{cards[idx]}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", bottom: 200, fontSize: 32, fontWeight: 800, color: P.ink2, letterSpacing: "0.2em" }}>每一步 · 環環相扣</div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            {chain.map((c, i) => {
              const d = 175 + i * 16;
              const lit = frame >= d;
              return (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ width: 3, height: 22, background: lit ? `linear-gradient(${P.o1},${P.gold})` : "rgba(255,150,60,0.2)" }} />}
                  <Pop delay={d} from={0.6}>
                    <div style={{ padding: "13px 34px", borderRadius: 999, background: lit ? "linear-gradient(90deg,rgba(255,107,0,0.22),rgba(255,183,0,0.12))" : "rgba(40,26,16,0.5)", border: `1.5px solid ${lit ? "rgba(255,150,60,0.6)" : "rgba(150,110,70,0.3)"}`, fontSize: 30, fontWeight: 800, color: lit ? P.ink : P.ink3, minWidth: 320, textAlign: "center" }}>{c}</div>
                  </Pop>
                </React.Fragment>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ============ S10 · 品牌收尾(170–180s / 300f) ============ */
export const S10Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const breathe = 0.7 + 0.3 * Math.sin(frame / 20);
  return (
    <AbsoluteFill style={{ fontFamily: P.font }}>
      <DarkBg e={1.1} />
      <Motes n={34} op={0.8} />
      <div style={{ position: "absolute", left: CX, top: 720, width: 900, height: 900, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,0,0.22), transparent 62%)", opacity: breathe }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 430 }}>
        {/* Logo + 龍蝦 */}
        <div style={{ position: "relative" }}>
          <Pop delay={10} from={0.5} bouncy><Wordmark size={140} plus /></Pop>
          <div style={{ position: "absolute", right: -140, top: -70 }}>
            <Lobster size={200} delay={30} mode="cheer" />
          </div>
        </div>

        {/* Slogan */}
        <Rise delay={70} style={{ marginTop: 60 }}>
          <div style={{ fontSize: 62, fontWeight: 800, textAlign: "center", lineHeight: 1.4, background: `linear-gradient(120deg,${P.o1},${P.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: "0 0 40px rgba(255,150,0,0.2)" }}>
            下一個商機,<br />不必等客戶開口
          </div>
        </Rise>

        <Rise delay={110} style={{ marginTop: 40 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: P.ink2, letterSpacing: "0.04em" }}>
            <span style={{ color: P.o1 }}>AI Service</span> × <span style={{ color: P.o2 }}>AI Intelligence</span> × <span style={{ color: P.gold }}>AI Sales</span>
          </div>
        </Rise>

        <Rise delay={150} style={{ marginTop: 44 }}>
          <div style={{ fontSize: 26, color: P.ink3, fontWeight: 600 }}>無痛對接現有客服與 CRM 系統</div>
        </Rise>
      </AbsoluteFill>
      <Burst at={20} n={34} spread={640} x={CX} y={640} />
      <Glare at={40} s={0.6} />
      <Glare at={150} s={0.4} />
    </AbsoluteFill>
  );
};
