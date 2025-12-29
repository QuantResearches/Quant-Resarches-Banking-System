# DATABASE MIGRATION POLICY
**Quant Researches Internal Financial System**

## 1. Zero Data Loss Contract
- **NO DESTRUCTIVE OPERATIONS:** `DROP TABLE`, `DROP COLUMN`, or `TRUNCATE` are strictly prohibited in production migrations.
- **SOFT DELETES ONLY:** Data is never deleted. Use `is_active`, `deleted_at`, or `status` columns to manage lifecycle.
- **APPEND-ONLY LEDGER:** All financial transaction tables (`transactions`, `gl_entries`, `audit_logs`) are APPEND-ONLY. Updates to amounts are forbidden; use Reversal entries.

## 2. Migration Workflow
1.  **Local Dev:** Create migration via `npx prisma migrate dev`.
2.  **Review:** Inspect SQL file manually for implicit drops.
3.  **staging:** Apply via `npx prisma migrate deploy`.
4.  **Production:** Apply via `npx prisma migrate deploy` only during maintenance windows.

## 3. Rollback Strategy
- Down-migrations are not supported automatically.
- Fix-forward strategy: If a migration fails, push a new migration to correct it.
- Backup: Point-in-time recovery (PITR) must be enabled before running migrations.

## 4. Sensitive Data
- PII columns (PAN, Aadhaar) must be encrypted at application level before storage.
- No cleartext passwords or secrets in database.
