export const FPS = 30
export const DURATION_SECONDS = 72
export const DURATION_FRAMES = DURATION_SECONDS * FPS

export const fontFamily =
  '"Noto Sans TC", "Noto Sans CJK TC", "PingFang TC", "Microsoft JhengHei", sans-serif'

// Primary — deep space grade. Secondary — the AI's living colors.
export const colors = {
  black: '#050507',
  navy: '#0A0E1C',
  navy2: '#0D1224',
  white: '#F5F6FA',
  ink: '#C7CAD9',
  inkDim: '#5C6178',

  aiBlue: '#3B82F6',
  intelligencePurple: '#8B5CF6',
  successEmerald: '#10B981',
  warmGold: '#F0B94D',
  frustrationRed: '#F0596B',

  // Taiwan Mobile brand facets — reserved for the logo formation / closing moments only.
  brandOrange: '#FF6B00',
  brandPink: '#E4007F',
  brandGreen: '#8DC63F',
  brandPurple: '#5C4E9E',
}

// Seconds, not frames — every scene component is written against t = frame / fps
// so the same logic renders identically at 1080p/30 or a future 4K/60 pass.
// Pain points moved out of the film into the stage deck; the film now opens
// directly on MyClaw and spends its middle on the grounded product moment.
export const ACT = {
  ringtoneLogo: [0, 9] as const,
  listening: [9, 20] as const,
  salesHighlight: [20, 34] as const,
  industryTunnel: [34, 46] as const,
  benefits: [46, 60] as const,
  convergence: [60, 72] as const,
}

export const industries = [
  { id: 'telecom', label: '電信', color: colors.aiBlue },
  { id: 'banking', label: '金融', color: colors.warmGold },
  { id: 'retail', label: '零售', color: colors.intelligencePurple },
] as const

export const capabilities = [
  { id: 'myvoca', label: 'MyVoca', color: colors.aiBlue },
  { id: 'ai-service', label: 'AI 智能客服', color: colors.intelligencePurple },
  { id: 'quality', label: '門市語音質檢', color: colors.warmGold },
  { id: 'genaius', label: 'GenAIus', color: colors.successEmerald },
  { id: 'mplus', label: 'M+', color: colors.brandPink },
] as const
