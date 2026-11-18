"use strict";

const progressKey = "yomikumu/course/v1";
const knownIds = new Set([...lessons.map((lesson) => lesson.id), "studio"]);
let memoryProgress = { version: 1, units: {}, last: "" };
let storageProblem = false;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatedProgress(value) {
  if (!isObject(value) || value.version !== 1 || !isObject(value.units)) throw Error("形式");
  const units = {};
  for (const [id, item] of Object.entries(value.units)) {
    if (!knownIds.has(id) || !isObject(item)) throw Error("単元");
    const clean = {};
    for (const [key, field] of Object.entries(item)) {
      if (["html", "css", "note"].includes(key) && typeof field === "string") clean[key] = field;
      else if (["quizDone", "writeDone", "quizChecked"].includes(key) && typeof field === "boolean")
        clean[key] = field;
      else if (key === "choice" && Number.isInteger(field) && field >= 0 && field < 4)
        clean[key] = field;
      else throw Error("項目");
    }
    units[id] = clean;
  }
  if (typeof value.last !== "string" || !/^[a-z0-9/-]{0,64}$/.test(value.last)) throw Error("位置");
  return { version: 1, units, last: value.last };
}

function readProgress() {
  if (storageProblem) return memoryProgress;
  try {
    const raw = localStorage.getItem(progressKey);
    if (raw) memoryProgress = validatedProgress(JSON.parse(raw));
  } catch {
    storageProblem = true;
  }
  return memoryProgress;
}

function writeProgress(state) {
  memoryProgress = state;
  if (!storageProblem) {
    try {
      localStorage.setItem(progressKey, JSON.stringify(state));
    } catch {
      storageProblem = true;
    }
  }
  const warning = document.getElementById("storage-note");
  if (warning && storageProblem)
    warning.textContent =
      "この端末に自動保存できません。閉じる前にコース目次から進捗を書き出してください。";
}

function updateUnit(id, fields) {
  const state = readProgress();
  state.units[id] = { ...state.units[id], ...fields };
  writeProgress(state);
}

function downloadFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

// 初回に公開した単独の余白教材の入力を、同じブラウザで引き継ぐ。
function adoptPaddingDraft() {
  const state = readProgress();
  if (state.units.padding) return;
  try {
    const original = JSON.parse(localStorage.getItem("yomikumu/padding/v1"));
    if (!isObject(original)) return;
    const fields = {};
    if (typeof original.draft === "string") fields.css = original.draft;
    const choice = ["inner-y", "outer-x", "inner-x", "outer-y"].indexOf(original.choice);
    if (choice >= 0) {
      fields.choice = choice;
      fields.quizChecked = original.checkedChoice === true;
      fields.quizDone = fields.quizChecked && choice === 2;
    }
    updateUnit("padding", fields);
  } catch {
    /* 初回形式の記録が読めない場合も現在の教材を開く。 */
  }
}
