# DISASTER_RECOVERY.md — Disaster Recovery Plan

Scope: the MongoDB Atlas database backing `apps/api` — the one stateful piece of this system. Cloudinary (media) and the application code itself (Git, and once deployed, whatever platform hosts it) are out of scope here; they have their own recovery story (Cloudinary is a managed service with its own durability; app code is recovered by redeploying from Git).

This plan assumes **nothing is deployed yet** (see `FULLSTACK.md` §5) — it documents the recovery process against the current MongoDB Atlas cluster used for development today, so the process is proven before it's ever needed for real. Once production hosting exists, the same process applies against the production cluster; update the "Current state" section below when that happens.

## Failure scenarios in scope

| Scenario | Likelihood | Impact |
|---|---|---|
| Bad deploy/migration corrupts or deletes data | Medium (any manual DB operation, e.g. a bulk admin script gone wrong) | High — wrong/missing catalog, orders, or customer data |
| Accidental destructive action (e.g. admin deletes wrong records) | Medium | Medium — usually scoped to a few documents |
| Atlas cluster/region outage | Low (managed service, but not zero) | High while it lasts — full read/write outage |
| Compromised admin credentials used to wipe data | Low | High |

Full regional disaster / multi-region failover is **not** planned for here — this is a single-shop application on Atlas's shared/dedicated tier, not a multi-region deployment, so that tier of resilience is deferred until traffic/revenue justifies the cost (see `FULLSTACK.md` §11 Load Balancing & Scaling, also deferred).

## Recovery objectives

- **RPO (Recovery Point Objective): ≤ 24 hours.** Daily automated backup via `pnpm backup:db` (see `BACKUP_RESTORE.md`) is the floor; Atlas's own continuous backup (if enabled on the cluster tier) can tighten this further.
- **RTO (Recovery Time Objective): ≤ 1 hour** from decision-to-restore to a working database, for a single-database restore of this size (currently a handful of collections, low document counts — see `BACKUP_RESTORE.md` for the measured restore time). This will need revisiting once real production data volume exists.

## Response steps

1. **Confirm the failure.** Check `GET /health` (`apps/api/src/app.ts`) and query the affected collection directly (via `mongosh` or Atlas's own data explorer) to confirm what's actually wrong before touching anything — don't restore against a guess.
2. **Stop further writes if the cause is ongoing** (e.g. a runaway script) — the API has no maintenance-mode flag today, so this means either stopping the API process or revoking the offending credential/IP in Atlas's network access list.
3. **Identify the last good backup.** List `apps/api/backups/` (or wherever backups are archived once off local disk — see "Off-machine copies" below) and pick the most recent one that predates the incident.
4. **Restore.** Run `pnpm restore:db -- --yes [backup-timestamp]` (see `BACKUP_RESTORE.md` for full usage). This is destructive (`--drop`) by design — it replaces the current state, so step 1 (confirming the failure) matters.
5. **Verify.** Hit a handful of representative reads (`GET /health`, `GET /api/products`, `GET /api/orders` as admin) and spot-check document counts against what the backup log reported when it was taken.
6. **Root-cause and document.** Add a short postmortem note here or in `docs/system/NOTE.md`: what broke, what the restore point lost (any writes between the backup and the incident are gone — this is the RPO gap), and what changes (code, access control, or process) prevent a repeat.

## Known gaps (accepted for now, revisit at production launch)

- **Off-machine copies:** `pnpm backup:db` currently writes to local disk (`apps/api/backups/`, gitignored). There's no automated upload to cloud storage (S3, Atlas's own backup snapshots, etc.) yet — a backup only protects against DB-side data loss, not also losing the machine it was taken on. Before production launch, either enable Atlas's built-in scheduled snapshots (its cluster tier permitting) or add a step to `backup.ts` that uploads the dump somewhere durable.
- **No scheduled/automated trigger:** the backup script exists and works (verified: `pnpm backup:db` then `pnpm restore:db -- --yes` round-tripped successfully with zero data loss), but nothing runs it on a schedule yet — it's a manual `pnpm` command today. A cron job / scheduled task (or a scheduled CI/CD job, once §7 CI/CD exists) should call it daily once there's a real host to run it from.
- **No alerting on backup failure.** If a scheduled backup silently fails, nobody is notified — tie this to whatever error-tracking/monitoring exists (see `FULLSTACK.md` §12) once deployed.

## Current state (update this section as it changes)

- Database: MongoDB Atlas, connection via `MONGODB_URI` in `apps/api/.env` (dev cluster).
- Last verified restore drill: 2026-07-31 — full `pnpm backup:db` → `pnpm restore:db -- --yes` round trip, 30 documents restored across all collections, 0 failures.
- Backup retention: last 7 backups kept locally (`BACKUP_RETENTION_COUNT` in `backup.ts`), older ones pruned automatically on each run.
