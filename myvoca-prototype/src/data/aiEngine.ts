// Lightweight rule-based "AI brain" used to make the prototype react to
// live, freely-typed customer utterances instead of only replaying a fixed
// script. Keyword buckets stand in for a real NLU model — same interface a
// production intent/emotion classifier would expose.

export type IntentId = 'network' | 'billing' | 'churn' | 'upsell' | 'compliment' | 'general'
export type EmotionId = 'frustrated' | 'concerned' | 'positive' | 'neutral'

export interface Recommendation {
  step: number
  title: string
  detail: string
  icon: 'router' | 'receipt' | 'shield' | 'gift' | 'trending' | 'heart' | 'help'
}

export interface ScoredCandidate<T extends string> {
  id: T
  label: string
  score: number
  matchedKeywords: string[]
}

// The 'network' category is the one intent that's genuinely industry-specific
// (telecom's "斷線/網路" doesn't generalize to a bank's "轉帳失敗" or a retailer's
// "缺貨出貨"). Everything else — billing, churn, upsell, compliment, emotion —
// is a universal business concept and stays identical across industries. An
// IndustryProfile (src/data/industries.ts) supplies this override; passing
// none keeps the telecom defaults below.
export interface ServiceOverride {
  label: string
  keywords: string[]
  recommendations: Recommendation[]
}

export interface AnalysisResult {
  intentId: IntentId
  intentLabel: string
  intentConfidence: number
  emotionId: EmotionId
  emotionLabel: string
  emotionIntensity: number
  purchaseSignal: boolean
  purchaseNote: string | null
  recommendations: Recommendation[]
  whisperTips: { type: 'alert' | 'coach'; text: string }[]
  suggestedReply: string
  /** Full ranked candidate list (winner first) — powers the optional AI-reasoning panel. */
  intentCandidates: ScoredCandidate<IntentId>[]
  emotionCandidates: ScoredCandidate<EmotionId>[]
}

const INTENT_KEYWORDS: Record<Exclude<IntentId, 'general'>, string[]> = {
  network: ['斷線', '網路', '訊號', '連不上', '頻寬', 'wifi', 'Wi-Fi', '光纖', '很慢', '龜速', '不穩'],
  billing: ['帳單', '扣款', '收費', '退費', '金額', '發票', '月租費', '多收', '算錯'],
  churn: ['解約', '退租', '取消', '不想用了', '轉台', '別家', '換電信', '退租'],
  upsell: ['升速', '升級', '方案', '加購', '更快', '上課', '線上課', '遊戲', '4K', '追劇', '小孩', '在家'],
  compliment: ['謝謝', '滿意', '很棒', '讚', '感謝', '辛苦了'],
}

const EMOTION_KEYWORDS: Record<Exclude<EmotionId, 'neutral'>, string[]> = {
  frustrated: ['一直', '到底', '沒有處理', '很不好', '生氣', '不滿', '抱怨', '爛', '誰負責', '很差', '受不了'],
  concerned: ['擔心', '不確定', '會不會', '怎麼辦', '不安', '怕'],
  positive: ['謝謝', '滿意', '很棒', '好的', '感謝', '沒問題', '可以'],
}

const INTENT_LABELS: Record<IntentId, string> = {
  network: 'Network Issue',
  billing: 'Billing Dispute',
  churn: 'Cancellation Risk',
  upsell: 'Upgrade Opportunity',
  compliment: 'Positive Feedback',
  general: 'General Inquiry',
}

const EMOTION_LABELS: Record<EmotionId, string> = {
  frustrated: 'Frustrated',
  concerned: 'Concerned',
  positive: 'Positive',
  neutral: 'Neutral',
}

