#!/usr/bin/env bash
#
# Native Release Verification
# ===========================
#
# Executes the verification sequence defined in
# docs/VERIFY-NATIVE-RELEASE-PROMPT.md (steps 1-12) and records evidence for
# every step under .verification/<timestamp>/.
#
# Modes
# -----
#   local (default)  Routine validation for a developer machine. Uses a
#                    disposable SQLite database and the local/test configuration.
#                    `app:release-check --strict` is EXPECTED to fail on the
#                    documented local-only configuration items and does not fail
#                    the run.
#
#   ci               Release gate for CI / production-like environments. Every
#                    step is mandatory, including `app:release-check --strict`,
#                    which must report zero failures.
#
# Usage
# -----
#   bash scripts/verify-native-release.sh
#   RELEASE_MODE=ci bash scripts/verify-native-release.sh
#
# Environment overrides
# ---------------------
#   RELEASE_MODE              local | ci                        (default: local)
#   COMPOSER_INSTALL_FLAGS    extra composer install flags       (default: empty)
#   SKIP_COMPOSER_INSTALL     1 to skip `composer install`
#   SKIP_NPM_INSTALL          1 to skip `npm ci`
#   ARTISAN                  artisan binary                     (default: php artisan)
#
# Contract
# --------
#   * Never uses `|| true` and never suppresses a required failure.
#   * Destructive migration checks only ever run against a disposable SQLite
#     database created by this script. The configured MySQL instance is never
#     touched.
#   * Exits 0 only when every required step passed for the selected mode.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

RELEASE_MODE="${RELEASE_MODE:-local}"
ARTISAN="${ARTISAN:-php artisan}"
COMPOSER_INSTALL_FLAGS="${COMPOSER_INSTALL_FLAGS:-}"
SKIP_COMPOSER_INSTALL="${SKIP_COMPOSER_INSTALL:-0}"
SKIP_NPM_INSTALL="${SKIP_NPM_INSTALL:-0}"

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
EVIDENCE_DIR="${REPO_ROOT}/.verification/${RUN_ID}"
mkdir -p "$EVIDENCE_DIR"

STEP_NUMBER=0
FAILURES=()
EXPECTED_RESULTS=()
EXPECTED_COUNT=0

# --- output helpers ---------------------------------------------------------

