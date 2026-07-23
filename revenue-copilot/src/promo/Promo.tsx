import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Fade } from "./kit";
import {
  S1Chaos, S2Freeze, S3Compare, S4Core, S5Insight,
  S6NBA, S7Match, S8Copilot, S9Chain, S10Brand,
} from "./scenes";

/** MyAgent+ 直式電影感宣傳片 · 9:16 1080×1920 · 30fps · 180s / 5400f
 *  S1 0–600     壓迫與混亂
 *  S2 600–900   急停 Glitch
 *  S3 900–1500  傳統 vs MyAgent
 *  S4 1500–2100 核心價值鏈
 *  S5 2100–2550 客戶洞察 + 雷達
 *  S6 2550–3150 Next Best Action
 *  S7 3150–3600 智慧銷售匹配
 *  S8 3600–4500 即時 Copilot
 *  S9 4500–5100 價值鏈回顧
 *  S10 5100–5400 品牌收尾
 */
const S: React.FC<{ from: number; dur: number; fi?: number; fo?: number; children: React.ReactNode }> = ({ from, dur, fi, fo, children }) => (
  <Sequence from={from} durationInFrames={dur}>
    <Fade d={dur} fi={fi} fo={fo}>{children}</Fade>
  </Sequence>
);

export const PromoVertical: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0A0503" }}>
      <S from={0} dur={600} fi={8} fo={10}><S1Chaos /></S>
      <S from={600} dur={300} fi={4} fo={14}><S2Freeze /></S>
      <S from={900} dur={600}><S3Compare /></S>
      <S from={1500} dur={600}><S4Core /></S>
      <S from={2100} dur={450}><S5Insight /></S>
      <S from={2550} dur={600}><S6NBA /></S>
      <S from={3150} dur={450}><S7Match /></S>
      <S from={3600} dur={900}><S8Copilot /></S>
      <S from={4500} dur={600}><S9Chain /></S>
      <S from={5100} dur={300} fo={20}><S10Brand /></S>
    </AbsoluteFill>
  );
};
