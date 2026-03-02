-- ============================================
-- SCHEMA ELEARN — À coller dans Supabase SQL Editor
-- ============================================

-- 1. PROFILES
create table public.profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text not null,
  avatar_url text,
  role text check (role in ('student', 'teacher')) not null default 'student',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "profiles: read own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = user_id);
create policy "profiles: read all" on public.profiles for select using (true);
create policy "profiles: insert own" on public.profiles for insert with check (auth.uid() = user_id);

-- 2. COURSES
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  thumbnail_url text,
  category text,
  teacher_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);
alter table public.courses enable row level security;
create policy "courses: anyone can read" on public.courses for select using (true);
create policy "courses: teacher can insert" on public.courses for insert with check (auth.uid() = teacher_id);
create policy "courses: teacher can update" on public.courses for update using (auth.uid() = teacher_id);
create policy "courses: teacher can delete" on public.courses for delete using (auth.uid() = teacher_id);

-- 3. LESSONS
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  type text check (type in ('video', 'pdf')) not null,
  file_url text,
  "order" integer not null default 1,
  created_at timestamptz default now()
);
alter table public.lessons enable row level security;
create policy "lessons: anyone can read" on public.lessons for select using (true);
create policy "lessons: teacher can insert" on public.lessons for insert with check (
  auth.uid() = (select teacher_id from public.courses where id = course_id)
);
create policy "lessons: teacher can update" on public.lessons for update using (
  auth.uid() = (select teacher_id from public.courses where id = course_id)
);
create policy "lessons: teacher can delete" on public.lessons for delete using (
  auth.uid() = (select teacher_id from public.courses where id = course_id)
);

-- 4. ENROLLMENTS
create table public.enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  unique(student_id, course_id)
);
alter table public.enrollments enable row level security;
create policy "enrollments: student can read own" on public.enrollments for select using (auth.uid() = student_id);
create policy "enrollments: student can insert" on public.enrollments for insert with check (auth.uid() = student_id);
create policy "enrollments: teacher can read" on public.enrollments for select using (
  auth.uid() = (select teacher_id from public.courses where id = course_id)
);

-- 5. PROGRESS
create table public.progress (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references auth.users(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  completed boolean default true,
  completed_at timestamptz default now(),
  unique(student_id, lesson_id)
);
alter table public.progress enable row level security;
create policy "progress: student read own" on public.progress for select using (auth.uid() = student_id);
create policy "progress: student insert" on public.progress for insert with check (auth.uid() = student_id);
create policy "progress: student update" on public.progress for update using (auth.uid() = student_id);

-- 6. COMMENTS
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);
alter table public.comments enable row level security;
create policy "comments: anyone can read" on public.comments for select using (true);
create policy "comments: auth users can insert" on public.comments for insert with check (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Dans Storage > New Bucket, créez:
-- 1. "course-thumbnails" → Public: true
-- 2. "lesson-files"      → Public: true
-- 3. "avatars"           → Public: true

-- Policies Storage (run for each bucket):
insert into storage.buckets (id, name, public) values ('course-thumbnails', 'course-thumbnails', true);
insert into storage.buckets (id, name, public) values ('lesson-files', 'lesson-files', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "course-thumbnails: public read" on storage.objects for select using (bucket_id = 'course-thumbnails');
create policy "course-thumbnails: auth upload" on storage.objects for insert with check (bucket_id = 'course-thumbnails' and auth.role() = 'authenticated');

create policy "lesson-files: public read" on storage.objects for select using (bucket_id = 'lesson-files');
create policy "lesson-files: auth upload" on storage.objects for insert with check (bucket_id = 'lesson-files' and auth.role() = 'authenticated');

create policy "avatars: public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: auth upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "avatars: auth update" on storage.objects for update with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- ============================================
-- REALTIME (activer dans Supabase > Database > Replication)
-- Activer la table "comments" pour Realtime
-- ============================================
