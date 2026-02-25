alter table public.assessments
  add column if not exists dimension_scores jsonb,
  add column if not exists company_context jsonb,
  add column if not exists advisory jsonb;
