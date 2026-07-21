import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Bot, Calendar, Check, Database, FileText, Loader, PhoneOff, Send, Target, TrendingUp } from "lucide-react";
import { T } from "../theme";
import { CountUp, Pop, Rise } from "../components/ui";
import { AppShell, Cursor, Panel, Waypoint } from "../components/AppChrome";

/**
 * 第三幕:掛斷後 0 秒自動化 + 商機(1800f / 60s)— 真實工作流
 *  0–820    通話結束 → 自動化工作流逐項執行打勾(帶時間戳)
 *  850–1800 切換到「商機」→ 新增高意向案件 + 全量覆蓋對比
 */
const CURSOR: Waypoint[] = [
  { t: 0, x: 1000, y: 500 },
  { t: 40, x: 1700, y: 250, click: true }, // 掛斷
  { t: 120, x: 900, y: 500 },
  { t: 800, x: 120, y: 250, click: true }, // 側欄:商機
  { t: 900, x: 700, y: 450 },
  { t: 1800, x: 700, y: 450 },
];

const STEPS = [
  { icon: FileText, label: "產生 AI 逐字稿與通話摘要", t: "14:07:02", d: 150 },
  { icon: Database, label: "自動寫回 CRM 客戶紀錄", t: "14:07:02", d: 300 },
  { icon: Send, label: "寄送商品試算表至客戶 LINE / Email", t: "14:07:03", d: 450 },
  { icon: Calendar, label: "建立專員跟進 Task(3 日後)", t: "14:07:03", d: 600 },
];

export const Scene3Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const showB = frame >= 840;

  return (
    <AbsoluteFill>
      {!showB ? (
        <AppShell active="calls" clock="14:07">
          <div style={{ padding: "30px 40px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Rise delay={6}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(224,45,60,0.1)", border: "1.5px solid rgba(224,45,60,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PhoneOff size={26} color={T.red} />
                </div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 800 }}>通話結束 · 自動化接續啟動</div>
                  <div style={{ fontSize: 16, color: T.ink3, marginTop: 3 }}>張先生 · 通話 01:12 · 掛斷即觸發,全程 0 人工</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontSize: 15, color: T.ink3, fontWeight: 700 }}>觸發延遲</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: T.orange, fontFamily: T.mono, lineHeight: 1 }}>0.0s</div>
                </div>
              </div>
            </Rise>

            <Panel title="自動化工作流 · Workflow Run #4821" style={{ marginTop: 26, flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {STEPS.map((s, i) => {
                  const running = frame >= s.d - 30 && frame < s.d;
                  const done = frame >= s.d;
                  const Icon = s.icon;
                  return (
                    <Rise key={i} delay={s.d - 40} y={20}>
                      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 22px", borderRadius: 14, background: done ? "rgba(0,158,108,0.07)" : "#FFF9F3", border: `1px solid ${done ? "rgba(0,158,108,0.3)" : "rgba(214,110,30,0.14)"}` }}>
                        <Icon size={26} color={done ? T.green : T.ink3} style={{ flex: "none" }} />
                        <div style={{ fontSize: 21, fontWeight: 700, flex: 1 }}>{s.label}</div>
                        <div style={{ fontSize: 15, color: T.ink3, fontFamily: T.mono }}>{done ? s.t : ""}</div>
                        <div style={{ width: 130, textAlign: "right" }}>
                          {done ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: T.green, fontWeight: 800, fontSize: 16 }}>
                              <span style={{ width: 24, height: 24, borderRadius: "50%", background: T.green, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Check size={16} color="#fff" /></span>
                              完成
                            </span>
                          ) : running ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: T.orange, fontWeight: 800, fontSize: 16 }}>
                              <Loader size={18} /> 執行中
                            </span>
                          ) : (
                            <span style={{ color: T.ink3, fontSize: 15 }}>等待中</span>
                          )}
                        </div>
                      </div>
                    </Rise>
                  );
                })}
              </div>
              <Rise delay={640}>
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, color: T.green, fontWeight: 800, fontSize: 19 }}>
                  <Bot size={22} /> 全部由 AI 自動完成 · 專員無需任何手動輸入
                </div>
              </Rise>
            </Panel>
          </div>
        </AppShell>
      ) : (
        <AppShell active="pipeline" clock="14:07">
          <div style={{ padding: "30px 40px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Rise delay={846}>
              <div style={{ fontSize: 30, fontWeight: 800 }}>銷售商機 Pipeline</div>
              <div style={{ fontSize: 16, color: T.ink3, marginTop: 3 }}>AI 自動建立與分級</div>
            </Rise>

            {/* Kanban 三欄 */}
            <div style={{ display: "flex", gap: 20, marginTop: 24, flex: 1 }}>
              <Column title="待聯繫" count={38} tone="muted" />
              <Column title="跟進中" count={54} tone="muted" />
              <Column title="高意向" count={215} tone="hot" highlightNew />
            </div>

            {/* 底部覆蓋率對比 */}
            <Panel style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.ink2, letterSpacing: "0.06em" }}>質檢與洞察覆蓋率</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: 18, color: T.ink3 }}>以前 每日抽聽</span>
                  <span style={{ fontSize: 44, fontWeight: 800, color: T.ink3, fontVariantNumeric: "tabular-nums" }}>20</span>
                  <span style={{ fontSize: 18, color: T.ink3 }}>通</span>
                </div>
                <div style={{ fontSize: 26, color: T.orange, fontWeight: 800 }}>→</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: 18, color: T.orange, fontWeight: 700 }}>現在 AI 全量分析</span>
                  <span style={{ fontSize: 56, fontWeight: 800, color: T.orange, fontVariantNumeric: "tabular-nums", textShadow: "0 2px 20px rgba(245,91,0,0.3)" }}>
                    <CountUp to={20000} delay={1050} dur={70} />
                  </span>
                  <span style={{ fontSize: 18, color: T.orange, fontWeight: 700 }}>通</span>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800, color: T.green }}>100% 通話覆蓋</div>
              </div>
            </Panel>
          </div>
        </AppShell>
      )}
      <Cursor path={CURSOR} />
    </AbsoluteFill>
  );
};

