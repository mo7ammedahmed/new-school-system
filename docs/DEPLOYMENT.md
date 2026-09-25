# Deployment and Operations Runbook

## Required production configuration

Set APP_ENV=production, APP_DEBUG=false, a strong APP_KEY, the public APP_URL, production database credentials, a non-local session and cache backend, and a real mail transport. Use a persistent queue backend such as Redis or the database queue. Configure STRIPE_SECRET and STRIPE_WEBHOOK_SECRET only through the deployment secret store; do not commit either value.

Configure the queue and health thresholds according to expected traffic. The default values are DB_QUEUE_RETRY_AFTER=90, QUEUE_WORKER_STALE_MINUTES=10, QUEUE_BACKLOG_THRESHOLD=100, QUEUE_FAILED_THRESHOLD=10, NOTIFICATION_DELIVERY_FAILURE_THRESHOLD=10, and NOTIFICATION_DELIVERY_QUEUE_THRESHOLD=50.

The web middleware applies baseline security headers to web responses and adds a production Content Security Policy. If the frontend introduces a new third-party script, image host, font host, or embedded frame, update pp/Http/Middleware/SecurityHeaders.php deliberately and run the security hardening feature tests before deployment. Public admissions submissions are protected by a 10 requests per minute route throttle.

## Release procedure

Before touching the production environment, run the complete native/CI gate from a disposable checkout. **A single-file verification script (scripts/verify-native-release.sh) and GitHub Actions workflow (.github/workflows/native-release.yml) do not yet exist**; the equivalent manual steps are:

`ash
composer install

# Validate fresh and refresh migrations against disposable SQLite

php artisan wayfinder:generate
npm ci
npm run check
npm run build
composer lint:check
composer types:check
php artisan test
php artisan app:release-check --strict
`

Do not run these steps from the mounted development workspace; they require a native filesystem. Only continue with the production sequence after the gate passes.

Deploy the application code and dependencies, verify the release environment, then run:

`ash
php artisan down --render="errors::503" --retry=60
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
`

Run migrations before restarting workers so the notification, finance, webhook, receipt, and heartbeat tables exist before queued jobs execute. Keep the previous release available for rollback and do not roll back a migration after immutable financial records have been created without a reviewed recovery plan.

## Queue workers

Run at least one persistent worker for the configured connection and queue. A production process manager should restart the worker after failure and during deployments. A typical database-queue worker command is:

`ash
php artisan queue:work database --queue=default --sleep=3 --tries=3 --timeout=90 --max-time=3600
`

The worker process or its supervisor-side health hook must periodically record liveness:

`ash
php artisan queue:heartbeat worker-1 --connection=database --queue=default
`

The heartbeat command is intentionally explicit so deployment infrastructure can supply the actual worker identity and counters. The hourly queue:check-health command alerts organization and school administrators when workers become stale or queue thresholds are exceeded.

## Scheduler

Run one scheduler process per application deployment:

`ash

-   -   -   -   - cd /var/www/school.system && php artisan schedule:run >> /dev/null 2>&1
                  `

The application schedules installment reminders daily at 07:00 and notification and queue health checks hourly. Do not run duplicate scheduler processes unless the deployment platform provides distributed scheduler locking.

## Stripe webhook

Register the public endpoint:

`	ext
POST https://your-school-domain.example/webhooks/stripe
`

Configure Stripe to deliver payment_intent.succeeded and payment_intent.payment_failed. The endpoint verifies the raw request body and Stripe-Signature header, rejects stale signatures, deduplicates event IDs, and reconciles payment state without trusting browser redirects. Confirm the webhook endpoint can reach the application without authentication or CSRF tokens while remaining protected by the signing secret.

## Smoke checks after release

Run the readiness endpoint, verify a protected staff page, verify the scheduler list, and inspect queue health:

`ash
curl -fsS https://your-school-domain.example/health/ready
php artisan schedule:list
php artisan queue:monitor default
php artisan queue:check-health
`

Also verify the public release surface: load /, /robots.txt, /sitemap.xml, a public school page, and its /apply page in both Arabic and English. Confirm the privacy consent choice persists, the admissions success/error feedback is visible, and the response includes the expected security headers.

Create a test heartbeat and confirm it appears in the delivery monitoring page. In a non-production Stripe environment, send a signed test event and confirm exactly one webhook event, one successful receipt, and one payment notification are recorded.

## Operational safeguards

Keep application logs, failed jobs, webhook event IDs, audit logs, and payment receipts in retention-managed storage. Alert on failed jobs, stale worker heartbeats, rising email failures, and webhook signature failures. Never edit or delete audit logs, receipts, payment intents, or webhook event records directly. Investigate through an auditable administrative workflow and preserve the original records.
