import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { CustomerId, CustomerRecord } from '../data/customers'
import type { AnalysisResult } from '../data/aiEngine'
import type { Deal } from '../data/deals'
import { industries, type IndustryId } from '../data/industries'

export interface OpsAlert {
  id: string
  rank: number
  text: string
  detail: string
  severity: 'high' | 'medium'
}

export interface QualityCheckResult {
  id: string
  transcriptLabel: string
  overallScore: number
  checkedAt: number
}

export interface Metrics {
  aiResolutionCount: number
  humanTransferCount: number
  dealsClosedCount: number
  dealsMrrTotal: number
  minutesSavedEstimate: number
  retentionPlansTriggered: number
  kbLookupCount: number
  vipRiskCount: number
  /** Calls handed off to a human agent this demo session — surfaced on
   *  Eric Chen's row in OperationDashboard's team table. */
  agentHandoffCount: number
}

export interface AppState {
  industryId: IndustryId
  customers: Record<CustomerId, CustomerRecord>
  activeCustomerId: CustomerId
  deals: Deal[]
  opsAlerts: OpsAlert[]
  qualityChecks: QualityCheckResult[]
  metrics: Metrics
  showReasoning: boolean
}

const INITIAL_VIP_RISK_COUNT = 5

function buildOpsAlerts(industryId: IndustryId, vipRiskCount: number): OpsAlert[] {
  const profile = industries[industryId]
  return [
    {
      id: 'seed-primary',
      rank: 1,
      text: profile.primaryOpsAlert.text,
      detail: profile.primaryOpsAlert.detail,
      severity: 'high',
    },
    {
      id: 'seed-vip-risk',
      rank: 2,
      text: `VIP 客戶流失風險 ${vipRiskCount} 人`,
      detail: 'AI 已生成挽留策略，建議 24 小時內主動關懷',
      severity: 'high',
    },
    {
      id: 'seed-faq',
      rank: 3,
      text: profile.faqOpsAlert.text,
      detail: profile.faqOpsAlert.detail,
      severity: 'medium',
    },
  ]
}

function initialState(industryId: IndustryId = 'telecom'): AppState {
  return {
    industryId,
    customers: JSON.parse(JSON.stringify(industries[industryId].customers)),
    activeCustomerId: 'wang',
    deals: [],
    opsAlerts: buildOpsAlerts(industryId, INITIAL_VIP_RISK_COUNT),
    qualityChecks: [],
    metrics: {
      aiResolutionCount: 0,
      humanTransferCount: 0,
      dealsClosedCount: 0,
      dealsMrrTotal: 0,
      minutesSavedEstimate: 0,
      retentionPlansTriggered: 0,
      kbLookupCount: 0,
      vipRiskCount: INITIAL_VIP_RISK_COUNT,
      agentHandoffCount: 0,
    },
    showReasoning: false,
  }
}

function clamp(v: number, min = 5, max = 95) {
  return Math.max(min, Math.min(max, v))
}

const EMOTION_TREND_DELTA: Record<AnalysisResult['emotionId'], number> = {
  frustrated: -8,
  concerned: -4,
  positive: 6,
  neutral: -1,
}

const CHURN_DELTA: Record<AnalysisResult['emotionId'], number> = {
  frustrated: 6,
  concerned: 3,
  positive: -5,
  neutral: 0,
}

