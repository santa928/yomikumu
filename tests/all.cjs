"use strict";
const path = require("node:path");
const { spawnSync } = require("node:child_process");

for (const suite of ["course", "dom-elements", "dom-events", "dom-state", "dom-loading", "dom-keyboard",
  "dom-quiz", "dom-guard", "tailwind-cards", "tailwind-shelf", "typescript-basics", "typescript-states",
  "typescript-functions", "typescript-boundaries", "typescript-final", "react-cards", "react-works",
  "react-roles", "react-effects", "react-quiz", "react-reading", "next-workshop", "path-workshops", "path-projects"]) {
  const run = spawnSync(process.execPath, [path.join(__dirname, suite + ".cjs")], { stdio: "inherit" });
  if (run.error) throw run.error;
  if (run.status !== 0) process.exit(run.status || 1);
}
