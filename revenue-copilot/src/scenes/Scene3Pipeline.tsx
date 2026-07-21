import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import {
  Bot,
  CalendarCheck,
  Database,
  FileText,
  PhoneOff,
  Send,
  TrendingUp,
} from "lucide-react";
import { T, frost, frostHot, eyebrow } from "../theme";
import {
  AIBadge,
  Backdrop,
  Burst,
  CountUp,
  FrostIn,
  Particles,
  Pop,
  Rise,
} from "../components/ui";
import { Lobster } from "../components/Lobster";

/**
 * 第三幕:0 秒自動化與 Pipeline(1800f / 60s)MyAgent 亮色版
 *  0–240    掛斷 + 0.0s 強彈跳(無人值守)
 *  240–820  四段流水線橘色光束依序點亮 + 完成粒子(🦞 歡呼 #3)
 *  850–1800 Dashboard:+1 高意向脈動、20 vs 20,000 計數 + 柱狀圖增長
 */
export const Scene3Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const beatA = interpolate(frame, [820, 856], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const beatB = interpolate(frame, [850, 884], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const steps = [
    { icon: FileText, label: "AI 逐字稿與摘要", d: 250 },
    { icon: Database, label: "自動寫回 CRM", d: 390 },
    { icon: Send, label: "LINE/Email 寄送試算表", d: 530 },
    { icon: CalendarCheck, label: "設定跟進 Task", d: 670 },
  ];

  // 0.0s 超強彈跳
  const stopwatch = spring({
    frame: frame - 110,
    fps,
    config: { damping: 8, stiffness: 210, mass: 0.8 },
  });

  // +1 徽章脈動
  const plusPulse = 1 + 0.06 * Math.sin(frame / 10);

  return (
    <AbsoluteFill style={{ fontFamily: T.font, color: T.ink }}>
      <Backdrop />
      <Particles n={30} opacity={0.7} />

      {/* Beat A:掛斷 → 自動化流水線 */}
      <AbsoluteFill style={{ opacity: beatA, padding: 90 }}>
        <Rise delay={12}>
          <div style={{ ...eyebrow, color: T.orange }}>
            STEP 02 · ZERO-SECOND AUTOMATION
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 14 }}>
            <div style={{ fontSize: 54, fontWeight: 800 }}>
              電話掛斷的那一刻,AI 的工作才剛開始
            </div>
            <AIBadge delay={60} label="無人值守 · AI 全自動接續" />
          </div>
        </Rise>

        {/* 掛斷 + 0.0s 碼表 */}
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 60 }}>
          <Pop delay={70} from={0.3} bouncy>
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "rgba(224,45,60,0.12)",
                border: "1.5px solid rgba(224,45,60,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 40px rgba(224,45,60,0.25)",
              }}
            >
              <PhoneOff size={48} color={T.red} />
            </div>
          </Pop>
          <div
            style={{
              opacity: frame >= 110 ? 1 : 0,
              transform: `scale(${0.2 + 0.8 * stopwatch})`,
              transformOrigin: "left center",
            }}
          >
            <div
              style={{
                fontSize: 84,
                fontWeight: 800,
                fontFamily: T.mono,
                color: T.orange,
                lineHeight: 1,
                textShadow: "0 4px 40px rgba(245,91,0,0.45)",
              }}
            >
              0.0s
            </div>
            <div style={{ fontSize: 24, color: T.ink2, marginTop: 8, fontWeight: 700 }}>
              掛斷即觸發 · 0 人工介入
            </div>
          </div>
          <Burst at={112} x={340} y={60} n={20} spread={220} />
        </div>

        {/* 流水線 */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginTop: 80 }}>
          {steps.map((s, i) => {
            const lit = frame >= s.d;
            const beamP = interpolate(frame, [s.d + 30, s.d + 90], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const fillP = interpolate(frame, [s.d, s.d + 50], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const Icon = s.icon;
            return (
              <React.Fragment key={i}>
                <div style={{ flex: 1, position: "relative" }}>
                  <FrostIn delay={s.d} rot={i % 2 ? 3 : -3} style={{ height: "100%" }}>
                    <div
                      style={{
                        ...(lit ? frostHot : frost),
                        height: "100%",
                        padding: "34px 28px",
                        textAlign: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* 頂部進度條填充 */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          height: 6,
                          width: `${fillP * 100}%`,
                          background: `linear-gradient(90deg, ${T.orange}, ${T.amber})`,
                          boxShadow: `0 0 14px ${T.orange2}`,
                        }}
                      />
                      <Icon size={52} color={lit ? T.orange : T.ink3} />
                      <div style={{ marginTop: 18, fontSize: 27, fontWeight: 800, lineHeight: 1.4 }}>
                        {s.label}
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 17,
                          fontFamily: T.mono,
                          letterSpacing: "0.18em",
                          fontWeight: 800,
                          color: lit ? T.green : T.ink3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        {lit ? (
                          <>
                            <Bot size={18} /> DONE by AI ✓
                          </>
                        ) : (
                          "WAITING"
                        )}
                      </div>
                    </div>
                  </FrostIn>
                  {/* 點亮瞬間粒子完成特效 */}
                  <Burst at={s.d + 6} x="50%" y="40%" n={16} spread={170} size={0.8} />
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 74,
                      alignSelf: "center",
                      position: "relative",
                      height: 5,
                      flex: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(214,110,30,0.2)",
                        borderRadius: 3,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${beamP * 100}%`,
                        background: `linear-gradient(90deg, ${T.orange}, ${T.amber})`,
                        boxShadow: `0 0 16px ${T.orange2}`,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 🦞 #3:流水線全部完成,龍蝦歡呼 */}
        <div style={{ position: "absolute", right: 100, bottom: 40 }}>
          <Lobster size={185} delay={740} mode="cheer" bubble="全部搞定!" />
        </div>
      </AbsoluteFill>

      {/* Beat B:Dashboard */}
      <AbsoluteFill style={{ opacity: beatB, padding: 90 }}>
        <Rise delay={880}>
          <div style={{ ...eyebrow, color: T.blue }}>STEP 03 · REVENUE DASHBOARD</div>
          <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 14 }}>
            <div style={{ fontSize: 54, fontWeight: 800 }}>
              每一通電話,都變成看得見的 Pipeline
            </div>
            <AIBadge delay={930} label="AI 全自動整理" />
          </div>
        </Rise>

        <div style={{ display: "flex", gap: 40, marginTop: 70 }}>
          {/* Pipeline 卡 */}
          <FrostIn delay={940} rot={-3} style={{ flex: 1 }}>
            <div style={{ ...frost, padding: "38px 44px", height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 22,
                  letterSpacing: "0.2em",
                  color: T.ink2,
                  fontWeight: 800,
                }}
              >
                <TrendingUp size={26} color={T.blue} /> SALES PIPELINE
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30 }}>
                <div
                  style={{
                    fontSize: 120,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: T.green,
                    textShadow: "0 4px 40px rgba(0,158,108,0.35)",
                    transform: `scale(${plusPulse})`,
                    transformOrigin: "center",
                  }}
                >
                  +1
                </div>
                <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.4 }}>
                  高意向案件
                  <div style={{ fontSize: 20, color: T.ink2, fontWeight: 600, marginTop: 6 }}>
                    張先生 · 雙寶安心加額防護專案
                  </div>
                </div>
              </div>
              {/* 柱狀圖逐根增長 */}
              <div style={{ display: "flex", gap: 12, marginTop: 36, alignItems: "flex-end", height: 150 }}>
                {[86, 64, 42, 26].map((h, i) => {
                  const grow = spring({
                    frame: frame - (1000 + i * 14),
                    fps,
                    config: { damping: 13, stiffness: 110, mass: 0.8 },
                  });
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: h * 1.7 * grow,
                        borderRadius: 10,
                        background:
                          i === 3
                            ? `linear-gradient(180deg, ${T.green}, rgba(0,158,108,0.5))`
                            : `linear-gradient(180deg, ${T.orange2}, rgba(255,138,0,0.35))`,
                        boxShadow:
                          i === 3
                            ? "0 8px 24px rgba(0,158,108,0.3)"
                            : "0 8px 24px rgba(255,138,0,0.25)",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </FrostIn>

          {/* 對比卡 */}
          <FrostIn delay={1010} rot={3} style={{ flex: 1.15 }}>
            <div style={{ ...frost, padding: "38px 44px", height: "100%" }}>
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: "0.2em",
                  color: T.ink2,
                  fontWeight: 800,
                }}
              >
                COVERAGE · 質檢與洞察覆蓋率
              </div>
              <div style={{ display: "flex", gap: 36, marginTop: 36 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, color: T.ink3, fontWeight: 700 }}>
                    以前:每日抽聽
                  </div>
                  <div
                    style={{
                      fontSize: 96,
                      fontWeight: 800,
                      color: T.ink3,
                      lineHeight: 1.1,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <CountUp to={20} delay={1050} dur={40} />
                    <span style={{ fontSize: 40 }}> 通</span>
                  </div>
                  <div
                    style={{
                      height: 14,
                      width: "8%",
                      minWidth: 26,
                      borderRadius: 8,
                      background: "rgba(95,70,48,0.3)",
                      marginTop: 20,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, color: T.orange, fontWeight: 800 }}>
                    現在:AI 全量分析
                  </div>
                  <div
                    style={{
                      fontSize: 96,
                      fontWeight: 800,
                      color: T.orange,
                      lineHeight: 1.1,
                      textShadow: "0 4px 40px rgba(245,91,0,0.35)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <CountUp to={20000} delay={1080} dur={80} />
                    <span style={{ fontSize: 40 }}> 通</span>
                  </div>
                  <div
                    style={{
                      height: 14,
                      width: `${interpolate(frame, [1090, 1240], [8, 100], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                      })}%`,
                      borderRadius: 8,
                      background: `linear-gradient(90deg, ${T.orange}, ${T.amber})`,
                      boxShadow: "0 0 24px rgba(255,138,0,0.45)",
                      marginTop: 20,
                    }}
                  />
                </div>
              </div>
              <div style={{ marginTop: 32, fontSize: 24, color: T.ink2, lineHeight: 1.6, fontWeight: 600 }}>
                100% 通話覆蓋——每一位客戶的訊號,都不再被漏掉。
              </div>
            </div>
          </FrostIn>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
