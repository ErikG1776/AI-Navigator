import { supabase } from '@/lib/supabase'
import { calculateScores } from '@/lib/scoring'

type AssessmentResponse = {
  [questionKey: string]: number
}

export async function saveAssessment(
  userId: string,
  responses: AssessmentResponse
) {
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      title: 'AI Navigator Assessment',
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