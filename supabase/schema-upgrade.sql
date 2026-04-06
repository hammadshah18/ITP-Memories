-- Advanced memory platform schema upgrade
-- Run in Supabase SQL editor

alter table if exists public.memories
  add column if not exists tagged_friends text[] default '{}',
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists aspect_ratio text,
  add column if not exists display_type text,
  add column if not exists created_by_email text;

alter table if exists public.memories
  alter column tagged_friends set default '{}';

create index if not exists idx_memories_created_by_email on public.memories (created_by_email);
create index if not exists idx_memories_is_private on public.memories (is_private);
create index if not exists idx_memories_date on public.memories (date desc);

alter table public.memories enable row level security;

-- Replace temporary permissive policies with authenticated-only access
-- Adjust names if your policies already exist with different names.
drop policy if exists "memories_select_all" on public.memories;
drop policy if exists "memories_insert_all" on public.memories;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memories' and policyname = 'memories_select_authenticated'
  ) then
    create policy "memories_select_authenticated"
      on public.memories
      for select
      to authenticated
      using (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memories' and policyname = 'memories_insert_authenticated'
  ) then
    create policy "memories_insert_authenticated"
      on public.memories
      for insert
      to authenticated
      with check (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memories' and policyname = 'memories_delete_authenticated'
  ) then
    create policy "memories_delete_authenticated"
      on public.memories
      for delete
      to authenticated
      using (auth.uid() is not null);
  end if;
end $$;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_reactions (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  user_email text not null,
  emoji text not null check (emoji in ('❤️', '😂', '😮', '😢', '🔥')),
  created_at timestamptz not null default now(),
  unique(memory_id, user_email)
);

create table if not exists public.memory_comments (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  user_email text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user_email on public.push_subscriptions (user_email);
create index if not exists idx_memory_reactions_memory_id on public.memory_reactions (memory_id);
create index if not exists idx_memory_comments_memory_id on public.memory_comments (memory_id);
create index if not exists idx_memory_comments_created_at on public.memory_comments (created_at desc);

alter table public.push_subscriptions enable row level security;
alter table public.memory_reactions enable row level security;
alter table public.memory_comments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'push_subscriptions' and policyname = 'push_subscriptions_select_authenticated'
  ) then
    create policy "push_subscriptions_select_authenticated"
      on public.push_subscriptions
      for select
      to authenticated
      using (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'push_subscriptions' and policyname = 'push_subscriptions_insert_authenticated'
  ) then
    create policy "push_subscriptions_insert_authenticated"
      on public.push_subscriptions
      for insert
      to authenticated
      with check (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'push_subscriptions' and policyname = 'push_subscriptions_update_authenticated'
  ) then
    create policy "push_subscriptions_update_authenticated"
      on public.push_subscriptions
      for update
      to authenticated
      using (auth.uid() is not null)
      with check (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'push_subscriptions' and policyname = 'push_subscriptions_delete_authenticated'
  ) then
    create policy "push_subscriptions_delete_authenticated"
      on public.push_subscriptions
      for delete
      to authenticated
      using (auth.uid() is not null);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memory_reactions' and policyname = 'memory_reactions_select_all'
  ) then
    create policy "memory_reactions_select_all"
      on public.memory_reactions
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memory_reactions' and policyname = 'memory_reactions_insert_allowed_emails'
  ) then
    create policy "memory_reactions_insert_allowed_emails"
      on public.memory_reactions
      for insert
      to anon, authenticated
      with check (
        lower(user_email) in (
          'hammadshah7218@gmail.com',
          'razakhanzada100@gmail.com',
          'aitzazhakro123@gmail.com',
          'hammadmasood179@gmail.com'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memory_reactions' and policyname = 'memory_reactions_update_allowed_emails'
  ) then
    create policy "memory_reactions_update_allowed_emails"
      on public.memory_reactions
      for update
      to anon, authenticated
      using (
        lower(user_email) in (
          'hammadshah7218@gmail.com',
          'razakhanzada100@gmail.com',
          'aitzazhakro123@gmail.com',
          'hammadmasood179@gmail.com'
        )
      )
      with check (
        lower(user_email) in (
          'hammadshah7218@gmail.com',
          'razakhanzada100@gmail.com',
          'aitzazhakro123@gmail.com',
          'hammadmasood179@gmail.com'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memory_reactions' and policyname = 'memory_reactions_delete_allowed_emails'
  ) then
    create policy "memory_reactions_delete_allowed_emails"
      on public.memory_reactions
      for delete
      to anon, authenticated
      using (
        lower(user_email) in (
          'hammadshah7218@gmail.com',
          'razakhanzada100@gmail.com',
          'aitzazhakro123@gmail.com',
          'hammadmasood179@gmail.com'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memory_comments' and policyname = 'memory_comments_select_all'
  ) then
    create policy "memory_comments_select_all"
      on public.memory_comments
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memory_comments' and policyname = 'memory_comments_insert_allowed_emails'
  ) then
    create policy "memory_comments_insert_allowed_emails"
      on public.memory_comments
      for insert
      to anon, authenticated
      with check (
        lower(user_email) in (
          'hammadshah7218@gmail.com',
          'razakhanzada100@gmail.com',
          'aitzazhakro123@gmail.com',
          'hammadmasood179@gmail.com'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'memory_comments' and policyname = 'memory_comments_delete_allowed_emails'
  ) then
    create policy "memory_comments_delete_allowed_emails"
      on public.memory_comments
      for delete
      to anon, authenticated
      using (
        lower(user_email) in (
          'hammadshah7218@gmail.com',
          'razakhanzada100@gmail.com',
          'aitzazhakro123@gmail.com',
          'hammadmasood179@gmail.com'
        )
      );
  end if;
end $$;

-- Storage bucket policies for "memories" bucket (authenticated users)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'storage_memories_authenticated_read'
  ) then
    create policy "storage_memories_authenticated_read"
      on storage.objects
      for select
      to authenticated
      using (bucket_id = 'memories' and auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'storage_memories_authenticated_insert'
  ) then
    create policy "storage_memories_authenticated_insert"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'memories' and auth.uid() is not null);
  end if;
end $$;
