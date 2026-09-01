# Nexora v9.5 — Transaction Import Fix

This release fixes automatic bank income/expense import for recent Swedbank transactions.

## What changed
- Recent transaction sync now requests only the current + previous month first.
- Removed `strategy=longest` and >90-day transaction requests from the normal sync path.
  Swedbank can require extra SCA for archive transactions older than 90 days, which made
  the previous sync path unreliable even though balances still loaded.
- Transaction pagination remains supported through `continuation_key`.
- CRDT entries import as income and DBIT entries as expense.
- Pending/cancelled-style entries do not inflate monthly totals.
- Transfers between two of the user's own connected bank accounts remain visible but do
  not count as income or expense.
- Transaction sync response now includes access/range diagnostics.
- No balance-delta guessing is used to create fake transactions.

## Deploy
1. Replace repository files with this release.
2. Commit + push.
3. Run `Deploy Nexora Bank Backend`.
4. Run `Build Nexora APK`.
5. Install the new APK over the existing Nexora install.

Existing GitHub secrets do not need to be changed.
