// Central mock data for the MyVoca prototype demo.

export interface TranscriptLine {
  speaker: 'customer' | 'agent' | 'ai'
  name: string
  text: string
}

export const demoTranscript: TranscriptLine[] = [
  {
    speaker: 'ai',
    name: 'MyVoca AI',
    text: '您好，這裡是台灣大哥大智慧客服中心，我是您的 AI 服務專員。請問有什麼可以協助您？',
  },
  {
    speaker: 'customer',
    name: '王先生',
    text: '最近我的網路一直斷線，昨天客服說會處理，但現在還沒有改善。',
  },
]

export const aiRecommendations = [
  {
    step: 1,
    title: '確認設備狀態',
    detail: '遠端偵測 CPE 數據機訊號品質，近 24 小時斷線 4 次',
    icon: 'router',
  },
  {
    step: 2,
    title: '提供補償方案',
    detail: 'VIP 客戶符合「網路中斷補償」資格，建議折抵當月費用 15%',
    icon: 'gift',
  },
  {
    step: 3,
    title: '避免重複詢問',
    detail: '昨日已完成基本排除流程，直接升級至網路工程處理',
    icon: 'shield',
  },
]

export const whisperTips = [
  { type: 'alert', text: '客戶目前情緒下降' },
  { type: 'coach', text: '建議先同理，再提供方案' },
]

export const whisperSuggestedReply =
  '王先生，非常抱歉造成您的困擾，我先協助確認目前設備狀態。'

export const customerProfile = {
  name: '王先生',
  tier: 'VIP',
  phone: '0912-***-568',
  tenureYears: 8,
  plan: '5G 雙飽 999 + 家用光纖 300M',
  emotion: 'Concerned',
  history: [
    { date: '07/06', channel: '電話客服', summary: '反映網路斷線，已建立工單' },
    { date: '06/28', channel: 'App 客服', summary: '詢問光纖升速方案' },
    { date: '05/14', channel: '門市', summary: '5G 資費續約諮詢' },
  ],
}

export const customer360 = {
  lifetimeValue: 'NT$ 286,400',
  clv12m: 'NT$ 38,900',
  churnRisk: 'High',
  churnScore: 78,
  preferences: ['偏好電話聯繫', '對價格敏感度低', '重視網路穩定度', '晚間 19-21 時可聯繫'],
  emotionTrend: [72, 68, 70, 61, 55, 48, 41],
  insights: [
    { icon: 'history', text: '此客戶過去 90 天曾三次反映網路問題' },
    { icon: 'risk', text: '流失風險：High（78 / 100）' },
    { icon: 'strategy', text: '最佳策略：主動提供光纖 1G 升級方案 + 補償折抵' },
  ],
  serviceHistory: [
    { date: '07/07', type: '網路障礙', status: '處理中' },
    { date: '07/06', type: '網路障礙', status: '已升級工程' },
    { date: '06/12', type: '網路障礙', status: '已結案' },
    { date: '05/03', type: '帳務詢問', status: '已結案' },
  ],
}

export const opsInsights = [
  { rank: 1, text: '網路品質問題增加 32%', detail: '主要集中於新北市板橋、中和區，建議通知網路工程中心', severity: 'high' },
  { rank: 2, text: 'VIP 客戶流失風險 5 人', detail: 'AI 已生成挽留策略，建議 24 小時內主動關懷', severity: 'high' },
  { rank: 3, text: '建議新增 FAQ', detail: '「5G 訊號優化設定」詢問量上升 47%，建議新增自助解決方案', severity: 'medium' },
]

export const hourlyCalls = [42, 58, 75, 96, 120, 142, 128, 110, 132, 148, 125, 98]

export const teamAgents = [
  { name: 'Eric Chen', calls: 32, csat: 4.9, aiAssist: 96, status: 'online' },
  { name: 'Amy Lin', calls: 28, csat: 4.8, aiAssist: 92, status: 'online' },
  { name: 'Kevin Wu', calls: 25, csat: 4.7, aiAssist: 88, status: 'busy' },
  { name: 'Sandy Ho', calls: 21, csat: 4.6, aiAssist: 85, status: 'away' },
]
