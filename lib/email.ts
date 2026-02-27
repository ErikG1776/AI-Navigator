import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

// DEBUG LINE — remove later
console.log('RESEND KEY EXISTS:', !!resendApiKey)

if (!resendApiKey) {
  throw new Error('Missing required environment variable: RESEND_API_KEY')
}

const resend = new Resend(resendApiKey)

export async function sendAssessmentReportEmail(params: {
  to: string
  recipientName?: string
  companyName?: string
  assessmentId: string
  overallScore: number
  overallStage: string
  reportUrl: string
}) {
  const {
    to,
    recipientName,
    companyName,
    assessmentId,
    overallScore,
    overallStage,
    reportUrl,
  } = params

  const greetingName = recipientName?.trim() || 'there'
  const companyLine = companyName?.trim()
    ? `<p><strong>Company:</strong> ${companyName}</p>`
    : ''

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2>Your AI Navigator Report is Ready</h2>
      <p>Hi ${greetingName},</p>
      <p>Your assessment has been completed and your report is now available.</p>
      <p><strong>Assessment ID:</strong> ${assessmentId}</p>
      ${companyLine}
      <p><strong>Overall Score:</strong> ${overallScore}</p>
      <p><strong>Overall Stage:</strong> ${overallStage}</p>
      <p style="margin: 24px 0;">
        <a
          href="${reportUrl}"
          style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px;"
        >
          View Report
        </a>
      </p>
      <p>If the button does not work, use this link:</p>
      <p><a href="${reportUrl}">${reportUrl}</a></p>
    </div>
  `

  try {
    const response = await resend.emails.send({
      from: 'AI Navigator <onboarding@resend.dev>',
      to,
      subject: 'Your AI Navigator Report is Ready',
      html,
    })

    console.log('RESEND RESPONSE:', response)

    return response
  } catch (error) {
    console.error('RESEND ERROR:', error)
    throw error
  }
}