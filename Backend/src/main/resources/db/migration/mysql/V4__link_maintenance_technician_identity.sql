ALTER TABLE maintenance_tasks
    ADD COLUMN IF NOT EXISTS assigned_technician_record_id BIGINT NULL;

UPDATE maintenance_tasks mt
JOIN users u
  ON LOWER(TRIM(u.email)) = LOWER(TRIM(mt.assigned_technician))
SET mt.assigned_technician_record_id = u.id
WHERE mt.assigned_technician_record_id IS NULL
  AND mt.assigned_technician IS NOT NULL;

-- Preserve the historical API-facing email if an account is deleted while
-- removing the authorization relationship to that account.
ALTER TABLE maintenance_tasks
    ADD CONSTRAINT fk_maintenance_tasks_assigned_technician
    FOREIGN KEY (assigned_technician_record_id) REFERENCES users(id) ON DELETE SET NULL;
