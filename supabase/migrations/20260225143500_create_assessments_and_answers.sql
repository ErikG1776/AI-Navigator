create extension if not exists pgcrypto;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_key text not null,
  answer_text text,
  answer_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_answers_question_key_not_empty check (char_length(question_key) > 0)
);

create unique index if not exists assessment_answers_assessment_id_question_key_idx
  on public.assessment_answers (assessment_id, question_key);

alter table public.assessments enable row level security;
alter table public.assessment_answers enable row level security;

create policy "Users can view their own assessments"
  on public.assessments
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own assessments"
  on public.assessments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own assessments"
  on public.assessments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own assessments"
  on public.assessments
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can view answers for their own assessments"
  on public.assessment_answers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assessments a
      where a.id = assessment_answers.assessment_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can insert answers for their own assessments"
  on public.assessment_answers
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.assessments a
      where a.id = assessment_answers.assessment_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can update answers for their own assessments"
  on public.assessment_answers
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.assessments a
      where a.id = assessment_answers.assessment_id
        and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.assessments a
      where a.id = assessment_answers.assessment_id
        and a.user_id = auth.uid()
    )
  );

create policy "Users can delete answers for their own assessments"
  on public.assessment_answers
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.assessments a
      where a.id = assessment_answers.assessment_id
        and a.user_id = auth.uid()
    )
  );
