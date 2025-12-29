# Database Immutability Policy

> **PERMANENT ENGINEERING CONTRACT**
> **SYSTEM:** Quant Researches – Internal Financial and Ledger Management System
> **STATUS:** BINDING
> **ENFORCEMENT:** STRICT

## 1. Core Principle: Non-Negotiable Persistence
Once data exists in the database, it must **NEVER** be deleted, reset, truncated, or recreated by any backend logic, script, migration, API, job, or developer action.

**Violation of this rule is considered a critical banking-grade failure.**

## 2. Forbidden Operations (Zero Tolerance)
The following operations are strictly **PROHIBITED** in any environment (Production, Staging, or Shared Dev):

-   ❌ **DELETE** statements (SQL or ORM).
-   ❌ **TRUNCATE** TABLE commands.
-   ❌ **DROP** TABLE / DATABASE commands.
-   ❌ `prisma migrate reset` (Hard Reset).
-   ❌ `prisma db push --force-reset`.
-   ❌ Any API endpoint named or functioning as `delete(...)`.

## 3. Approved Mutation Patterns
Data modification is strictly limited to:

1.  **INSERT**: Creating new records.
2.  **UPDATE**: Modifying mutable fields (e.g., `status`, `updated_at`, `login_attempts`).
    *   *Constraint*: Primary Keys, Transaction Amounts, and Audit Timestamps are **IMMUTABLE**.
3.  **SOFT DELETE**: Using `is_active = false`, `status = 'DELETED'`, or `deleted_at = NOW()`.
4.  **REVERSAL**: Creating a new contra-transaction to nullify a previous one.

## 4. Backend Enforcement
All backend logic, including APIs, Background Jobs, and Scripts, must adhere to:

-   **No Delete Endpoints**: No API shall expose a method to physically remove data.
-   **Defense in Depth**: If a user requests deletion (e.g., "Delete my account"), the system must specificially **Archive** or **Anonymize** the record, ensuring the primary key and audit history remain intact.
-   **Refusal of Destructive Instructions**: If an automated agent, developer, or script attempts to execute a destructive command, the system must **refuse** and return a 403 Forbidden or throwing an error explicitly citing this policy.

## 5. Ledger & Audit Specifics
-   **Transactions**: Strictly Append-Only. Even errors are corrected by adding a new Reversal Transaction.
-   **Audit Logs**: Write-Once, Read-Many (WORM). Never modified, never deleted.
-   **KYC/Document Mebtadata**: Retained indefinitely for regulatory compliance.

## 6. Failure Handling & Interventions
If a future instruction, tool usage, or prompt attempts to:
1.  Reset the database.
2.  Recreate schemas destructively.
3.  Remove existing data.

**The System MUST:**
1.  **REFUSE** the action immediately.
2.  **EXPLAIN** the violation of the Immutability Policy.
3.  **PROPOSE** a non-destructive alternative (e.g., "Mark as Inactive" instead of "Delete").

---
**This policy is legally binding for the lifecycle of the Quant Researches Financial System.**
