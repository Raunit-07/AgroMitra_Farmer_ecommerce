create table if not exists public.farmer_profiles (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    farm_name text not null,
    farm_description text,
    farm_address text,
    city text,
    state text,
    pincode text,
    gst_number text,
    is_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);