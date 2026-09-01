# Nexora v1.8.8

## Sisemised ülekanded / oma kontod

- Ühendatud pangakontode IBAN-id tuvastatakse automaatselt kui kasutaja enda kontod.
- Seaded → Minu kontod võimaldab lisada kogumis-, investeerimis- või muid enda IBAN-e lokaalselt telefoni.
- Oma kontode vahelised tehingud kuvatakse `Sisemine ülekanne` märgendiga ja neid ei arvestata kuu tulusse, kulusse ega kogustatistikasse.
- Sisemised ülekanded ei tekita raha-laekumise / raha-väljamineku push-teavitust.
- IBAN-e ei ole lähtekoodi hardcode'itud; kasutaja finantsidentifikaatorid jäävad seadme lokaalsesse state'i ja push-registreeringusse.


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


## v9.6 transaction history
- searchable transaction history by name, amount, account, IBAN or reference
- scrollable full transaction list on mobile
- tap a transaction for bank-detail view
- preserves additional Enable Banking transaction metadata when available
- imported bank transactions are read-only in the list

## v1.8.7 recurring tasks
- Planner tasks can repeat daily, weekly on the same weekday, or monthly on the same date.
- Completing a recurring task advances it to the next occurrence instead of closing it permanently.
- Existing one-time tasks remain unchanged.
