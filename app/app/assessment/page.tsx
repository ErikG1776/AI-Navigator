'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { assessmentQuestions, type Dimension } from '@/lib/assessment-model'
import { saveAssessment } from '@/lib/assessment-service'
import { useAuth } from '@/lib/auth-context'
import type { CompanyContext } from '@/lib/advisory-types'

// ─── Constants ───────────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Financial Services & Banking',
  'Healthcare & Life Sciences',
  'Manufacturing & Industrial',
  'Retail & Consumer Goods',
  'Technology & Software',
  'Energy & Utilities',
  'Government & Public Sector',
  'Professional Services',
  'Insurance',
  'Telecommunications',
  'Other',
]

const COMPANY_SIZES = [
  'Under 500 employees',
  '500–1,000 employees',
  '1,000–5,000 employees',
  '5,000–15,000 employees',
  '15,000+ employees',
]

const ROLES = [
  'CEO / President',
  'CTO / CIO',
  'CDO / Chief Data Officer',
  'CISO',
  'VP Engineering / Technology',
  'Director of AI / Analytics',
  'Product / Strategy',
  'IT / Operations Manager',
  'Consultant / Advisor',
  'Other',
]

const DIMENSION_LABELS: Record<Dimension, { label: string; group: string; description: string }> = {
  reasoning: {
    label: 'Reasoning & Decision Quality',
    group: 'AAIMM',
    description: 'How rigorously your organization frames AI as decision science and validates outputs before acting.',
  },
  collaboration: {
    label: 'Cross-functional Collaboration',
    group: 'AAIMM',
    description: 'How effectively stakeholders from product, legal, data, and operations co-own AI governance and priorities.',
  },
  action: {
    label: 'Action & Operationalization',
    group: 'AAIMM',
    description: 'How reliably AI insights are converted into operational changes with accountable owners and measurable outcomes.',
  },
  data: {
    label: 'Data Foundation',
    group: 'Navigator',
    description: 'The maturity of your enterprise data infrastructure — governance, quality, lineage, and reusability for AI use cases.',
  },
  infrastructure: {
    label: 'AI Infrastructure & MLOps',
    group: 'Navigator',
    description: 'Your platform\'s ability to support scalable, governed, and reproducible AI model development and deployment.',
  },
  governance: {
    label: 'AI Governance & Risk',
    group: 'Navigator',
    description: 'The robustness of frameworks for model risk, compliance, bias, and privacy within your AI delivery process.',
  },
  change: {
    label: 'Change & Adoption',
    group: 'Navigator',
    description: 'How effectively your organization manages behavioral and process change required for sustained AI adoption.',
  },
  resources: {
    label: 'Resources & Talent',
    group: 'Navigator',
    description: 'How well funding, talent, and partner capacity are aligned to the AI portfolio based on strategic value.',
  },
}

const SCALE_LABELS: Record<number, { short: string; long: string }> = {
  1: { short: 'Ad hoc', long: 'Not established — ad hoc or absent' },
  2: { short: 'Emerging', long: 'Emerging — inconsistent across the org' },
  3: { short: 'Developing', long: 'Developing — functional but not standardized' },
  4: { short: 'Established', long: 'Established — consistent and well-managed' },
  5: { short: 'Optimized', long: 'Optimized — leading practice, continuously improved' },
}

const DIMENSION_ORDER: Dimension[] = [
  'reasoning',
  'collaboration',
  'action',
  'data',
  'infrastructure',
  'governance',
  'change',
  'resources',
]

// Step 0 = company context; steps 1–8 = dimensions; step 9 = review
const TOTAL_STEPS = 10

// ─── Component ───────────────────────────────────────────────────────────────

type WizardStep = 'context' | 'dimension' | 'review'

function getStepType(step: number): WizardStep {
  if (step === 0) return 'context'
  if (step === TOTAL_STEPS - 1) return 'review'
  return 'dimension'
}

function getDimensionForStep(step: number): Dimension {
  return DIMENSION_ORDER[step - 1]
}

function getQuestionsForDimension(dim: Dimension) {
  return assessmentQuestions.filter((q) => q.dimension === dim)
}

