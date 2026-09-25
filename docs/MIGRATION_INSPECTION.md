# Migration Table Inspection (Pre-Deploy Gate)

`docs/DATABASE_INTEGRITY.md` documents seven migrations that are intentionally
neutralized as no-ops so a fresh install does not recreate canonical tables:

| #   | Migration                                                 | Canonical owner                                        |
| --- | --------------------------------------------------------- | ------------------------------------------------------ |
| 1   | `2026_09_14_000005_create_queue_tables`                   | `0001_01_01_000002_create_jobs_table`                  |
| 2   | `2026_09_14_143947_create_organizations_table`            | `2026_09_14_000001_create_organization_hierarchy`      |
| 3   | `2026_09_14_144527_create_schools_table`                  | `2026_09_14_000001_create_organization_hierarchy`      |
| 4   | `2026_09_14_144720_create_branches_table`                 | `2026_09_14_000001_create_organization_hierarchy`      |
| 5   | `2026_09_14_145312_add_organization_id_to_users_table`    | `2026_09_14_000002_add_organization_id_to_users_table` |
| 6   | `2026_09_14_145322_add_organization_id_to_users_table`    | `2026_09_14_000002_add_organization_id_to_users_table` |
| 7   | `2026_09_14_150000_add_organization_id_to_branches_table` | `2026_09_14_000001_create_organization_hierarchy`      |

A deployment target is only safe to promote when its `migrations` table is
understood. Run the inspection below **before** the first `php artisan migrate`
against production.

## Rules

1. **Never** rewrite or delete an already-applied migration.
2. **Never** edit a migration file that is recorded in the target `migrations`
   table. Corrections are made with reviewed forward migrations only.
3. Never run `migrate:fresh`, `migrate:reset`, or `migrate:rollback` against
   production. Destructive migration validation belongs on a disposable database
   (`scripts/verify-native-release.sh` does this automatically).
4. If the target already recorded a duplicate migration under its _original,
   non-neutralized_ name, the deployment needs a coordinated plan — not a file
   edit. Stop and escalate.

## Step 1 — Export the target migration table

MySQL / MariaDB:

```bash
mysql --host="$DB_HOST" --port="${DB_PORT:-3306}" --user="$DB_USERNAME" \
      --password="$DB_PASSWORD" "$DB_DATABASE" \
      --batch --raw \
      --execute="SELECT id, migration, batch FROM migrations ORDER BY batch, migration;" \
      > migration-table-$(date -u +%Y%m%dT%H%M%SZ).tsv
```

PostgreSQL:

```bash
psql "host=$DB_HOST dbname=$DB_DATABASE user=$DB_USERNAME" \
     --command "\copy (SELECT id, migration, batch FROM migrations ORDER BY batch, migration) TO STDOUT WITH (FORMAT csv, HEADER)" \
     > migration-table-$(date -u +%Y%m%dT%H%M%SZ).csv
```

SQLite (a copy of the file, never the live file):

```bash
sqlite3 ./production-copy.sqlite \
        "SELECT id || '|' || migration || '|' || batch FROM migrations ORDER BY batch, migration;" \
        > migration-table-$(date -u +%Y%m%dT%H%M%SZ).tsv
```

## Step 2 — Compare with the repository set

Repository migrations (the expected set):

```bash
for file in database/migrations/*.php; do
    basename "$file" .php
done | sort > /tmp/repo-migrations.txt

# from the Step 1 export, column 2 is the migration name
cut -f2 /tmp/migration-table.tsv | tail -n +2 | sort > /tmp/applied-migrations.txt

diff /tmp/repo-migrations.txt /tmp/applied-migrations.txt
```

Interpretation:

| Diff output                            | Meaning                                                             | Action                                                    |
| -------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| no output                              | Target is fully in sync with the repository                         | Continue to Step 4                                        |
| lines only in `repo-migrations.txt`    | Migrations not yet applied                                          | Expected before deploy; `migrate --force` will apply them |
| lines only in `applied-migrations.txt` | Target recorded a migration that no longer exists in the repository | **Stop.** Do not deploy until reconciled                  |
| counts differ from 52                  | Repository drift                                                    | Re-run the diff and reconcile before deploying            |

## Step 3 — Confirm the seven neutralized duplicates

```sql
SELECT migration, batch
FROM migrations
WHERE migration IN (
    '2026_09_14_000005_create_queue_tables',
    '2026_09_14_143947_create_organizations_table',
    '2026_09_14_144527_create_schools_table',
    '2026_09_14_144720_create_branches_table',
    '2026_09_14_145312_add_organization_id_to_users_table',
    '2026_09_14_145322_add_organization_id_to_users_table',
    '2026_09_14_150000_add_organization_id_to_branches_table'
)
ORDER BY migration;
```

- **All seven recorded** → the no-op versions are in place. Safe to continue.
- **None recorded** → the no-op versions will be applied on the next run, after
  the canonical tables. Safe to continue.
- **A partial subset recorded** → legitimate for a database that was migrated
  between the duplicate files being created and their neutralization, provided
  the canonical tables (`organizations`, `schools`, `branches`, `users`,
  `jobs`, `failed_jobs`) already exist:

```sql
SHOW TABLES LIKE 'organizations';
SHOW TABLES LIKE 'schools';
SHOW TABLES LIKE 'branches';
SHOW TABLES LIKE 'jobs';
SHOW TABLES LIKE 'failed_jobs';
```

If the canonical tables are missing, **stop**: the target was never migrated
with the canonical hierarchy and needs a reviewed forward migration plan.

## Step 4 — Confirm the target schema matches the expectation

```sql
SELECT COUNT(*) AS applied_migrations, MAX(batch) AS latest_batch FROM migrations;
SELECT migration, batch FROM migrations WHERE batch = (SELECT MAX(batch) FROM migrations) ORDER BY migration;
```

Then validate the rollback path on a **disposable copy** only:

```bash
RELEASE_MODE=local bash scripts/verify-native-release.sh
```

Step 07 of that script runs `migrate:reset` against a throwaway SQLite database
and step 09 compares the applied set with the repository set.

## Recording the result

Attach the Step 1 export, the Step 2 diff, and the Step 3 result to the release
ticket, and tick the corresponding items in `docs/RELEASE_CHECKLIST.md`. A
release without a recorded migration-table inspection is a no-go.
