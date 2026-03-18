#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");

// Prisma schema requires QANDA_DATABASE_URL at generate time. Use a placeholder
// when unset (e.g. Vercel install or first deploy). Runtime uses the real env var.
if (!process.env.QANDA_DATABASE_URL) {
  process.env.QANDA_DATABASE_URL = "postgresql://localhost:5432/placeholder";
}

execSync("prisma generate", { stdio: "inherit", env: process.env });
execSync("next build", { stdio: "inherit", env: process.env });
