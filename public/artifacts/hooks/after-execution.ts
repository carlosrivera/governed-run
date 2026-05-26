type ValidatorResult = {
  name: string;
  command?: string;
  status: "passed" | "failed" | "not-run";
  reason?: string;
};

type PolicyDecision = {
  rule: string;
  decision: "allow" | "deny" | "escalate";
  reason?: string;
};

type ExecutionContext = {
  intentId: string;
  actor: string;
  startedAt: string;
  completedAt: string;
  changedFiles: string[];
  validators: ValidatorResult[];
  policyDecisions: PolicyDecision[];
  attempts: number;
  costUsd?: number;
  remainingRisk?: string;
  escalation?: string;
};

export async function afterExecution(context: ExecutionContext) {
  const failedValidators = context.validators.filter((validator) => validator.status === "failed");
  const skippedValidators = context.validators.filter((validator) => validator.status === "not-run");
  const escalations = context.policyDecisions.filter((decision) => decision.decision === "escalate");
  const denials = context.policyDecisions.filter((decision) => decision.decision === "deny");

  emitTrace({
    type: "csg.execution.completed",
    intentId: context.intentId,
    actor: context.actor,
    startedAt: context.startedAt,
    completedAt: context.completedAt,
    durationMs: Date.parse(context.completedAt) - Date.parse(context.startedAt),
    changedFiles: context.changedFiles,
    validators: context.validators,
    policyDecisions: context.policyDecisions,
    attempts: context.attempts,
    outcome: determineOutcome(failedValidators.length, skippedValidators.length, escalations.length, denials.length),
    remainingRisk: context.remainingRisk ?? "not reported",
    escalation: context.escalation ?? null,
  });

  emitCostMetrics({
    type: "csg.execution.cost",
    intentId: context.intentId,
    costUsd: context.costUsd ?? 0,
  });
}

function determineOutcome(
  failedValidators: number,
  skippedValidators: number,
  escalations: number,
  denials: number,
) {
  if (denials > 0) return "denied";
  if (failedValidators > 0) return "failed-validation";
  if (skippedValidators > 0 || escalations > 0) return "needs-human-review";
  return "validated";
}

function emitTrace(payload: unknown) {
  console.log(JSON.stringify(payload));
}

function emitCostMetrics(payload: unknown) {
  console.log(JSON.stringify(payload));
}
