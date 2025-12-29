    # DATABASE IMMUTABILITY POLICY
**Quant Researches - General Ledger Core**

## 1. The Golden Rule
**"The Ledger is Immutable. History cannot be rewritten, only appended to."**

## 2. Immutable Tables
The following tables are strictly AMEND-ONLY (INSERT/SELECT only):
1.  `transactions`
2.  `gl_entries`
3.  `audit_logs`
4.  `failed_login_attempts`
5.  `idempotency_logs`
6.  `security_events`

**Violation of this rule via manual SQL or code intervention is a termination-level offense.**

## 3. Error Correction
If a transaction is posted in error:
- **DO NOT** Delete the row.
- **DO NOT** Update the amount.
- **DO:** Create a **Reversal Transaction** (Credit becomes Debit) linking to the original ID.

## 4. Integrity Checks
- `hash` columns (if implemented) must match row content to detect tampering.
- Sequence numbers (if implemented) must be gapless.

## 5. Audit Trail
- Every write operation must capture `created_by` (User ID), `created_at` (Timestamp), and `ip_address` (Context).
- `updated_at` timestamps on mutable records (e.g. User Profiles) must differ from `created_at`.
