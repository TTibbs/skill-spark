#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const root = resolve(process.cwd());
const command = process.argv[2];
const args = process.argv.slice(3);

loadEnvFiles();

function fail(message) {
  console.error(`\nDatabase migration error: ${message}\n`);
  process.exit(1);
}

function loadEnvFiles() {
  const shellEnv = { ...process.env };
  const envFiles = [
    ".env",
    ".env.development",
    ".env.local",
    "apps/backend/.env",
    "apps/backend/.env.development",
    process.env.NODE_ENV ? `apps/backend/.env.${process.env.NODE_ENV}` : null,
    "apps/backend/.env.local",
  ].filter(Boolean);

  for (const envFile of envFiles) {
    const fullPath = join(root, envFile);

    if (!existsSync(fullPath)) {
      continue;
    }

    for (const line of readFileSync(fullPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)?\s*$/);

      if (!match || line.trim().startsWith("#")) {
        continue;
      }

      const [, key, rawValue = ""] = match;
      const value = rawValue
        .replace(/\s+#.*$/, "")
        .replace(/^['"]|['"]$/g, "");

      process.env[key] = value;
    }
  }

  Object.assign(process.env, shellEnv);
}

function packageManagerCommand() {
  if (process.env.npm_execpath?.includes("pnpm")) {
    return {
      command: process.execPath,
      args: [process.env.npm_execpath],
    };
  }

  return {
    command: process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    args: [],
  };
}

function runSupabase(supabaseArgs, options = {}) {
  const pnpm = packageManagerCommand();
  const result = spawnSync(
    pnpm.command,
    [...pnpm.args, "exec", "supabase", ...supabaseArgs],
    {
      cwd: root,
      env: process.env,
      input: options.input,
      stdio: options.input ? ["pipe", "inherit", "inherit"] : "inherit",
    },
  );

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    fail(`Supabase command failed: supabase ${supabaseArgs.join(" ")}`);
  }
}

function projectRef() {
  const ref = process.env.SUPABASE_PROJECT_REF ?? process.env.SUPABASE_PROJECT_ID;

  if (!ref) {
    fail("Set SUPABASE_PROJECT_REF in an env file or shell before migrating.");
  }

  return ref;
}

function ensureLinked() {
  const ref = projectRef();
  const linkedRefPath = join(root, "supabase", ".temp", "project-ref");
  const linkedRef = existsSync(linkedRefPath)
    ? readFileSync(linkedRefPath, "utf8").trim()
    : "";

  if (linkedRef === ref) {
    return;
  }

  console.log(`Linking Supabase project ${ref}...`);
  runSupabase(["link", "--project-ref", ref], { input: "\n" });
}

function help() {
  console.log(
    [
      "Usage:",
      "  pnpm db:migration:new <name>",
      "  pnpm db:migrate:check",
      "  pnpm db:migrate:dry-run",
      "  pnpm db:migrate",
      "",
      "Set SUPABASE_PROJECT_REF in .env, .env.local, apps/backend/.env.development,",
      "or your shell. No database URL is used by these commands.",
    ].join("\n"),
  );
}

if (args.includes("--help") || args.includes("-h")) {
  help();
  process.exit(0);
}

switch (command) {
  case "new": {
    const name = args.join(" ").trim();

    if (!name) {
      fail("Provide a migration name, for example: pnpm db:migration:new add_profiles");
    }

    runSupabase(["migration", "new", name]);
    break;
  }

  case "check":
    runSupabase(["db", "reset", "--local"]);
    break;

  case "dry-run":
    ensureLinked();
    runSupabase(["db", "push", "--linked", "--dry-run"]);
    break;

  case "migrate":
    ensureLinked();
    runSupabase(["db", "push", "--linked"]);
    break;

  case "help":
  case "--help":
  case "-h":
  case undefined:
    help();
    break;

  default:
    help();
    process.exit(1);
}
