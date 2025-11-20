-- Step 1.2: Create Backend Functions for Role Checking (Without Drop)
-- These security definer functions allow safe role checks without RLS recursion

-- 1. Create has_role function - checks if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  );
$$;

-- 2. Create get_user_roles function - returns all active roles for a user
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TABLE (
  role app_role,
  org_id UUID,
  assigned_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role, org_id, assigned_at
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
  ORDER BY assigned_at DESC;
$$;

-- 3. Create helper function to get primary role (most recently assigned active role)
CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
  ORDER BY assigned_at DESC
  LIMIT 1;
$$;

-- 4. Update is_org_admin - keep same parameter name to avoid breaking policies
CREATE OR REPLACE FUNCTION public.is_org_admin(org_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_active = true
      AND (org_uuid IS NULL OR org_id = org_uuid)
  );
$$;

-- 5. Grant execute permissions on these functions to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_primary_role(UUID) TO authenticated;