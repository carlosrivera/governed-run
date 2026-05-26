export type CommandRequest = {
  intentId: string;
  command: string;
  cwd: string;
  actor: string;
};

export type CommandPolicy = {
  allowedCommands: string[];
  deniedCommands: string[];
  deniedSubstrings: string[];
  requireExactCommand?: boolean;
};

export type CommandDecision =
  | { decision: "allow"; evidence: string[] }
  | { decision: "deny"; reason: string; evidence: string[] }
  | { decision: "escalate"; reason: string; evidence: string[] };

export function beforeCommand(
  request: CommandRequest,
  policy: CommandPolicy,
): CommandDecision {
  const normalized = normalizeCommand(request.command);
  const evidence = [
    `intent:${request.intentId}`,
    `actor:${request.actor}`,
    `cwd:${request.cwd}`,
    `command:${normalized}`,
  ];

  const deniedCommand = policy.deniedCommands.find((command) =>
    normalized === normalizeCommand(command) || normalized.startsWith(`${normalizeCommand(command)} `),
  );

  if (deniedCommand) {
    return {
      decision: "deny",
      reason: `Command is explicitly denied: ${deniedCommand}`,
      evidence,
    };
  }

  const deniedSubstring = policy.deniedSubstrings.find((part) => normalized.includes(part));
  if (deniedSubstring) {
    return {
      decision: "deny",
      reason: `Command contains denied shell fragment: ${deniedSubstring}`,
      evidence,
    };
  }

  const allowed = policy.requireExactCommand
    ? policy.allowedCommands.some((command) => normalized === normalizeCommand(command))
    : policy.allowedCommands.some((command) =>
        normalized === normalizeCommand(command) || normalized.startsWith(`${normalizeCommand(command)} `),
      );

  if (!allowed) {
    return {
      decision: "escalate",
      reason: "Command is outside the declared allow list",
      evidence,
    };
  }

  return { decision: "allow", evidence };
}

function normalizeCommand(command: string) {
  return command.trim().replace(/\s+/g, " ");
}
