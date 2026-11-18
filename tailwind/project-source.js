import { zipSync, strToU8 } from "fflate";
import source from "./shelf/index.html";
import input from "./shelf/input.css";
import compose from "./shelf/compose.yaml";
import manifest from "./shelf/package.json";
import lock from "./shelf/package-lock.json";

window.readingProject = function (values) {
  const doc = new DOMParser().parseFromString(source, "text/html");
  for (const part of ["shelf", "card", "other"]) {
    doc.querySelector(`[data-part="${part}"]`).className = values[part] || "";
  }
  const files = {
    "index.html": "<!doctype html>\n" + doc.documentElement.outerHTML,
    "input.css": input.slice(0, input.indexOf("@theme")) + (values.theme || "") + "\n",
    "compose.yaml": compose,
    "package.json": JSON.stringify(manifest, null, 2) + "\n",
    "package-lock.json": JSON.stringify(lock, null, 2) + "\n"
  };
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, text]) => [name, strToU8(text)])));
};
