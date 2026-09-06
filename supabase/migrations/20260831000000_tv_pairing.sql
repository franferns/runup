-- Slice 7: TV companion pairing + shared session state

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  state jsonb not null default '{"v":1,"personaId":null,"budgetHours":null,"watchedIds":[],"skippedIds":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pairing_codes (
  code text primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  device_token text not null unique,
  label text,
  paired_at timestamptz not null default now()
);

create index pairing_codes_session_id_idx on public.pairing_codes(session_id);
create index pairing_codes_expires_at_idx on public.pairing_codes(expires_at);
create index devices_session_id_idx on public.devices(session_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

alter table public.sessions enable row level security;
alter table public.pairing_codes enable row level security;
alter table public.devices enable row level security;

-- UUID session ids are unguessable; clients filter by id. Mutations go through edge functions.
create policy sessions_select on public.sessions for select using (true);
create policy devices_select on public.devices for select using (true);

alter publication supabase_realtime add table public.sessions;
