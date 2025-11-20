-- Step 1.1: Create Roles System Migration
-- This creates the foundation for secure role-based access control

-- 1. Create app_role enum type
CREATE TYPE public.app_role AS ENUM (
  'student',
  'instructor',
  'admin',
  'super_admin',
  'ops_manager',
  'maintenance_officer',
  'compliance_officer',
  'accounts_officer',
  'marketing_crm',
  'support',
  'pending'
);

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, role, org_id)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_roles table
-- Users can view their own roles
CREATE POLICY "user_roles_own_view"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage all roles in their organization
CREATE POLICY "user_roles_admin_manage"
  ON public.user_roles
  FOR ALL
  USING (is_org_admin(org_id));

-- 5. Migrate existing data from profiles.role to user_roles
INSERT INTO public.user_roles (user_id, role, org_id, assigned_at, is_active)
SELECT 
  p.id,
  p.role::public.app_role,
  p.org_id,
  p.created_at,
  true
FROM public.profiles p
WHERE p.role IS NOT NULL
ON CONFLICT (user_id, role, org_id) DO NOTHING;

-- 6. Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_org_id ON public.user_roles(org_id);
CREATE INDEX idx_user_roles_active ON public.user_roles(is_active) WHERE is_active = true;
CREATE INDEX idx_user_roles_user_org ON public.user_roles(user_id, org_id);
CREATE INDEX idx_user_roles_lookup ON public.user_roles(user_id, role, is_active);