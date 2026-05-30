create extension if not exists pgcrypto;

create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  handle text,
  location text,
  bio text,
  avatar_url text,
  booking_rate integer,
  booking_rate_label text default 'per day',
  roles text[] not null default '{}'::text[],
  jobs_done integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  name text not null,
  price integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_media (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  url text not null,
  type text not null check (type in ('image', 'video')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  client_id uuid not null references auth.users (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  client_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('inquiry', 'confirmed', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.professionals enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_media enable row level security;
alter table public.reviews enable row level security;
alter table public.bookings enable row level security;

alter table public.profiles enable row level security;

drop policy if exists "professionals_select_public" on public.professionals;
create policy "professionals_select_public"
  on public.professionals
  for select
  using (true);

drop policy if exists "professionals_insert_owner" on public.professionals;
create policy "professionals_insert_owner"
  on public.professionals
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "professionals_update_owner" on public.professionals;
create policy "professionals_update_owner"
  on public.professionals
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "services_select_public" on public.services;
create policy "services_select_public"
  on public.services
  for select
  using (true);

drop policy if exists "services_write_owner" on public.services;
create policy "services_write_owner"
  on public.services
  for all
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "portfolio_select_public" on public.portfolio_media;
create policy "portfolio_select_public"
  on public.portfolio_media
  for select
  using (true);

drop policy if exists "portfolio_write_owner" on public.portfolio_media;
create policy "portfolio_write_owner"
  on public.portfolio_media
  for all
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "reviews_select_public" on public.reviews;
create policy "reviews_select_public"
  on public.reviews
  for select
  using (true);

drop policy if exists "reviews_insert_authenticated" on public.reviews;
create policy "reviews_insert_authenticated"
  on public.reviews
  for insert
  with check (auth.uid() = client_id);

drop policy if exists "bookings_select_owner_or_client" on public.bookings;
create policy "bookings_select_owner_or_client"
  on public.bookings
  for select
  using (
    auth.uid() = client_id
    or exists (
      select 1
      from public.professionals p
      where p.id = professional_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "bookings_insert_client" on public.bookings;
create policy "bookings_insert_client"
  on public.bookings
  for insert
  with check (auth.uid() = client_id);

drop policy if exists "bookings_update_owner" on public.bookings;
create policy "bookings_update_owner"
  on public.bookings
  for update
  using (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.professionals p
      where p.id = professional_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles
  for select
  using (true);

drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

create or replace function public.increment_jobs_done_on_completed_booking()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from new.status and new.status = 'completed' then
    update public.professionals
    set jobs_done = coalesce(jobs_done, 0) + 1,
        updated_at = now()
    where id = new.professional_id;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_completed_jobs_done on public.bookings;
create trigger bookings_completed_jobs_done
after update of status on public.bookings
for each row
execute function public.increment_jobs_done_on_completed_booking();

create or replace function public.enforce_portfolio_media_limit()
returns trigger
language plpgsql
as $$
declare
  image_count integer;
  video_count integer;
begin
  if new.type = 'image' then
    select count(*) into image_count
    from public.portfolio_media
    where professional_id = new.professional_id
      and type = 'image';

    if image_count >= 10 then
      raise exception 'Image limit reached (10/10).';
    end if;
  elsif new.type = 'video' then
    select count(*) into video_count
    from public.portfolio_media
    where professional_id = new.professional_id
      and type = 'video';

    if video_count >= 5 then
      raise exception 'Video limit reached (5/5).';
    end if;
  else
    raise exception 'Invalid media type: %', new.type;
  end if;

  return new;
end;
$$;

drop trigger if exists portfolio_media_limit on public.portfolio_media;
create trigger portfolio_media_limit
before insert on public.portfolio_media
for each row
execute function public.enforce_portfolio_media_limit();
