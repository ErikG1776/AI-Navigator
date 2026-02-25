'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { signOutUser } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { getAssessmentHistory } from '@/lib/assessment-service'

type AssessmentSummary = {
  id: string
  title: string | null
  created_at: string
  overallscore: number | null
  overallstage: string | null
  aaimmscore: number | null
  aaimmstage: string | null
  navigatorscore: number | null
  navigatorstage: string | null
}

const STAGE_VARIANTS: Record<string, 'muted' | 'warning' | 'info' | 'success' | 'default'> = {
  Emerging: 'muted',
  Developing: 'warning',
  Operational: 'info',
  Scaling: 'success',
  Optimized: 'success',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (!user) return
    getAssessmentHistory(user.id)
      .then((data) => setAssessments(data as AssessmentSummary[]))
      .catch(console.error)
      .finally(() => setHistoryLoading(false))
  }, [user])

  const handleSignOut = async () => {
    await signOutUser()
    router.replace('/auth/login')
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Nividous</p>
            <h1 className="text-lg font-semibold">AI Navigator</h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground hidden sm:block">{user.email}</p>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">

        {/* CTA banner */}
        <div className="rounded-xl border-2 border-gray-900 bg-gray-900 text-white px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">AI Readiness Assessment</h2>
            <p className="text-sm text-gray-300 mt-1 max-w-lg">
              Complete a guided 24-question assessment across 8 AI maturity dimensions. Receive scores, a deterministic maturity stage, and an AI advisory tailored to your industry.
            </p>
          </div>
          <Link href="/app/assessment">
            <Button variant="secondary" className="shrink-0">
              Start Assessment
            </Button>
          </Link>
        </div>

        {/* Assessment history */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Assessment History
          </h2>

          {historyLoading ? (
            <p className="text-sm text-muted-foreground">Loading history...</p>
          ) : assessments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">No assessments yet</p>
                <p className="text-xs text-muted-foreground">
                  Complete your first assessment to see your AI maturity score and advisory.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {assessments.map((a) => (
                <Link key={a.id} href={`/app/results/${a.id}`} className="block">
                  <Card className="hover:border-gray-400 transition-colors cursor-pointer">
                    <CardContent className="py-4 px-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {a.title ?? 'AI Readiness Assessment'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(a.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {a.overallscore !== null && (
                            <div className="text-right">
                              <p className="text-lg font-bold tabular-nums">{a.overallscore.toFixed(1)}</p>
                              <p className="text-[10px] text-muted-foreground">Overall</p>
                            </div>
                          )}
                          {a.overallstage && (
                            <Badge variant={STAGE_VARIANTS[a.overallstage] ?? 'default'}>
                              {a.overallstage}
                            </Badge>
                          )}
                          <span className="text-muted-foreground text-sm">→</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Maturity stage legend */}
        <Card>
          <CardContent className="py-4 px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Maturity Stage Reference
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { stage: 'Emerging', range: '1.0–1.9', desc: 'Ad hoc, no defined AI process' },
                { stage: 'Developing', range: '2.0–2.9', desc: 'Isolated efforts, inconsistent' },
                { stage: 'Operational', range: '3.0–3.9', desc: 'Functional, not yet scaled' },
                { stage: 'Scaling', range: '4.0–4.5', desc: 'Consistent, enterprise-wide' },
                { stage: 'Optimized', range: '4.6–5.0', desc: 'Best-in-class, self-improving' },
              ].map((s) => (
                <div key={s.stage} className="text-center">
                  <Badge variant={STAGE_VARIANTS[s.stage] ?? 'default'} className="mb-1">
                    {s.stage}
                  </Badge>
                  <p className="text-[10px] font-mono text-muted-foreground">{s.range}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
