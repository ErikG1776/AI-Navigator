import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nividous</span>
            <p className="text-sm font-bold leading-tight">AI Navigator</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 border-b">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 inline-block rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            Enterprise AI Consulting · Powered by Nividous
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-gray-900 mb-5">
            Know exactly where your<br />enterprise AI stands.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-8">
            AI Navigator delivers a rigorous, dimension-by-dimension maturity assessment with
            deterministic scoring and an AI advisory synthesized for your industry and context.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signup"
              className="rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Start your assessment →
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md border px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign in to your portal
            </Link>
          </div>
        </div>
      </section>

      {/* What it measures */}
      <section className="px-6 py-16 border-b bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Assessment Framework
          </p>
          <h2 className="text-2xl font-bold mb-8">Two lenses. Eight dimensions.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FrameworkCard
              label="AAIMM"
              title="Adaptive AI Maturity Model"
              subtitle="Organizational readiness to act on AI"
              items={[
                { name: 'Reasoning', desc: 'Decision quality and hypothesis discipline' },
                { name: 'Collaboration', desc: 'Cross-functional co-ownership of AI priorities' },
                { name: 'Action', desc: 'Conversion of AI insight to operational change' },
              ]}
            />
            <FrameworkCard
              label="Navigator"
              title="AI Readiness Foundation"
              subtitle="Technical and structural enablers"
              items={[
                { name: 'Data', desc: 'Data quality, governance, and reusability' },
                { name: 'Infrastructure', desc: 'MLOps, deployment, and scale' },
                { name: 'Governance', desc: 'Risk, compliance, and ethics controls' },
                { name: 'Change', desc: 'Adoption management and stakeholder alignment' },
                { name: 'Resources', desc: 'Talent, funding, and partner capacity' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 border-b">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            How it works
          </p>
          <h2 className="text-2xl font-bold mb-8">From assessment to advisory in minutes.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StepCard
              number="01"
              title="Complete the assessment"
              desc="Answer 24 structured questions across 8 dimensions. Takes 15–20 minutes. Based on established AI consulting frameworks."
            />
            <StepCard
              number="02"
              title="Get your maturity scores"
              desc="Receive dimension scores, composite scores, and a maturity stage classification — computed deterministically, not by AI guesswork."
            />
            <StepCard
              number="03"
              title="Receive your AI advisory"
              desc="Claude synthesizes your scores, industry, and context into a structured advisory: bottlenecks, a 90-day roadmap, and prioritized use cases."
            />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="px-6 py-16 border-b bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ValueProp
              title="Executive-grade output"
              desc="Built for CIOs, CTOs, and CDOs. Every output is structured, specific, and ready to present to leadership."
            />
            <ValueProp
              title="Deterministic credibility"
              desc="Scores are computed from your responses, not estimated by AI. The LLM synthesizes — it never fabricates your score."
            />
            <ValueProp
              title="Re-assess quarterly"
              desc="Track maturity over time. Return every quarter to measure progress and refresh your advisory with updated context."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to assess your AI readiness?</h2>
          <p className="text-gray-500 mb-6">
            Free to start. No commitment required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block rounded-md bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Start your free assessment →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2026 Nividous. All rights reserved.</p>
          <p>AI Navigator is a Nividous product. Powered by Claude.</p>
        </div>
      </footer>
    </div>
  )
}

function FrameworkCard({
  label,
  title,
  subtitle,
  items,
}: {
  label: string
  title: string
  subtitle: string
  items: { name: string; desc: string }[]
}) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 mb-3">
        {label}
      </span>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.name} className="flex gap-2 text-sm">
            <span className="font-medium text-gray-800 w-28 shrink-0">{item.name}</span>
            <span className="text-gray-500">{item.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StepCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-gray-200 mb-2">{number}</p>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function ValueProp({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}
