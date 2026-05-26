---
name: production-troubleshooting
description: Use when an agent must triage a production incident, CI failure, local reproduction failure, or degraded service by collecting structured diagnostics before making changes.
kind: csg.skill
version: 0.2.0
riskLevel: high
---

# Production Troubleshooting

## Use This Skill When

Use this skill when the failure is not yet explained. Typical triggers include CI passing locally but failing remotely, a service failing to start, a health check regression, a test suite hanging, a dependency install failure, a runtime error after deploy, or an incident symptom that needs evidence before remediation.

## Required Intake

Capture:

- incident id or failing job URL
- affected service or package
- expected behavior
- observed behavior
- time the failure started
- last known good version or commit, if available
- commands already tried
- production surfaces that must not be touched

## Diagnostic Procedure

1. Run the included diagnostic script from this skill directory:

   ```sh
   node ./scripts/diagnose.js --json
   ```

2. If a service URL is provided by the user, run:

   ```sh
   node ./scripts/diagnose.js --json --url https://service.example/health
   ```

3. Read the JSON output before editing. Treat nonzero exit codes, dirty working tree entries, missing package scripts, unavailable runtimes, failing health checks, and policy file gaps as evidence.
4. Reproduce the failure with the narrowest command possible.
5. Classify the problem as environment, dependency, configuration, code regression, data contract, infrastructure, flaky test, or unknown.
6. Only then choose the next skill, usually `governed-remediation`, `security-audit`, or `repo-migration`.

## Diagnostic Evidence To Preserve

Keep these fields in the final report:

- runtime versions
- package manager and scripts detected
- git branch and dirty files
- changed files
- relevant environment variable names, never values
- policy, validator, and skill files detected
- health check status, if a URL was checked
- command reproduction result

## Blocked Actions

Do not restart production services, rotate credentials, clear queues, run destructive database commands, purge caches, or change deployment configuration from this skill alone. This skill gathers evidence and identifies the next bounded action. Production mutation requires a specific policy allowance and an explicit remediation plan.

## Stop Conditions

Stop and escalate when diagnostics expose secrets, the issue requires production credentials, the health check confirms an active customer impacting outage, the repository has local changes unrelated to the incident that would be overwritten, or the next step requires infrastructure or data mutation.
