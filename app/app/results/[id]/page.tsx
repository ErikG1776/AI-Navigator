'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { AdvisoryOutput, CompanyContext } from '@/lib/advisory-types'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STAGE_VARIANTS: Record<string, 'muted' | 'warning' | 'info' | 'success' | 'default'> = {
  Emerging: 'muted',
  Developing: 'warning',
  Operational: 'info',
  Scaling: 'success',
  Optimized: 'success',
}

const DIMENSION_DISPLAY: Record<string, { label: string; group: 'AAIMM' | 'Navigator' }> = {
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

function scoreColor(score: number) {
  if (score <= 1.9) return 'text-red-600'
  if (score <= 2.9) return 'text-amber-600'
  if (score <= 3.9) return 'text-blue-600'
  return 'text-emerald-600'
}

function scoreBarColor(score: number) {
  if (score <= 1.9) return 'bg-red-400'
  if (score <= 2.9) return 'bg-amber-400'
  if (score <= 3.9) return 'bg-blue-500'
  return 'bg-emerald-500'
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAuth()

  const [data, setData] = useState<AssessmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [advisoryLoading, setAdvisoryLoading] = useState(false)
  const [advisoryError, setAdvisoryError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    bottlenecks: true,
    roadmap: false,
    useCases: false,
    governance: false,
    partners: false,
    nividous: false,
  })

  const assessmentId = params?.id as string

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login')
  }, [authLoading, user, router])

  const fetchAssessment = useCallback(async () => {
    if (!user || !assessmentId) return
    await supabase.auth.getSession()
    const { data: row, error } = await supabase
      .from('assessments')
      .select(
        'id, title, created_at, overallscore, overallstage, aaimmscore, aaimmstage, navigatorscore, navigatorstage, dimension_scores, company_context, advisory'
      )
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (error || !row) {
      setLoading(false)
      return
    }
    setData(row as AssessmentData)
    setLoading(false)
  }, [user, assessmentId])

  useEffect(() => {
    fetchAssessment()
  }, [fetchAssessment])

  const handleGenerateAdvisory = async () => {
    if (!user || !data) return
    setAdvisoryLoading(true)
    setAdvisoryError(null)

    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token

      const res = await fetch('/api/advisory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessment_id: assessmentId,
          user_id: user.id,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error ?? 'Advisory generation failed')
      }

      const { advisory } = await res.json()
      setData((prev) => (prev ? { ...prev, advisory } : prev))
      setExpandedSections({ bottlenecks: true, roadmap: true, useCases: true, governance: true, partners: true, nividous: true })
    } catch (err) {
      setAdvisoryError(err instanceof Error ? err.message : 'Failed to generate advisory')
    } finally {
      setAdvisoryLoading(false)
    }
  }

  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading assessment...</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Assessment not found.</p>
          <Link href="/app" className="text-sm text-muted-foreground underline">Return to dashboard</Link>
        </div>
      </main>
    )
  }

  const dimScores = data.dimension_scores ?? {}
  const radarData = Object.entries(DIMENSION_DISPLAY).map(([key, meta]) => ({
    subject: meta.label,
    score: dimScores[key] ?? 0,
    fullMark: 5,
  }))

  const sortedDimensions = Object.entries(dimScores).sort(([, a], [, b]) => a - b)
  const bottomDims = sortedDimensions.slice(0, 3)

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* ── Page Header ── */}
      <div className="border-b bg-white px-6 py-5">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">AI Navigator</p>
            <h1 className="text-lg font-semibold">
              {data.title ?? 'AI Readiness Assessment'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(data.created_at)}
              {data.company_context?.industry ? ` · ${data.company_context.industry}` : ''}
              {data.company_context?.company_size ? ` · ${data.company_context.company_size}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/app/results/${assessmentId}/report`} target="_blank">
              <Button variant="outline" size="sm">Export Report</Button>
            </Link>
            <Link href="/app">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 space-y-8">

        {/* ── Hero Score ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall */}
          <Card className="md:col-span-1 border-2">
            <CardContent className="pt-6 pb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Overall Maturity</p>
              <div className="flex items-end gap-2">
                <span className={`text-5xl font-bold tabular-nums ${scoreColor(data.overallscore)}`}>
                  {data.overallscore.toFixed(1)}
                </span>
                <span className="text-lg text-muted-foreground mb-1">/5</span>
              </div>
              <Badge variant={STAGE_VARIANTS[data.overallstage] ?? 'default'} className="mt-2">
                {data.overallstage}
              </Badge>
            </CardContent>
          </Card>

          {/* AAIMM */}
          <Card>
            <CardContent className="pt-6 pb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">AAIMM Score</p>
              <p className="text-[10px] text-muted-foreground mb-2">Reasoning · Collaboration · Action</p>
              <div className="flex items-end gap-1">
                <span className={`text-3xl font-bold tabular-nums ${scoreColor(data.aaimmscore)}`}>
                  {data.aaimmscore.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">/5</span>
              </div>
              <Badge variant={STAGE_VARIANTS[data.aaimmstage] ?? 'default'} className="mt-2">
                {data.aaimmstage}
              </Badge>
            </CardContent>
          </Card>

          {/* Navigator */}
          <Card>
            <CardContent className="pt-6 pb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Navigator Score</p>
              <p className="text-[10px] text-muted-foreground mb-2">Data · Infrastructure · Governance · Change · Resources</p>
              <div className="flex items-end gap-1">
                <span className={`text-3xl font-bold tabular-nums ${scoreColor(data.navigatorscore)}`}>
                  {data.navigatorscore.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">/5</span>
              </div>
              <Badge variant={STAGE_VARIANTS[data.navigatorstage] ?? 'default'} className="mt-2">
                {data.navigatorstage}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* ── Radar + Dimension Breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Radar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Maturity Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#111827"
                    fill="#111827"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(val: number) => [val.toFixed(1), 'Score']}
                    contentStyle={{ fontSize: 12 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Dimension Scores */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Dimension Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(DIMENSION_DISPLAY).map(([key, meta]) => {
                  const score = dimScores[key] ?? 0
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-800">{meta.label}</span>
                          <span className="text-[10px] text-muted-foreground border rounded-full px-1.5 py-0.5">{meta.group}</span>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${scoreColor(score)}`}>
                          {score.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scoreBarColor(score)}`}
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Key Bottlenecks (deterministic) ── */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-900">Identified Bottlenecks</CardTitle>
            <p className="text-xs text-amber-700">Your lowest-scoring dimensions — address these first to unlock AI advancement.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bottomDims.map(([key, score]) => {
                const meta = DIMENSION_DISPLAY[key]
                return (
                  <div key={key} className="rounded-md border border-amber-200 bg-white p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-800">{meta?.label ?? key}</span>
                      <Badge variant="warning">{score.toFixed(1)}</Badge>
                    </div>
                    <span className="text-[10px] text-amber-700 font-medium">{meta?.group} Dimension</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Advisory Panel ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold">AI Advisory</h2>
              <p className="text-xs text-muted-foreground">
                Claude-powered analysis synthesized from your scores, industry, and context.
              </p>
            </div>
            {!data.advisory ? (
              <Button onClick={handleGenerateAdvisory} disabled={advisoryLoading}>
                {advisoryLoading ? 'Generating...' : 'Generate Advisory'}
              </Button>
            ) : (
              <Button variant="outline" onClick={handleGenerateAdvisory} disabled={advisoryLoading} size="sm">
                {advisoryLoading ? 'Refreshing...' : 'Refresh Advisory'}
              </Button>
            )}
          </div>

          {advisoryError && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {advisoryError}
            </div>
          )}

          {advisoryLoading && !data.advisory && (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Generating your advisory — this takes 15–30 seconds...
              </CardContent>
            </Card>
          )}

          {data.advisory && (
            <div className="space-y-3">
              {/* Executive Summary */}
              <Card className="border-gray-200">
                <CardContent className="pt-5 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Executive Summary</p>
                  <p className="text-sm leading-relaxed text-gray-800">{data.advisory.executive_summary}</p>
                </CardContent>
              </Card>

              {/* Top Bottlenecks (AI) */}
              <AdvisorySection
                title="Top Bottlenecks"
                subtitle="Root-cause analysis of critical gaps"
                expanded={expandedSections.bottlenecks}
                onToggle={() => toggleSection('bottlenecks')}
              >
                <div className="space-y-4">
                  {data.advisory.top_bottlenecks.map((b, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold">{b.dimension}</p>
                          <Badge variant="warning">{b.score}/5</Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{b.what}</p>
                        <p className="text-xs text-muted-foreground">{b.why_it_matters}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AdvisorySection>

              {/* 90-Day Roadmap */}
              <AdvisorySection
                title="90-Day Roadmap"
                subtitle="Phased action plan to advance AI maturity"
                expanded={expandedSections.roadmap}
                onToggle={() => toggleSection('roadmap')}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <RoadmapPhase label="Days 0–30" color="bg-gray-900" items={data.advisory.roadmap.days_0_30} />
                  <RoadmapPhase label="Days 31–60" color="bg-blue-700" items={data.advisory.roadmap.days_31_60} />
                  <RoadmapPhase label="Days 61–90" color="bg-emerald-700" items={data.advisory.roadmap.days_61_90} />
                </div>
              </AdvisorySection>

              {/* Use Cases */}
              <AdvisorySection
                title="Prioritized Use Cases"
                subtitle="AI opportunities ranked by ROI, effort, and current maturity"
                expanded={expandedSections.useCases}
                onToggle={() => toggleSection('useCases')}
              >
                <div className="space-y-3">
                  {data.advisory.prioritized_use_cases.map((uc, i) => (
                    <div key={i} className="rounded-md border bg-white p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-sm font-semibold">{uc.title}</p>
                        <div className="flex gap-1.5 shrink-0">
                          <RoiBadge label="ROI" value={uc.roi_band} />
                          <RoiBadge label="Effort" value={uc.effort} invert />
                          <RoiBadge label="Risk" value={uc.risk} invert />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{uc.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {uc.nividous_fit && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            Nividous fit
                          </span>
                        )}
                        {uc.partner_needed && (
                          <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium text-gray-600">
                            Partner required
                          </span>
                        )}
                        {uc.dependencies.map((dep, j) => (
                          <span key={j} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] text-gray-500">
                            Req: {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AdvisorySection>

              {/* Governance */}
              <AdvisorySection
                title="Governance & Risk"
                subtitle="AI governance requirements and recommendations"
                expanded={expandedSections.governance}
                onToggle={() => toggleSection('governance')}
              >
                <div className="space-y-3">
                  {data.advisory.governance_notes.map((g, i) => (
                    <div key={i} className="flex gap-3">
                      <UrgencyBadge urgency={g.urgency} />
                      <div>
                        <p className="text-sm font-semibold mb-1">{g.area}</p>
                        <p className="text-sm text-gray-600">{g.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AdvisorySection>

              {/* Partner Gaps */}
              {data.advisory.partner_gaps.length > 0 && (
                <AdvisorySection
                  title="Capability Gaps"
                  subtitle="Areas requiring specialized external partners"
                  expanded={expandedSections.partners}
                  onToggle={() => toggleSection('partners')}
                >
                  <div className="space-y-3">
                    {data.advisory.partner_gaps.map((p, i) => (
                      <div key={i} className="rounded-md border bg-white p-4">
                        <p className="text-sm font-semibold mb-1">{p.capability}</p>
                        <p className="text-xs text-muted-foreground mb-2">{p.reason}</p>
                        <p className="text-sm text-gray-700">{p.suggested_approach}</p>
                      </div>
                    ))}
                  </div>
                </AdvisorySection>
              )}

              {/* Nividous Fit */}
              {data.advisory.nividous_fit.length > 0 && (
                <AdvisorySection
                  title="Where Nividous Can Help"
                  subtitle="Areas aligned to Nividous process orchestration and AI integration expertise"
                  expanded={expandedSections.nividous}
                  onToggle={() => toggleSection('nividous')}
                >
                  <div className="space-y-3">
                    {data.advisory.nividous_fit.map((n, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-5 w-5 shrink-0 rounded-full bg-gray-900 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold mb-1">{n.area}</p>
                          <p className="text-sm text-gray-600">{n.how_nividous_helps}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AdvisorySection>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AdvisorySection({
  title,
  subtitle,
  expanded,
  onToggle,
  children,
}: {
  title: string
  subtitle: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="text-muted-foreground text-lg leading-none">
          {expanded ? '−' : '+'}
        </span>
      </button>
      {expanded && (
        <CardContent className="pt-0 pb-5">
          <div className="border-t pt-4">{children}</div>
        </CardContent>
      )}
    </Card>
  )
}

function RoadmapPhase({
  label,
  color,
  items,
}: {
  label: string
  color: string
  items: { action: string; owner: string; outcome: string }[]
}) {
  return (
    <div>
      <div className={`${color} text-white text-xs font-semibold rounded-t-md px-3 py-2`}>{label}</div>
      <div className="rounded-b-md border border-t-0 divide-y bg-white">
        {items.map((item, i) => (
          <div key={i} className="px-3 py-3">
            <p className="text-xs font-semibold text-gray-800 mb-0.5">{item.action}</p>
            <p className="text-[11px] text-muted-foreground">Owner: {item.owner}</p>
            <p className="text-[11px] text-gray-500 mt-1">{item.outcome}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoiBadge({ label, value, invert }: { label: string; value: 'Low' | 'Medium' | 'High'; invert?: boolean }) {
  const posColor = invert
    ? { Low: 'bg-emerald-100 text-emerald-800', Medium: 'bg-amber-100 text-amber-800', High: 'bg-red-100 text-red-800' }
    : { Low: 'bg-gray-100 text-gray-600', Medium: 'bg-blue-100 text-blue-800', High: 'bg-emerald-100 text-emerald-800' }

  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${posColor[value]}`}>
      {label}: {value}
    </span>
  )
}

function UrgencyBadge({ urgency }: { urgency: 'Low' | 'Medium' | 'High' }) {
  const map = {
    High: 'bg-red-100 text-red-700 border-red-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`shrink-0 mt-0.5 rounded border px-2 py-0.5 text-[10px] font-semibold ${map[urgency]}`}>
      {urgency}
    </span>
  )
}