if [ -t 1 ]; then
    C_RESET=$'\033[0m'; C_BOLD=$'\033[1m'; C_RED=$'\033[31m'
    C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'; C_BLUE=$'\033[34m'
else
    C_RESET=""; C_BOLD=""; C_RED=""; C_GREEN=""; C_YELLOW=""; C_BLUE=""
fi

banner() {
    printf '\n%s==> %s%s\n' "$C_BOLD$C_BLUE" "$1" "$C_RESET"
}

info() { printf '%s    %s%s\n' "$C_BOLD" "$1" "$C_RESET"; }

note() { printf '    %s%s%s\n' "$C_YELLOW" "$1" "$C_RESET"; }

# --- step runner ------------------------------------------------------------
#
# A failing step is recorded and aborts the run immediately, except for steps
# explicitly registered as "expected to fail" in local mode.

run_step() {
    local id="$1"; shift
    local title="$1"; shift
    local expectation="${1:-required}"; shift

    STEP_NUMBER=$((STEP_NUMBER + 1))
    local log_file="${EVIDENCE_DIR}/${id}.log"

    banner "Step ${STEP_NUMBER}: ${title}"

    local status=0
    "$@" >"$log_file" 2>&1 || status=$?

    if [ "$status" -eq 0 ]; then
        printf '    %sPASS%s  %s\n' "$C_GREEN" "$C_RESET" "$title"
        printf '    log: %s\n' "${log_file#"$REPO_ROOT/"}"
        return 0
    fi

    if [ "$expectation" = "expected-local-failure" ] && [ "$RELEASE_MODE" = "local" ]; then
        EXPECTED_COUNT=$((EXPECTED_COUNT + 1))
        EXPECTED_RESULTS+=("Step ${STEP_NUMBER} (${title}): expected local-only failure, exit ${status}")
        printf '    %sEXPECTED FAIL%s (local mode) %s\n' "$C_YELLOW" "$C_RESET" "$title"
        note "documented local-only configuration failure; this is a hard failure in RELEASE_MODE=ci"
        printf '    log: %s\n' "${log_file#"$REPO_ROOT/"}"
        return 0
    fi

    printf '    %sFAIL%s  %s (exit %s)\n' "$C_RED" "$C_RESET" "$title" "$status"
    printf '    log: %s\n' "${log_file#"$REPO_ROOT/"}"
    FAILURES+=("Step ${STEP_NUMBER} (${title}) failed with exit ${status}; see ${log_file#"$REPO_ROOT/"}")
    print_log_tail "$log_file"

    if [ "$expectation" = "expected-local-failure" ]; then
        note "this step must pass in RELEASE_MODE=ci"
    fi

    return 1
}

print_log_tail() {
    local log_file="$1"
    local lines=40
    info "last ${lines} lines of ${log_file#"$REPO_ROOT/"}:"
    tail -n "$lines" "$log_file" | sed 's/^/      | /'
}

# --- command adapters -------------------------------------------------------

cmd_versions() {
    {
        echo "run-id: ${RUN_ID}"
        echo "release-mode: ${RELEASE_MODE}"
        echo "repo-root: ${REPO_ROOT}"
        echo
        echo "== PHP =="
        php --version
        echo
        echo "== Composer =="
        composer --version
        echo
        echo "== Node =="
        node --version
        echo
        echo "== npm =="
        npm --version
        echo
        echo "== Database (configured) =="
        php -r 'echo "DB_CONNECTION=".env("DB_CONNECTION").PHP_EOL;'
        echo
        echo "== Database (disposable, used for destructive steps) =="
        echo "sqlite:${DISPOSABLE_DB}"
        echo
        echo "== Laravel =="
        $ARTISAN --version
    } 2>&1
}

cmd_working_tree() {
    {
        echo "== git status --porcelain =="
        git status --porcelain
        echo
        echo "== git log --oneline -10 =="
        git log --oneline -10
    } 2>&1
}

cmd_wayfinder() {
    $ARTISAN config:clear
    # --with-form mirrors the `formVariants: true` option in vite.config.ts.
    # Without it the artisan command overwrites the Vite-generated routes with
    # a variant that has no `.form()` helper and breaks the type check.
    $ARTISAN wayfinder:generate --with-form
    local generated=0
    for dir in resources/js/actions resources/js/routes resources/js/wayfinder; do
        if [ -d "$dir" ]; then
            generated=$((generated + $(find "$dir" -type f | wc -l)))
        fi
    done
    echo "generated files: ${generated}"
    if [ "$generated" -eq 0 ]; then
        echo "ERROR: wayfinder produced no generated imports" >&2
        return 1
    fi
}

cmd_migration_count() {
    $ARTISAN tinker --execute='
        $repo = glob(base_path("database/migrations/*.php"));
        sort($repo);
        $applied = DB::table("migrations")->orderBy("batch")->orderBy("migration")->pluck("migration")->all();
        $duplicates = array_values(array_filter([
            "2026_09_14_000005_create_queue_tables",
            "2026_09_14_143947_create_organizations_table",
            "2026_09_14_144527_create_schools_table",
            "2026_09_14_144720_create_branches_table",
            "2026_09_14_145312_add_organization_id_to_users_table",
            "2026_09_14_145322_add_organization_id_to_users_table",
            "2026_09_14_150000_add_organization_id_to_branches_table",
        ], fn ($m) => in_array($m, $applied, true)));
        echo "repository migrations: ".count($repo).PHP_EOL;
        echo "applied migrations: ".count($applied).PHP_EOL;
        echo "missing from database: ".json_encode(array_values(array_diff(array_map(fn($f) => basename($f, ".php"), $repo), $applied))).PHP_EOL;
        echo "applied but absent from repository: ".json_encode(array_values(array_diff($applied, array_map(fn($f) => basename($f, ".php"), $repo)))).PHP_EOL;
        echo "documented duplicate no-ops applied: ".json_encode($duplicates).PHP_EOL;
    ' 2>&1
}

# --- preflight --------------------------------------------------------------

if [ "$RELEASE_MODE" != "local" ] && [ "$RELEASE_MODE" != "ci" ]; then
    printf '%sInvalid RELEASE_MODE: %s (expected: local or ci)%s\n' "$C_RED" "$RELEASE_MODE" "$C_RESET" >&2
    exit 2
fi

for binary in php node npm composer git; do
    if ! command -v "$binary" >/dev/null 2>&1; then
        printf '%sMissing required binary: %s%s\n' "$C_RED" "$binary" "$C_RESET" >&2
        exit 2
    fi
done

if [ ! -f .env ]; then
    cp .env.example .env
    $ARTISAN key:generate --ansi
    note "created .env from .env.example"
fi

# Disposable database: destructive migration checks must never touch the
# configured MySQL instance. Exported variables win over .env because Laravel
# loads the environment immutably.
#
# Only the database is overridden. Queue, mail, cache, and payment settings are
# deliberately left to the caller so that RELEASE_MODE=ci can exercise the real
# production-like configuration.
DISPOSABLE_DIR="$(mktemp -d)"
DISPOSABLE_DB="${DISPOSABLE_DIR}/verification.sqlite"
: > "$DISPOSABLE_DB"

export DB_CONNECTION=sqlite
export DB_DATABASE="$DISPOSABLE_DB"

SUMMARY_FILE="${EVIDENCE_DIR}/summary.txt"

write_summary() {
    {
        echo "Native Release Verification Summary"
        echo "==================================="
        echo "run id       : ${RUN_ID}"
        echo "release mode : ${RELEASE_MODE}"
        echo "evidence dir : ${EVIDENCE_DIR}"
        echo
        if [ "${#FAILURES[@]}" -gt 0 ]; then
            echo "required failures:"
            for failure in "${FAILURES[@]}"; do
                echo "  - ${failure}"
            done
        else
            echo "required failures: none"
        fi
        if [ "${#EXPECTED_RESULTS[@]}" -gt 0 ]; then
            echo
            echo "expected local-only results:"
            for expected in "${EXPECTED_RESULTS[@]}"; do
                echo "  - ${expected}"
            done
        fi
    } > "$SUMMARY_FILE"
}

print_results() {
    if [ "${#FAILURES[@]}" -gt 0 ]; then
        for failure in "${FAILURES[@]}"; do
            printf '    %sFAIL%s  %s\n' "$C_RED" "$C_RESET" "$failure"
        done
    fi

    if [ "${#EXPECTED_RESULTS[@]}" -gt 0 ]; then
        for expected in "${EXPECTED_RESULTS[@]}"; do
            printf '    %sEXPECTED%s  %s\n' "$C_YELLOW" "$C_RESET" "$expected"
        done
    fi
}

on_exit() {
    local status=$?
    write_summary

    if [ "$status" -ne 0 ]; then
        banner "Verification result"
        print_results
        printf '\n  evidence : %s\n  summary  : %s\n' \
            "${EVIDENCE_DIR#"$REPO_ROOT/"}" "${SUMMARY_FILE#"$REPO_ROOT/"}"
        printf '\n%sVERIFICATION FAILED%s — %d required step(s) failed in %s mode.\n' \
            "$C_RED$C_BOLD" "$C_RESET" "${#FAILURES[@]}" "$RELEASE_MODE"
    fi

    if [ "${KEEP_DISPOSABLE_DB:-0}" = "0" ]; then
        rm -rf "$DISPOSABLE_DIR"
    else
        printf 'Disposable database kept at %s\n' "$DISPOSABLE_DB"
    fi

    exit "$status"
}
trap on_exit EXIT

# --- run --------------------------------------------------------------------

printf '%s%sNative Release Verification%s\n' "$C_BOLD" "$C_BOLD" "$C_RESET"
printf '  mode     : %s\n' "$RELEASE_MODE"
printf '  evidence : %s\n' "${EVIDENCE_DIR#"$REPO_ROOT/"}"
printf '  database : %s\n' "$DISPOSABLE_DB"

run_step 01-versions "Record environment versions" required cmd_versions
run_step 02-working-tree "Inspect working tree and record pre-existing changes" required cmd_working_tree

if [ "$SKIP_COMPOSER_INSTALL" = "1" ]; then
    note "SKIP_COMPOSER_INSTALL=1, skipping composer install"
else
    # shellcheck disable=SC2086
    run_step 03-composer-install "Install PHP dependencies from composer.lock" required composer install --no-interaction --no-progress ${COMPOSER_INSTALL_FLAGS}
fi

if [ "$SKIP_NPM_INSTALL" = "1" ]; then
    note "SKIP_NPM_INSTALL=1, skipping npm ci"
else
    run_step 04-npm-install "Install frontend dependencies from package-lock.json" required npm ci --no-audit --no-fund
fi

run_step 05-migrate-fresh "Fresh migration and seed on the disposable database" required \
    $ARTISAN config:clear
run_step 06-migrate-fresh-run "Apply all migrations and seed data" required \
    $ARTISAN migrate:fresh --seed --force
run_step 07-migrate-reset "Rollback validation (migrate:reset)" required \
    $ARTISAN migrate:reset --force
run_step 08-migrate-apply "Re-apply migrations and seed data" required \
    $ARTISAN migrate --seed --force
run_step 09-migration-audit "Compare applied migrations with the repository migration set" required cmd_migration_count
run_step 10-wayfinder "Generate Wayfinder actions and verify generated imports" required cmd_wayfinder
run_step 11-frontend-check "Frontend lint and translation-key check" required npm run check
run_step 12-frontend-types "TypeScript type check" required npm run types:check
run_step 13-frontend-build "Production frontend build" required npm run build
run_step 14-pint "Pint code style check" required composer lint:check
run_step 15-phpstan "PHPStan static analysis" required composer types:check
run_step 16-tests "PHPUnit / Pest test suite" required $ARTISAN test

# The strict release check promotes every non-critical warning to a failure.
# On a developer machine APP_ENV, APP_URL (HTTPS) and the mail transport cannot
# pass, so the step is expected to fail in local mode and mandatory in ci mode.
run_step 17-config-clear "Clear cached configuration before the release gate" required \
    $ARTISAN config:clear
run_step 18-release-check "Strict release readiness check (app:release-check --strict)" \
    expected-local-failure $ARTISAN app:release-check --strict

# --- summary ----------------------------------------------------------------

banner "Summary"
print_results

printf '\n  evidence : %s\n' "${EVIDENCE_DIR#"$REPO_ROOT/"}"
printf '  summary  : %s\n' "${SUMMARY_FILE#"$REPO_ROOT/"}"
printf '  git      : %s file(s) currently modified or untracked\n' \
    "$(git status --porcelain | wc -l | tr -d ' ')"

if [ "$RELEASE_MODE" = "local" ] && [ "$EXPECTED_COUNT" -gt 0 ]; then
    printf '\n%sVERIFICATION PASSED (local mode)%s — all code gates green; %d configuration gate(s) fail as documented locally and must pass in a production-like environment.\n' \
        "$C_GREEN$C_BOLD" "$C_RESET" "$EXPECTED_COUNT"
else
    printf '\n%sVERIFICATION PASSED%s — every required gate is green in %s mode.\n' \
        "$C_GREEN$C_BOLD" "$C_RESET" "$RELEASE_MODE"
fi

exit 0
