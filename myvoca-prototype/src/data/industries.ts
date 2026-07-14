// Proves the pitch's core claim in the code, not just in copy: swapping
// `industryId` swaps ONLY the knowledge (customers, KB, "service issue"
// keywords/recommendations) — the AI engine itself (src/data/aiEngine.ts)
// and every page/component are completely unchanged across industries.
import type { CustomerRecord } from './customers'
import type { ServiceOverride } from './aiEngine'
import type { KnowledgeEntry } from './knowledgeBase'
import { CUSTOMER_SEED } from './customers'
import { knowledgeBase as telecomKnowledgeBase } from './knowledgeBase'

export type IndustryId = 'telecom' | 'banking' | 'retail'

export interface OpsAlertSeed {
  text: string
  detail: string
}

export interface IndustryProfile {
  id: IndustryId
  name: string
  tagline: string
  serviceOverride?: ServiceOverride
  customers: Record<'wang' | 'chen' | 'lin', CustomerRecord>
  knowledgeBase: KnowledgeEntry[]
  primaryOpsAlert: OpsAlertSeed
  faqOpsAlert: OpsAlertSeed
}

const OPENING_LINE_BANKING = '您好，這裡是智慧客服中心，我是您的 AI 服務專員。請問有什麼可以協助您？'
const OPENING_LINE_RETAIL = OPENING_LINE_BANKING

