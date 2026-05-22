create table if not exists public.categories (
    id bigserial primary key,
    name text not null unique,
    slug text not null unique,
    image_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);