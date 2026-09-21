# Production Release Checklist

## Release gate

Run the automated gate from the release environment before enabling traffic:

```bash
php artisan app:release-check
php artisan app:release-check --strict
```

The check must report no failures. Warnings must be reviewed and accepted explicitly; strict mode turns warnings into failures for a production launch.

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
