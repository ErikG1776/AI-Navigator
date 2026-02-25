'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { assessmentQuestions } from '@/lib/assessment-model'
import { saveAssessment } from '@/lib/assessment-service'
import { useAuth } from '@/lib/auth-context'

export default function AssessmentPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const handleStartAssessment = async () => {
    const responses = Object.fromEntries(
      assessmentQuestions.map((question) => [question.key, 3])
    )

    const { assessmentId } = await saveAssessment(user.id, responses)
    router.push(`/app/results/${assessmentId}`)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <div className="w-full space-y-4 rounded-lg border p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">AI Readiness Assessment</h1>
        <Button onClick={handleStartAssessment}>
          Start Assessment
        </Button>
      </div>
    </main>
  )
}