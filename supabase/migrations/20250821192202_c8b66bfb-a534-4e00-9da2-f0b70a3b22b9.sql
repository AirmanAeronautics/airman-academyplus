-- Fix function security warnings by setting search_path

-- Fix update_achievement_streaks function
CREATE OR REPLACE FUNCTION update_achievement_streaks()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update consistency streak based on flight frequency
  INSERT INTO achievement_streaks (student_id, org_id, streak_type, current_count, last_activity_date)
  VALUES (NEW.student_id, NEW.org_id, 'consistency', 1, NEW.flight_date::date)
  ON CONFLICT (student_id, streak_type)
  DO UPDATE SET
    current_count = CASE 
      WHEN achievement_streaks.last_activity_date = NEW.flight_date::date - INTERVAL '1 day' 
      THEN achievement_streaks.current_count + 1
      ELSE 1
    END,
    best_count = GREATEST(achievement_streaks.best_count, 
      CASE 
        WHEN achievement_streaks.last_activity_date = NEW.flight_date::date - INTERVAL '1 day' 
        THEN achievement_streaks.current_count + 1
        ELSE 1
      END),
    last_activity_date = NEW.flight_date::date,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Fix calculate_compliance_expiry function
CREATE OR REPLACE FUNCTION calculate_compliance_expiry()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recurrence_rules jsonb;
  months_to_add integer;
BEGIN
  -- Get recurrence rules from compliance type
  SELECT ct.recurrence_rules INTO recurrence_rules
  FROM compliance_types ct
  WHERE ct.id = NEW.compliance_type_id;
  
  -- Calculate next due date based on rules
  months_to_add := (recurrence_rules->>'months')::integer;
  
  IF months_to_add IS NOT NULL THEN
    NEW.next_due_date := NEW.expiry_date + (months_to_add || ' months')::interval;
  END IF;
  
  -- Set status based on expiry
  NEW.status := CASE
    WHEN NEW.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring'
    ELSE 'current'
  END;
  
  RETURN NEW;
END;
$$;