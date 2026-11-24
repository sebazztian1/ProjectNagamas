CREATE TABLE audit_log_purge_history (
  id CHAR(36) PRIMARY KEY, started_at DATETIME(3) NOT NULL, finished_at DATETIME(3),
  deadline_at DATETIME(3), cutoff DATETIME(3), mode VARCHAR(12) NOT NULL, status VARCHAR(12) NOT NULL,
  eligible BIGINT UNSIGNED, deleted BIGINT UNSIGNED NOT NULL DEFAULT 0, remaining BIGINT UNSIGNED,
  error_message VARCHAR(160), INDEX idx_purge_started (started_at)
) ENGINE=InnoDB;
ALTER TABLE audit_logs ADD INDEX idx_audit_retention (created_at, id), ALGORITHM=INPLACE, LOCK=NONE;
