"use strict";

window.YomikumuPaths = (() => {
  const key = "yomikumu/paths/v1";
  const courses = new Set(["html", "javascript", "tailwind", "dom", "typescript", "react", "next", "python", "python-practice", "python-oop"]);
  let fallback = { last: "", positions: {} };

  function validRoute(route) {
    return typeof route === "string" && /^[a-z0-9-]+(?:\/[a-z0-9-]+){0,4}$/.test(route) && route.length <= 96;
  }

  function validate(record) {
    if (!record || typeof record.positions !== "object" || !record.positions || Array.isArray(record.positions))
      throw Error("再開位置");
    const positions = {};
    for (const [course, route] of Object.entries(record.positions)) {
      if (!courses.has(course) || !validRoute(route)) throw Error("再開位置");
      positions[course] = route;
    }
    if (record.last !== "" && !Object.hasOwn(positions, record.last)) throw Error("前回のコース");
    return { last: record.last, positions };
  }

  function read() {
    try {
      const saved = localStorage.getItem(key);
      if (saved) fallback = validate(JSON.parse(saved));
    } catch { /* 保存できない端末でもこの画面では再開できる。 */ }
    return fallback;
  }

  function restore(incoming) {
    const previous = read();
    fallback = { last: incoming.last || previous.last, positions: { ...previous.positions, ...incoming.positions } };
    try { localStorage.setItem(key, JSON.stringify(fallback)); } catch { /* メモリで続ける。 */ }
  }

  function remember(course, route) {
    if (courses.has(course) && validRoute(route)) restore({ last: course, positions: { [course]: route } });
  }

  return { read, restore, validate, remember };
})();