export default function AssessmentPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [context, setContext] = useState<CompanyContext>({
    industry: '',
    company_size: '',
    tool_stack: '',
    role: '',
    notes: '',
  })

  const [responses, setResponses] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (!user) return null

  const progressPct = Math.round((step / (TOTAL_STEPS - 1)) * 100)
  const stepType = getStepType(step)

  const canAdvanceContext =
    context.industry.trim() !== '' &&
    context.company_size.trim() !== '' &&
    context.role.trim() !== ''

  const canAdvanceDimension = () => {
    if (stepType !== 'dimension') return true
    const dim = getDimensionForStep(step)
    const qs = getQuestionsForDimension(dim)
    return qs.every((q) => typeof responses[q.key] === 'number')
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      const { assessmentId } = await saveAssessment(user.id, responses, context)
      router.push(`/app/results/${assessmentId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>AI Readiness Assessment</span>
            <span>
              {step === 0
                ? 'Company Profile'
                : step === TOTAL_STEPS - 1
                ? 'Review & Submit'
                : `Dimension ${step} of 8`}
            </span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* ── Step 0: Company Context ── */}
        {stepType === 'context' && (
          <ContextStep context={context} onChange={setContext} />
        )}

        {/* ── Steps 1–8: Dimension Questions ── */}
        {stepType === 'dimension' && (
          <DimensionStep
            dimension={getDimensionForStep(step)}
            responses={responses}
            onChange={(key, value) =>
              setResponses((prev) => ({ ...prev, [key]: value }))
            }
          />
        )}

        {/* ── Step 9: Review ── */}
        {stepType === 'review' && (
          <ReviewStep context={context} responses={responses} />
        )}

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0 || saving}
          >
            Back
          </Button>

          {stepType !== 'review' ? (
            <Button
              onClick={handleNext}
              disabled={
                stepType === 'context' ? !canAdvanceContext : !canAdvanceDimension()
              }
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

// ─── Context Step ─────────────────────────────────────────────────────────────

function ContextStep({
  context,
  onChange,
}: {
  context: CompanyContext
  onChange: (c: CompanyContext) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This context allows us to tailor your AI advisory to your industry, scale, and current environment.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-5">
        <SelectField
          label="Industry"
          required
          value={context.industry}
          options={INDUSTRIES}
          onChange={(v) => onChange({ ...context, industry: v })}
        />
        <SelectField
          label="Company Size"
          required
          value={context.company_size}
          options={COMPANY_SIZES}
          onChange={(v) => onChange({ ...context, company_size: v })}
        />
        <SelectField
          label="Your Role"
          required
          value={context.role}
          options={ROLES}
          onChange={(v) => onChange({ ...context, role: v })}
        />
        <TextInputField
          label="Primary Technology Stack"
          placeholder="e.g. Azure, Snowflake, Salesforce, SAP..."
          value={context.tool_stack}
          onChange={(v) => onChange({ ...context, tool_stack: v })}
          hint="List your major platforms and tools. This helps us identify integration opportunities."
        />
        <TextAreaField
          label="Additional Context"
          placeholder="Any ongoing AI initiatives, specific challenges, or goals you'd like to share..."
          value={context.notes}
          onChange={(v) => onChange({ ...context, notes: v })}
          hint="Optional — but the more you share, the more specific your advisory will be."
        />
      </div>
    </div>
  )
}

// ─── Dimension Step ───────────────────────────────────────────────────────────

function DimensionStep({
  dimension,
  responses,
  onChange,
}: {
  dimension: Dimension
  responses: Record<string, number>
  onChange: (key: string, value: number) => void
}) {
  const meta = DIMENSION_LABELS[dimension]
  const questions = getQuestionsForDimension(dimension)

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {meta.group}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{meta.label}</h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl">{meta.description}</p>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.key}
            index={i + 1}
            prompt={q.prompt}
            value={responses[q.key] ?? null}
            onChange={(v) => onChange(q.key, v)}
          />
        ))}
      </div>
    </div>
  )
}

function QuestionCard({
  index,
  prompt,
  value,
  onChange,
}: {
  index: number
  prompt: string
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-medium leading-relaxed text-gray-800">
        <span className="mr-2 text-muted-foreground">{index}.</span>
        {prompt}
      </p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => {
          const selected = value === score
          return (
            <button
              key={score}
              onClick={() => onChange(score)}
              className={[
                'flex-1 flex flex-col items-center gap-1 rounded-md border-2 py-3 transition-all',
                selected
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="text-base font-bold">{score}</span>
              <span className={['text-[10px] font-medium leading-tight text-center', selected ? 'text-gray-200' : 'text-gray-400'].join(' ')}>
                {SCALE_LABELS[score].short}
              </span>
            </button>
          )
        })}
      </div>
      {value !== null && (
        <p className="mt-3 text-xs text-muted-foreground">
          Selected: <span className="font-medium text-gray-700">{SCALE_LABELS[value].long}</span>
        </p>
      )}
    </div>
  )
}

// ─── Review Step ──────────────────────────────────────────────────────────────

function ReviewStep({
  context,
  responses,
}: {
  context: CompanyContext
  responses: Record<string, number>
}) {
  const dimensionAverages = DIMENSION_ORDER.map((dim) => {
    const qs = getQuestionsForDimension(dim)
    const avg = qs.reduce((sum, q) => sum + (responses[q.key] ?? 0), 0) / qs.length
    return { dimension: dim, label: DIMENSION_LABELS[dim].label, avg: Math.round(avg * 10) / 10 }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review Your Responses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm everything looks correct before submitting. Your results will be computed immediately.
        </p>
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Company Profile</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <ReviewField label="Industry" value={context.industry} />
          <ReviewField label="Company Size" value={context.company_size} />
          <ReviewField label="Role" value={context.role} />
          <ReviewField label="Tech Stack" value={context.tool_stack || 'Not provided'} />
        </dl>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Dimension Averages</h2>
        <div className="space-y-3">
          {dimensionAverages.map(({ dimension, label, avg }) => (
            <div key={dimension} className="flex items-center gap-3">
              <span className="w-48 text-sm text-gray-600 shrink-0">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gray-800 transition-all"
                  style={{ width: `${(avg / 5) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-sm font-semibold tabular-nums">{avg}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        After submission, your AI maturity scores will be computed and an AI advisory will be available for generation on the results page.
      </p>
    </div>
  )
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </>
  )
}

// ─── Form Primitives ──────────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  options,
  onChange,
  required,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

function TextInputField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none"
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
