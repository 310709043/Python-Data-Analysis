import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Phone,
  Search,
  Settings,
  Target,
  Users,
} from "lucide-react";
import { T } from "../theme";

/* ============ 模擬滑鼠游標(依 waypoint 移動 + 點擊漣漪) ============ */
export type Waypoint = { t: number; x: number; y: number; click?: boolean };

export const Cursor: React.FC<{ path: Waypoint[] }> = ({ path }) => {
  const frame = useCurrentFrame();
  if (path.length === 0) return null;
  const ts = path.map((p) => p.t);
  const xs = path.map((p) => p.x);
  const ys = path.map((p) => p.y);
  const x = interpolate(frame, ts, xs, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, ts, ys, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 點擊漣漪 + 按壓縮放
  let clickRipple = 0;
  let press = 1;
  for (const p of path) {
    if (p.click) {
      const dt = frame - p.t;
      if (dt >= 0 && dt <= 20) clickRipple = Math.max(clickRipple, dt / 20);
      if (dt >= 0 && dt <= 8) press = 0.82;
    }
  }

  return (
    <div style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 50 }}>
      {clickRipple > 0 && clickRipple < 1 && (
        <div
          style={{
            position: "absolute",
            left: x - 26 * clickRipple,
            top: y - 26 * clickRipple,
            width: 52 * clickRipple,
            height: 52 * clickRipple,
            borderRadius: "50%",
            border: `2px solid rgba(245,91,0,${0.7 * (1 - clickRipple)})`,
          }}
        />
      )}
      <svg
        width={30}
        height={38}
        viewBox="0 0 30 38"
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `scale(${press})`,
          transformOrigin: "top left",
          filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.35))",
        }}
      >
        <path d="M2 2 L2 27 L9 20 L14 31 L18 29 L13 18 L23 18 Z" fill="#fff" stroke="#1a1a1a" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ============ App 外殼:側邊欄 + 頂欄 + 主內容 ============ */
const NAV = [
  { icon: LayoutDashboard, label: "儀表板", key: "dashboard" },
  { icon: Phone, label: "來電", key: "calls" },
  { icon: Users, label: "客戶", key: "customers" },
  { icon: Target, label: "商機", key: "pipeline" },
  { icon: BarChart3, label: "報表", key: "reports" },
  { icon: Settings, label: "設定", key: "settings" },
];

export const AppShell: React.FC<{
  active: string;
  clock?: string;
  children: React.ReactNode;
}> = ({ active, clock = "14:28", children }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        fontFamily: T.font,
        color: T.ink,
        background: "#FFFDFA",
      }}
    >
      {/* 側邊欄 */}
      <div
        style={{
          width: 240,
          flex: "none",
          background: "linear-gradient(180deg, #FFF3E6, #FFEAD6)",
          borderRight: "1px solid rgba(214,110,30,0.16)",
          padding: "26px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: `linear-gradient(135deg, ${T.orange}, ${T.amber})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 22,
              boxShadow: "0 6px 16px rgba(245,91,0,0.35)",
            }}
          >
            M
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>
            My<span style={{ color: T.orange }}>Agent</span>
          </div>
        </div>
        {NAV.map((n) => {
          const on = n.key === active;
          const Icon = n.icon;
          return (
            <div
              key={n.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "12px 14px",
                borderRadius: 12,
                fontSize: 18,
                fontWeight: on ? 800 : 600,
                color: on ? T.orange : T.ink2,
                background: on ? "rgba(245,91,0,0.12)" : "transparent",
                boxShadow: on ? "inset 0 0 0 1px rgba(245,91,0,0.25)" : "none",
              }}
            >
              <Icon size={21} color={on ? T.orange : T.ink3} />
              {n.label}
            </div>
          );
        })}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: "12px 8px" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(14,125,194,0.15)",
              border: "1px solid rgba(14,125,194,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 15,
              color: T.blue,
            }}
          >
            林
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700 }}>林經理</div>
            <div style={{ color: T.ink3, fontSize: 12 }}>業務主管</div>
          </div>
        </div>
      </div>

      {/* 右側:頂欄 + 內容 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            height: 64,
            flex: "none",
            borderBottom: "1px solid rgba(214,110,30,0.12)",
            display: "flex",
            alignItems: "center",
            padding: "0 30px",
            gap: 20,
            background: "rgba(255,253,250,0.9)",
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: 420,
              height: 38,
              borderRadius: 10,
              background: "#FFF3E9",
              border: "1px solid rgba(214,110,30,0.18)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
              color: T.ink3,
              fontSize: 15,
            }}
          >
            <Search size={17} /> 搜尋客戶、來電或商機…
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18, color: T.ink3 }}>
            <span style={{ fontSize: 15, fontFamily: T.mono }}>{clock}</span>
            <Bell size={20} />
          </div>
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>{children}</div>
      </div>
    </div>
  );
};

/* ============ 共用小元件 ============ */
export const Panel: React.FC<{
  title?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, children, style }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid rgba(214,110,30,0.16)",
      borderRadius: 18,
      boxShadow: "0 10px 30px rgba(214,110,30,0.06)",
      padding: 24,
      ...style,
    }}
  >
    {title && (
      <div style={{ fontSize: 15, letterSpacing: "0.14em", color: T.ink3, fontWeight: 800, textTransform: "uppercase", marginBottom: 16 }}>
        {title}
      </div>
    )}
    {children}
  </div>
);
