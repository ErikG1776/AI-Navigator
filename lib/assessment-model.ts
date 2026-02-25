export type WeightGroup = 'aaimm' | 'navigator'

export type Dimension =
  | 'reasoning'
  | 'collaboration'
  | 'action'
  | 'data'
  | 'infrastructure'
  | 'governance'
  | 'change'
  | 'resources'

export type AssessmentQuestion = {
  key: string
  dimension: Dimension
  weightGroup: WeightGroup
  prompt: string
  scaleMin: 1
  scaleMax: 5
}

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    key: 'reasoning_01',
    dimension: 'reasoning',
    weightGroup: 'aaimm',
    prompt:
      'How consistently do business units frame AI initiatives as explicit decision problems with measurable business outcomes and defined confidence thresholds?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'reasoning_02',
    dimension: 'reasoning',
    weightGroup: 'aaimm',
    prompt:
      'To what extent are model recommendations challenged through structured hypothesis testing before they are accepted in executive workflows?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'reasoning_03',
    dimension: 'reasoning',
    weightGroup: 'aaimm',
    prompt:
      'How mature is your organization in documenting decision rationale when AI outputs materially influence financial, operational, or risk decisions?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'collaboration_01',
    dimension: 'collaboration',
    weightGroup: 'aaimm',
    prompt:
      'How effectively do product, data science, legal, and operations leaders co-own AI priorities through formal governance forums and shared KPIs?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'collaboration_02',
    dimension: 'collaboration',
    weightGroup: 'aaimm',
    prompt:
      'To what degree are frontline domain experts embedded into model design and validation rather than consulted only after deployment decisions?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'collaboration_03',
    dimension: 'collaboration',
    weightGroup: 'aaimm',
    prompt:
      'How consistently are disagreements on AI tradeoffs resolved through transparent escalation paths with executive sponsorship?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'action_01',
    dimension: 'action',
    weightGroup: 'aaimm',
    prompt:
      'How reliably does your organization convert AI insights into operational actions with clear owners, deadlines, and benefit tracking?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'action_02',
    dimension: 'action',
    weightGroup: 'aaimm',
    prompt:
      'To what extent are AI-enabled process changes codified into standard operating procedures and audited for adoption at scale?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'action_03',
    dimension: 'action',
    weightGroup: 'aaimm',
    prompt:
      'How quickly can leadership move from pilot evidence to enterprise rollout without losing control of quality, compliance, or value realization?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'data_01',
    dimension: 'data',
    weightGroup: 'navigator',
    prompt:
      'How mature is your enterprise data foundation in providing trusted, governed, and reusable data products for AI use cases across business lines?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'data_02',
    dimension: 'data',
    weightGroup: 'navigator',
    prompt:
      'To what extent are data quality issues proactively detected, prioritized by business impact, and resolved within defined service levels?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'data_03',
    dimension: 'data',
    weightGroup: 'navigator',
    prompt:
      'How consistently can teams trace critical AI features to authoritative sources, transformations, and stewardship accountability?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'infrastructure_01',
    dimension: 'infrastructure',
    weightGroup: 'navigator',
    prompt:
      'How well does your platform support secure, scalable model development and deployment across cloud, on-prem, and regulated environments?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'infrastructure_02',
    dimension: 'infrastructure',
    weightGroup: 'navigator',
    prompt:
      'To what degree are MLOps and LLMOps capabilities standardized to reduce cycle time while maintaining reproducibility and control?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'infrastructure_03',
    dimension: 'infrastructure',
    weightGroup: 'navigator',
    prompt:
      'How effectively do cost, latency, and reliability metrics inform architectural decisions for production AI services?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'governance_01',
    dimension: 'governance',
    weightGroup: 'navigator',
    prompt:
      'How comprehensive is your AI governance framework in defining accountability, control points, and risk thresholds for high-impact use cases?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'governance_02',
    dimension: 'governance',
    weightGroup: 'navigator',
    prompt:
      'To what extent are model risk, bias, privacy, and security assessments integrated into delivery gates rather than handled as exceptions?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'governance_03',
    dimension: 'governance',
    weightGroup: 'navigator',
    prompt:
      'How consistently does executive leadership receive decision-ready reporting on AI compliance posture and residual risk exposure?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'change_01',
    dimension: 'change',
    weightGroup: 'navigator',
    prompt:
      'How effectively does the organization manage behavioral and process change required for sustained adoption of AI-enabled ways of working?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'change_02',
    dimension: 'change',
    weightGroup: 'navigator',
    prompt:
      'To what degree are communications, training, and leadership reinforcement tailored to different stakeholder groups during AI transformations?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'change_03',
    dimension: 'change',
    weightGroup: 'navigator',
    prompt:
      'How consistently are adoption barriers identified early and resolved through structured intervention plans with accountable owners?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'resources_01',
    dimension: 'resources',
    weightGroup: 'navigator',
    prompt:
      'How well are funding, talent, and partner capacity aligned to the AI portfolio based on strategic value and execution risk?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'resources_02',
    dimension: 'resources',
    weightGroup: 'navigator',
    prompt:
      'To what extent does your workforce strategy build critical AI capabilities through targeted hiring, upskilling, and role redesign?',
    scaleMin: 1,
    scaleMax: 5,
  },
  {
    key: 'resources_03',
    dimension: 'resources',
    weightGroup: 'navigator',
    prompt:
      'How effectively are scarce technical resources prioritized toward initiatives with the strongest enterprise impact and readiness?',
    scaleMin: 1,
    scaleMax: 5,
  },
]
