-- Profiles table mirrors auth.users for app-level metadata.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text
);

create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_email text not null,
  subject text,
  body text,
  is_starred boolean not null default false,
  is_archived boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.emails enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "emails_select_participant" on public.emails;
create policy "emails_select_participant" on public.emails
for select using (
  sender_id = auth.uid()
  or lower(recipient_email) = lower((select email from public.profiles where id = auth.uid()))
);

drop policy if exists "emails_insert_sender" on public.emails;
create policy "emails_insert_sender" on public.emails
for insert with check (sender_id = auth.uid());

drop policy if exists "emails_update_participant" on public.emails;
create policy "emails_update_participant" on public.emails
for update using (
  sender_id = auth.uid()
  or lower(recipient_email) = lower((select email from public.profiles where id = auth.uid()))
);
