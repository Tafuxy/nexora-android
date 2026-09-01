# Nexora V10 changelog

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
- Unified Android/iOS/web release versioning to 10.0.0 (build 26).
- Updated legal/privacy copy for task reminders.
