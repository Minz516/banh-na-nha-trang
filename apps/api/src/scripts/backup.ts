/**
 * backup.ts — dumps the full MongoDB database via mongodump.
 * Run with: pnpm backup:db
 *
 * Requires the MongoDB Database Tools (`mongodump`) installed and on PATH.
 * Writes to apps/api/backups/<ISO-timestamp>/ and prunes anything beyond
 * BACKUP_RETENTION_COUNT (default 7) so this directory doesn't grow forever.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../config/env.js';

const BACKUPS_ROOT = join(import.meta.dirname, '../../backups');
const BACKUP_RETENTION_COUNT = Number(process.env.BACKUP_RETENTION_COUNT ?? 7);

function pruneOldBackups(): void {
  if (!statSync(BACKUPS_ROOT, { throwIfNoEntry: false })) return;

  const entries = readdirSync(BACKUPS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort() // ISO timestamps sort chronologically as strings
    .reverse();

  for (const stale of entries.slice(BACKUP_RETENTION_COUNT)) {
    rmSync(join(BACKUPS_ROOT, stale), { recursive: true, force: true });
    console.log(`🗑️  Pruned old backup: ${stale}`);
  }
}

function main(): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = join(BACKUPS_ROOT, timestamp);
  mkdirSync(outDir, { recursive: true });

  console.log(`📦 Backing up database to ${outDir} ...`);
  const result = spawnSync('mongodump', ['--uri', env.MONGODB_URI, '--out', outDir], {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error('❌ mongodump failed to start — is the MongoDB Database Tools package installed?', result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`❌ mongodump exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }

  console.log(`✅ Backup complete: ${outDir}`);
  pruneOldBackups();
}

main();