const Column: React.FC<{ title: string; count: number; tone: "muted" | "hot"; highlightNew?: boolean }> = ({ title, count, tone, highlightNew }) => {
  const frame = useCurrentFrame();
  const hot = tone === "hot";
  return (
    <div style={{ flex: 1, background: hot ? "linear-gradient(180deg,#FFF6EC,#FFECD8)" : "#FBF6F0", borderRadius: 16, border: `1px solid ${hot ? "rgba(245,91,0,0.3)" : "rgba(214,110,30,0.12)"}`, padding: 18, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: hot ? T.orange : T.ink2 }}>{title}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: hot ? T.orange : T.ink3, background: hot ? "rgba(245,91,0,0.14)" : "#F0E6DA", borderRadius: 999, padding: "3px 12px" }}>{count}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {highlightNew && (
          <Pop delay={920} from={0.6}>
            <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid rgba(245,91,0,0.5)", boxShadow: "0 12px 30px rgba(245,91,0,0.16)", padding: "16px 18px", position: "relative" }}>
              <div style={{ position: "absolute", top: -12, right: 14, background: T.green, color: "#fff", fontSize: 13, fontWeight: 800, borderRadius: 999, padding: "3px 12px" }}>AI 新增 +1</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(14,125,194,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: T.blue }}>張</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>張先生</div>
                  <div style={{ fontSize: 13, color: T.ink3 }}>雙寶安心加額防護專案</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 14 }}>
                <Target size={15} color={T.orange} />
                <span style={{ fontWeight: 700, color: T.orange }}>成交機率 92%</span>
                <span style={{ marginLeft: "auto", color: T.ink3 }}>已指派專員</span>
              </div>
            </div>
          </Pop>
        )}
        {[0, 1].map((i) => (
          <div key={i} style={{ background: hot ? "rgba(255,255,255,0.6)" : "#fff", borderRadius: 12, border: "1px solid rgba(214,110,30,0.1)", padding: "14px 16px", opacity: 0.7 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.ink2 }}>客戶 #{hot ? 200 + i : 40 + i}</div>
            <div style={{ height: 8, borderRadius: 4, background: "#EFE3D6", marginTop: 10, width: `${60 - i * 15}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
};
