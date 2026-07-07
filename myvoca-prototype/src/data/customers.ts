// Single source of truth for customer identity — replaces the old split
// between aiEngine.ts's CallScenario fixtures and mock.ts's customer360
// (which only ever fleshed out 王先生). Every page reads/writes through
// the shared app store (src/state/appStore.tsx), which seeds its
// `customers` map from CUSTOMER_SEED below.

export type CustomerId = 'wang' | 'chen' | 'lin'
export type ScenarioTag = 'network' | 'billing' | 'churn'

export interface ServiceHistoryEntry {
  date: string
  type: string
  status: string
}

export interface HistoryEntry {
  date: string
  channel: string
  summary: string
}

export interface Insight {
  icon: 'history' | 'risk' | 'strategy'
  text: string
}

export interface CustomerRecord {
  id: CustomerId
  name: string
  tier: string
  phone: string
  tenureYears: number
  scenarioTag: ScenarioTag
  openingLine: string
  customerLine: string
  emotion: string
  history: HistoryEntry[]
  serviceHistory: ServiceHistoryEntry[]
  lifetimeValue: string
  clv12m: string
  churnScore: number
  preferences: string[]
  emotionTrend: number[]
  insights: Insight[]
}

const OPENING_LINE = '您好，這裡是台灣大哥大智慧客服中心，我是您的 AI 服務專員。請問有什麼可以協助您？'

export const CUSTOMER_SEED: Record<CustomerId, CustomerRecord> = {
  wang: {
    id: 'wang',
    name: '王先生',
    tier: 'VIP',
    phone: '0912-***-568',
    tenureYears: 8,
    scenarioTag: 'network',
    openingLine: OPENING_LINE,
    customerLine: '最近我的網路一直斷線，昨天客服說會處理，但現在還沒有改善。',
    emotion: 'Concerned',
    history: [
      { date: '07/06', channel: '電話客服', summary: '反映網路斷線，已建立工單' },
      { date: '06/28', channel: 'App 客服', summary: '詢問光纖升速方案' },
      { date: '05/14', channel: '門市', summary: '5G 資費續約諮詢' },
    ],
    serviceHistory: [
      { date: '07/07', type: '網路障礙', status: '處理中' },
      { date: '07/06', type: '網路障礙', status: '已升級工程' },
      { date: '06/12', type: '網路障礙', status: '已結案' },
      { date: '05/03', type: '帳務詢問', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 286,400',
    clv12m: 'NT$ 38,900',
    churnScore: 78,
    preferences: ['偏好電話聯繫', '對價格敏感度低', '重視網路穩定度', '晚間 19-21 時可聯繫'],
    emotionTrend: [72, 68, 70, 61, 55, 48, 41],
    insights: [
      { icon: 'history', text: '此客戶過去 90 天曾三次反映網路問題' },
      { icon: 'risk', text: '流失風險：High（78 / 100）' },
      { icon: 'strategy', text: '最佳策略：主動提供光纖 1G 升級方案 + 補償折抵' },
    ],
  },
  chen: {
    id: 'chen',
    name: '陳小姐',
    tier: 'VIP',
    phone: '0987-***-231',
    tenureYears: 5,
    scenarioTag: 'billing',
    openingLine: OPENING_LINE,
    customerLine: '我這個月的帳單金額怎麼比平常多了三百塊，到底是為什麼多收費？',
    emotion: 'Frustrated',
    history: [
      { date: '07/05', channel: '電話客服', summary: '詢問月租費異動原因' },
      { date: '06/10', channel: 'App 客服', summary: '申請電子帳單' },
      { date: '03/22', channel: '門市', summary: '更換 SIM 卡' },
    ],
    serviceHistory: [
      { date: '07/05', type: '帳務爭議', status: '處理中' },
      { date: '06/10', type: '帳務詢問', status: '已結案' },
      { date: '03/22', type: '設備服務', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 154,200',
    clv12m: 'NT$ 27,600',
    churnScore: 46,
    preferences: ['偏好 App 自助服務', '對價格敏感度高', '重視帳務透明度'],
    emotionTrend: [40, 38, 45, 42, 50, 55, 58],
    insights: [
      { icon: 'history', text: '近 6 個月第 2 次詢問帳單異動' },
      { icon: 'risk', text: '流失風險：Medium（46 / 100）' },
      { icon: 'strategy', text: '最佳策略：主動核對帳務並說明計費規則，避免信任流失' },
    ],
  },
  lin: {
    id: 'lin',
    name: '林先生',
    tier: '一般會員',
    phone: '0966-***-704',
    tenureYears: 2,
    scenarioTag: 'churn',
    openingLine: OPENING_LINE,
    customerLine: '我想解約，別家資費比較便宜，你們可以退給我剩下的月費嗎？',
    emotion: 'Frustrated',
    history: [
      { date: '07/02', channel: '電話客服', summary: '詢問違約金計算方式' },
      { date: '06/18', channel: 'App 客服', summary: '比較其他電信資費' },
    ],
    serviceHistory: [
      { date: '07/02', type: '解約諮詢', status: '處理中' },
      { date: '06/18', type: '資費詢問', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 42,800',
    clv12m: 'NT$ 14,300',
    churnScore: 82,
    preferences: ['對價格敏感度極高', '曾比較競品資費', '偏好簡訊聯繫'],
    emotionTrend: [50, 55, 60, 68, 74, 79, 82],
    insights: [
      { icon: 'history', text: '30 天內兩次詢問解約與競品資費' },
      { icon: 'risk', text: '流失風險：High（82 / 100）' },
      { icon: 'strategy', text: '最佳策略：主動提出對等續約優惠，避免流失' },
    ],
  },
}

export function churnRiskLabel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}
