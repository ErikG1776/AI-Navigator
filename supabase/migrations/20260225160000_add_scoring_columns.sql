alter table public.assessments
  add column if not exists aaImmScore numeric,
  add column if not exists navigatorScore numeric,
  add column if not exists overallScore numeric,
  add column if not exists aaImmStage text,
  add column if not exists navigatorStage text,
  add column if not exists overallStage text;
