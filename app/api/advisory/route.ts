import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import type { AdvisoryOutput } from '@/lib/advisory-types'

const ADVISORY_TOOL_SCHEMA = {
  name: 'generate_advisory',
  description:
    'Generate a structured AI readiness advisory for an enterprise organization based on their assessment results.',
  input_schema: {
    type: 'object' as const,
    required: [
      'executive_summary',
      'top_bottlenecks',
      'roadmap',
      'prioritized_use_cases',
      'governance_notes',
      'partner_gaps',
      'nividous_fit',
    ],
    properties: {
      executive_summary: {
        type: 'string',
        description:
          '3-4 sentence executive summary of the organization\'s AI readiness posture, key strengths, and critical priorities. Be specific and avoid generic language.',
      },
      top_bottlenecks: {
        type: 'array',
        description: 'Top 3 most critical bottlenecks preventing AI advancement, ordered by severity.',
        items: {
          type: 'object',
          required: ['dimension', 'what', 'why_it_matters', 'score'],
          properties: {
            dimension: { type: 'string', description: 'The assessment dimension name' },
            what: { type: 'string', description: 'Specific description of the bottleneck (2-3 sentences)' },
            why_it_matters: { type: 'string', description: 'Business impact if this bottleneck is not addressed (2-3 sentences)' },
            score: { type: 'number', description: 'The dimension score (1-5)' },
          },
        },
      },
      roadmap: {
        type: 'object',
        description: 'Phased 90-day action roadmap',
        required: ['days_0_30', 'days_31_60', 'days_61_90'],
        properties: {
          days_0_30: {
            type: 'array',
            description: 'Quick wins and foundation actions (3-4 items)',
            items: {
              type: 'object',
              required: ['action', 'owner', 'outcome'],
              properties: {
                action: { type: 'string', description: 'Specific action to take' },
                owner: { type: 'string', description: 'Role responsible (e.g., Chief Data Officer, AI Program Manager)' },
                outcome: { type: 'string', description: 'Expected outcome or deliverable' },
              },
            },
          },
          days_31_60: {
            type: 'array',
            description: 'Build and validate actions (3-4 items)',
            items: {
              type: 'object',
              required: ['action', 'owner', 'outcome'],
              properties: {
                action: { type: 'string' },
                owner: { type: 'string' },
                outcome: { type: 'string' },
              },
            },
          },
          days_61_90: {
            type: 'array',
            description: 'Scale and institutionalize actions (3-4 items)',
            items: {
              type: 'object',
              required: ['action', 'owner', 'outcome'],
              properties: {
                action: { type: 'string' },
                owner: { type: 'string' },
                outcome: { type: 'string' },
              },
            },
          },
        },
      },
      prioritized_use_cases: {
        type: 'array',
        description: '3-5 prioritized AI use cases tailored to the organization\'s industry and maturity level',
        items: {
          type: 'object',
          required: ['title', 'description', 'roi_band', 'effort', 'risk', 'dependencies', 'nividous_fit', 'partner_needed'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string', description: '2-3 sentence description of the use case and its value' },
            roi_band: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            effort: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            risk: { type: 'string', enum: ['Low', 'Medium', 'High'] },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key capabilities or conditions required before this use case can succeed',
            },
            nividous_fit: {
              type: 'boolean',
              description: 'True if Nividous (process orchestration and automation specialist) can implement this',
            },
            partner_needed: {
              type: 'boolean',
              description: 'True if a specialized partner (e.g., data governance, model risk) is required',
            },
          },
        },
      },
      governance_notes: {
        type: 'array',
        description: 'Governance and compliance recommendations (2-4 items)',
        items: {
          type: 'object',
          required: ['area', 'recommendation', 'urgency'],
          properties: {
            area: { type: 'string', description: 'Governance area (e.g., Model Risk Management, Data Privacy, AI Ethics)' },
            recommendation: { type: 'string', description: 'Specific recommendation (2-3 sentences)' },
            urgency: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          },
        },
      },
      partner_gaps: {
        type: 'array',
        description: 'Capability gaps requiring specialized external partners (1-3 items)',
        items: {
          type: 'object',
          required: ['capability', 'reason', 'suggested_approach'],
          properties: {
            capability: { type: 'string', description: 'The specific capability gap' },
            reason: { type: 'string', description: 'Why this cannot be built internally in the near term' },
            suggested_approach: { type: 'string', description: 'Recommended approach to address the gap' },
          },
        },
      },
      nividous_fit: {
        type: 'array',
        description: 'Areas where Nividous specifically excels as an implementation partner (1-3 items)',
        items: {
          type: 'object',
          required: ['area', 'how_nividous_helps'],
          properties: {
            area: { type: 'string' },
            how_nividous_helps: { type: 'string', description: 'Specific value Nividous brings (2-3 sentences)' },
          },
        },
      },
    },
  },
}

