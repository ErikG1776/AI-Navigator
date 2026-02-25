'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { AdvisoryOutput, CompanyContext } from '@/lib/advisory-types'

type AssessmentData = {
  id: string
  title: string | null
  created_at: string
  overallscore: number
  overallstage: string
  aaimmscore: number
  aaimmstage: string
  navigatorscore: number
  navigatorstage: string
  dimension_scores: Record<string, number> | null
  company_context: CompanyContext | null
  advisory: AdvisoryOutput | null
}

const DIMENSION_DISPLAY: Record<string, { label: string; group: string }> = {
  reasoning: { label: 'Reasoning', group: 'AAIMM' },
  collaboration: { label: 'Collaboration', group: 'AAIMM' },
  action: { label: 'Action', group: 'AAIMM' },
  data: { label: 'Data', group: 'Navigator' },
  infrastructure: { label: 'Infrastructure', group: 'Navigator' },
  governance: { label: 'Governance', group: 'Navigator' },
  change: { label: 'Change', group: 'Navigator' },
  resources: { label: 'Resources', group: 'Navigator' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ReportPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAuth()
  const [data, setData] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)

  const assessmentId = params?.id as string

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login')
  }, [authLoading, user, router])

  const fetchAssessment = useCallback(async () => {
    if (!user || !assessmentId) return
    await supabase.auth.getSession()
    const { data: row } = await supabase
      .from('assessments')
      .select(
        'id, title, created_at, overallscore, overallstage, aaimmscore, aaimmstage, navigatorscore, navigatorstage, dimension_scores, company_context, advisory'
      )
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    setData(row as AssessmentData)
    setLoading(false)
  }, [user, assessmentId])

  useEffect(() => {
    fetchAssessment()
  }, [fetchAssessment])

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading report...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Assessment not found.</p>
      </div>
    )
  }

  const dimScores = data.dimension_scores ?? {}

  return (
    <>
      {/* Print button - hidden in print */}
      <div className="print:hidden fixed top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => window.print()}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Print / Save PDF
        </button>
        <button
          onClick={() => window.close()}
          className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 print:py-6 print:px-8 font-sans text-gray-900">

        {/* Header */}
        <div className="mb-10 pb-6 border-b-2 border-gray-900">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Nividous · AI Navigator</p>
          <h1 className="text-3xl font-bold mt-1">AI Readiness Assessment Report</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Date: {formatDate(data.created_at)}</span>
            {data.company_context?.industry && <span>Industry: {data.company_context.industry}</span>}
            {data.company_context?.company_size && <span>Size: {data.company_context.company_size}</span>}
            {data.company_context?.role && <span>Respondent: {data.company_context.role}</span>}
          </div>
        </div>

        {/* Executive Summary (from advisory) */}
        {data.advisory?.executive_summary && (
          <section className="mb-10">
            <SectionTitle>Executive Summary</SectionTitle>
            <p className="text-sm leading-relaxed text-gray-700 bg-gray-50 rounded-md p-4 border">
              {data.advisory.executive_summary}
            </p>
          </section>
        )}

        {/* Scores */}
        <section className="mb-10">
          <SectionTitle>Maturity Scores</SectionTitle>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <ScoreBox label="Overall Maturity" score={data.overallscore} stage={data.overallstage} />
            <ScoreBox label="AAIMM Score" score={data.aaimmscore} stage={data.aaimmstage} />
            <ScoreBox label="Navigator Score" score={data.navigatorscore} stage={data.navigatorstage} />
          </div>

          {/* Dimension table */}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-3 py-2 font-semibold border">Dimension</th>
                <th className="text-left px-3 py-2 font-semibold border">Framework</th>
                <th className="text-right px-3 py-2 font-semibold border">Score</th>
                <th className="text-left px-3 py-2 font-semibold border">Stage</th>
                <th className="px-3 py-2 border w-32">Rating</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(DIMENSION_DISPLAY).map(([key, meta]) => {
                const score = dimScores[key] ?? 0
                const stage = getStage(score)
                return (
                  <tr key={key} className="border-b">
                    <td className="px-3 py-2 border font-medium">{meta.label}</td>
                    <td className="px-3 py-2 border text-gray-500">{meta.group}</td>
                    <td className="px-3 py-2 border text-right font-bold">{score.toFixed(1)}</td>
                    <td className="px-3 py-2 border text-gray-600">{stage}</td>
                    <td className="px-3 py-2 border">
                      <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded bg-gray-700"
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* Top Bottlenecks */}
        {data.advisory?.top_bottlenecks && data.advisory.top_bottlenecks.length > 0 && (
          <section className="mb-10 print:break-before-page">
            <SectionTitle>Top Bottlenecks</SectionTitle>
            <div className="space-y-4">
              {data.advisory.top_bottlenecks.map((b, i) => (
                <div key={i} className="border rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-white bg-gray-900 rounded-full w-5 h-5 flex items-center justify-center">{i + 1}</span>
                    <span className="font-semibold">{b.dimension}</span>
                    <span className="text-xs text-gray-500">Score: {b.score}/5</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{b.what}</p>
                  <p className="text-xs text-gray-500">{b.why_it_matters}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 90-Day Roadmap */}
        {data.advisory?.roadmap && (
          <section className="mb-10">
            <SectionTitle>90-Day Roadmap</SectionTitle>
            <div className="grid grid-cols-3 gap-4 print:grid-cols-3">
              <RoadmapCol label="Days 0–30" items={data.advisory.roadmap.days_0_30} />
              <RoadmapCol label="Days 31–60" items={data.advisory.roadmap.days_31_60} />
              <RoadmapCol label="Days 61–90" items={data.advisory.roadmap.days_61_90} />
            </div>
          </section>
        )}

        {/* Prioritized Use Cases */}
        {data.advisory?.prioritized_use_cases && data.advisory.prioritized_use_cases.length > 0 && (
          <section className="mb-10 print:break-before-page">
            <SectionTitle>Prioritized Use Cases</SectionTitle>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2 font-semibold border">Use Case</th>
                  <th className="text-right px-3 py-2 font-semibold border">ROI</th>
                  <th className="text-right px-3 py-2 font-semibold border">Effort</th>
                  <th className="text-right px-3 py-2 font-semibold border">Risk</th>
                  <th className="text-center px-3 py-2 font-semibold border">Nividous Fit</th>
                </tr>
              </thead>
              <tbody>
                {data.advisory.prioritized_use_cases.map((uc, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-2 border">
                      <p className="font-medium">{uc.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{uc.description}</p>
                    </td>
                    <td className="px-3 py-2 border text-right">{uc.roi_band}</td>
                    <td className="px-3 py-2 border text-right">{uc.effort}</td>
                    <td className="px-3 py-2 border text-right">{uc.risk}</td>
                    <td className="px-3 py-2 border text-center">{uc.nividous_fit ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Governance Notes */}
        {data.advisory?.governance_notes && data.advisory.governance_notes.length > 0 && (
          <section className="mb-10">
            <SectionTitle>Governance & Risk</SectionTitle>
            <div className="space-y-3">
              {data.advisory.governance_notes.map((g, i) => (
                <div key={i} className="border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold border rounded px-1.5 py-0.5">{g.urgency}</span>
                    <span className="font-medium text-sm">{g.area}</span>
                  </div>
                  <p className="text-sm text-gray-600">{g.recommendation}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-4 border-t text-xs text-gray-400 flex justify-between">
          <span>Nividous AI Navigator · Confidential</span>
          <span>Generated {formatDate(data.created_at)}</span>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { font-size: 11px; }
        }
      `}</style>
    </>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 pb-1 border-b">
      {children}
    </h2>
  )
}

function ScoreBox({ label, score, stage }: { label: string; score: number; stage: string }) {
  return (
    <div className="border rounded-lg p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold">{score.toFixed(1)}</p>
      <p className="text-xs font-semibold text-gray-600 mt-1">{stage}</p>
    </div>
  )
}

function RoadmapCol({ label, items }: { label: string; items: { action: string; owner: string; outcome: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold bg-gray-900 text-white rounded-t px-2 py-1">{label}</p>
      <div className="border border-t-0 rounded-b divide-y text-xs">
        {items.map((item, i) => (
          <div key={i} className="p-2">
            <p className="font-medium">{item.action}</p>
            <p className="text-gray-400 mt-0.5">Owner: {item.owner}</p>
            <p className="text-gray-500 mt-0.5">{item.outcome}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function getStage(score: number) {
  if (score <= 1.9) return 'Emerging'
  if (score <= 2.9) return 'Developing'
  if (score <= 3.9) return 'Operational'
  if (score <= 4.5) return 'Scaling'
  return 'Optimized'
}
