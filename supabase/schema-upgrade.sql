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

alter table storage.objects enable row level security;

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
