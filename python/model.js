"use strict";

const pythonChapters = [];
function check(label, want, options = {}) {
  return { label, want, ...options };
}
function exercise(prompt, starter, solution, cases, hint, extra = {}) {
  return { prompt, starter, solution, cases, hint, ...extra };
}
function passed(result, test) {
  if (test.error) return result.error?.startsWith(test.error) && result.output === test.want;
  if (result.error || result.output !== test.want) return false;
  return !test.observe || JSON.stringify(result.value) === JSON.stringify(test.value);
}
