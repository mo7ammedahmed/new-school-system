# Production Release Checklist

## Release gate

Run the automated gate from the release environment before enabling traffic:

```bash
php artisan app:release-check
php artisan app:release-check --strict
```

The check must report no failures. Warnings must be reviewed and accepted explicitly; strict mode turns warnings into failures for a production launch.

The full end-to-end gate (dependencies, disposable-database migration and
rollback validation, Wayfinder generation, frontend lint/types/build, Pint,
PHPStan, tests, and the strict release check) is automated:

```bash
bash scripts/verify-native-release.sh                 # routine local/CI validation
RELEASE_MODE=ci bash scripts/verify-native-release.sh # full production-like release gate
```

Both modes fail the run on any required gate failure and write per-step evidence
to `.verification/<run-id>/`. See `scripts/verify-native-release.sh` for the
mode contract.

### Expected local failures

Running `app:release-check --strict` on a developer machine always reports these
three items, because they are production-configuration requirements that a local
environment cannot satisfy:

| Check                          | Local value             | Why it cannot pass locally                    |
| ------------------------------ | ----------------------- | --------------------------------------------- |
| `APP_ENV is production`        | `local`                 | `APP_ENV` is `local`/`testing` in development |
| `APP_URL is HTTPS`             | `http://localhost:8000` | No TLS certificate exists for localhost       |
| `Mail transport is configured` | `log` or `array`        | No real mail credentials are available        |

They are **warnings** in `app:release-check` and become **failures** under
`--strict`. `RELEASE_MODE=local` therefore records them as expected results and
still exits 0 when every code gate is green; `RELEASE_MODE=ci` treats them as
hard failures, so a production-like environment must report zero failures.

Any _other_ strict-check failure — database connectivity, missing `jobs`,
`failed_jobs`, `notification_deliveries` or `queue_worker_heartbeats` tables,
unpaired Stripe secrets, a synchronous queue, or a non-production `APP_ENV` with
a debug-enabled build — is a real blocker in either mode.

## Application and secrets

- [ ] `APP_ENV=production`.
- [ ] `APP_DEBUG=false`.
- [ ] `APP_KEY` is present in the secret store and is not regenerated during deploy.
- [ ] `APP_URL` uses HTTPS and matches the public hostname.
- [ ] Database credentials point to the production database.
- [ ] Session and cache stores are persistent and shared by all application instances.
- [ ] A real mail transport and verified sender address are configured.
- [ ] `STRIPE_SECRET` and `STRIPE_WEBHOOK_SECRET` are both configured, paired, and stored outside source control.
- [ ] Queue and notification thresholds match expected operating volume.

## Database and release

- [ ] A backup or provider snapshot was completed and verified.
- [ ] The production `migrations` table was exported and compared with the repository migration set, following `docs/MIGRATION_INSPECTION.md`. The export and the diff are attached to the release record.
- [ ] The seven neutralized duplicate migrations were checked explicitly (`docs/MIGRATION_INSPECTION.md`, step 3) and the result recorded.
- [ ] `php artisan migrate --force` completed successfully.
- [ ] `php artisan optimize:clear`, `config:cache`, `route:cache`, and `view:cache` completed successfully.
- [ ] The release can be rolled back without deleting immutable financial or audit records.
- [ ] The previous release remains available until smoke checks pass.

## Background execution

- [ ] At least one persistent `queue:work` process is running for every configured queue.
- [ ] The process manager restarts failed workers and drains workers during deployment.
- [ ] Worker heartbeats are being recorded with a stable worker identity.
- [ ] One scheduler process or cron entry runs `php artisan schedule:run` every minute.
- [ ] `php artisan schedule:list` shows daily installment reminders and hourly health checks.
- [ ] `php artisan app:release-check` confirms `jobs`, `failed_jobs`, `notification_deliveries`, and `queue_worker_heartbeats` tables exist.

## Stripe and notifications

- [ ] Stripe webhook URL is `POST /webhooks/stripe` over HTTPS.
- [ ] Stripe is configured to send payment success and failure events.
- [ ] A signed test event was accepted once and a replay was deduplicated.
- [ ] An invalid or stale signature was rejected.
- [ ] A successful payment created exactly one immutable receipt.
- [ ] Email delivery failures create a failed delivery record and are visible to authorized staff.
- [ ] Arabic and English notification templates render correctly, including RTL email direction.

## Smoke tests

- [ ] `GET /health/ready` returns success.
- [ ] Public bilingual School page loads in English and Arabic.
- [ ] Guardian portal shows only linked Students and linked finance records.
- [ ] Finance Staff can view the finance report and export CSV.
- [ ] Receipt download returns printable HTML for an authorized user and is rejected for an unrelated user.
- [ ] Delivery monitoring shows queue backlog, failed jobs, and worker heartbeats.
- [ ] Audit events are created for the smoke-test payment and administrative actions.

## Go / no-go decision

Go live only when the automated release gate passes, all critical checklist items are checked, smoke tests pass, monitoring owners are assigned, and rollback responsibility is explicit. A failed database, queue, secret, webhook, or tenant-isolation check is a no-go condition.
