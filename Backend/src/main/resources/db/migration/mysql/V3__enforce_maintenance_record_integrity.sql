-- Maintenance ownership is required because every read and delete is tenant-scoped.
ALTER TABLE maintenance_tasks MODIFY hospital_id BIGINT NOT NULL;
ALTER TABLE maintenance_tasks MODIFY status VARCHAR(255) NOT NULL;

-- Retain maintenance history when equipment deletion is attempted.
ALTER TABLE maintenance_tasks
    ADD CONSTRAINT fk_maintenance_tasks_equipment_record
    FOREIGN KEY (equipment_record_id) REFERENCES equipment(id) ON DELETE RESTRICT;
