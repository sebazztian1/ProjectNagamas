ALTER TABLE audit_logs DROP INDEX idx_audit_retention, ALGORITHM=INPLACE, LOCK=NONE;
-- Preserve operational history for recovery.
RENAME TABLE audit_log_purge_history TO audit_log_purge_history_rollback;
