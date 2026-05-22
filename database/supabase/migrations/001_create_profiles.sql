create extension if not exists "pgcrypto";

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text unique,
    phone text,
    avatar_url text,
    role text not null default 'buyer' check (role in ('buyer', 'farmer', 'admin')),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);