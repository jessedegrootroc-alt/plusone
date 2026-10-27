-- PlusOne: je hele reis (gewoontes, logboek, spiegel, koektrommel, grenzen) als één document per gebruiker.
-- De app werkt eerst lokaal; dit is de kopie in de cloud, zodat je niets kwijtraakt en op meer apparaten kunt werken.
-- Plak dit in Supabase onder SQL Editor en klik Run.

create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: iedereen ziet en wijzigt alleen zijn eigen reis.
alter table public.user_state enable row level security;

drop policy if exists "eigen reis lezen" on public.user_state;
create policy "eigen reis lezen" on public.user_state
  for select using (auth.uid() = user_id);

drop policy if exists "eigen reis aanmaken" on public.user_state;
create policy "eigen reis aanmaken" on public.user_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "eigen reis bijwerken" on public.user_state;
create policy "eigen reis bijwerken" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "eigen reis verwijderen" on public.user_state;
create policy "eigen reis verwijderen" on public.user_state
  for delete using (auth.uid() = user_id);
