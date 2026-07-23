ALTER TABLE maintenance_tasks ADD COLUMN IF NOT EXISTS completed_at DATETIME(6) NULL;
