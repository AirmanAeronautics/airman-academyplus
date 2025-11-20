-- Step 1.3: Update RLS Policies to Use New Role System
-- Replace old role checks with secure has_role() function calls

-- 1. Update student_badges policies
DROP POLICY IF EXISTS "Admins can manage all badges" ON public.student_badges;
CREATE POLICY "Admins can manage all badges"
  ON public.student_badges
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Instructors can view assigned students badges" ON public.student_badges;
CREATE POLICY "Instructors can view assigned students badges"
  ON public.student_badges
  FOR SELECT
  USING (
    has_role(auth.uid(), 'instructor') AND
    student_id IN (
      SELECT student_id 
      FROM student_assignments 
      WHERE instructor_id = auth.uid() AND active = true
    )
  );

-- 2. Update flight_debriefs policies
DROP POLICY IF EXISTS "Admins can manage all debriefs" ON public.flight_debriefs;
CREATE POLICY "Admins can manage all debriefs"
  ON public.flight_debriefs
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Instructors can view assigned students debriefs" ON public.flight_debriefs;
CREATE POLICY "Instructors can view assigned students debriefs"
  ON public.flight_debriefs
  FOR SELECT
  USING (
    instructor_id = auth.uid() OR
    (has_role(auth.uid(), 'instructor') AND student_id IN (
      SELECT student_id 
      FROM student_assignments 
      WHERE instructor_id = auth.uid() AND active = true
    ))
  );

DROP POLICY IF EXISTS "Instructors can create debriefs" ON public.flight_debriefs;
CREATE POLICY "Instructors can create debriefs"
  ON public.flight_debriefs
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'instructor') AND instructor_id = auth.uid()
  );

-- 3. Update achievement_streaks policies
DROP POLICY IF EXISTS "streaks_admin_manage" ON public.achievement_streaks;
CREATE POLICY "streaks_admin_manage"
  ON public.achievement_streaks
  FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "streaks_instructor_view" ON public.achievement_streaks;
CREATE POLICY "streaks_instructor_view"
  ON public.achievement_streaks
  FOR SELECT
  USING (
    has_role(auth.uid(), 'instructor') AND
    student_id IN (
      SELECT student_id 
      FROM student_assignments 
      WHERE instructor_id = auth.uid() AND active = true
    )
  );

-- 4. Update school_join_requests policies
DROP POLICY IF EXISTS "School admins can manage join requests" ON public.school_join_requests;
CREATE POLICY "School admins can manage join requests"
  ON public.school_join_requests
  FOR ALL
  USING (
    flight_school_id IN (
      SELECT id FROM flight_schools WHERE admin_user_id = auth.uid()
    ) OR 
    is_org_admin(get_user_org_id())
  );

-- 5. Update flight_schools policies
DROP POLICY IF EXISTS "School admins can manage their schools" ON public.flight_schools;
CREATE POLICY "School admins can manage their schools"
  ON public.flight_schools
  FOR ALL
  USING (
    admin_user_id = auth.uid() OR 
    is_org_admin(get_user_org_id())
  );

-- 6. Update meeting_recordings policies
DROP POLICY IF EXISTS "Admins can manage recordings" ON public.meeting_recordings;
CREATE POLICY "Admins can manage recordings"
  ON public.meeting_recordings
  FOR ALL
  USING (is_org_admin(org_id));

-- 7. Update org_integrations policies
DROP POLICY IF EXISTS "Admins can manage integrations" ON public.org_integrations;
CREATE POLICY "Admins can manage integrations"
  ON public.org_integrations
  FOR ALL
  USING (is_org_admin(org_id));

-- 8. Update integration_events policies
DROP POLICY IF EXISTS "Admins can manage integration events" ON public.integration_events;
CREATE POLICY "Admins can manage integration events"
  ON public.integration_events
  FOR ALL
  USING (is_org_admin(org_id));

-- 9. Update report_schedules policies
DROP POLICY IF EXISTS "Admins can manage schedules" ON public.report_schedules;
CREATE POLICY "Admins can manage schedules"
  ON public.report_schedules
  FOR ALL
  USING (is_org_admin(org_id));

-- 10. Update report_history policies
DROP POLICY IF EXISTS "Admins can manage report history" ON public.report_history;
CREATE POLICY "Admins can manage report history"
  ON public.report_history
  FOR ALL
  USING (is_org_admin(org_id));

-- 11. Update lesson_catalog policies
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lesson_catalog;
CREATE POLICY "Admins can manage lessons"
  ON public.lesson_catalog
  FOR ALL
  USING (is_org_admin(org_id));