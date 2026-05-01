-- Supabase SQL Editor에서 실행하세요

-- 1. habits 테이블
create table public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  last_done_date text -- 'Mon May 01 2026' 형식 (기존 코드와 동일)
);

-- 2. 인덱스
create index habits_user_id_idx on public.habits(user_id);

-- 3. RLS 활성화 (자신의 데이터만 접근 가능)
alter table public.habits enable row level security;

create policy "users can read own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);
