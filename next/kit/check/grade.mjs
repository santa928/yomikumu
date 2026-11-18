import { chromium } from "playwright";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { routeChecks } from "./routes.mjs";
import { clientChecks } from "./client.mjs";
import { refreshChecks } from "./refresh.mjs";
import { signupChecks } from "./signup.mjs";
import { guideChecks } from "./guide.mjs";

const step = process.argv[2];
const suites = { ...routeChecks, ...clientChecks, ...refreshChecks, ...signupChecks, ...guideChecks };
if (!Object.hasOwn(suites, step)) {
  console.error("確かめる単元を選びます。 " + Object.keys(suites).join(" / "));
  process.exit(2);
}
const exercise = suites[step];
const base = process.env.BOOK_URL || "http://localhost:3000";
const sourceDir = process.env.SOURCE_DIR || "/source";
const reportDir = process.env.REPORT_DIR || "/reports";
const source = await readFile(join(sourceDir, exercise.file), "utf8");
const companionSources = {};
for (const file of exercise.companionFiles || []) {
  companionSources[file] = await readFile(join(sourceDir, file), "utf8");
}
const results = [];
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ baseURL: base });
  const page = await context.newPage();
  const http = path => fetch(new URL(path, base), { signal: AbortSignal.timeout(30000) });
  for (const [label, verify] of exercise.checks) {
    let passed = false;
    try { passed = Boolean(await verify({ page, http })); }
    catch (error) { console.error("確認できませんでした。 " + String(error.message).split("\n")[0]); }
    results.push({ label, passed });
    console.log((passed ? "できました　" : "次に確かめる　") + label);
    if (!passed) break;
  }
} finally { await browser.close(); }
const passed = results.length === exercise.checks.length && results.every(row => row.passed);
const report = { version: 1, course: "yomikumu-next", step, source, companionSources, passed, results };
await mkdir(reportDir, { recursive: true });
await writeFile(join(reportDir, step + ".json"), JSON.stringify(report, null, 2));
console.log("reports/" + step + ".json を教材の採点結果欄で開けます。");
if (!passed) process.exitCode = 1;
