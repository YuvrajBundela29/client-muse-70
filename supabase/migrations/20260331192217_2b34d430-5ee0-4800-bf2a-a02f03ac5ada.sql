
-- User roles system
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Admins can read roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Make profiles publicly readable for portfolio feature
create policy "Public can read profiles for portfolio"
on public.profiles for select to anon
using (onboarding_complete = true);

-- Client portal links
create table public.client_portal_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lead_id uuid references public.leads(id) on delete cascade not null,
  token text not null unique default substr(md5(gen_random_uuid()::text), 1, 12),
  message text,
  is_active boolean default true,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days')
);

alter table public.client_portal_links enable row level security;

create policy "Users can manage own portal links"
on public.client_portal_links for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Anyone can read active portal links"
on public.client_portal_links for select to anon
using (is_active = true);

-- Client responses
create table public.client_responses (
  id uuid primary key default gen_random_uuid(),
  portal_link_id uuid references public.client_portal_links(id) on delete cascade not null,
  respondent_name text,
  respondent_email text,
  message text not null,
  interest_level text default 'interested',
  created_at timestamptz default now()
);

alter table public.client_responses enable row level security;

create policy "Anyone can insert responses"
on public.client_responses for insert to anon, authenticated
with check (true);

create policy "Users can read own responses"
on public.client_responses for select to authenticated
using (
  exists (
    select 1 from public.client_portal_links
    where id = client_responses.portal_link_id
    and user_id = auth.uid()
  )
);

-- Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  role text,
  content text not null,
  rating integer default 5,
  is_approved boolean default false,
  created_at timestamptz default now()
);

alter table public.testimonials enable row level security;

create policy "Anyone can read approved testimonials"
on public.testimonials for select to anon, authenticated
using (is_approved = true);

create policy "Users can insert testimonials"
on public.testimonials for insert to authenticated
with check (auth.uid() = user_id);

-- A/B experiment events
create table public.ab_events (
  id uuid primary key default gen_random_uuid(),
  variant text not null,
  event_type text not null default 'view',
  user_id uuid,
  created_at timestamptz default now()
);

alter table public.ab_events enable row level security;

create policy "Anyone can insert ab events"
on public.ab_events for insert to anon, authenticated
with check (true);

create policy "Admins can read ab events"
on public.ab_events for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Allow leads to be read publicly for portal feature
create policy "Public can read leads for portal"
on public.leads for select to anon
using (true);
