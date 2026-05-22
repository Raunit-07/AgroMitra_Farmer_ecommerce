create table if not exists public.products (
    id bigserial primary key,
    farmer_id uuid not null references public.profiles(id) on delete cascade,
    category_id bigint references public.categories(id) on delete set null,
    name text not null,
    slug text not null unique,
    description text,
    price numeric(10,2) not null check (price >= 0),
    unit text not null,
    stock_quantity integer not null default 0 check (stock_quantity >= 0),
    min_order_quantity integer not null default 1 check (min_order_quantity > 0),
    image_url text,
    is_active boolean not null default true,
    is_approved boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);