const bankingCustomers: IndustryProfile['customers'] = {
  wang: {
    id: 'wang',
    name: '王先生',
    tier: '貴賓理財客戶',
    phone: '0912-***-568',
    tenureYears: 8,
    scenarioTag: 'network',
    openingLine: OPENING_LINE_BANKING,
    customerLine: '我這幾天用 App 轉帳一直失敗，昨天客服說會處理，但現在還是不行。',
    emotion: 'Concerned',
    history: [
      { date: '07/06', channel: '電話客服', summary: '反映 App 轉帳失敗，已建立工單' },
      { date: '06/28', channel: 'App 客服', summary: '詢問理財方案升級' },
      { date: '05/14', channel: '分行', summary: '貴賓理財續約諮詢' },
    ],
    serviceHistory: [
      { date: '07/07', type: 'App 異常', status: '處理中' },
      { date: '07/06', type: 'App 異常', status: '已升級工程' },
      { date: '06/12', type: 'App 異常', status: '已結案' },
      { date: '05/03', type: '帳務詢問', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 2,864,000',
    clv12m: 'NT$ 389,000',
    churnScore: 78,
    preferences: ['偏好電話聯繫', '對手續費敏感度低', '重視系統穩定度', '晚間 19-21 時可聯繫'],
    emotionTrend: [72, 68, 70, 61, 55, 48, 41],
    insights: [
      { icon: 'history', text: '此客戶過去 90 天曾三次反映 App 異常' },
      { icon: 'risk', text: '流失風險：High（78 / 100）' },
      { icon: 'strategy', text: '最佳策略：主動提供理財方案升級 + 手續費減免' },
    ],
  },
  chen: {
    id: 'chen',
    name: '陳小姐',
    tier: '貴賓理財客戶',
    phone: '0987-***-231',
    tenureYears: 5,
    scenarioTag: 'billing',
    openingLine: OPENING_LINE_BANKING,
    customerLine: '我這個月的信用卡帳單金額怎麼比平常多了三千塊，到底是為什麼多收費？',
    emotion: 'Frustrated',
    history: [
      { date: '07/05', channel: '電話客服', summary: '詢問信用卡年費異動原因' },
      { date: '06/10', channel: 'App 客服', summary: '申請電子帳單' },
      { date: '03/22', channel: '分行', summary: '更換信用卡' },
    ],
    serviceHistory: [
      { date: '07/05', type: '帳務爭議', status: '處理中' },
      { date: '06/10', type: '帳務詢問', status: '已結案' },
      { date: '03/22', type: '卡片服務', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 1,542,000',
    clv12m: 'NT$ 276,000',
    churnScore: 46,
    preferences: ['偏好 App 自助服務', '對手續費敏感度高', '重視帳務透明度'],
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
    openingLine: OPENING_LINE_BANKING,
    customerLine: '我想解約信用卡，別家銀行的年費比較便宜，你們可以退給我剩下的年費嗎？',
    emotion: 'Frustrated',
    history: [
      { date: '07/02', channel: '電話客服', summary: '詢問信用卡解約手續費' },
      { date: '06/18', channel: 'App 客服', summary: '比較其他銀行信用卡方案' },
    ],
    serviceHistory: [
      { date: '07/02', type: '解約諮詢', status: '處理中' },
      { date: '06/18', type: '資費詢問', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 428,000',
    clv12m: 'NT$ 143,000',
    churnScore: 82,
    preferences: ['對手續費敏感度極高', '曾比較競品銀行', '偏好簡訊聯繫'],
    emotionTrend: [50, 55, 60, 68, 74, 79, 82],
    insights: [
      { icon: 'history', text: '30 天內兩次詢問解約與競品銀行方案' },
      { icon: 'risk', text: '流失風險：High（82 / 100）' },
      { icon: 'strategy', text: '最佳策略：主動提出對等年費減免，避免流失' },
    ],
  },
}

const retailCustomers: IndustryProfile['customers'] = {
  wang: {
    id: 'wang',
    name: '王先生',
    tier: '白金會員',
    phone: '0912-***-568',
    tenureYears: 8,
    scenarioTag: 'network',
    openingLine: OPENING_LINE_RETAIL,
    customerLine: '我上週訂的商品到現在都還沒出貨，昨天客服說會處理，但現在還是查不到物流。',
    emotion: 'Concerned',
    history: [
      { date: '07/06', channel: '電話客服', summary: '反映訂單未出貨，已建立工單' },
      { date: '06/28', channel: 'App 客服', summary: '詢問會員升級方案' },
      { date: '05/14', channel: '門市', summary: '會員續卡諮詢' },
    ],
    serviceHistory: [
      { date: '07/07', type: '物流異常', status: '處理中' },
      { date: '07/06', type: '物流異常', status: '已升級工程' },
      { date: '06/12', type: '物流異常', status: '已結案' },
      { date: '05/03', type: '帳務詢問', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 286,400',
    clv12m: 'NT$ 38,900',
    churnScore: 78,
    preferences: ['偏好電話聯繫', '對價格敏感度低', '重視配送準確度', '晚間 19-21 時可聯繫'],
    emotionTrend: [72, 68, 70, 61, 55, 48, 41],
    insights: [
      { icon: 'history', text: '此客戶過去 90 天曾三次反映物流問題' },
      { icon: 'risk', text: '流失風險：High（78 / 100）' },
      { icon: 'strategy', text: '最佳策略：主動提供會員升級方案 + 運費折抵' },
    ],
  },
  chen: {
    id: 'chen',
    name: '陳小姐',
    tier: '白金會員',
    phone: '0987-***-231',
    tenureYears: 5,
    scenarioTag: 'billing',
    openingLine: OPENING_LINE_RETAIL,
    customerLine: '我這次訂單的金額怎麼比平常多了三百塊，到底是為什麼多收費？',
    emotion: 'Frustrated',
    history: [
      { date: '07/05', channel: '電話客服', summary: '詢問訂單金額異動原因' },
      { date: '06/10', channel: 'App 客服', summary: '申請電子發票' },
      { date: '03/22', channel: '門市', summary: '更換會員卡' },
    ],
    serviceHistory: [
      { date: '07/05', type: '帳務爭議', status: '處理中' },
      { date: '06/10', type: '帳務詢問', status: '已結案' },
      { date: '03/22', type: '會員服務', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 154,200',
    clv12m: 'NT$ 27,600',
    churnScore: 46,
    preferences: ['偏好 App 自助服務', '對價格敏感度高', '重視帳務透明度'],
    emotionTrend: [40, 38, 45, 42, 50, 55, 58],
    insights: [
      { icon: 'history', text: '近 6 個月第 2 次詢問訂單金額異動' },
      { icon: 'risk', text: '流失風險：Medium（46 / 100）' },
      { icon: 'strategy', text: '最佳策略：主動核對訂單並說明計費規則，避免信任流失' },
    ],
  },
  lin: {
    id: 'lin',
    name: '林先生',
    tier: '一般會員',
    phone: '0966-***-704',
    tenureYears: 2,
    scenarioTag: 'churn',
    openingLine: OPENING_LINE_RETAIL,
    customerLine: '我想取消會員資格，別家電商比較便宜，你們可以退給我剩下的會員費嗎？',
    emotion: 'Frustrated',
    history: [
      { date: '07/02', channel: '電話客服', summary: '詢問會員退費規則' },
      { date: '06/18', channel: 'App 客服', summary: '比較其他電商平台' },
    ],
    serviceHistory: [
      { date: '07/02', type: '退會諮詢', status: '處理中' },
      { date: '06/18', type: '會員詢問', status: '已結案' },
    ],
    lifetimeValue: 'NT$ 42,800',
    clv12m: 'NT$ 14,300',
    churnScore: 82,
    preferences: ['對價格敏感度極高', '曾比較競品電商', '偏好簡訊聯繫'],
    emotionTrend: [50, 55, 60, 68, 74, 79, 82],
    insights: [
      { icon: 'history', text: '30 天內兩次詢問退會與競品電商' },
      { icon: 'risk', text: '流失風險：High（82 / 100）' },
      { icon: 'strategy', text: '最佳策略：主動提出對等會員優惠，避免流失' },
    ],
  },
}

const bankingKnowledgeBase: KnowledgeEntry[] = [
  {
    id: 'kb-bank-1',
    question: 'App 轉帳失敗可以怎麼處理？',
    answer: '若連續 24 小時內轉帳失敗超過 3 次，可申請當月跨行手續費全免，並優先派工檢修系統。',
    sourceDoc: '《數位金融異常處理 SOP》第 2 章',
    keywords: ['轉帳', '失敗', '手續費', 'App'],
  },
  {
    id: 'kb-bank-2',
    question: '信用卡帳單金額異常要怎麼處理？',
    answer: '先核對近 3 期帳單與費率異動紀錄，若確認為系統誤收，客服可直接授權退費，最快 3 個工作日內退回原支付方式。',
    sourceDoc: '《帳務爭議處理 SOP》第 3 章',
    keywords: ['帳單', '金額', '退費', '收費'],
  },
  {
    id: 'kb-bank-3',
    question: '貴賓客戶解約可以提供什麼留客方案？',
    answer: '流失風險 High 的貴賓客戶，可主動提出「年費減免」：比對競品銀行費率後給予不遜於市場的優惠，並贈送 3 個月保管箱服務。',
    sourceDoc: '《客戶留存策略手冊》第 5 章',
    keywords: ['解約', '流失', '留客', '貴賓'],
  },
  {
    id: 'kb-bank-4',
    question: '理財方案升級有哪些選項？',
    answer: '目前主推「貴賓理財升級方案」與「基金定期定額優惠方案」，適合資產配置需求提升的客戶。',
    sourceDoc: '《理財商品手冊》2026 版',
    keywords: ['理財', '升級', '方案', '基金'],
  },
]

const retailKnowledgeBase: KnowledgeEntry[] = [
  {
    id: 'kb-retail-1',
    question: '訂單延遲出貨可以申請什麼補償？',
    answer: '白金會員遇訂單延遲出貨超過 3 天，可申請運費全免，並優先安排出貨排程。',
    sourceDoc: '《物流異常處理 SOP》第 2 章',
    keywords: ['出貨', '延遲', '補償', '物流'],
  },
  {
    id: 'kb-retail-2',
    question: '訂單金額異常要怎麼處理？',
    answer: '先核對訂單明細與優惠券使用紀錄，若確認為系統誤收，客服可直接授權退費，最快 3 個工作日內退回原支付方式。',
    sourceDoc: '《帳務爭議處理 SOP》第 3 章',
    keywords: ['訂單', '金額', '退費', '收費'],
  },
  {
    id: 'kb-retail-3',
    question: '白金會員取消會員可以提供什麼留客方案？',
    answer: '流失風險 High 的白金會員，可主動提出「會員優惠續約」：比對競品電商後給予不遜於市場的折扣券，並贈送 3 個月免運服務。',
    sourceDoc: '《會員留存策略手冊》第 5 章',
    keywords: ['取消', '流失', '留客', '會員'],
  },
  {
    id: 'kb-retail-4',
    question: '會員升級方案有哪些選項？',
    answer: '目前主推「白金會員升級方案」（含免運與生日禮）與「訂閱制優惠包」，適合高頻消費客戶。',
    sourceDoc: '《會員方案手冊》2026 版',
    keywords: ['升級', '方案', '會員', '訂閱'],
  },
]

export const industries: Record<IndustryId, IndustryProfile> = {
  telecom: {
    id: 'telecom',
    name: '電信',
    tagline: 'TAIPBX 語音骨幹 + MyVoca AI Service Brain',
    customers: CUSTOMER_SEED,
    knowledgeBase: telecomKnowledgeBase,
    primaryOpsAlert: {
      text: '網路品質問題增加 32%',
      detail: '主要集中於新北市板橋、中和區，建議通知網路工程中心',
    },
    faqOpsAlert: {
      text: '建議新增 FAQ',
      detail: '「5G 訊號優化設定」詢問量上升 47%，建議新增自助解決方案',
    },
  },
  banking: {
    id: 'banking',
    name: '銀行金融',
    tagline: '同一套 AI 大腦，換上金融知識與流程',
    serviceOverride: {
      label: 'Transaction Issue',
      keywords: ['轉帳', '扣款', '當機', '無法登入', '提款', '刷卡', 'App', '連不上', '系統'],
      recommendations: [
        { step: 1, title: '確認系統狀態', detail: '遠端偵測 App / 核心系統近期異常紀錄', icon: 'shield' },
        { step: 2, title: '提供手續費減免', detail: '依會員等級評估減免資格，主動提出而非等客戶要求', icon: 'gift' },
        { step: 3, title: '升級技術工程', detail: '若已排除基本故障，直接轉單至資訊工程處理', icon: 'shield' },
      ],
    },
    customers: bankingCustomers,
    knowledgeBase: bankingKnowledgeBase,
    primaryOpsAlert: {
      text: 'App 轉帳異常增加 28%',
      detail: '主要集中於跨行轉帳時段，建議通知資訊工程中心',
    },
    faqOpsAlert: {
      text: '建議新增 FAQ',
      detail: '「App 生物辨識登入設定」詢問量上升 41%，建議新增自助解決方案',
    },
  },
  retail: {
    id: 'retail',
    name: '零售電商',
    tagline: '同一套 AI 大腦，換上零售知識與流程',
    serviceOverride: {
      label: 'Fulfillment Issue',
      keywords: ['出貨', '延遲', '缺貨', '物流', '退貨', '包裹', '配送', '查不到'],
      recommendations: [
        { step: 1, title: '確認物流狀態', detail: '即時查詢倉儲與配送商近期異常紀錄', icon: 'shield' },
        { step: 2, title: '提供運費補償', detail: '依會員等級評估補償資格，主動提出而非等客戶要求', icon: 'gift' },
        { step: 3, title: '升級物流工程', detail: '若已排除基本延誤，直接轉單至物流商處理', icon: 'shield' },
      ],
    },
    customers: retailCustomers,
    knowledgeBase: retailKnowledgeBase,
    primaryOpsAlert: {
      text: '物流延遲問題增加 25%',
      detail: '主要集中於雙北地區配送商，建議通知物流合作夥伴',
    },
    faqOpsAlert: {
      text: '建議新增 FAQ',
      detail: '「訂單查詢與退貨流程」詢問量上升 38%，建議新增自助解決方案',
    },
  },
}
