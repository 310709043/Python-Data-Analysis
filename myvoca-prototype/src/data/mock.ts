// Central mock data for the MyVoca prototype demo.

export interface TranscriptLine {
  speaker: 'customer' | 'agent' | 'ai'
  name: string
  text: string
}

export const hourlyCalls = [42, 58, 75, 96, 120, 142, 128, 110, 132, 148, 125, 98]

export const teamAgents = [
  { name: 'Eric Chen', calls: 32, csat: 4.9, aiAssist: 96, status: 'online' },
  { name: 'Amy Lin', calls: 28, csat: 4.8, aiAssist: 92, status: 'online' },
  { name: 'Kevin Wu', calls: 25, csat: 4.7, aiAssist: 88, status: 'busy' },
  { name: 'Sandy Ho', calls: 21, csat: 4.6, aiAssist: 85, status: 'away' },
]
