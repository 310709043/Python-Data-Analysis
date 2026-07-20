export const T = {
  bg: "#0A0A0C",
  neon: "#00FF9D",
  aurora: "#38BDF8",
  red: "#FF3B4E",
  ink: "#F4F6F8",
  ink2: "#A6AEBB",
  ink3: "#5C6472",
  font: `'Noto Sans TC','PingFang TC','Microsoft JhengHei',-apple-system,'Segoe UI',sans-serif`,
  mono: `ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace`,
};

export const glass: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 28,
  boxShadow: "0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)",
};

export const eyebrow: React.CSSProperties = {
  fontSize: 22,
  letterSpacing: "0.5em",
  textTransform: "uppercase",
  color: T.ink3,
  fontWeight: 700,
  fontFamily: T.font,
};
