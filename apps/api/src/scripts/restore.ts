/**
 * restore.ts — restores a mongodump backup via mongorestore. DESTRUCTIVE:
 * drops every collection in the target database before restoring (--drop),
 * so this only runs with an explicit confirmation flag.
 *
 * Run with: pnpm restore:db -- --yes [backup-timestamp]
 *   --yes                 required; refuses to run without it
 *   [backup-timestamp]    a folder name under apps/api/backups/ (defaults to the latest one)
 *
 * Requires the MongoDB Database Tools (`mongorestore`) installed and on PATH.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../config/env.js';

const BACKUPS_ROOT = join(import.meta.dirname, '../../backups');

function latestBackup(): string {
  const entries = readdirSync(BACKUPS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .reverse();
  if (entries.length === 0) {
    console.error(`❌ No backups found under ${BACKUPS_ROOT}. Run "pnpm backup:db" first.`);
    process.exit(1);
  }
  return entries[0] as string;
}

function main(): void {
  const args = process.argv.slice(2);
  if (!args.includes('--yes')) {
    console.error('❌ Refusing to restore without --yes — this DROPS every collection in the target database first.');
    console.error('   Run: pnpm restore:db -- --yes [backup-timestamp]');
    process.exit(1);
  }

  const positional = args.filter((a) => a !== '--yes');
  const timestamp = positional[0] ?? latestBackup();
  const backupDir = join(BACKUPS_ROOT, timestamp);

  if (!statSync(backupDir, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`❌ Backup not found: ${backupDir}`);
    process.exit(1);
  }

  const dbName = new URL(env.MONGODB_URI).pathname.replace(/^\//, '');
  const dumpPath = join(backupDir, dbName);
  if (!statSync(dumpPath, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`❌ Backup at ${backupDir} has no dump for database "${dbName}" (expected ${dumpPath}).`);
    process.exit(1);
  }

  console.log(`⚠️  Restoring "${dbName}" from ${backupDir} — this will DROP existing collections first.`);
  const result = spawnSync('mongorestore', ['--uri', env.MONGODB_URI, '--drop', dumpPath], {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error('❌ mongorestore failed to start — is the MongoDB Database Tools package installed?', result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`❌ mongorestore exited with code ${result.status}`);
    process.exit(result.status ?? 1);
  }

  console.log(`✅ Restore complete from ${backupDir}`);
}

main();
