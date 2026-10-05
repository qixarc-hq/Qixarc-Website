create table public.qixarc_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.qixarc_admins enable row level security;
grant select on public.qixarc_admins to authenticated;
revoke all on public.qixarc_admins from anon;
create policy "Admins can verify own membership" on public.qixarc_admins for select to authenticated using (user_id = (select auth.uid()));
create table public.qixarc_enquiries (
 id uuid primary key,
 name text not null check (char_length(trim(name)) between 1 and 100),
 email text not null check (char_length(email) between 3 and 180 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 service text not null default 'A new digital project' check (char_length(service) <= 100),
 message text not null check (char_length(trim(message)) between 10 and 5000),
 status text not null default 'new' check (status in ('new','read','archived')),
 created_at timestamptz not null default now()
);
alter table public.qixarc_enquiries enable row level security;
grant insert(id,name,email,service,message) on public.qixarc_enquiries to anon,authenticated;
grant select,update(status) on public.qixarc_enquiries to authenticated;
create policy "Visitors submit enquiries" on public.qixarc_enquiries for insert to anon,authenticated with check (status='new');
create policy "Admins read enquiries" on public.qixarc_enquiries for select to authenticated using (exists(select 1 from public.qixarc_admins where user_id=(select auth.uid())));
create policy "Admins triage enquiries" on public.qixarc_enquiries for update to authenticated using (exists(select 1 from public.qixarc_admins where user_id=(select auth.uid()))) with check (exists(select 1 from public.qixarc_admins where user_id=(select auth.uid())));
create index qixarc_enquiries_created on public.qixarc_enquiries(created_at desc);
create table public.qixarc_content (
 id uuid primary key default gen_random_uuid(),
 kind text not null check (kind in ('blog','research')),
 slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug)<=100),
 title text not null check (char_length(trim(title)) between 1 and 180),
 summary text not null default '' check (char_length(summary)<=600),
 body text not null check (char_length(trim(body)) between 1 and 50000),
 status text not null default 'draft' check (status in ('draft','published')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(kind,slug)
);
alter table public.qixarc_content enable row level security;
grant select on public.qixarc_content to anon,authenticated;
grant insert,update,delete on public.qixarc_content to authenticated;
create policy "Visitors read published content" on public.qixarc_content for select to anon,authenticated using(status='published');
create policy "Admins manage content" on public.qixarc_content for all to authenticated using(exists(select 1 from public.qixarc_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.qixarc_admins where user_id=(select auth.uid())));
create index qixarc_content_published on public.qixarc_content(kind,created_at desc) where status='published';

-- Explicitly replace Supabase default grants with the intended column privileges.
revoke all on public.qixarc_admins from anon,authenticated;
grant select on public.qixarc_admins to authenticated;
revoke all on public.qixarc_enquiries from anon,authenticated;
grant insert(id,name,email,service,message) on public.qixarc_enquiries to anon,authenticated;
grant select,update(status) on public.qixarc_enquiries to authenticated;
revoke all on public.qixarc_content from anon,authenticated;
grant select on public.qixarc_content to anon,authenticated;
grant insert,update,delete on public.qixarc_content to authenticated;
