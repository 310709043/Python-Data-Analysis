import type { TranscriptLine } from './mock'

export interface ChecklistItem {
  id: string
  label: string
  keywords: string[]
}

export interface StoreTranscript {
  id: string
  storeName: string
  agentName: string
  lines: TranscriptLine[]
}

// Compliance checklist — a line "passes" an item if any agent line in the
// transcript contains one of its keywords. Deliberately simple (keyword
// match, same spirit as aiEngine.ts) rather than a bespoke NLU stack.
export const complianceChecklist: ChecklistItem[] = [
  { id: 'greeting', label: '開場身分驗證', keywords: ['您好', '請問您是', '手機號碼後五碼'] },
  { id: 'needs', label: '主動了解需求', keywords: ['請問需要', '想了解', '需要什麼協助'] },
  { id: 'disclosure', label: '資費異動主動告知', keywords: ['月租費', '資費', '折抵', '費用'] },
  { id: 'banned-phrase', label: '未使用禁用話術', keywords: ['沒辦法', '不知道', '不歸我管'] },
  { id: 'closing', label: '結尾確認滿意度', keywords: ['還有其他', '滿意', '謝謝光臨'] },
]

export const storeTranscripts: StoreTranscript[] = [
  {
    id: 'store-1',
    storeName: '台灣大哥大 板橋門市',
    agentName: '門市專員 Amy',
    lines: [
      { speaker: 'agent', name: '門市專員 Amy', text: '您好，請問您是王先生嗎？可以跟我核對一下手機號碼後五碼嗎？' },
      { speaker: 'customer', name: '客戶', text: '好，是 12568。' },
      { speaker: 'agent', name: '門市專員 Amy', text: '謝謝，請問今天需要什麼協助呢？' },
      { speaker: 'customer', name: '客戶', text: '我想升級網路方案，家裡人比較多在用。' },
      { speaker: 'agent', name: '門市專員 Amy', text: '了解，這個升級方案月租費會增加 300 元，目前有折抵活動，我幫您說明一下。' },
      { speaker: 'customer', name: '客戶', text: '好，那就辦這個。' },
      { speaker: 'agent', name: '門市專員 Amy', text: '辦理好了，還有其他可以協助的嗎？' },
      { speaker: 'customer', name: '客戶', text: '沒有了，謝謝。' },
    ],
  },
  {
    id: 'store-2',
    storeName: '台灣大哥大 中和門市',
    agentName: '門市專員 Kevin',
    lines: [
      { speaker: 'agent', name: '門市專員 Kevin', text: '您好，請問需要什麼服務？' },
      { speaker: 'customer', name: '客戶', text: '我的帳單金額好像不對，可以查一下嗎？' },
      { speaker: 'agent', name: '門市專員 Kevin', text: '這個帳務問題我不知道，不歸我管，要打客服電話。' },
      { speaker: 'customer', name: '客戶', text: '那我要打去客服嗎？' },
      { speaker: 'agent', name: '門市專員 Kevin', text: '對，麻煩您打客服電話問。' },
    ],
  },
]
