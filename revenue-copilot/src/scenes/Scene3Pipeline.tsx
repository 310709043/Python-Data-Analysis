import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  CalendarCheck,
  Database,
  FileText,
  PhoneOff,
  Send,
  TrendingUp,
} from "lucide-react";
import { T, glass, eyebrow } from "../theme";
import { Backdrop, CountUp, Pop, Rise } from "../components/ui";

/**
 * 第三幕:0 秒自動化與 Pipeline(1800f / 60s)
 *  0–240   掛斷 + 0.0s
 *  240–820 四張流水線卡依序亮起
 *  850–1800 Dashboard:Pipeline +1、20 vs 20,000 對比
 */
export const Scene3Pipeline: React.FC = () => {
  const frame = useCurrentFrame();

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

  return (
    <AbsoluteFill style={{ fontFamily: T.font, color: T.ink }}>
      <Backdrop />

      {/* Beat A:掛斷 → 自動化流水線 */}
      <AbsoluteFill style={{ opacity: beatA, padding: 90 }}>
        <Rise delay={12}>
          <div style={{ ...eyebrow, color: T.neon }}>
            STEP 02 · ZERO-SECOND AUTOMATION
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, marginTop: 14 }}>
            電話掛斷的那一刻,AI 的工作才剛開始
          </div>
        </Rise>

        {/* 掛斷 + 碼表 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            marginTop: 70,
          }}
        >
          <Pop delay={70} from={0.4}>
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "rgba(255,59,78,0.14)",
                border: "1px solid rgba(255,59,78,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 50px rgba(255,59,78,0.25)",
              }}
            >
              <PhoneOff size={48} color={T.red} />
            </div>
          </Pop>
          <Pop delay={110}>
            <div>
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 800,
                  fontFamily: T.mono,
                  color: T.neon,
                  lineHeight: 1,
                  textShadow: "0 0 40px rgba(0,255,157,0.35)",
                }}
              >
                0.0s
              </div>
              <div style={{ fontSize: 24, color: T.ink2, marginTop: 8 }}>
                掛斷即觸發 · 全自動接續
              </div>
            </div>
          </Pop>
        </div>

        {/* 流水線 */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            marginTop: 90,
          }}
        >
          {steps.map((s, i) => {
            const lit = frame >= s.d;
            const beamP = interpolate(
              frame,
              [s.d + 30, s.d + 90],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const Icon = s.icon;
            return (
              <React.Fragment key={i}>
                <Pop delay={s.d} from={0.7} style={{ flex: 1 }}>
                  <div
                    style={{
                      ...glass,
                      height: "100%",
                      padding: "36px 30px",
                      textAlign: "center",
                      border: lit
                        ? "1px solid rgba(0,255,157,0.45)"
                        : (glass.border as string),
                      boxShadow: lit
                        ? "0 40px 90px rgba(0,0,0,0.5), 0 0 46px rgba(0,255,157,0.12)"
                        : (glass.boxShadow as string),
                    }}
                  >
                    <Icon size={52} color={lit ? T.neon : T.ink3} />
                    <div
                      style={{
                        marginTop: 20,
                        fontSize: 27,
                        fontWeight: 800,
                        lineHeight: 1.4,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 17,
                        fontFamily: T.mono,
                        letterSpacing: "0.2em",
                        color: lit ? T.neon : T.ink3,
                      }}
                    >
                      {lit ? "DONE ✓" : "WAITING"}
                    </div>
                  </div>
                </Pop>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 74,
                      alignSelf: "center",
                      position: "relative",
                      height: 4,
                      flex: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255,255,255,0.10)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${beamP * 100}%`,
                        background: T.neon,
                        boxShadow: `0 0 16px ${T.neon}`,
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Beat B:Dashboard */}
      <AbsoluteFill style={{ opacity: beatB, padding: 90 }}>
        <Rise delay={880}>
          <div style={{ ...eyebrow, color: T.aurora }}>
            STEP 03 · REVENUE DASHBOARD
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, marginTop: 14 }}>
            每一通電話,都變成看得見的 Pipeline
          </div>
        </Rise>

        <div style={{ display: "flex", gap: 40, marginTop: 80 }}>
          {/* Pipeline 卡 */}
          <Rise delay={940} style={{ flex: 1 }}>
            <div style={{ ...glass, padding: "40px 44px", height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 22,
                  letterSpacing: "0.22em",
                  color: T.ink2,
                  fontWeight: 800,
                }}
              >
                <TrendingUp size={26} color={T.aurora} /> SALES PIPELINE
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  marginTop: 34,
                }}
              >
                <div
                  style={{
                    fontSize: 120,
                    fontWeight: 800,
                    lineHeight: 1,
                    color: T.neon,
                    textShadow: "0 0 50px rgba(0,255,157,0.35)",
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
              {/* mini funnel */}
              <div style={{ display: "flex", gap: 10, marginTop: 40, alignItems: "flex-end" }}>
                {[86, 64, 42, 26].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: h * 1.6,
                      borderRadius: 8,
                      background:
                        i === 3
                          ? `linear-gradient(180deg, ${T.neon}, ${T.neon}66)`
                          : "linear-gradient(180deg, rgba(56,189,248,0.5), rgba(56,189,248,0.15))",
                    }}
                  />
                ))}
              </div>
            </div>
          </Rise>

          {/* 對比卡 */}
          <Rise delay={1010} style={{ flex: 1.15 }}>
            <div style={{ ...glass, padding: "40px 44px", height: "100%" }}>
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: "0.22em",
                  color: T.ink2,
                  fontWeight: 800,
                }}
              >
                COVERAGE · 質檢與洞察覆蓋率
              </div>
              <div style={{ display: "flex", gap: 36, marginTop: 40 }}>
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
                      background: "rgba(255,255,255,0.22)",
                      marginTop: 20,
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, color: T.neon, fontWeight: 700 }}>
                    現在:AI 全量分析
                  </div>
                  <div
                    style={{
                      fontSize: 96,
                      fontWeight: 800,
                      color: T.neon,
                      lineHeight: 1.1,
                      textShadow: "0 0 46px rgba(0,255,157,0.35)",
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
                      background: `linear-gradient(90deg, ${T.neon}, ${T.aurora})`,
                      boxShadow: "0 0 24px rgba(0,255,157,0.4)",
                      marginTop: 20,
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  marginTop: 36,
                  fontSize: 24,
                  color: T.ink2,
                  lineHeight: 1.6,
                }}
              >
                100% 通話覆蓋——每一位客戶的訊號,都不再被漏掉。
              </div>
            </div>
          </Rise>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
