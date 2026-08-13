#!/usr/bin/env node
// Thin npm wrapper around joy.py so `npx joy` / `npm start` works.
// All arguments are forwarded to the Python program.
const { spawnSync } = require("child_process");
const path = require("path");

const script = path.join(__dirname, "..", "joy.py");
const python = process.env.PYTHON || "python3";

const res = spawnSync(python, [script, ...process.argv.slice(2)], {
  stdio: "inherit",
});

if (res.error) {
  console.error(
    `joy: could not launch ${python}. Is Python 3 installed? (${res.error.message})`
  );
  process.exit(1);
}
process.exit(res.status === null ? 1 : res.status);
