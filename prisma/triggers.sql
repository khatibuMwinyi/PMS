-- Assignment FSM integrity trigger (Spec §III, §IV).
-- Guards against invalid status transitions at DB level.

CREATE OR REPLACE FUNCTION check_assignment_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate on status changes
  IF OLD.status IS NULL OR NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- PENDING_ACCEPTANCE → ACCEPTED | REJECTED | EXPIRED | CANCELLED_BY_OWNER | AUTO_REASSIGNED | NO_PROVIDER_AVAILABLE
  IF OLD.status = 'PENDING_ACCEPTANCE' AND NEW.status NOT IN (
    'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED_BY_OWNER',
    'AUTO_REASSIGNED', 'NO_PROVIDER_AVAILABLE', 'PENDING_ACCEPTANCE'
  ) THEN
    RAISE EXCEPTION 'Invalid transition from PENDING_ACCEPTANCE to %', NEW.status;
  END IF;

  -- ACCEPTED → SCHEDULED | CANCELLED_BY_OWNER | CANCELLED_NO_SHOW
  IF OLD.status = 'ACCEPTED' AND NEW.status NOT IN (
    'SCHEDULED', 'CANCELLED_BY_OWNER', 'CANCELLED_NO_SHOW', 'IN_PROGRESS'
  ) THEN
    RAISE EXCEPTION 'Invalid transition from ACCEPTED to %', NEW.status;
  END IF;

  -- SCHEDULED → IN_PROGRESS | CANCELLED_BY_OWNER | CANCELLED_NO_SHOW
  IF OLD.status = 'SCHEDULED' AND NEW.status NOT IN (
    'IN_PROGRESS', 'CANCELLED_BY_OWNER', 'CANCELLED_NO_SHOW'
  ) THEN
    RAISE EXCEPTION 'Invalid transition from SCHEDULED to %', NEW.status;
  END IF;

  -- IN_PROGRESS → COMPLETED | CANCELLED_NO_SHOW
  IF OLD.status = 'IN_PROGRESS' AND NEW.status NOT IN (
    'COMPLETED', 'CANCELLED_NO_SHOW'
  ) THEN
    RAISE EXCEPTION 'Invalid transition from IN_PROGRESS to %', NEW.status;
  END IF;

  -- COMPLETED → VERIFIED | DISPUTED
  IF OLD.status = 'COMPLETED' AND NEW.status NOT IN ('VERIFIED', 'DISPUTED') THEN
    RAISE EXCEPTION 'Completed assignments can only be disputed or verified';
  END IF;

  -- DISPUTED → VERIFIED | CANCELLED_BY_OWNER
  IF OLD.status = 'DISPUTED' AND NEW.status NOT IN (
    'VERIFIED', 'CANCELLED_BY_OWNER'
  ) THEN
    RAISE EXCEPTION 'Invalid transition from DISPUTED to %', NEW.status;
  END IF;

  -- Timestamp integrity
  IF NEW.completed_at IS NOT NULL AND NEW.accepted_at IS NULL THEN
    RAISE EXCEPTION 'Cannot set completed_at before accepted_at';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assignment_fsm_guard ON assignments;
CREATE TRIGGER assignment_fsm_guard
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION check_assignment_transition();
