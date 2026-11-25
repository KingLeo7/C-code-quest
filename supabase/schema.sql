create table if not exists public.guest_progress (
  guest_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  coins integer not null default 30 check (coins >= 0),
  completed text[] not null default '{}',
  world integer not null default 0 check (world between 0 and 4),
  updated_at timestamptz not null default now()
);

alter table public.guest_progress enable row level security;

create policy "anonymous player reads own progress"
on public.guest_progress for select to authenticated
using (guest_id = auth.uid());

create policy "anonymous player creates own progress"
on public.guest_progress for insert to authenticated
with check (guest_id = auth.uid());

create policy "anonymous player updates own progress"
on public.guest_progress for update to authenticated
using (guest_id = auth.uid())
with check (guest_id = auth.uid());

-- Enable Anonymous Sign-ins in Supabase Dashboard > Authentication > Providers.
-- Supabase anonymous users use the authenticated role and auth.uid() for RLS.
