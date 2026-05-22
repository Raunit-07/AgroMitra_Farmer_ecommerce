-- Migration: Unified Roles (Allow multiple roles per user)

-- 1. Add roles column as a text array
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roles text[] DEFAULT ARRAY['buyer'];

-- 2. Migrate existing role data to the roles array
UPDATE public.profiles 
SET roles = ARRAY[role]
WHERE roles IS NULL OR array_length(roles, 1) = 0;

-- 3. Update handle_new_user function to initialize roles array
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    role,
    roles
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'avatar_url', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'buyer'),
    ARRAY[COALESCE(new.raw_user_meta_data ->> 'role', 'buyer')]
  );
  RETURN new;
END;
$$;
