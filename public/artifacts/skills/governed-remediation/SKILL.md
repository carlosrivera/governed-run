---
name: governed-remediation
description: Use when an agent must repair a failing test, contract, build, lint rule, incident symptom, or production regression without expanding scope or weakening validation.
kind: csg.skill
version: 0.2.0
riskLevel: high
---

# Governed Remediation

## Use This Skill When

Use this skill for concrete failures with observable evidence, such as failing CI, a broken contract test, a production error trace, a typecheck regression, a migration dry run failure, or a monitoring alert tied to a recent change. Do not use it for broad refactors, product ideation, dependency upgrades, or speculative cleanup.

## Required Intake

Capture these fields before editing:

- incident or failure id
- failing command, alert, trace, or log excerpt
- suspected service, package, or module
- allowed paths
- blocked paths
- required validators
- maximum remediation attempts, default `2`
- escalation owner, default `human reviewer`

If the intake omits allowed and blocked paths, derive them from `public/artifacts/policies/*.yaml` and `public/artifacts/validators/*.json`. If the repository has no policy for the touched surface, treat production runtime, secrets, migrations, billing, auth, deployment, and infrastructure as blocked.

## Execution Procedure

1. Reproduce the failure with the exact command or the narrowest available equivalent.
2. Read only the smallest set of source, tests, fixtures, contracts, and traces needed to explain the failure.
3. Classify the failure as test expectation drift, product behavior regression, dependency or environment mismatch, data contract break, configuration error, or unknown.
4. Patch only files inside allowed scope. If the root cause is outside allowed scope, stop and escalate with evidence.
5. Run the failing validator again. If it passes, run any declared broader validator for the touched surface.
6. If validation fails, make one more bounded attempt only when the new evidence explains why the first patch was insufficient.
7. Stop after the second failed attempt, or sooner if policy, secrets, production data, or deployment surfaces are involved.

## Allowed Production Repairs

Allowed only when the task and policy permit the paths:

- tests that assert intended behavior
- fixtures that are stale but contractually safe to update
- documentation or runbooks that are wrong and caused operational misuse
- application code whose behavior is covered by a targeted validator and a broader regression validator
- configuration for non production environments

## Blocked Repairs

Do not perform these autonomously:

- weaken, delete, skip, or quarantine a failing validator to create a green run
- edit production secrets, deployment credentials, payment provider settings, or live database connection material
- change database migrations that affect live data unless a migration policy explicitly allows the operation
- change billing, auth, authorization, or data deletion behavior without a contract test
- apply unrelated cleanup while the failure is still under investigation

## Evidence Envelope

Return this structure in the completion report:

```json
{
  "intent": "bounded remediation target",
  "failure": "command, alert, trace, or contract that failed",
  "classification": "one of the failure classes",
  "changedFiles": [],
  "policyDecisions": [],
  "validators": [
    { "command": "exact command", "status": "passed|failed|not-run", "reason": "short reason" }
  ],
  "attempts": 1,
  "remainingRisk": "what a reviewer still needs to know",
  "escalation": "none or owner plus reason"
}
```

## Stop Conditions

Stop and escalate when blocked scope is required, a secret appears in output, production data is needed to verify the fix, public behavior changes without a contract validator, the same validator fails after two bounded attempts, or the only apparent path forward is to weaken a test, policy, or deployment gate.
