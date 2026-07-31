# BACKUP_RESTORE.md — Database Backup & Restore

Covers `apps/api`'s MongoDB database. Two layers exist; use whichever fits the situation.

## Layer 1 — Atlas's own backup

MongoDB Atlas provides automated backups on its own (continuous or scheduled snapshots, tier-dependent) with no setup required beyond having a cluster. This is the baseline safety net and requires no action from this repo — but it's **not verified/configured for any specific retention or restore-testing here**, which is the gap this doc and `pnpm backup:db`/`restore:db` close: Atlas backups protect against Atlas-side failure, but nobody had a documented, tested way to restore *from this repo* until now.

Check the current backup policy for the cluster in the Atlas UI (Backup tab) before relying on it — retention windows and snapshot frequency vary by tier.

## Layer 2 — `pnpm backup:db` / `pnpm restore:db` (this repo)

A `mongodump`/`mongorestore` wrapper (`apps/api/src/scripts/backup.ts` / `restore.ts`) that works against any MongoDB target reachable via `MONGODB_URI`, independent of Atlas's own snapshot schedule. Useful for: a manual pre-migration safety snapshot, a portable local copy, or the restore step in `DISASTER_RECOVERY.md`.

### Requirements

- [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) installed and on `PATH` (`mongodump`/`mongorestore`). Verify with `mongodump --version`.
- `apps/api/.env` with a valid `MONGODB_URI`.

### Backup

```bash
cd apps/api
pnpm backup:db
```

Writes to `apps/api/backups/<ISO-timestamp>/<db-name>/*.bson` (gitignored — these are local artifacts, not committed). Automatically prunes anything beyond the last 7 backups (`BACKUP_RETENTION_COUNT` env var to change the count).

### Restore

```bash
cd apps/api
npx tsx --env-file=.env src/scripts/restore.ts --yes [backup-timestamp]
```

- `--yes` is **required** — the script refuses to run without it, since restoring **drops every existing collection in the target database first** (`mongorestore --drop`), then loads the backup.
- `[backup-timestamp]` is optional — a folder name from `apps/api/backups/` (e.g. `2026-07-31T10-02-52-194Z`). Omit it to restore the most recent backup.
- Prefer `npx tsx ...` over `pnpm restore:db -- --yes` for this one — passing flags through `pnpm run`'s `--` forwarding was unreliable in testing on Windows (the literal `--` got forwarded as an argument). `pnpm backup:db` (no flags) is unaffected.

**This is destructive by design.** Never run it against a database you don't intend to fully replace with the backup's contents. Verified end-to-end 2026-07-31: `pnpm backup:db` then a full restore round-tripped all 30 documents across every collection in the dev database with zero data loss or failures.

### What gets backed up

Everything in the database `mongodump` finds at `MONGODB_URI`'s path — all collections (`products`, `categories`, `orders`, `customers`, `users`, `vouchers`, `posts`, etc.), including their indexes. Nothing is excluded; there's no PII-scrubbing step, so treat backup files with the same care as the live database (they're gitignored specifically for this reason — never commit one).

## See also

- `docs/system/DISASTER_RECOVERY.md` — when to reach for a restore, and the fuller incident-response process.
