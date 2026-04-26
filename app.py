import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st
import yfinance as yf


st.set_page_config(page_title="黃金兌美金技術分析平台", layout="wide")
st.title("🥇 黃金兌美金（XAU/USD）技術分析平台")
st.caption("資料來源：Yahoo Finance（GC=F 黃金期貨）")


def load_data(period: str, interval: str) -> pd.DataFrame:
    df = yf.download("GC=F", period=period, interval=interval, auto_adjust=False, progress=False)
    if df.empty:
        return df
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] for c in df.columns]
    df = df.rename(columns=str.title)
    required_cols = ["Open", "High", "Low", "Close", "Volume"]
    for col in required_cols:
        if col not in df.columns:
            df[col] = np.nan
    return df[["Open", "High", "Low", "Close", "Volume"]].dropna(subset=["Open", "High", "Low", "Close"])


def add_indicators(df: pd.DataFrame, sma_fast: int, sma_slow: int, rsi_period: int):
    out = df.copy()
    out["SMA_FAST"] = out["Close"].rolling(sma_fast).mean()
    out["SMA_SLOW"] = out["Close"].rolling(sma_slow).mean()

    delta = out["Close"].diff()
    gain = np.where(delta > 0, delta, 0.0)
    loss = np.where(delta < 0, -delta, 0.0)
    gain_ema = pd.Series(gain, index=out.index).ewm(alpha=1 / rsi_period, adjust=False).mean()
    loss_ema = pd.Series(loss, index=out.index).ewm(alpha=1 / rsi_period, adjust=False).mean()
    rs = gain_ema / (loss_ema.replace(0, np.nan))
    out["RSI"] = 100 - (100 / (1 + rs))

    ema12 = out["Close"].ewm(span=12, adjust=False).mean()
    ema26 = out["Close"].ewm(span=26, adjust=False).mean()
    out["MACD"] = ema12 - ema26
    out["MACD_SIGNAL"] = out["MACD"].ewm(span=9, adjust=False).mean()
    out["MACD_HIST"] = out["MACD"] - out["MACD_SIGNAL"]

    out["BB_MID"] = out["Close"].rolling(20).mean()
    std20 = out["Close"].rolling(20).std()
    out["BB_UPPER"] = out["BB_MID"] + 2 * std20
    out["BB_LOWER"] = out["BB_MID"] - 2 * std20

    return out


def generate_signal(df: pd.DataFrame) -> str:
    latest = df.iloc[-1]
    bullish = 0
    bearish = 0

    if latest["SMA_FAST"] > latest["SMA_SLOW"]:
        bullish += 1
    else:
        bearish += 1

    if latest["RSI"] < 30:
        bullish += 1
    elif latest["RSI"] > 70:
        bearish += 1

    if latest["MACD"] > latest["MACD_SIGNAL"]:
        bullish += 1
    else:
        bearish += 1

    if latest["Close"] < latest["BB_LOWER"]:
        bullish += 1
    elif latest["Close"] > latest["BB_UPPER"]:
        bearish += 1

    if bullish >= bearish + 2:
        return "🟢 偏多（可關注做多機會）"
    if bearish >= bullish + 2:
        return "🔴 偏空（可關注做空機會）"
    return "🟡 中性（等待更明確訊號）"


with st.sidebar:
    st.header("參數設定")
    period = st.selectbox("歷史區間", ["1mo", "3mo", "6mo", "1y", "2y", "5y"], index=3)
    interval = st.selectbox("K 線週期", ["1h", "4h", "1d", "1wk"], index=2)
    sma_fast = st.slider("短期 SMA", min_value=5, max_value=60, value=20)
    sma_slow = st.slider("長期 SMA", min_value=20, max_value=200, value=60)
    rsi_period = st.slider("RSI 週期", min_value=7, max_value=30, value=14)

if sma_fast >= sma_slow:
    st.error("短期 SMA 必須小於長期 SMA，請調整參數。")
    st.stop()

raw = load_data(period, interval)
if raw.empty:
    st.warning("目前無法取得資料，請稍後再試。")
    st.stop()

frame = add_indicators(raw, sma_fast=sma_fast, sma_slow=sma_slow, rsi_period=rsi_period)
latest = frame.iloc[-1]

col1, col2, col3, col4 = st.columns(4)
col1.metric("最新收盤價", f"{latest['Close']:.2f}")
col2.metric("RSI", f"{latest['RSI']:.2f}")
col3.metric("MACD", f"{latest['MACD']:.2f}")
col4.metric("策略判斷", generate_signal(frame))

fig = go.Figure()
fig.add_trace(
    go.Candlestick(
        x=frame.index,
        open=frame["Open"],
        high=frame["High"],
        low=frame["Low"],
        close=frame["Close"],
        name="XAU/USD",
    )
)
fig.add_trace(go.Scatter(x=frame.index, y=frame["SMA_FAST"], name=f"SMA{sma_fast}"))
fig.add_trace(go.Scatter(x=frame.index, y=frame["SMA_SLOW"], name=f"SMA{sma_slow}"))
fig.add_trace(go.Scatter(x=frame.index, y=frame["BB_UPPER"], name="布林上軌", line=dict(dash="dot")))
fig.add_trace(go.Scatter(x=frame.index, y=frame["BB_LOWER"], name="布林下軌", line=dict(dash="dot")))
fig.update_layout(height=600, xaxis_rangeslider_visible=False, title="黃金價格與均線/布林通道")
st.plotly_chart(fig, use_container_width=True)

st.subheader("RSI")
st.line_chart(frame[["RSI"]])
st.subheader("MACD")
st.bar_chart(frame[["MACD_HIST"]])
st.line_chart(frame[["MACD", "MACD_SIGNAL"]])

st.subheader("最近資料")
st.dataframe(frame.tail(30), use_container_width=True)

st.info("⚠️ 本平台僅供教育與研究用途，非投資建議。")
