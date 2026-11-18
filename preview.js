"use strict";

const permittedTags = new Set(
  "main header footer nav section article aside div span h1 h2 h3 h4 h5 h6 p a strong em small ul ol li br hr figure figcaption b i code pre blockquote".split(
    " ",
  ),
);

function safeMarkup(source) {
  const template = document.createElement("template");
  template.innerHTML = source;
  function copy(node, parent) {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.append(node.textContent);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || !permittedTags.has(node.localName)) return;
    const element = document.createElement(node.localName);
    for (const attribute of ["class", "id", "style", "lang", "aria-label"]) {
      if (node.hasAttribute(attribute))
        element.setAttribute(attribute, node.getAttribute(attribute));
    }
    if (node.localName === "a" && /^#[^\s#]+$/u.test(node.getAttribute("href") || "")) {
      element.setAttribute("href", node.getAttribute("href"));
    }
    for (const child of node.childNodes) copy(child, element);
    parent.append(element);
  }
  const container = document.createElement("div");
  for (const node of template.content.childNodes) copy(node, container);
  return container.innerHTML;
}

function pageSource(html, css, title = "作品紹介") {
  const safeTitle = document.createElement("span");
  safeTitle.textContent = title;
  return (
    '<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'\">\n" +
    "<title>" +
    safeTitle.innerHTML +
    "</title>\n<style>\n" +
    css.replaceAll("<", "\\3c ") +
    "\n</style>\n</head>\n<body>\n" +
    safeMarkup(html) +
    "\n</body>\n</html>"
  );
}

function makePreview(host, html, css, label, width, maxHeight = 310) {
  const frame = document.createElement("iframe");
  frame.title = label;
  frame.setAttribute("sandbox", "allow-same-origin");
  frame.referrerPolicy = "no-referrer";
  if (width) frame.style.width = width + "px";
  const view = document.createElement("div");
  view.className = "viewport";
  if (width) view.dataset.width = width;
  const caption = document.createElement("figcaption");
  caption.textContent = label;
  const figure = document.createElement("figure");
  figure.append(caption, view);
  host.append(figure);
  const ready = new Promise((resolve) =>
    frame.addEventListener(
      "load",
      () => {
        const doc = frame.contentDocument;
        // srcdoc の相対URLは親ページを基準にする。作品内のリンクを同じ見本の文書に向ける。
        for (const anchor of doc.querySelectorAll('a[href^="#"]')) {
          anchor.href = "about:srcdoc" + anchor.getAttribute("href");
        }
        const height = Math.max(
          72,
          Math.min(
            maxHeight,
            Math.ceil(doc.body.getBoundingClientRect().height) +
              parseFloat(doc.defaultView.getComputedStyle(doc.body).marginTop || 0) +
              parseFloat(doc.defaultView.getComputedStyle(doc.body).marginBottom || 0) +
              12,
          ),
        );
        frame.style.height = height + "px";
        if (width) fitPreview(view);
        resolve(doc);
      },
      { once: true },
    ),
  );
  frame.srcdoc = pageSource(html, css);
  view.append(frame);
  return ready;
}

function fitPreview(view) {
  const frame = view.firstElementChild;
  if (!frame) return;
  const scale = Math.min(1, view.clientWidth / Number(view.dataset.width));
  frame.style.transform = "scale(" + scale + ")";
  view.style.height = Math.ceil(frame.offsetHeight * scale) + "px";
}

window.addEventListener("resize", () => {
  for (const view of document.querySelectorAll(".viewport[data-width]")) fitPreview(view);
});
