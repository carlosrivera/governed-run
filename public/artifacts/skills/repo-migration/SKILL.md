---
name: repo-migration
description: Use when an agent must migrate a deprecated API, framework version, package import, configuration format, schema contract, or cross repository convention under batch limits and validation gates.
kind: csg.skill
version: 0.2.0
riskLevel: high
---

# Repo Migration

## Use This Skill When

Use this skill for production migrations that touch repeated patterns across a codebase, including package upgrades, import path changes, framework API changes, schema format changes, config file migrations, and database client migrations. Do not use it for one file fixes or broad rewrites without a concrete source pattern and target pattern.

## Required Intake

Before editing, define:

- source pattern to remove
- target pattern to introduce
- migration owner or escalation owner
- maximum files per batch, default `10`
- allowed paths
- blocked paths
- required validators for each batch
- final repository wide validator

If the task does not provide a source and target pattern, inspect official local migration notes, dependency changelogs already present in the repo, type errors, or failing tests. Do not invent a migration target from memory when production code is affected.

## Discovery Procedure

1. Run a read only inventory with `rg` or the repository search tool for the deprecated API, package, config key, or schema field.
2. Save the inventory as counts by path category: app code, tests, fixtures, docs, generated files, migrations, infra, and unknown.
3. Compare the inventory against policy. Mark protected files as blocked before editing.
4. Identify the smallest safe batch that can be validated independently.
5. If generated files are involved, find the generator instead of hand editing generated output.

## Migration Procedure

1. Migrate one batch at a time, respecting the file limit.
2. Prefer structured edits, compiler guided fixes, codemods, or AST aware tools when available. Do not use blind repository wide replacement for production code.
3. After each batch, run the narrow validator for that surface.
4. If a batch changes exported behavior, update or add the relevant contract test in the same batch.
5. When all batches pass, run the final repository wide validator.
6. Report remaining deprecated usages, including blocked paths and generated files.

## Blocked Operations

Do not autonomously:

- migrate production database migrations that rewrite live data
- update auth, billing, payment, deletion, or permission behavior without explicit contract validators
- suppress compiler errors with ignore comments unless the migration guide explicitly requires it and a human approves
- change lockfiles without explaining the package manager command that produced the change
- combine a migration with unrelated formatting, cleanup, or dependency bumps

## Required Evidence

The completion report must include:

```json
{
  "sourcePattern": "deprecated API or convention",
  "targetPattern": "replacement API or convention",
  "inventory": {
    "found": 0,
    "migrated": 0,
    "remaining": 0,
    "blocked": []
  },
  "batches": [
    {
      "files": [],
      "validators": [
        { "command": "exact command", "status": "passed|failed|not-run", "reason": "short reason" }
      ]
    }
  ],
  "lockfileChanged": false,
  "remainingRisk": "reviewer concern",
  "escalation": "none or owner plus reason"
}
```

## Stop Conditions

Stop and escalate when blocked files are required, the source and target pattern are ambiguous, a batch fails validation twice, generated files cannot be regenerated, a migration changes public behavior without tests, or the final validator cannot run for a production critical surface.
