import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { rmSync } from "node:fs";

const outDir = "/tmp/tfs-rate-limit-test";
rmSync(outDir, { recursive: true, force: true });

execFileSync(
  "npx",
  [
    "tsc",
    "src/lib/rate-limit.ts",
    "--outDir",
    outDir,
    "--module",
    "commonjs",
    "--target",
    "es2022",
    "--esModuleInterop",
    "--skipLibCheck",
  ],
  { stdio: "inherit" }
);

const require = createRequire(import.meta.url);
const { createRateLimiter } = require(`${outDir}/rate-limit.js`);

const check = createRateLimiter({ windowMs: 10_000, max: 3 });

// 1. Allow up to max requests within window
assert.equal(check("1.1.1.1", 1000).allowed, true);
assert.equal(check("1.1.1.1", 2000).allowed, true);
assert.equal(check("1.1.1.1", 3000).allowed, true);

// 2. Block on max + 1 with positive retryAfterSec
const blocked = check("1.1.1.1", 4000);
assert.equal(blocked.allowed, false);
assert.ok(blocked.retryAfterSec >= 7);

// 3. Isolate different IPs
assert.equal(check("2.2.2.2", 4000).allowed, true);

// 4. Reset after window expires
assert.equal(check("1.1.1.1", 11_001).allowed, true);

rmSync(outDir, { recursive: true, force: true });
console.log("ALL 4 RATE-LIMIT TESTS PASSED");
