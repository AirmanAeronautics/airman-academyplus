-- Step 1.3 Part 2: Continue Updating RLS Policies

-- 12. Update student_assignments policies
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.student_assignments;
CREATE POLICY "Admins can manage all assignments"
  ON public.student_assignments
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- 13. Update student_progress policies
DROP POLICY IF EXISTS "Admins can manage all progress" ON public.student_progress;
CREATE POLICY "Admins can manage all progress"
  ON public.student_progress
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- 14. Update compliance_items policies (if exists)
DROP POLICY IF EXISTS "compliance_items_admin_manage" ON public.compliance_items;
CREATE POLICY "compliance_items_admin_manage"
  ON public.compliance_items
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'compliance_officer'));

-- 15. Update compliance_blocks policies (if exists)
DROP POLICY IF EXISTS "compliance_blocks_admin_manage" ON public.compliance_blocks;
CREATE POLICY "compliance_blocks_admin_manage"
  ON public.compliance_blocks
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'compliance_officer'));

-- 16. Update billing_rule_sets policies (if exists)
DROP POLICY IF EXISTS "billing_rules_org_manage" ON public.billing_rule_sets;
CREATE POLICY "billing_rules_org_manage"
  ON public.billing_rule_sets
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'accounts_officer'));

-- 17. Update billing_rules policies (if exists)
DROP POLICY IF EXISTS "billing_rules_admin_manage" ON public.billing_rules;
CREATE POLICY "billing_rules_admin_manage"
  ON public.billing_rules
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'accounts_officer'));

-- 18. Update billing_calculations policies
DROP POLICY IF EXISTS "billing_calc_org_manage" ON public.billing_calculations;
CREATE POLICY "billing_calc_org_manage"
  ON public.billing_calculations
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'accounts_officer'));

-- 19. Update integration_configs policies (if exists)
DROP POLICY IF EXISTS "integration_configs_admin" ON public.integration_configs;
CREATE POLICY "integration_configs_admin"
  ON public.integration_configs
  FOR ALL
  USING (is_org_admin(org_id));

-- 20. Update sync_logs policies
DROP POLICY IF EXISTS "sync_logs_admin" ON public.sync_logs;
CREATE POLICY "sync_logs_admin"
  ON public.sync_logs
  FOR ALL
  USING (is_org_admin(org_id));

-- 21. Update aircraft_capability policies (if exists)
DROP POLICY IF EXISTS "Admins can manage aircraft capabilities" ON public.aircraft_capability;
CREATE POLICY "Admins can manage aircraft capabilities"
  ON public.aircraft_capability
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'));

-- 22. Update availability_block policies (if exists)
DROP POLICY IF EXISTS "Admins can view all availability in org" ON public.availability_block;
CREATE POLICY "Admins can view all availability in org"
  ON public.availability_block
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'));

-- 23. Update aircraft_availability policies (if exists)
DROP POLICY IF EXISTS "Admins can manage aircraft availability" ON public.aircraft_availability;
CREATE POLICY "Admins can manage aircraft availability"
  ON public.aircraft_availability
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'));

-- 24. Update constraint_policies policies (if exists)
DROP POLICY IF EXISTS "Admins can manage policies" ON public.constraint_policies;
CREATE POLICY "Admins can manage policies"
  ON public.constraint_policies
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'));

-- 25. Update roster_plan policies (if exists)
DROP POLICY IF EXISTS "Admins can manage roster plans" ON public.roster_plan;
CREATE POLICY "Admins can manage roster plans"
  ON public.roster_plan
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'));

-- 26. Update roster_assignment policies (if exists)
DROP POLICY IF EXISTS "Admins can manage all assignments in org" ON public.roster_assignment;
CREATE POLICY "Admins can manage all assignments in org"
  ON public.roster_assignment
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'));

-- 27. Update report_templates policies (if exists)
DROP POLICY IF EXISTS "Admins can manage templates" ON public.report_templates;
CREATE POLICY "Admins can manage templates"
  ON public.report_templates
  FOR ALL
  USING (is_org_admin(org_id));

-- 28. Update flight_hours_log policies (if exists)
DROP POLICY IF EXISTS "Admins can manage flight hours" ON public.flight_hours_log;
CREATE POLICY "Admins can manage flight hours"
  ON public.flight_hours_log
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_manager'));