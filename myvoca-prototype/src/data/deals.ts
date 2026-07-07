import type { AnalysisResult } from './aiEngine'
import type { CustomerId } from './customers'

export interface Deal {
  id: string
  customerId: CustomerId
  customerName: string
  planName: string
  mrrDelta: number
  channel: 'voice' | 'chat'
  createdAt: number
  note: string
}

interface PlanOption {
  planName: string
  mrrDelta: number
  keywords: string[]
}

const PLAN_CATALOG: PlanOption[] = [
  { planName: '家用光纖升速方案（500M）', mrrDelta: 300, keywords: ['小孩', '上課', '線上課', '在家'] },
  { planName: '影音娛樂加值包（4K 串流）', mrrDelta: 199, keywords: ['4K', '追劇', '遊戲'] },
  { planName: '光纖 1G 全方位升級方案', mrrDelta: 350, keywords: ['更快', '升速', '升級'] },
]

function resolveUpsellPlan(analysis: AnalysisResult): PlanOption {
  // Match against the keywords the engine actually found in the customer's
  // own words (not the AI's templated reply, which always says "升級" and
  // would otherwise make every upsell resolve to the same generic plan).
  const matched = analysis.intentCandidates.find((c) => c.id === 'upsell')?.matchedKeywords ?? []
  for (const plan of PLAN_CATALOG) {
    if (plan.keywords.some((kw) => matched.includes(kw))) return plan
  }
  return PLAN_CATALOG[PLAN_CATALOG.length - 1]
}

let dealSeq = 0

export function createDealFromAnalysis(
  customerId: CustomerId,
  customerName: string,
  analysis: AnalysisResult,
  channel: 'voice' | 'chat',
): Deal {
  dealSeq += 1
  const plan = resolveUpsellPlan(analysis)
  const today = new Date()
  const dateTag = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  return {
    id: `TM-${dateTag}-${String(dealSeq).padStart(3, '0')}`,
    customerId,
    customerName,
    planName: plan.planName,
    mrrDelta: plan.mrrDelta,
    channel,
    createdAt: Date.now(),
    note: analysis.purchaseNote ?? '透過 AI 對話識別的升級需求',
  }
}