const RECOMMENDATIONS: Record<IntentId, Recommendation[]> = {
  network: [
    { step: 1, title: '確認設備狀態', detail: '遠端偵測 CPE 數據機訊號品質與近期斷線紀錄', icon: 'router' },
    { step: 2, title: '提供補償方案', detail: '依會員等級評估折抵資格，主動提出而非等客戶要求', icon: 'gift' },
    { step: 3, title: '升級網路工程', detail: '若已排除基本故障，直接轉單至網路工程處理', icon: 'shield' },
  ],
  billing: [
    { step: 1, title: '調閱帳務明細', detail: '秒級拉出近 3 期帳單與計費規則比對', icon: 'receipt' },
    { step: 2, title: '判斷是否誤扣', detail: 'AI 比對資費異動紀錄，自動標記異常項目', icon: 'shield' },
    { step: 3, title: '主動提出退款', detail: '若確認誤收，直接提供退費金額與到帳時間', icon: 'gift' },
  ],
  churn: [
    { step: 1, title: '啟動保留名單', detail: '標記高流失風險，通知客戶關懷團隊 24 小時內跟進', icon: 'shield' },
    { step: 2, title: '調閱歷史貢獻', detail: '呈現此客戶的長期價值，作為留客方案依據', icon: 'receipt' },
    { step: 3, title: '提出對等方案', detail: '比對競品資費，提供不遜於市場的續約優惠', icon: 'gift' },
  ],
  upsell: [
    { step: 1, title: '識別需求場景', detail: '從對話內容判斷頻寬 / 資費使用情境', icon: 'trending' },
    { step: 2, title: '推薦對應方案', detail: '媒合最符合當前需求的升級或加購選項', icon: 'gift' },
    { step: 3, title: '同步發送確認', detail: '成交後由 M+ 自動發送方案確認與後續追蹤', icon: 'heart' },
  ],
  compliment: [
    { step: 1, title: '記錄正向回饋', detail: '同步存入客戶檔案，作為關係經營參考', icon: 'heart' },
    { step: 2, title: '評估交叉推薦', detail: '滿意度高時機，適度推薦相關服務', icon: 'trending' },
    { step: 3, title: '結尾主動關懷', detail: '確認是否還有其他可協助事項', icon: 'help' },
  ],
  general: [
    { step: 1, title: '釐清問題類型', detail: 'AI 持續監聽對話，等待更多語意訊號進一步分類', icon: 'help' },
    { step: 2, title: '提供標準協助', detail: '依常見問題資料庫給出初步回應', icon: 'shield' },
    { step: 3, title: '保持追蹤彈性', detail: '若對話轉向明確意圖，即時切換建議', icon: 'help' },
  ],
}

// Returns every candidate (winner first), each with its matched keywords —
// the single source of truth for both the final classification and the
// optional "AI reasoning" transparency panel.
//
// Ranking key is raw matchedKeywords.length, NOT the displayed score: the
// score formula clamps at 97/96, so any sentence hitting 3+ keywords in two
// different categories would tie on score and (since score-based sorting is
// stable) silently fall back to declaration order — e.g. a sentence about
// upgrading that merely mentions "網路" would misclassify as Network Issue
// just because 'network' is declared before 'upsell'. Sorting by the
// uncapped match count avoids that. The general/neutral fallback is pushed
// FIRST so it wins ties (0 matches) against any specific category that also
// matched nothing, exactly like the pre-refactor detectIntent/detectEmotion.
function scoreIntentCandidates(text: string, serviceOverride?: ServiceOverride): ScoredCandidate<IntentId>[] {
  const clean = text.trim()
  const lenBonus = Math.min(clean.length, 20)
  const candidates: ScoredCandidate<IntentId>[] = [
    {
      id: 'general',
      label: INTENT_LABELS.general,
      score: clean.length === 0 ? 0 : Math.min(97, 74 + lenBonus),
      matchedKeywords: [],
    },
  ]
  for (const id of Object.keys(INTENT_KEYWORDS) as Exclude<IntentId, 'general'>[]) {
    const keywordPool = id === 'network' && serviceOverride ? serviceOverride.keywords : INTENT_KEYWORDS[id]
    const label = id === 'network' && serviceOverride ? serviceOverride.label : INTENT_LABELS[id]
    const matchedKeywords = clean.length === 0 ? [] : keywordPool.filter((kw) => clean.includes(kw))
    const score = clean.length === 0 ? 0 : Math.min(97, 74 + matchedKeywords.length * 7 + lenBonus)
    candidates.push({ id, label, score, matchedKeywords })
  }
  candidates.sort((a, b) => b.matchedKeywords.length - a.matchedKeywords.length)
  return candidates
}

function scoreEmotionCandidates(text: string): ScoredCandidate<EmotionId>[] {
  const clean = text.trim()
  const candidates: ScoredCandidate<EmotionId>[] = [
    {
      id: 'neutral',
      label: EMOTION_LABELS.neutral,
      score: clean.length === 0 ? 0 : 58,
      matchedKeywords: [],
    },
  ]
  for (const id of Object.keys(EMOTION_KEYWORDS) as Exclude<EmotionId, 'neutral'>[]) {
    const matchedKeywords = clean.length === 0 ? [] : EMOTION_KEYWORDS[id].filter((kw) => clean.includes(kw))
    const score = clean.length === 0 ? 0 : Math.min(96, 58 + matchedKeywords.length * 11)
    candidates.push({ id, label: EMOTION_LABELS[id], score, matchedKeywords })
  }
  candidates.sort((a, b) => b.matchedKeywords.length - a.matchedKeywords.length)
  return candidates
}

