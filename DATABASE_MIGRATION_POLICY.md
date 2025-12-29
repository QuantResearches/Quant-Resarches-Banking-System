
# Database Migration Policy

> **CRITICAL ENGINEERING CONTRACT**
> This document defines the absolute, non-negotiable rules for database management in the "Quant Researches – Internal Financial and Ledger Management System". 
> All engineers and automated agents must adhere effectively to this policy.

## 1. Core Philosophy: Data Immutability
The database contains real, valuable financial and compliance data. 
**Existing database data must NEVER be deleted, reset, truncated, or recreated as part of schema changes.**

-   **Data First**: The schema evolves to support the data; the data never dies to support the schema.
-   **No Resets**: Development convenience is secondary to data safety.
-   **Production Parity**: Treat Development and Staging databases with the same care as Production.

## 2. Forbidden Operations
The following commands and actions are strictly **FORBIDDEN** under any circumstances:

-   ❌ `npx prisma migrate reset` (Wipes the entire database)
-   ❌ `npx prisma db push --force-reset` (Forces data deletion on conflict)
-   ❌ Dropping tables manually to "fix" migration errors.
-   ❌ Truncating tables to "clean up" state.

## 3. Approved Migration Workflow
We use **Prisma Migrations** to track changes version-controlled and safely.

### Routine Changes (Additive)
For adding tables, columns (nullable/default), or indexes:
1.  Edit `prisma/schema.prisma`.
2.  Run: `npx prisma migrate dev --name <expressive_name>`
3.  Review the generated SQL migration file (`prisma/migrations/...`).
4.  Commit the migration file.

### Complex Changes (Destructive/Refactor)
For renaming columns, changing types, or enforcing non-null on existing data:
1.  **Stop**: Plan the migration explicitly.
2.  **Backup**: Ensure a dump exists (`pg_dump`).
3.  **Expand and Contract**:
    -   Add the new column (nullable).
    -   Backfill data via script.
    -   Switch application code to read new column.
    -   Mark old column deprecated.
    -   (Optional) Remove old column in a future maintenance window.

## 4. Safe vs. Unsafe Operations

| Operation | Safety | Requirement |
| :--- | :--- | :--- |
| **Add Table** | ✅ Safe | Standard Migration |
| **Add Nullable Column** | ✅ Safe | Standard Migration |
| **Add Column w/ Default** | ✅ Safe | Standard Migration |
| **Drop Table** | ⚠️ **DANGEROUS** | **Manual Approval Required**. Verify table is fully unused and archived. |
| **Drop Column** | ⚠️ **DANGEROUS** | **Manual Approval Required**. Verify data is backed up. |
| **Rename Column** | ❌ Unsafe | Do not rename. Add new, copy data, deprecate old. |
| **Change Type** | ❌ Unsafe | Do not cast. Add new column, convert data, deprecate old. |
| **Force Reset** | ⛔ **FORBIDDEN** | Never run this. |

## 5. Recovery Protocol
If a migration fails or data is at risk:
1.  **Do NOT** panic and run `reset`.
2.  Revert the schema change locally.
3.  Restore from the latest `backup`.
4.  Diagnose the SQL failure.

---
**By editing the database schema, you agree to follow this policy.**
