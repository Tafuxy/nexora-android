# Nexora V10.1 changelog

## Savings — rebuilt for normal people
- Added a dedicated **Säästud / Savings** view reachable from Money, Home and Settings.
- Savings goals now use a simple flow: **what for → how much → by when**.
- Added progress, amount remaining, target forecast and required monthly saving calculation.
- Added manual “add to savings / take from savings” adjustments that do not pollute income/expense statistics.
- Added optional bank-account linking per savings goal; linked goals use the synced account balance automatically.
- Added total savings and this-month savings movement summaries.
- Removed the confusing raw savings fields from onboarding and profile editing.
- Existing V10 `savingsCurrent` / `savingsGoal` values migrate automatically into a goal.
- Own-account transfers stay excluded from income and spending; real external income such as interest remains real income.


## Money & bank sync
- Added partial-account sync protection and last-trustworthy-balance fallback.
- Added persistent manual category overrides for synced bank transactions.
- Added persistent manual own-account-transfer overrides.
- Hardened automatic own-account transfer detection.
- Added server push-registry cleanup on bank disconnect.
- Added MCC-based fuel-station categorization.

## Spending categories
- Renamed the visible fuel category to **Tankla**.
- Added clickable category details.
- Added Tankla chain ranking with total spend, transaction count, share and average purchase.

## Planner
- Added completion history grouped by date with completion time.
- One-off completed tasks are removed from the active list.
- Recurring tasks support daily, weekly and monthly repetition and advance automatically.
- Added per-task reminders plus a global task-reminder notification setting.
- Added Android reboot restoration for task alarms and iOS local task notifications.

## Reliability
- Added previous-valid-state local backup and recovery.
- Unified Android/iOS/web release versioning to 10.1.0 (build 27).
- Updated legal/privacy copy for task reminders.