function buildAdvisoryPrompt(params: {
  industry: string
  companySize: string
  toolStack: string
  role: string
  notes: string
  overallScore: number
  overallStage: string
  aaImmScore: number
  aaImmStage: string
  navigatorScore: number
  navigatorStage: string
  dimensionScores: Record<string, number>
}) {
  const sorted = Object.entries(params.dimensionScores).sort(
    ([, a]: [string, number], [, b]: [string, number]) => a - b
  )
  const bottomDimensions = sorted.slice(0, 3).map(([d, s]) => `${d} (${s}/5)`).join(', ')
  const topDimensions = sorted.slice(-2).reverse().map(([d, s]) => `${d} (${s}/5)`).join(', ')

  return `You are a senior AI strategy advisor reviewing an enterprise AI readiness assessment. Generate a rigorous, executive-grade advisory based on the following assessment data.

ORGANIZATION PROFILE
- Industry: ${params.industry}
- Company Size: ${params.companySize}
- Tech Stack: ${params.toolStack}
- Respondent Role: ${params.role}
- Additional Context: ${params.notes || 'None provided'}

ASSESSMENT SCORES
- Overall Score: ${params.overallScore}/5.0 — Stage: ${params.overallStage}
- AAIMM Score (Reasoning, Collaboration, Action): ${params.aaImmScore}/5.0 — Stage: ${params.aaImmStage}
- Navigator Score (Data, Infrastructure, Governance, Change, Resources): ${params.navigatorScore}/5.0 — Stage: ${params.navigatorStage}

DIMENSION BREAKDOWN
${Object.entries(params.dimensionScores).map(([d, s]) => `- ${d.charAt(0).toUpperCase() + d.slice(1)}: ${s}/5.0`).join('\n')}

CRITICAL BOTTLENECKS (lowest-scoring): ${bottomDimensions}
RELATIVE STRENGTHS (highest-scoring): ${topDimensions}

ADVISORY REQUIREMENTS
1. Be industry-specific and maturity-aware. A score of 2.1 in Financial Services governance means something very different than in a startup.
2. Identify root causes, not just symptoms. Low governance + low data scores together signal a systemic problem.
3. The roadmap must be executable, not aspirational. Actions should be achievable within 90 days.
4. Use cases must be realistic given the current maturity level. Do not recommend advanced ML when data foundations score below 2.5.
5. Be tool-agnostic in recommendations. Do not mention specific vendor products unless essential.
6. Flag where Nividous (process orchestration, workflow automation, AI integration specialist) is a natural fit — but do not make this a sales pitch.
7. Governance notes must reflect regulatory context appropriate to the industry.

Generate the advisory now using the generate_advisory tool.`
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Advisory service not configured' }, { status: 503 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  let body: { assessment_id: string; user_id: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { assessment_id, user_id } = body
  if (!assessment_id || !user_id) {
    return NextResponse.json({ error: 'assessment_id and user_id are required' }, { status: 400 })
  }

  // Use service client with anon key (RLS will enforce ownership via JWT)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: request.headers.get('Authorization') ?? '',
      },
    },
  })

  const { data: assessment, error: fetchError } = await supabase
    .from('assessments')
    .select(
      'id, overallscore, overallstage, aaimmscore, aaimmstage, navigatorscore, navigatorstage, dimension_scores, company_context'
    )
    .eq('id', assessment_id)
    .eq('user_id', user_id)
    .single()

  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
  }

  const context = assessment.company_context as {
    industry?: string
    company_size?: string
    tool_stack?: string
    role?: string
    notes?: string
  } | null

  const dimensionScores = (assessment.dimension_scores ?? {}) as Record<string, number>

  const promptParams = {
    industry: context?.industry ?? 'Not specified',
    companySize: context?.company_size ?? 'Not specified',
    toolStack: context?.tool_stack ?? 'Not specified',
    role: context?.role ?? 'Not specified',
    notes: context?.notes ?? '',
    overallScore: assessment.overallscore ?? 0,
    overallStage: assessment.overallstage ?? 'Unknown',
    aaImmScore: assessment.aaimmscore ?? 0,
    aaImmStage: assessment.aaimmstage ?? 'Unknown',
    navigatorScore: assessment.navigatorscore ?? 0,
    navigatorStage: assessment.navigatorstage ?? 'Unknown',
    dimensionScores,
  }

  const anthropic = new Anthropic({ apiKey })

  let advisory: AdvisoryOutput
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [ADVISORY_TOOL_SCHEMA],
      tool_choice: { type: 'tool', name: 'generate_advisory' },
      messages: [{ role: 'user', content: buildAdvisoryPrompt(promptParams) }],
    })

    const toolUseBlock = message.content.find((b) => b.type === 'tool_use')
    if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
      return NextResponse.json({ error: 'Advisory generation failed' }, { status: 500 })
    }

    advisory = toolUseBlock.input as AdvisoryOutput
  } catch (err) {
    console.error('Anthropic API error:', err)
    const message = err instanceof Error ? err.message : 'Advisory generation failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const { error: updateError } = await supabase
    .from('assessments')
    .update({ advisory })
    .eq('id', assessment_id)
    .eq('user_id', user_id)

  if (updateError) {
    console.error('Failed to persist advisory:', updateError)
  }

  return NextResponse.json({ advisory })
}
