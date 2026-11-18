"use strict";

const courseStores = {
  python: { key: "yomikumu-python-v1", position: "route", groups: ["drafts", "completed", "quizzes"], validate: validatePythonRecord },
  "python-oop": { key: "yomikumu-python-oop-v1", position: "route", groups: ["drafts", "completed", "quizzes"], validate: validatePythonRecord },
  "python-practice": { key: "yomikumu-python-practice-v1", position: "route", groups: ["drafts", "completed", "quizzes"], validate: validatePythonRecord },
  typescript: { key: "yomikumu/typescript/v1", position: "last", groups: ["units"], version: 1, validate: validateTypeRecord },
  dom: { key: "yomikumu/dom/v1", position: "last", groups: ["tasks"], validate: validateDomRecord },
  react: { key: "yomikumu/react/v1", position: "last", groups: ["tasks"], validate: validateDomRecord },
  tailwind: { key: "yomikumu/tailwind/v1", position: "last", groups: ["units"], version: 1, validate: validateReadingRecord },
};

function validateTypeRecord(group, id, item) {
  if (!/^[a-z][a-z0-9-]*$/.test(id) || !validMap(item)) return false;
  return Object.entries(item).every(([key, value]) => {
    if (key === "choice") return Number.isInteger(value) && value >= 0 && value < 4;
    if (key === "tap") return Array.isArray(value) && value.every(piece => piece === null || typeof piece === "string");
    if (key === "write") return typeof value === "string";
    return ["quizDone", "tapDone", "writeDone"].includes(key) && typeof value === "boolean";
  });
}

function validateDomRecord(group, route, item) {
  if (!/^[a-z][a-z0-9-]*\/[1-9]\d*$/.test(route) || !validMap(item)) return false;
  return Object.entries(item).every(([key, value]) => {
    if (key === "choice") return Number.isInteger(value) && value >= 0 && value < 4;
    if (key === "pieces") return Array.isArray(value) && value.every(piece => piece === null || typeof piece === "string");
    if (key === "mode") return value === "build" || value === "write";
    if (["code", "file", "note"].includes(key)) return typeof value === "string";
    return ["tap", "built", "passed"].includes(key) && typeof value === "boolean";
  });
}

function validateReadingRecord(group, id, item) {
  if (!/^[a-z][a-z0-9-]*$/.test(id) || !validMap(item)) return false;
  return Object.entries(item).every(([key, value]) => {
    if (key === "choice") return Number.isInteger(value) && value >= 0 && value < 4;
    if (key === "tap" || key === "write") return validMap(value) && Object.entries(value).every(
      ([part, code]) => ["card", "shelf", "action", "first", "other", "theme"].includes(part) && typeof code === "string");
    return ["quizDone", "tapDone", "writeDone", "localDone"].includes(key) && typeof value === "boolean";
  });
}

function validMap(value) {
  return isObject(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function validatePythonRecord(group, route, item) {
  if (group === "completed")
    return /^\d+\/\d+\/(?:write|guide)\/(?:tap|code)$/.test(route) && typeof item === "boolean";
  if (group === "quizzes")
    return /^\d+\/\d+\/slide$/.test(route) && Number.isInteger(item) && item >= 0 && item < 4;
  if (!/^\d+\/(?:demo|\d+\/(?:slide|guide|write))$/.test(route) || !validMap(item)) return false;
  return Object.entries(item).every(([field, value]) => {
    if (field === "files") return validMap(value) && Object.entries(value).every(([name, source]) =>
      /^[a-zA-Z][\w-]*\.py$/.test(name) && typeof source === "string");
    if (field === "tap") return Array.isArray(value) && value.every(line => typeof line === "string");
    if (field === "mode") return value === "tap" || value === "code";
    return (field === "input" || field === "code") && typeof value === "string";
  });
}

function validatedStores(data) {
  if (!validMap(data)) throw Error("コースの記録");
  for (const [course, record] of Object.entries(data)) {
    if (!Object.hasOwn(courseStores, course) || !validMap(record)) throw Error("コース");
    const { position, groups, validate, version } = courseStores[course];
    if (Object.keys(record).some(key => ![position, ...groups, ...(version ? ["version"] : [])].includes(key))) throw Error("記録の項目");
    if (version && record.version !== version) throw Error("記録の版");
    if (typeof record[position] !== "string" || !/^[a-z0-9/-]{0,96}$/.test(record[position])) throw Error("教材の位置");
    for (const group of groups) {
      if (!validMap(record[group]) || !Object.entries(record[group]).every(([id, value]) => validate(group, id, value)))
        throw Error("課題の記録");
    }
  }
  return data;
}

function exportStores() {
  const data = {};
  for (const [course, store] of Object.entries(courseStores)) {
    let raw;
    try { raw = localStorage.getItem(store.key); }
    catch (error) {
      if (error.name === "SecurityError" && storageProblem) continue;
      throw error;
    }
    if (raw !== null) data[course] = JSON.parse(raw);
  }
  return validatedStores(data);
}

function restoreStores(data) {
  const writes = [];
  for (const [course, incoming] of Object.entries(data)) {
    const { key, groups, position } = courseStores[course];
    const raw = localStorage.getItem(key);
    const current = raw ? validatedStores({ [course]: JSON.parse(raw) })[course] : {};
    const merged = { ...incoming, [position]: incoming[position] || current[position] || "" };
    for (const field of groups) merged[field] = { ...current[field], ...incoming[field] };
    writes.push({ key, raw, value: JSON.stringify(merged) });
  }
  const saved = [];
  try {
    for (const record of writes) { localStorage.setItem(record.key, record.value); saved.push(record); }
  } catch (error) {
    for (const record of saved.reverse()) {
      if (record.raw === null) localStorage.removeItem(record.key);
      else localStorage.setItem(record.key, record.raw);
    }
    throw error;
  }
}
