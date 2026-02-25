import {
  assessmentQuestions,
  type Dimension,
  type WeightGroup,
} from './assessment-model'

type AssessmentResponse = {
  [questionKey: string]: number
}

const groupedDimensions: Record<WeightGroup, Dimension[]> = {
  aaimm: ['reasoning', 'collaboration', 'action'],
  navigator: ['data', 'infrastructure', 'governance', 'change', 'resources'],
}

const allDimensions: Dimension[] = [
  'reasoning',
  'collaboration',
  'action',
  'data',
  'infrastructure',
  'governance',
  'change',
  'resources',
]

function roundTo2(value: number): number {
  return Number(value.toFixed(2))
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

function classifyStage(
  score: number
): 'Emerging' | 'Developing' | 'Operational' | 'Scaling' | 'Optimized' {
  if (score <= 1.9) return 'Emerging'
  if (score <= 2.9) return 'Developing'
  if (score <= 3.9) return 'Operational'
  if (score <= 4.5) return 'Scaling'
  return 'Optimized'
}

export function calculateScores(responses: AssessmentResponse) {
  const valuesByDimension: Record<Dimension, number[]> = {
    reasoning: [],
    collaboration: [],
    action: [],
    data: [],
    infrastructure: [],
    governance: [],
    change: [],
    resources: [],
  }

  for (const question of assessmentQuestions) {
    const responseValue = responses[question.key]

    if (typeof responseValue !== 'number' || Number.isNaN(responseValue)) {
      continue
    }

    valuesByDimension[question.dimension].push(responseValue)
  }

  const dimensionScores = {} as Record<Dimension, number>

  for (const dimension of allDimensions) {
    dimensionScores[dimension] = roundTo2(average(valuesByDimension[dimension]))
  }

  const aaImmScore = roundTo2(
    average(groupedDimensions.aaimm.map((dimension) => dimensionScores[dimension]))
  )

  const navigatorScore = roundTo2(
    average(
      groupedDimensions.navigator.map((dimension) => dimensionScores[dimension])
    )
  )

  const overallScore = roundTo2(average([aaImmScore, navigatorScore]))
  const aaImmStage = classifyStage(aaImmScore)
  const navigatorStage = classifyStage(navigatorScore)
  const overallStage = classifyStage(overallScore)

  return {
    dimensionScores,
    aaImmScore,
    navigatorScore,
    overallScore,
    aaImmStage,
    navigatorStage,
    overallStage,
  }
}
