-- ============ enums ============
create type public.app_role as enum ('admin','client');
create type public.client_status as enum ('active','paused','completed','inactive');
create type public.campaign_status as enum ('draft','active','paused','completed','archived');
create type public.metrics_mode as enum ('live','manual');
create type public.lead_status as enum ('new','contacted','opened','replied','interested','meeting_booked','opportunity','won','lost');
create type public.reply_class as enum ('interested','not_interested','question','meeting_request','out_of_office','other');
create type public.opp_stage as enum ('new','qualified','meeting_booked','proposal','negotiation','won','lost');
create type public.screenshot_category as enum ('campaign_results','client_reply','analytics','testimonial','dashboard','before_after','other');

-- ============ helpers ============
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ============ clients ============
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  logo_url text,
  contact_name text,
  contact_email text,
  phone text,
  website text,
  industry text,
  status public.client_status not null default 'active',
  account_manager text,
  notes text,
  joined_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ profiles / roles ============
create table public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar_url text,
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
$$;

create or replace function public.my_client_id()
returns uuid language sql stable security definer set search_path = public as $$
  select client_id from public.profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare admin_exists boolean;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  select exists(select 1 from public.user_roles where role='admin') into admin_exists;
  insert into public.user_roles (user_id, role)
  values (new.id, case when admin_exists then 'client'::public.app_role else 'admin'::public.app_role end)
  on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ campaigns ============
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  description text,
  status public.campaign_status not null default 'draft',
  metrics_mode public.metrics_mode not null default 'manual',
  progress int not null default 0,
  start_date date,
  end_date date,
  open_rate_enabled boolean not null default true,
  click_rate_enabled boolean not null default true,
  leads_count int not null default 0,
  sequence_started int not null default 0,
  emails_sent int not null default 0,
  total_opens int not null default 0,
  unique_opens int not null default 0,
  total_clicks int not null default 0,
  unique_clicks int not null default 0,
  total_replies int not null default 0,
  unique_replies int not null default 0,
  opportunities int not null default 0,
  opportunity_value numeric not null default 0,
  meetings_booked int not null default 0,
  meetings_completed int not null default 0,
  won_deals int not null default 0,
  revenue numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.campaigns (client_id);

create table public.campaign_steps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  step_number int not null,
  subject text,
  sent int not null default 0,
  opened int not null default 0,
  replied int not null default 0,
  clicked int not null default 0,
  opportunities int not null default 0,
  created_at timestamptz not null default now(),
  unique (campaign_id, step_number)
);

create table public.campaign_daily_stats (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  day date not null,
  sent int not null default 0,
  total_opens int not null default 0,
  unique_opens int not null default 0,
  total_replies int not null default 0,
  total_clicks int not null default 0,
  unique_clicks int not null default 0,
  opportunities int not null default 0,
  unique (campaign_id, day)
);
create index on public.campaign_daily_stats (day);

-- ============ leads ============
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  first_name text,
  last_name text,
  company text,
  email text not null,
  phone text,
  website text,
  industry text,
  location text,
  status public.lead_status not null default 'new',
  tags text[] not null default '{}',
  notes text,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.leads (client_id);
create index on public.leads (campaign_id);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  activity_type text not null,
  description text,
  created_at timestamptz not null default now()
);
create index on public.lead_activities (campaign_id);
create index on public.lead_activities (client_id);

-- ============ replies ============
create table public.replies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  lead_name text,
  lead_email text not null,
  subject text,
  body text,
  classification public.reply_class not null default 'other',
  folder text not null default 'lead',
  is_read boolean not null default false,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index on public.replies (client_id);
create index on public.replies (campaign_id);

create table public.reply_messages (
  id uuid primary key default gen_random_uuid(),
  reply_id uuid not null references public.replies(id) on delete cascade,
  direction text not null default 'inbound',
  from_email text,
  to_email text,
  body text,
  sent_at timestamptz not null default now()
);

-- ============ opportunities / meetings ============
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  lead_name text,
  company text,
  value numeric not null default 0,
  stage public.opp_stage not null default 'new',
  expected_close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.opportunities (client_id);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  lead_name text,
  scheduled_at timestamptz,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- ============ proof ============
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  client_name text,
  company text,
  industry text,
  quote text,
  result_headline text,
  result_description text,
  logo_url text,
  photo_url text,
  campaign_id uuid references public.campaigns(id) on delete set null,
  leads int not null default 0,
  emails_sent int not null default 0,
  replies int not null default 0,
  opportunities int not null default 0,
  opportunity_value numeric not null default 0,
  meetings int not null default 0,
  revenue numeric not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.screenshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  title text,
  description text,
  image_url text not null,
  category public.screenshot_category not null default 'other',
  sort_order int not null default 0,
  taken_on date,
  created_at timestamptz not null default now()
);

-- ============ notifications / audit / settings ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  kind text not null default 'info',
  client_id uuid references public.clients(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  entity_type text not null,
  entity_id uuid,
  entity_label text,
  field text,
  old_value text,
  new_value text,
  action text not null default 'update',
  created_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============ triggers ============
create trigger t1 before update on public.clients for each row execute function public.update_updated_at_column();
create trigger t2 before update on public.campaigns for each row execute function public.update_updated_at_column();
create trigger t3 before update on public.leads for each row execute function public.update_updated_at_column();
create trigger t4 before update on public.opportunities for each row execute function public.update_updated_at_column();
create trigger t5 before update on public.testimonials for each row execute function public.update_updated_at_column();
create trigger t6 before update on public.profiles for each row execute function public.update_updated_at_column();

-- ============ grants + RLS ============
do $$
declare t text;
begin
  foreach t in array array['clients','profiles','user_roles','campaigns','campaign_steps','campaign_daily_stats',
    'leads','lead_activities','replies','reply_messages','opportunities','meetings','testimonials','screenshots',
    'notifications','admin_activity_logs','settings']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- profiles / roles
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin());
create policy "admin insert profile" on public.profiles for insert to authenticated with check (public.is_admin());
create policy "roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "roles admin write" on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin-only tables
create policy "admin all" on public.admin_activity_logs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "settings read" on public.settings for select to authenticated using (true);
create policy "settings admin" on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- clients
create policy "clients read" on public.clients for select to authenticated using (public.is_admin() or id = public.my_client_id());
create policy "clients admin write" on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- client-scoped tables
do $$
declare t text;
begin
  foreach t in array array['campaigns','leads','lead_activities','replies','opportunities','meetings','testimonials','screenshots','notifications']
  loop
    execute format($f$create policy "read scoped" on public.%I for select to authenticated using (public.is_admin() or client_id = public.my_client_id())$f$, t);
    execute format($f$create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())$f$, t);
  end loop;
end $$;

-- campaign-scoped children
create policy "steps read" on public.campaign_steps for select to authenticated using (public.is_admin() or exists (select 1 from public.campaigns c where c.id = campaign_id and c.client_id = public.my_client_id()));
create policy "steps admin" on public.campaign_steps for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "daily read" on public.campaign_daily_stats for select to authenticated using (public.is_admin() or exists (select 1 from public.campaigns c where c.id = campaign_id and c.client_id = public.my_client_id()));
create policy "daily admin" on public.campaign_daily_stats for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "msgs read" on public.reply_messages for select to authenticated using (public.is_admin() or exists (select 1 from public.replies r where r.id = reply_id and r.client_id = public.my_client_id()));
create policy "msgs admin" on public.reply_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());