---
name: security-audit
description: Use when an agent must audit changed code, dependencies, configuration, or infrastructure for secrets, vulnerable packages, injection paths, auth regressions, and unsafe production exposure.
kind: csg.skill
version: 0.2.0
riskLevel: high
---

# Security Audit

## Use This Skill When

Use this skill before merging changes that touch dependencies, authentication, authorization, sessions, tokens, request parsing, file upload, command execution, SQL or query construction, HTML rendering, webhooks, billing, infrastructure, environment configuration, or deployment automation.

## Required Intake

Capture:

- target diff or directories
- base branch or comparison point
- package manager
- services affected
- security owner or escalation owner
- accepted severity threshold, default `no high or critical findings`
- required scanners and manual checks

If the task does not provide a diff, use `git status --short` and `git diff --name-only` to identify changed files, then scope the audit to those files and adjacent call sites.

## Audit Procedure

1. Secret scan changed files and nearby configuration. Look for tokens, private keys, signing secrets, connection strings, webhook secrets, OAuth credentials, cloud credentials, and copied customer data.
2. Inspect dependency changes. Use the repository package manager audit command when available, and review new packages for install scripts, typosquatting risk, abandoned maintenance, excessive permissions, and runtime network behavior.
3. Review input boundaries. Treat HTTP input, webhook payloads, file paths, shell arguments, database filters, and serialized data as untrusted.
4. Review authorization boundaries. Check that new code preserves tenant isolation, role checks, ownership checks, session expiry, and audit logging.
5. Review output boundaries. Check HTML escaping, redirects, logs, error messages, exported files, and telemetry for sensitive data exposure.
6. Classify each finding as critical, high, medium, low, or informational, with a concrete exploit path or a reason it is not exploitable.
7. For automatically fixable issues, patch only inside the audited scope and rerun the relevant scanner or validator.

## Required Commands

Use repository specific commands first. When present, prefer:

- `git diff --check`
- package audit command, such as `bun audit`, `npm audit`, `pnpm audit`, or `yarn npm audit`
- secret scanner configured by the repo
- targeted tests for auth, billing, webhooks, uploads, or request validation
- build or typecheck when security relevant code changed

If a scanner is not installed or cannot run, report `not-run` with the blocker. Do not replace a missing scanner with a claim of safety.

## Critical Findings

Escalate immediately and stop normal remediation if you find:

- active credentials, private keys, signing secrets, or customer data committed to the repository
- authentication bypass, authorization bypass, tenant isolation failure, or payment integrity failure
- command injection, SQL injection, unsafe deserialization, arbitrary file read or write, or server side request forgery with a reachable path
- critical dependency vulnerability with no available patch
- deployment configuration that exposes private services, admin routes, databases, or object storage

## Evidence Envelope

Return:

```json
{
  "scope": [],
  "commands": [
    { "command": "exact command", "status": "passed|failed|not-run", "reason": "short reason" }
  ],
  "findings": [
    {
      "severity": "critical|high|medium|low|informational",
      "file": "path",
      "issue": "specific risk",
      "exploitPath": "how it can be triggered",
      "recommendation": "specific remediation"
    }
  ],
  "patchedFiles": [],
  "escalation": "none or owner plus reason"
}
```

## Stop Conditions

Stop and escalate on critical findings, exposed secrets, uncertain customer data handling, unreviewable dependency behavior, security scanner failure on a production critical change, or any request to suppress a security finding without documented human approval.
