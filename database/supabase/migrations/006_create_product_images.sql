create table if not exists public.product_images (
    id bigserial primary key,
    product_id bigint not null references public.products(id) on delete cascade,
    image_url text not null,
    is_primary boolean not null default false,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);