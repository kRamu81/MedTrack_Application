ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS equipment_record_id BIGINT NULL;

UPDATE maintenance_tasks SET status = 'SCHEDULED' WHERE UPPER(status) = 'SCHEDULED';
UPDATE maintenance_tasks SET status = 'IN_PROGRESS' WHERE UPPER(REPLACE(status, ' ', '_')) = 'IN_PROGRESS';
UPDATE maintenance_tasks SET status = 'NEEDS_PART' WHERE UPPER(REPLACE(status, ' ', '_')) = 'NEEDS_PART';
UPDATE maintenance_tasks SET status = 'ON_HOLD' WHERE UPPER(REPLACE(status, ' ', '_')) = 'ON_HOLD';
UPDATE maintenance_tasks SET status = 'COMPLETED' WHERE UPPER(status) = 'COMPLETED';

UPDATE maintenance_tasks mt
JOIN equipment e
  ON e.equipment_code = mt.equipment_id
 AND (mt.hospital_id IS NULL OR e.hospital_id = mt.hospital_id)
SET mt.equipment_record_id = e.id
WHERE mt.equipment_record_id IS NULL;

UPDATE maintenance_tasks mt
JOIN equipment e ON e.id = mt.equipment_record_id
SET mt.hospital_id = e.hospital_id
WHERE mt.hospital_id IS NULL;

-- This constraint intentionally makes the migration fail if any legacy task
-- could not be matched to a real equipment record.
ALTER TABLE maintenance_tasks MODIFY equipment_record_id BIGINT NOT NULL;