function buildWhisperTips(intentId: IntentId, emotionId: EmotionId): AnalysisResult['whisperTips'] {
  const tips: AnalysisResult['whisperTips'] = []
  if (emotionId === 'frustrated') {
    tips.push({ type: 'alert', text: '客戶情緒偏向不滿，建議先同理再處理' })
  } else if (emotionId === 'concerned') {
    tips.push({ type: 'alert', text: '客戶語氣略顯不安，給予明確承諾與時程' })
  } else if (emotionId === 'positive') {
    tips.push({ type: 'coach', text: '客戶情緒正向，適合順勢推薦加值服務' })
  }
  if (intentId === 'upsell') {
    tips.push({ type: 'coach', text: '偵測到升級需求，建議直接帶出方案價格' })
  } else if (intentId === 'churn') {
    tips.push({ type: 'coach', text: '流失風險偏高，先留住客戶再談方案細節' })
  } else if (intentId === 'billing') {
    tips.push({ type: 'coach', text: '先核對帳務事實，避免與客戶爭執金額' })
  } else if (tips.length < 2) {
    tips.push({ type: 'coach', text: '建議先確認需求細節，再給出對應方案' })
  }
  return tips.slice(0, 2)
}

function buildSuggestedReply(customerName: string, intentId: IntentId, emotionId: EmotionId): string {
  const empathy = emotionId === 'frustrated' ? `${customerName}，非常抱歉造成您的困擾，` : `${customerName}，感謝您的耐心，`
  switch (intentId) {
    case 'network':
      return `${empathy}我先協助確認目前設備與線路狀態，並同步為您申請補償方案。`
    case 'billing':
      return `${empathy}我立即調閱帳務明細為您核對，如有誤收會馬上處理退費。`
    case 'churn':
      return `${empathy}在您決定之前，我想先了解狀況，也想為您爭取更合適的續約方案。`
    case 'upsell':
      return `${empathy}聽起來目前的方案可能不夠用，我這邊有更適合的升級選項可以介紹給您。`
    case 'compliment':
      return `${empathy}謝謝您的肯定，這對我們是很大的鼓勵，還有什麼可以協助您的嗎？`
    default:
      return `${empathy}我先了解一下您的狀況，再為您安排最合適的處理方式。`
  }
}

export function analyzeUtterance(
  text: string,
  customerName = '這位客戶',
  serviceOverride?: ServiceOverride,
): AnalysisResult {
  const intentCandidates = scoreIntentCandidates(text, serviceOverride)
  const emotionCandidates = scoreEmotionCandidates(text)
  const intent = intentCandidates[0]
  const emotion = emotionCandidates[0]

  const purchaseSignal = intent.id === 'upsell' && intent.matchedKeywords.length > 0
  const purchaseNote = purchaseSignal
    ? '偵測到潛在購買訊號 — 對話中出現升級 / 加購相關語意'
    : null

  const recommendations = intent.id === 'network' && serviceOverride ? serviceOverride.recommendations : RECOMMENDATIONS[intent.id]

  return {
    intentId: intent.id,
    intentLabel: intent.label,
    intentConfidence: intent.score,
    emotionId: emotion.id,
    emotionLabel: emotion.label,
    emotionIntensity: emotion.score,
    purchaseSignal,
    purchaseNote,
    recommendations,
    whisperTips: buildWhisperTips(intent.id, emotion.id),
    suggestedReply: buildSuggestedReply(customerName, intent.id, emotion.id),
    intentCandidates,
    emotionCandidates,
  }
}

export const quickReplies: { label: string; text: string }[] = [
  { label: '網路斷線', text: '我的網路又斷線了，這已經是這個月第三次，你們到底有沒有在處理？' },
  { label: '帳單異常', text: '這個月的帳單金額不對，好像被多收了一筆錢，可以幫我查一下嗎？' },
  { label: '考慮解約', text: '我在考慮解約轉去別家，因為你們的資費真的太貴了。' },
  { label: '升級需求', text: '小孩最近都在家上線上課程，網路速度不太夠，有沒有更快的方案？' },
  { label: '表達感謝', text: '謝謝你們這次處理得很快，服務很棒，我很滿意。' },
]
