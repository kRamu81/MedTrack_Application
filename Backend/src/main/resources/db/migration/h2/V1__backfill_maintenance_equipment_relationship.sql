ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS equipment_record_id BIGINT;

UPDATE maintenance_tasks SET status = 'SCHEDULED' WHERE UPPER(status) = 'SCHEDULED';
UPDATE maintenance_tasks SET status = 'IN_PROGRESS' WHERE UPPER(REPLACE(status, ' ', '_')) = 'IN_PROGRESS';
UPDATE maintenance_tasks SET status = 'NEEDS_PART' WHERE UPPER(REPLACE(status, ' ', '_')) = 'NEEDS_PART';
UPDATE maintenance_tasks SET status = 'ON_HOLD' WHERE UPPER(REPLACE(status, ' ', '_')) = 'ON_HOLD';
UPDATE maintenance_tasks SET status = 'COMPLETED' WHERE UPPER(status) = 'COMPLETED';

UPDATE maintenance_tasks mt
SET equipment_record_id = (
    SELECT e.id
    FROM equipment e
    WHERE e.equipment_code = mt.equipment_id
      AND (mt.hospital_id IS NULL OR e.hospital_id = mt.hospital_id)
    FETCH FIRST 1 ROW ONLY
)
WHERE mt.equipment_record_id IS NULL;

UPDATE maintenance_tasks mt
SET hospital_id = (
    SELECT e.hospital_id
    FROM equipment e
    WHERE e.id = mt.equipment_record_id
)
WHERE mt.hospital_id IS NULL
  AND mt.equipment_record_id IS NOT NULL;

-- This constraint intentionally makes the migration fail if any legacy task
-- could not be matched to a real equipment record.
ALTER TABLE maintenance_tasks ALTER COLUMN equipment_record_id BIGINT NOT NULL;

