-- ==============================================================================
-- Calli Art - Full Supabase Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  username text unique,
  avatar_url text,
  bio text default 'Calligraphy & Lettering Enthusiast ✨',
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Artwork / Community Posts Table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  media_url text not null,
  category text default 'Calligraphy',
  likes_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Post Likes Table
create table if not exists public.likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(post_id, user_id)
);

-- 4. Post Comments Table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Course Resources / Digital Downloads Table
create table if not exists public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  file_url text not null,
  preview_url text,
  category text default 'Practice Sheets',
  difficulty text default 'Beginner', -- Beginner, Intermediate, Advanced
  file_type text default 'PDF',
  file_size text default '2.4 MB',
  download_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.resources enable row level security;

-- --- Profiles RLS ---
create policy "Allow public read access on profiles" on public.profiles
  for select using (true);

create policy "Allow user self update profile" on public.profiles
  for update using (auth.uid() = id);

-- --- Posts RLS ---
-- Har koi dekh sakta hai bina login ke (Open access)
create policy "Allow public read access on posts" on public.posts
  for select using (true);

-- Sirf logged-in users upload kar sakte hain
create policy "Allow user insert on posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "Allow user update own post" on public.posts
  for update using (auth.uid() = user_id);

create policy "Allow user delete own post" on public.posts
  for delete using (auth.uid() = user_id);

-- --- Likes RLS ---
create policy "Allow public read likes" on public.likes
  for select using (true);

create policy "Allow user to like" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Allow user to unlike" on public.likes
  for delete using (auth.uid() = user_id);

-- --- Comments RLS ---
create policy "Allow public read comments" on public.comments
  for select using (true);

create policy "Allow authenticated user to comment" on public.comments
  for insert with check (auth.uid() = user_id);

-- --- Resources RLS ---
create policy "Allow public read resources" on public.resources
  for select using (true);

-- ==============================================================================
-- Storage Buckets Configuration (Run in Supabase SQL editor or Storage UI)
-- ==============================================================================
-- Insert storage bucket records if storage schema exists
insert into storage.buckets (id, name, public) 
values ('artworks', 'artworks', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('resources', 'resources', true)
on conflict (id) do nothing;

-- Storage RLS: Public read access for artworks
create policy "Public Access for Artworks"
on storage.objects for select
using ( bucket_id = 'artworks' );

create policy "Authenticated users can upload artwork"
on storage.objects for insert
with check (
  bucket_id = 'artworks' 
  and auth.role() = 'authenticated'
);

-- ==============================================================================
-- Profile Auto-Creation Trigger on Auth Signup
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
