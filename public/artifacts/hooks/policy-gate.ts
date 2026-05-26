type ExecutionPlan = {
  intentId: string;
  actor: string;
  changedFiles: string[];
  requestedOperations: string[];
  validatorsPlanned: string[];
  estimatedCostUsd?: number;
};

type PolicyRule = {
  id: string;
  paths?: string[];
  operations?: string[];
  decision: "deny" | "escalate";
  requiredValidators?: string[];
};

type PolicyGateConfig = {
  allowedPaths: string[];
  blockedPaths: string[];
  blockedOperations: string[];
  requiredValidators: string[];
  maxCostUsd: number;
  rules?: PolicyRule[];
};

type PolicyGateResult =
  | { decision: "allow"; evidence: string[] }
  | { decision: "deny"; reason: string; evidence: string[] }
  | { decision: "escalate"; reason: string; evidence: string[] };

export async function beforeExecution(
  plan: ExecutionPlan,
  config: PolicyGateConfig,
): Promise<PolicyGateResult> {
  const evidence = [
    `intent:${plan.intentId}`,
    `actor:${plan.actor}`,
    `files:${plan.changedFiles.join(",") || "none"}`,
    `operations:${plan.requestedOperations.join(",") || "none"}`,
    `validators:${plan.validatorsPlanned.join(",") || "none"}`,
    `estimatedCostUsd:${plan.estimatedCostUsd ?? 0}`,
  ];

  const outsideAllowedScope = plan.changedFiles.find((file) =>
    config.allowedPaths.length > 0 && !config.allowedPaths.some((pattern) => matchesGlob(file, pattern)),
  );

  if (outsideAllowedScope) {
    return {
      decision: "escalate",
      reason: `Plan changes a file outside allowed scope: ${outsideAllowedScope}`,
      evidence,
    };
  }

  const blockedFile = plan.changedFiles.find((file) =>
    config.blockedPaths.some((pattern) => matchesGlob(file, pattern)),
  );

  if (blockedFile) {
    return {
      decision: "deny",
      reason: `Plan touches blocked path: ${blockedFile}`,
      evidence,
    };
  }

  const blockedOperation = plan.requestedOperations.find((operation) =>
    config.blockedOperations.includes(operation),
  );

  if (blockedOperation) {
    return {
      decision: "escalate",
      reason: `Operation requires human approval: ${blockedOperation}`,
      evidence,
    };
  }

  const missingValidator = config.requiredValidators.find(
    (validator) => !plan.validatorsPlanned.includes(validator),
  );

  if (missingValidator) {
    return {
      decision: "escalate",
      reason: `Required validator is not planned: ${missingValidator}`,
      evidence,
    };
  }

  if ((plan.estimatedCostUsd ?? 0) > config.maxCostUsd) {
    return {
      decision: "escalate",
      reason: `Estimated cost exceeds budget: ${plan.estimatedCostUsd}`,
      evidence,
    };
  }

  for (const rule of config.rules ?? []) {
    const pathMatched = rule.paths?.some((pattern) =>
      plan.changedFiles.some((file) => matchesGlob(file, pattern)),
    );
    const operationMatched = rule.operations?.some((operation) =>
      plan.requestedOperations.includes(operation),
    );

    if (!pathMatched && !operationMatched) continue;

    const missingRuleValidator = rule.requiredValidators?.find(
      (validator) => !plan.validatorsPlanned.includes(validator),
    );

    if (missingRuleValidator) {
      return {
        decision: "escalate",
        reason: `Rule ${rule.id} requires missing validator: ${missingRuleValidator}`,
        evidence,
      };
    }

    return {
      decision: rule.decision,
      reason: `Rule matched: ${rule.id}`,
      evidence,
    };
  }

  return { decision: "allow", evidence };
}

function matchesGlob(path: string, pattern: string) {
  const escaped = pattern
    .replace(/\*\*/g, "__GLOBSTAR__")
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, "[^/]*")
    .replace(/__GLOBSTAR__/g, ".*");

  return new RegExp(`^${escaped}$`).test(path);
}
