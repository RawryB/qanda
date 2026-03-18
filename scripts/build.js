#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");

// Prisma schema requires QANDA_DATABASE_URL at generate time. Use a placeholder
// when unset (e.g. Vercel install or first deploy). Runtime uses the real env var.
if (!process.env.QANDA_DATABASE_URL) {
  process.env.QANDA_DATABASE_URL = "postgresql://localhost:5432/placeholder";
}

execSync("prisma generate", { stdio: "inherit", env: process.env });

try {
  execSync("next build", {
    encoding: "utf8",
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
} catch (err) {
  const stdout = (err.stdout || "").trim();
  const stderr = (err.stderr || "").trim();
  if (stdout) console.error("\n--- next build stdout ---\n", stdout);
  if (stderr) console.error("\n--- next build stderr ---\n", stderr);
  console.error("\n--- next build failed (exit code " + (err.status ?? err.code) + ") ---");
  process.exit(err.status ?? 1);
}
