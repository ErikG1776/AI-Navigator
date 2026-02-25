'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

type AssessmentResultRow = {
  overallscore: number | null
  overallstage: string | null
  aaimmscore: number | null
  aaimmstage: string | null
  navigatorscore: number | null
  navigatorstage: string | null
} | null

export default function AssessmentResultsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isLoading } = useAuth()
  const [result, setResult] = useState<AssessmentResultRow>(null)

  const assessmentId = params?.id as string

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (!user || !assessmentId) return

    const fetchAssessment = async () => {
      await supabase.auth.getSession()

      const { data, error } = await supabase
        .from('assessments')
        .select(
          'overallscore, overallstage, aaimmscore, aaimmstage, navigatorscore, navigatorstage'
        )
        .eq('id', assessmentId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Fetch error:', error)
        setResult(null)
        return
      }

      console.log('Assessment result:', data)
      setResult(data)
    }

    fetchAssessment()
  }, [assessmentId, user])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Assessment Results Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm">{JSON.stringify(result)}</pre>
        </CardContent>
      </Card>
    </main>
  )
}
