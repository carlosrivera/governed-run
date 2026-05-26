#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const asJson = args.includes("--json") || args.includes("--full");
const urlArgIndex = args.indexOf("--url");
const healthUrl = urlArgIndex >= 0 ? args[urlArgIndex + 1] : undefined;
const cwd = process.cwd();

function run(command, commandArgs, options = {}) {
  try {
    const output = execFileSync(command, commandArgs, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: options.timeout ?? 10000,
    });
    return { status: "ok", output: output.trim() };
  } catch (error) {
    return {
      status: "error",
      code: error.status ?? null,
      output: String(error.stdout ?? "").trim(),
      error: String(error.stderr ?? error.message ?? "").trim(),
    };
  }
}

function commandVersion(command, commandArgs) {
  const result = run(command, commandArgs, { timeout: 5000 });
  return result.status === "ok" ? result.output.split("\n")[0] : null;
}

function readPackageJson() {
  const path = join(cwd, "package.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return { parseError: error.message };
  }
}

function listFiles(dir) {
  const root = join(cwd, dir);
  if (!existsSync(root)) return [];

  const files = [];
  const stack = [root];

  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      const path = join(current, entry);
      const stats = statSync(path);
      if (stats.isDirectory()) {
        stack.push(path);
      } else {
        files.push(relative(cwd, path));
      }
    }
  }

  return files.sort();
}

async function checkHealth(url) {
  if (!url) return null;
  const started = Date.now();
  try {
    const response = await fetch(url, { method: "GET" });
    const body = await response.text();
    return {
      url,
      status: response.status,
      ok: response.ok,
      durationMs: Date.now() - started,
      bodyPreview: body.slice(0, 500),
    };
  } catch (error) {
    return {
      url,
      ok: false,
      durationMs: Date.now() - started,
      error: error.message,
    };
  }
}

async function main() {
  const packageJson = readPackageJson();
  const gitStatus = run("git", ["status", "--short"]);
  const gitBranch = run("git", ["branch", "--show-current"]);
  const changedFiles = run("git", ["diff", "--name-only"]);
  const stagedFiles = run("git", ["diff", "--cached", "--name-only"]);

  const report = {
    timestamp: new Date().toISOString(),
    workspace: resolve(cwd),
    runtimes: {
      node: commandVersion("node", ["--version"]),
      bun: commandVersion("bun", ["--version"]),
      npm: commandVersion("npm", ["--version"]),
      pnpm: commandVersion("pnpm", ["--version"]),
    },
    git: {
      branch: gitBranch.status === "ok" ? gitBranch.output : null,
      status: gitStatus.status,
      dirtyEntries: gitStatus.status === "ok" ? gitStatus.output.split("\n").filter(Boolean) : [],
      changedFiles: changedFiles.status === "ok" ? changedFiles.output.split("\n").filter(Boolean) : [],
      stagedFiles: stagedFiles.status === "ok" ? stagedFiles.output.split("\n").filter(Boolean) : [],
      errors: [gitStatus, gitBranch, changedFiles, stagedFiles]
        .filter((item) => item.status !== "ok")
        .map((item) => item.error || item.output),
    },
    package: packageJson
      ? {
          name: packageJson.name ?? null,
          packageManager: packageJson.packageManager ?? null,
          scripts: packageJson.scripts ?? {},
          dependencies: Object.keys(packageJson.dependencies ?? {}).sort(),
          devDependencies: Object.keys(packageJson.devDependencies ?? {}).sort(),
          parseError: packageJson.parseError ?? null,
        }
      : null,
    csgArtifacts: {
      policies: listFiles("public/artifacts/policies"),
      validators: listFiles("public/artifacts/validators"),
      skills: listFiles("public/artifacts/skills").filter((file) => file.endsWith("SKILL.md")),
      hooks: listFiles("public/artifacts/hooks"),
      loopPatterns: listFiles("public/artifacts/loop-patterns"),
    },
    environmentNames: Object.keys(process.env)
      .filter((name) => /TOKEN|SECRET|KEY|PASSWORD|DATABASE|REDIS|AUTH|SESSION|COOKIE/i.test(name))
      .sort(),
    health: await checkHealth(healthUrl),
  };

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`workspace: ${report.workspace}`);
  console.log(`branch: ${report.git.branch ?? "unknown"}`);
  console.log(`dirty entries: ${report.git.dirtyEntries.length}`);
  console.log(`package: ${report.package?.name ?? "none"}`);
  console.log(`scripts: ${Object.keys(report.package?.scripts ?? {}).join(", ") || "none"}`);
  console.log(`policies: ${report.csgArtifacts.policies.length}`);
  console.log(`validators: ${report.csgArtifacts.validators.length}`);
  if (report.health) {
    console.log(`health: ${report.health.ok ? "ok" : "failed"} ${report.health.status ?? ""}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
