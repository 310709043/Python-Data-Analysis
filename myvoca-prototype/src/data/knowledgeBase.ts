export interface KnowledgeEntry {
  id: string
  question: string
  answer: string
  sourceDoc: string
  keywords: string[]
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: 'kb-1',
    question: '網路中斷可以申請什麼補償？',
    answer: 'VIP 會員遇連續 24 小時內斷線超過 3 次，可申請當月月租費折抵 15%，並優先派工檢修。',
    sourceDoc: '《網路中斷補償處理 SOP》第 2 章',
    keywords: ['網路', '斷線', '補償', '折抵'],
  },
  {
    id: 'kb-2',
    question: '帳單金額異常要怎麼處理？',
    answer: '先核對近 3 期帳單與資費異動紀錄，若確認為系統誤收，客服可直接授權退費，最快 3 個工作日內退回原支付方式。',
    sourceDoc: '《帳務爭議處理 SOP》第 3 章',
    keywords: ['帳單', '金額', '退費', '收費'],
  },
  {
    id: 'kb-3',
    question: 'VIP 客戶解約可以提供什麼留客方案？',
    answer: '流失風險 High 的 VIP 客戶，可主動提出「續約優惠」：比對競品資費後給予不遜於市場的續約折扣，並贈送 3 個月加值服務。',
    sourceDoc: '《客戶留存策略手冊》第 5 章',
    keywords: ['解約', '流失', '留客', 'VIP'],
  },
  {
    id: 'kb-4',
    question: '家用網路升速方案有哪些選項？',
    answer: '目前主推「家用光纖 500M 升速方案」（+NT$300/月）與「光纖 1G 全方位升級方案」（+NT$350/月），適合多人同時使用或線上學習情境。',
    sourceDoc: '《家用寬頻資費手冊》2026 版',
    keywords: ['升速', '升級', '光纖', '方案'],
  },
  {
    id: 'kb-5',
    question: '客服可以主動提供哪些加值服務？',
    answer: '客戶情緒正向時，可順勢推薦影音娛樂加值包（4K 串流，+NT$199/月）或雲端備份服務，作為交叉銷售機會。',
    sourceDoc: '《加值服務銷售指引》第 1 章',
    keywords: ['加值', '推薦', '交叉銷售', '4K'],
  },
  {
    id: 'kb-6',
    question: '新人客服上線前需要完成哪些訓練？',
    answer: '需完成 AI Service Twin 模擬情境訓練（涵蓋網路、帳務、解約三類情境）並達到 90% 以上話術符合度，才能獨立接聽來電。',
    sourceDoc: '《客服新人訓練手冊》第 4 章',
    keywords: ['新人', '訓練', 'Twin', '上線'],
  },
]

export interface KnowledgeLookupResult {
  hit: boolean
  entry: KnowledgeEntry | null
}

export function lookupKnowledge(query: string, pool: KnowledgeEntry[] = knowledgeBase): KnowledgeLookupResult {
  const clean = query.trim()
  if (!clean) return { hit: false, entry: null }
  const entry = pool.find((e) => e.keywords.some((kw) => clean.includes(kw)))
  return { hit: !!entry, entry: entry ?? null }
}
