import { supabase } from '@/lib/supabase'
import { calculateScores } from '@/lib/scoring'
import type { CompanyContext } from '@/lib/advisory-types'

type AssessmentResponse = {
  [questionKey: string]: number
}

export async function saveAssessment(
  userId: string,
  responses: AssessmentResponse,
  companyContext?: CompanyContext
) {
  const industry = companyContext?.industry ?? 'Unknown'
  const title = `AI Readiness Assessment — ${industry}`

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      title,
      company_context: companyContext ?? null,
    })
    .select('id')
    .single()

  if (assessmentError || !assessment) {
    throw assessmentError ?? new Error('Failed to create assessment')
  }

  const assessmentId = assessment.id as string

  const answerRows = Object.entries(responses).map(([questionKey, value]) => ({
    assessment_id: assessmentId,
    question_key: questionKey,
    answer_text: String(value),
    answer_json: { value },
  }))

  if (answerRows.length > 0) {
    const { error: answersError } = await supabase
      .from('assessment_answers')
      .insert(answerRows)

    if (answersError) {
      throw answersError
    }
  }

  const scores = calculateScores(responses)

  const { error: updateAssessmentError } = await supabase
    .from('assessments')
    .update({
      aaimmscore: scores.aaImmScore,
      navigatorscore: scores.navigatorScore,
      overallscore: scores.overallScore,
      aaimmstage: scores.aaImmStage,
      navigatorstage: scores.navigatorStage,
      overallstage: scores.overallStage,
      dimension_scores: scores.dimensionScores,
    })
    .eq('id', assessmentId)

  if (updateAssessmentError) {
    throw updateAssessmentError
  }

  return {
    assessmentId,
    scores,
  }
}

export async function deleteAssessment(assessmentId: string) {
  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', assessmentId)

  if (error) throw error
}

export async function getAssessmentHistory(userId: string) {
  const { data, error } = await supabase
    .from('assessments')
    .select(
      'id, title, created_at, overallscore, overallstage, aaimmscore, aaimmstage, navigatorscore, navigatorstage'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
