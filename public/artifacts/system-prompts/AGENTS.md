# AGENTS.md

## Mission

This repository allows autonomous agents to work on production software only inside governed execution loops. The agent may inspect, patch, validate, and report, but it must not treat code generation as authority. Authority comes from policy, tests, contracts, deployment rules, and human escalation.

## Production Operating Contract

Before changing files, create a run envelope in your own working notes with:

- intent: the exact production problem or requested change
- allowed scope: files, commands, services, and data the task permits
- blocked scope: protected paths, secrets, customer data, deployment surfaces, and destructive operations
- validators: commands that must pass before completion
- rollback: how the changed files can be reverted or isolated
- escalation: the condition that stops autonomous work

If any part of the envelope is missing, inspect the repository for local policy first. Use `public/artifacts/policies`, `public/artifacts/validators`, `public/artifacts/loop-patterns`, and the applicable `public/artifacts/skills` before assuming defaults.

## Default Protected Surfaces

Treat these as blocked unless a task specific policy explicitly allows them:

- `.env`, `.env.*`, `secrets/**`, `infra/secrets/**`, private keys, tokens, signing material, and customer exports
- production deployment configuration, release automation, live database credentials, DNS, billing runtime code, payment provider configuration, and access control rules
- database migrations that drop, truncate, rewrite, or backfill production data
- test, validator, policy, lint, or typecheck weakening that only exists to make a run pass
- direct commits to `main`, `master`, release branches, or protected deployment branches

## Required Workflow

1. Read the relevant files and policies before proposing a change.
2. Use `git status --short` and `git diff --name-only` to separate your changes from existing user work.
3. Prefer the smallest patch that explains the failure or requested outcome.
4. Run the narrow validator first, then the broader repository validator when the touched surface warrants it.
5. Stop after two failed remediation attempts on the same failure unless the task explicitly grants more attempts.
6. Report every validator that was run, every validator that could not run, and why.
7. Leave evidence that a reviewer can audit without trusting your memory.

## Validation Defaults

Use repository specific commands when present. If the repository does not declare a stronger validator, prefer this order:

- dependency and project metadata inspection: `git status --short`, package scripts, lockfile changes
- targeted tests for the changed area
- typecheck, compile, or framework build
- contract tests for public APIs, billing flows, auth flows, migrations, and integrations
- security checks when dependencies, input handling, secrets, auth, or infrastructure change

Do not claim a command passed unless it ran in the current workspace and completed successfully.

## Secrets And Data Handling

Never print, copy, summarize, transform, or exfiltrate secrets or customer data. If a command reveals sensitive values, stop using that output, report that sensitive material was exposed, and escalate. Redact only in the final report, not by editing repository files, unless the user explicitly asks for a remediation patch and policy allows it.

## Escalation Triggers

Escalate before changing files when:

- the requested change touches blocked scope
- production credentials or customer data are required
- validation cannot run and the changed surface is production critical
- the requested behavior conflicts with an existing policy or validator
- a generated patch would change public contracts without corresponding tests or documentation
- the same failure remains after two bounded attempts
- the safest fix requires weakening a test, policy, validator, or deployment gate

## Completion Report

Every completed run must report:

- changed files
- policy decisions made
- validators run and exact results
- validators not run and the blocker
- remaining operational risk
- any human follow up required before merge or deployment
