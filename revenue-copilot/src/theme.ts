/** MyAgent 亮色品牌主題:暖白底 + 橘色漸層毛玻璃(Frosted Glassmorphism) */
export const T = {
  bg: "#FFF6EC", // 暖白奶油底(亮色,非黑)
  bg2: "#FFEAD6",
  orange: "#F55B00", // 主橘(亮底上加深保對比)
  orange2: "#FF8A00",
  amber: "#FFB700",
  green: "#009E6C", // 成果綠(深化版,亮底可讀)
  blue: "#0E7DC2", // 極光藍(深化版)
  red: "#E02D3C", // 危機紅
  ink: "#26160A", // 主文字:深暖棕黑
  ink2: "#5F4630",
  ink3: "#97815F",
  font: `'Noto Sans TC','PingFang TC','Microsoft JhengHei',-apple-system,'Segoe UI',sans-serif`,
  mono: `ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace`,
};

/** 橘色系毛玻璃卡(亮色版):白玻璃 + 橘 tint + 橘邊框 + 內陰影 */
export const frost: React.CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(255,255,255,0.72), rgba(255,235,215,0.55) 55%, rgba(255,224,190,0.5))",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,150,60,0.45)",
  borderRadius: 28,
  boxShadow:
    "0 30px 70px rgba(214,110,30,0.18), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -16px 34px rgba(255,150,60,0.10)",
};

/** 橘色強調毛玻璃(高亮卡:AI 推薦、徽章) */
export const frostHot: React.CSSProperties = {
  background:
    "linear-gradient(160deg, rgba(255,138,0,0.16), rgba(255,255,255,0.7) 45%, rgba(255,183,0,0.14))",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(245,91,0,0.55)",
  borderRadius: 28,
  boxShadow:
    "0 30px 70px rgba(214,110,30,0.22), 0 0 60px rgba(255,138,0,0.25), inset 0 1px 0 rgba(255,255,255,0.95)",
};

export const eyebrow: React.CSSProperties = {
  fontSize: 22,
  letterSpacing: "0.5em",
  textTransform: "uppercase",
  color: T.ink3,
  fontWeight: 800,
  fontFamily: T.font,
};

/** 種子雜湊(粒子/爆發用,逐幀確定性) */
export const rnd = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
