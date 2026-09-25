# Project documentation

This directory contains the working baseline for product and delivery decisions. Read [Product definition](PRODUCT.md) to understand what will be built, [Architecture](ARCHITECTURE.md) to understand how its major responsibilities fit together, and [Delivery roadmap](ROADMAP.md) to understand when work is planned.

[Decision register](DECISIONS.md) is the source for confirmed assumptions and deliberately deferred choices. [Validation strategy](VALIDATION.md) defines the proof required before a phase is complete. [Repository audit](AUDIT.md) records the current launch risks and evidence status, while the [native verification prompt](VERIFY-NATIVE-RELEASE-PROMPT.md) provides the execution sequence.

Release operations are documented separately: [Release checklist](RELEASE_CHECKLIST.md) lists the pre-deploy gates and the go/no-go decision, [Migration inspection](MIGRATION_INSPECTION.md) defines the pre-deploy `migrations` table procedure, [Database integrity](DATABASE_INTEGRITY.md) records migration ownership and the neutralized duplicates, and [Deployment](DEPLOYMENT.md) covers the runtime procedure. The sequence is automated by `scripts/verify-native-release.sh` and run in CI by `.github/workflows/native-release.yml`.
