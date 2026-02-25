export type RoiBand = 'Low' | 'Medium' | 'High'
export type EffortLevel = 'Low' | 'Medium' | 'High'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type Urgency = 'Low' | 'Medium' | 'High'

export type Bottleneck = {
  dimension: string
  what: string
  why_it_matters: string
  score: number
}

export type RoadmapItem = {
  action: string
  owner: string
  outcome: string
}

export type UseCase = {
  title: string
  description: string
  roi_band: RoiBand
  effort: EffortLevel
  risk: RiskLevel
  dependencies: string[]
  nividous_fit: boolean
  partner_needed: boolean
}

export type GovernanceNote = {
  area: string
  recommendation: string
  urgency: Urgency
}

export type PartnerGap = {
  capability: string
  reason: string
  suggested_approach: string
}

export type NividousFitItem = {
  area: string
  how_nividous_helps: string
}

export type AdvisoryOutput = {
  executive_summary: string
  top_bottlenecks: Bottleneck[]
  roadmap: {
    days_0_30: RoadmapItem[]
    days_31_60: RoadmapItem[]
    days_61_90: RoadmapItem[]
  }
  prioritized_use_cases: UseCase[]
  governance_notes: GovernanceNote[]
  partner_gaps: PartnerGap[]
  nividous_fit: NividousFitItem[]
}

export type CompanyContext = {
  industry: string
  company_size: string
  tool_stack: string
  role: string
  notes: string
}