type Action =
  | { type: 'UTTERANCE_ANALYZED'; customerId: CustomerId; analysis: AnalysisResult; channel: 'voice' | 'chat' }
  | { type: 'CALL_RESOLVED'; customerId: CustomerId; resolution: 'ai' | 'human' }
  | { type: 'DEAL_CREATED'; deal: Deal }
  | { type: 'RETENTION_PLAN_TRIGGERED'; customerId: CustomerId }
  | { type: 'QUALITY_CHECK_RECORDED'; result: QualityCheckResult }
  | { type: 'KB_LOOKUP_RECORDED' }
  | { type: 'TOGGLE_REASONING_MODE' }
  | { type: 'RESET_DEMO' }
  | { type: 'SWITCH_INDUSTRY'; industryId: IndustryId }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UTTERANCE_ANALYZED': {
      const customer = state.customers[action.customerId]
      if (!customer) return state
      const trendDelta = EMOTION_TREND_DELTA[action.analysis.emotionId]
      const churnDelta = CHURN_DELTA[action.analysis.emotionId]
      const lastTrend = customer.emotionTrend[customer.emotionTrend.length - 1] ?? 60
      const nextTrend = [...customer.emotionTrend.slice(-6), clamp(lastTrend + trendDelta)]
      const dateTag = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
      const updatedCustomer: CustomerRecord = {
        ...customer,
        emotion: action.analysis.emotionLabel,
        emotionTrend: nextTrend,
        churnScore: clamp(customer.churnScore + churnDelta),
        history: [
          {
            date: dateTag,
            channel: action.channel === 'voice' ? '電話客服' : 'App 客服',
            summary: `AI 分析：${action.analysis.intentLabel} · ${action.analysis.emotionLabel}`,
          },
          ...customer.history,
        ].slice(0, 5),
      }
      return {
        ...state,
        activeCustomerId: action.customerId,
        customers: { ...state.customers, [action.customerId]: updatedCustomer },
      }
    }

    case 'CALL_RESOLVED': {
      const customer = state.customers[action.customerId]
      if (!customer) return state
      const dateTag = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
      const updatedCustomer: CustomerRecord = {
        ...customer,
        serviceHistory: [
          {
            date: dateTag,
            type: '客服來電',
            status: action.resolution === 'ai' ? '已結案（AI 自動處理）' : '已結案（轉真人客服）',
          },
          ...customer.serviceHistory,
        ].slice(0, 6),
      }
      return {
        ...state,
        activeCustomerId: action.customerId,
        customers: { ...state.customers, [action.customerId]: updatedCustomer },
        metrics: {
          ...state.metrics,
          aiResolutionCount: state.metrics.aiResolutionCount + (action.resolution === 'ai' ? 1 : 0),
          humanTransferCount: state.metrics.humanTransferCount + (action.resolution === 'human' ? 1 : 0),
          minutesSavedEstimate: state.metrics.minutesSavedEstimate + (action.resolution === 'ai' ? 8 : 0),
          agentHandoffCount: state.metrics.agentHandoffCount + (action.resolution === 'human' ? 1 : 0),
        },
      }
    }

    case 'DEAL_CREATED': {
      const customer = state.customers[action.deal.customerId]
      const updatedCustomers = customer
        ? {
            ...state.customers,
            [action.deal.customerId]: {
              ...customer,
              insights: [
                { icon: 'strategy' as const, text: `已成立商機：${action.deal.planName}（+NT$${action.deal.mrrDelta}/月）` },
                ...customer.insights,
              ].slice(0, 4),
            },
          }
        : state.customers
      return {
        ...state,
        customers: updatedCustomers,
        deals: [action.deal, ...state.deals],
        metrics: {
          ...state.metrics,
          dealsClosedCount: state.metrics.dealsClosedCount + 1,
          dealsMrrTotal: state.metrics.dealsMrrTotal + action.deal.mrrDelta,
          minutesSavedEstimate: state.metrics.minutesSavedEstimate + 5,
        },
      }
    }

    case 'RETENTION_PLAN_TRIGGERED': {
      const customer = state.customers[action.customerId]
      if (!customer) return state
      const wasHighRisk = customer.churnScore >= 70
      const nextChurnScore = clamp(customer.churnScore - 15)
      const nowLowRisk = wasHighRisk && nextChurnScore < 70
      const dateTag = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
      const updatedCustomer: CustomerRecord = {
        ...customer,
        churnScore: nextChurnScore,
        insights: [
          { icon: 'strategy' as const, text: 'AI 挽留方案已啟動，流失風險已下降' },
          ...customer.insights,
        ].slice(0, 4),
        serviceHistory: [
          { date: dateTag, type: '挽留方案', status: '已建立追蹤任務' },
          ...customer.serviceHistory,
        ].slice(0, 6),
      }
      const nextVipRiskCount = nowLowRisk ? Math.max(1, state.metrics.vipRiskCount - 1) : state.metrics.vipRiskCount
      return {
        ...state,
        customers: { ...state.customers, [action.customerId]: updatedCustomer },
        opsAlerts: buildOpsAlerts(state.industryId, nextVipRiskCount),
        metrics: {
          ...state.metrics,
          retentionPlansTriggered: state.metrics.retentionPlansTriggered + 1,
          vipRiskCount: nextVipRiskCount,
        },
      }
    }

    case 'QUALITY_CHECK_RECORDED':
      return { ...state, qualityChecks: [action.result, ...state.qualityChecks].slice(0, 5) }

    case 'KB_LOOKUP_RECORDED':
      return { ...state, metrics: { ...state.metrics, kbLookupCount: state.metrics.kbLookupCount + 1 } }

    case 'TOGGLE_REASONING_MODE':
      return { ...state, showReasoning: !state.showReasoning }

    case 'RESET_DEMO':
      return initialState(state.industryId)

    case 'SWITCH_INDUSTRY':
      return initialState(action.industryId)

    default:
      return state
  }
}

const StateContext = createContext<AppState | null>(null)
const DispatchContext = createContext<React.Dispatch<Action> | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useAppState(): AppState {
  const ctx = useContext(StateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

function useAppDispatch(): React.Dispatch<Action> {
  const ctx = useContext(DispatchContext)
  if (!ctx) throw new Error('useAppDispatch must be used within AppStateProvider')
  return ctx
}

export function useAppActions() {
  const dispatch = useAppDispatch()
  return useMemo(
    () => ({
      recordUtteranceAnalyzed: (customerId: CustomerId, analysis: AnalysisResult, channel: 'voice' | 'chat') =>
        dispatch({ type: 'UTTERANCE_ANALYZED', customerId, analysis, channel }),
      recordCallResolved: (customerId: CustomerId, resolution: 'ai' | 'human') =>
        dispatch({ type: 'CALL_RESOLVED', customerId, resolution }),
      recordDealCreated: (deal: Deal) => dispatch({ type: 'DEAL_CREATED', deal }),
      recordRetentionPlanTriggered: (customerId: CustomerId) =>
        dispatch({ type: 'RETENTION_PLAN_TRIGGERED', customerId }),
      recordQualityCheck: (result: QualityCheckResult) => dispatch({ type: 'QUALITY_CHECK_RECORDED', result }),
      recordKbLookup: () => dispatch({ type: 'KB_LOOKUP_RECORDED' }),
      toggleReasoningMode: () => dispatch({ type: 'TOGGLE_REASONING_MODE' }),
      resetDemo: () => dispatch({ type: 'RESET_DEMO' }),
      switchIndustry: (industryId: IndustryId) => dispatch({ type: 'SWITCH_INDUSTRY', industryId }),
    }),
    [dispatch],
  )
}
