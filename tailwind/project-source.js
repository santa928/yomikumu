import { zipSync, strToU8 } from "fflate";
import source from "./shelf/index.html";
import input from "./shelf/input.css";
import compose from "./shelf/compose.yaml";
import manifest from "./shelf/package.json";
import lock from "./shelf/package-lock.json";

const inputSources = input.slice(0, input.indexOf("@theme"));

function zipProject(doc, css, scripts = {}) {
  const files = {
    "index.html": "<!doctype html>\n" + doc.documentElement.outerHTML,
    "input.css": css,
    "compose.yaml": compose,
    "package.json": JSON.stringify(manifest, null, 2) + "\n",
    "package-lock.json": JSON.stringify(lock, null, 2) + "\n",
    ...scripts
  };
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)])));
}

window.readingProject = function (values) {
  const doc = new DOMParser().parseFromString(source, "text/html");
  for (const part of ["shelf", "card", "other"]) {
    doc.querySelector(`[data-part="${part}"]`).className = values[part] || "";
  }
  return zipProject(doc, inputSources + (values.theme || "") + "\n");
};

window.readingStatusProject = function (code, buttonClasses) {
  const doc = new DOMParser().parseFromString(source, "text/html");
  for (const [index, book] of Array.from(doc.querySelectorAll("article")).entries()) {
    book.removeAttribute("class");
    book.dataset.bookState = index === 0 ? "available" : "borrowed";
    const status = doc.createElement("p");
    status.dataset.status = "";
    status.setAttribute("role", "status");
    const button = doc.createElement("button");
    button.type = "button";
    button.className = buttonClasses;
    book.querySelector("h2").after(status, button);
  }
  const script = doc.createElement("script");
  script.src = "status.js";
  doc.body.append(script);
  return zipProject(doc, inputSources + '@source "./status.js";\n', { "status.js": code });
};
