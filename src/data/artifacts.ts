export interface Artifact {
  id: string;
  kind: string;
  title: string;
  href: string;
  tags: string[];
  body: string;
}

export const artifactCatalog: Artifact[] = [
  {
    id: "agents-prompt",
    kind: "System prompt",
    title: "AGENTS.md",
    href: "/artifacts/system-prompts/AGENTS.md",
    tags: ["agent-contract", "production-boundaries", "evidence"],
    body: "A production agent contract that forces every run to define intent, allowed scope, blocked scope, validators, rollback, escalation, and completion evidence before changing files.",
  },
  {
    id: "governed-remediation-skill",
    kind: "Skill",
    title: "Governed remediation",
    href: "/artifacts/skills/governed-remediation/SKILL.md",
    tags: ["incident-repair", "validator-gates", "attempt-limit"],
    body: "A production remediation skill for failing tests, contracts, builds, or incident symptoms, with strict intake fields, blocked repairs, two-attempt limits, and JSON evidence output.",
  },
  {
    id: "repo-migration-skill",
    kind: "Skill",
    title: "Repo migration",
    href: "/artifacts/skills/repo-migration/SKILL.md",
    tags: ["migration", "batching", "compiler-guided"],
    body: "A migration skill for deprecated APIs, config formats, package imports, and schema contracts, requiring inventory counts, batch limits, protected path checks, and final validator evidence.",
  },
  {
    id: "security-audit-skill",
    kind: "Skill",
    title: "Security audit",
    href: "/artifacts/skills/security-audit/SKILL.md",
    tags: ["security", "secrets", "auth-boundaries"],
    body: "A security review skill for changed code, dependencies, auth, input handling, infrastructure, and deployment paths, with critical finding stop rules and scanner evidence requirements.",
  },
  {
    id: "advanced-troubleshooting-skill",
    kind: "Skill",
    title: "Production troubleshooting",
    href: "/artifacts/skills/advanced-troubleshooting/SKILL.md",
    tags: ["incident-triage", "diagnostics", "health-check"],
    body: "A troubleshooting skill that gathers structured runtime, git, package, artifact, environment-name, and optional health-check diagnostics before choosing remediation.",
  },
  {
    id: "policy-gate",
    kind: "Hook",
    title: "Policy gate",
    href: "/artifacts/hooks/policy-gate.ts",
    tags: ["pre-execution", "policy", "validator-plan"],
    body: "A pre-execution hook that checks planned files, operations, validators, cost, and rule-specific requirements before allowing autonomous work to proceed.",
  },
  {
    id: "command-gate",
    kind: "Hook",
    title: "Command gate",
    href: "/artifacts/hooks/command-gate.ts",
    tags: ["security", "pre-execution", "cli-boundaries"],
    body: "A command hook that normalizes shell requests, denies destructive git and shell fragments, and escalates commands outside an explicit allow list.",
  },
  {
    id: "after-execution",
    kind: "Hook",
    title: "Execution trace",
    href: "/artifacts/hooks/after-execution.ts",
    tags: ["trace", "cost", "post-run"],
    body: "A post-run hook that emits outcome, duration, changed files, validators, policy decisions, attempts, remaining risk, escalation state, and cost metrics.",
  },
  {
    id: "protected-production",
    kind: "Policy",
    title: "Protected production",
    href: "/artifacts/policies/protected-production.yaml",
    tags: ["production", "secrets", "billing-auth"],
    body: "A production policy with default escalation, explicit blocked paths and operations, billing and migration validator requirements, and evidence rules.",
  },
  {
    id: "git-safety-policy",
    kind: "Policy",
    title: "Git safety policy",
    href: "/artifacts/policies/git-safety-policy.yaml",
    tags: ["git", "branch-protection", "dirty-tree"],
    body: "A git policy that blocks protected branch writes, destructive history commands, unrelated dirty worktree changes, and unvalidated merge attempts.",
  },
  {
    id: "billing-contract",
    kind: "Validator",
    title: "Billing contract",
    href: "/artifacts/validators/billing-contract.json",
    tags: ["billing", "unit-checks", "contract"],
    body: "A billing validator that protects totals, idempotency, refunds, integer currency handling, provider side effects, and secret-free logs with required contract commands.",
  },
  {
    id: "coverage-guardian",
    kind: "Validator",
    title: "Coverage guardian",
    href: "/artifacts/validators/coverage-guardian.json",
    tags: ["testing", "coverage-check", "build-gate"],
    body: "A coverage validator that fails changed production files without test evidence and escalates when coverage cannot run or thresholds must be lowered.",
  },
  {
    id: "governed-remediation-loop",
    kind: "Loop pattern",
    title: "Governed remediation loop",
    href: "/artifacts/loop-patterns/governed-remediation.yaml",
    tags: ["remediation", "adaptation", "retry-limit"],
    body: "A bounded remediation loop with named phases, required evidence per phase, adaptation rules, two-attempt maximum, and explicit escalation entry conditions.",
  },
  {
    id: "submission-template",
    kind: "Template",
    title: "Submission template",
    href: "/artifacts/submission-template.json",
    tags: ["contribution", "review-envelope", "primitives"],
    body: "A fill-in envelope that gives contributors a concrete starting structure to submit new operational primitives.",
  },
  {
    id: "artifact-schema",
    kind: "Schema",
    title: "Artifact schema",
    href: "/artifacts/schema/csg-artifact.schema.json",
    tags: ["validation", "metadata-standards", "schema"],
    body: "The JSON schema contract that every operational primitive must satisfy: kind, intent, scope, evidence, and escalation.",
  }
];
