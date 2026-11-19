"use strict";

const plainCard = `.reference { box-sizing: border-box; width: 12rem; padding: .5rem;
  font-size: 1.125rem; line-height: 1.75rem; background: oklch(96.2% .059 95.617); }`;
const sampleBookNames = ["川辺の手帳", "雨音の地図"];
const nightBookNames = ["夜の庭", "星の小径"];
const classTokens = value => String(value || "").trim().split(/\s+/).filter(Boolean);
const escapeText = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function sampleParts(values, titles) {
  function book(index) {
    const part = index ? "other" : "card";
    const classes = index ? values.other ?? values.card : values.card;
    return `<article data-part="${part}" class="sample-book ${escapeText(classes || "")}">
      <h3>${titles[index]}</h3><p>${index ? "夕暮れの帰り道。" : "散歩の日々を綴る。"}</p>
      <button type="button" data-part="action" class="${escapeText(values.action || "")}"
        ${index ? "disabled" : 'aria-pressed="false"'}>${index ? "貸出中" : "しおりをはさむ"}</button></article>`;
  }
  return `<section data-part="shelf" class="${escapeText(values.shelf || "")}">${book(0)}${book(1)}</section>`;
}

const sampleBase = `@layer reset, scenery; @layer scenery {
  body { margin: 0; padding: 8px; background: white; color: #25382f; font-family: sans-serif; }
  .sample-book { background: #f5f2e6; border: 1px solid #99a197; }
  button { padding: 3px; background: white; border: 1px solid #596e62; }
}`;

async function renderSample(frame, values, { titles = sampleBookNames, plain = false, probe = false, state = "", compiledCss, omitClassParts = [] } = {}) {
  const classes = Object.entries(values).filter(([key]) => key !== "theme" && !omitClassParts.includes(key))
    .flatMap(([, value]) => classTokens(value));
  let css = compiledCss ?? await window.readingStyles(classes, values.theme || "");
  if (probe || state) {
    // タッチの状態見本と採点用コピーでも、生成された宣言そのものを使う。
    css = css.replace(/(?<!\\):hover\b/g, ":is(:hover,[data-hover])")
      .replace(/(?<!\\):focus-visible\b/g, ":is(:focus-visible,[data-focus-visible])")
      .replace(/\(hover:\s*hover\)/g, "(min-width:0px)");
  }
  const stamp = Symbol();
  frame.renderStamp = stamp;
  const body = sampleParts(plain ? { card: "reference" } : values, titles);
  const documentText = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
    </head><body>${body}</body></html>`;
  await new Promise(resolve => {
    frame.addEventListener("load", resolve, { once: true });
    frame.srcdoc = documentText;
  });
  if (frame.renderStamp !== stamp || !frame.isConnected) return;
  const doc = frame.contentDocument;
  frame.themeVariable = (values.theme || "").match(/--color-[\w-]+/)?.[0];
  const style = doc.createElement("style");
  style.textContent = sampleBase + css + (plain ? plainCard : "");
  doc.head.append(style);
  const action = doc.querySelector("button");
  if (state === "hover" || state === "focus-visible") action.setAttribute("data-" + state, "");
  action.addEventListener("click", () => {
    const active = action.getAttribute("aria-pressed") !== "true";
    action.setAttribute("aria-pressed", String(active));
    action.textContent = active ? "しおりをはずす" : "しおりをはさむ";
  });
}

function frameElement(width, title) {
  const frame = document.createElement("iframe");
  frame.title = title;
  frame.setAttribute("sandbox", "allow-same-origin");
  frame.width = String(width);
  frame.height = "200";
  return frame;
}

function normalizedProperty(element, property) {
  const value = element.ownerDocument.defaultView.getComputedStyle(element)[property];
  if (!/color$/i.test(property)) return value;
  const context = element.ownerDocument.createElement("canvas").getContext("2d");
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  return Array.from(context.getImageData(0, 0, 1, 1).data).join();
}

function checkInFrames(left, right, check) {
  const current = left.contentDocument.querySelector('[data-part="' + check.part + '"]');
  const target = right.contentDocument.querySelector('[data-part="' + check.part + '"]');
  function same() {
    return check.properties.every(property => normalizedProperty(current, property) === normalizedProperty(target, property));
  }
  if (!same()) return false;
  if (check.sharedColor) {
    if (!left.themeVariable || !right.themeVariable) return false;
    const elements = [left, right];
    for (const frame of elements) frame.contentDocument.documentElement.style.setProperty(frame.themeVariable, "#ab45ef");
    const followsTheme = same();
    for (const frame of elements) frame.contentDocument.documentElement.style.removeProperty(frame.themeVariable);
    return followsTheme;
  }
  if (!check.state) return true;
  for (const element of [current, target]) {
    if (check.state === "disabled") element.disabled = true;
    else element.setAttribute("data-" + check.state, "");
  }
  const matched = same();
  for (const element of [current, target]) {
    if (check.state === "disabled") element.disabled = false;
    else element.removeAttribute("data-" + check.state);
  }
  return matched;
}

async function evaluateReading(unit, values, compiledCss) {
  const expected = Object.fromEntries(unit.fields.map(field => [field.part, field.solution]));
  const frames = [];
  const checks = unit.checks;
  const results = [];
  try {
    for (const width of new Set(checks.map(check => check.width || 420))) {
      const pair = [values, expected].map((source, i) => {
        const frame = frameElement(width, i ? "採点用の基準" : "採点用の記述");
        frame.setAttribute("aria-hidden", "true");
        frame.tabIndex = -1;
        frame.style.cssText = "border:0;position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none";
        document.body.append(frame);
        frames.push(frame);
        const base = unit.fields.some(field => field.part === "other") ? { other: "" } : {};
        return renderSample(frame, { ...base, ...unit.base, ...source }, {
          probe: true, compiledCss: i === 0 ? compiledCss : undefined
        }).then(() => frame);
      });
      const [left, right] = await Promise.all(pair);
      for (const check of checks.filter(item => (item.width || 420) === width)) {
        results.push({ check, ok: checkInFrames(left, right, check) });
      }
    }
    return results;
  } finally {
    frames.forEach(frame => frame.remove());
  }
}
