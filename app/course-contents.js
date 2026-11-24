"use strict";

// Shared introduction and closing navigation for the individual course contents.
window.CourseContents = (() => {
  function element(tag, text, className) {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  }

  function link(text, href, className) {
    const item = element("a", text, className);
    item.href = href;
    return item;
  }

  function familyLink(id, rootIndex, top = false) {
    const family = id.startsWith("python") ? "python" : "web";
    const name = family === "python" ? "Python" : "Web制作";
    return link(name + "のコース一覧" + (top ? "" : "に戻る"),
      rootIndex + "#paths/" + family + "/" + id, top ? "course-toc-parent" : "course-toc-back");
  }

  function intro(id, start, resume) {
    const courseLink = document.querySelector(".layout > nav > a[href='#contents']");
    if (courseLink && !courseLink.hasAttribute("data-toc-current")) {
      courseLink.dataset.tocCurrent = "";
      courseLink.before(familyLink(id, "../index.html", true));
    }
    const guide = CourseGuide.get(id);
    const block = element("section", undefined, "course-toc-intro");
    const heading = element("h2", guide.question);
    heading.id = "course-toc-overview";
    block.setAttribute("aria-labelledby", heading.id);
    const definition = element("p");
    definition.append(CourseGuide.richText(guide.definition));
    block.append(heading, definition);
    const facts = element("dl");
    for (const [label, value] of [["このコースでできるようになること", guide.example], ["始める前に", guide.prerequisite]]) {
      const fact = element("dd");
      fact.append(CourseGuide.richText(value));
      facts.append(element("dt", label), fact);
    }
    const actions = element("div", undefined, "course-toc-actions");
    const startLabel = "最初の課題： " + guide.firstLabel;
    if (resume) actions.append(link(resume.label || "前回の続きへ", resume.href, "next"));
    if (!resume || resume.href !== start) actions.append(link(startLabel, start, resume ? "review" : "next"));
    const extra = element("details", undefined, "course-toc-extra");
    extra.append(element("summary", "学ぶ内容と始める目安"), facts);
    block.append(actions, extra);
    return block;
  }

  function footer(id, rootIndex, next) {
    const area = element("footer", undefined, "course-toc-footer");
    if (next) {
      area.append(element("h2", "次に学ぶなら"), element("p", next.reason), link(next.label, next.href));
    }
    area.append(familyLink(id, rootIndex));
    return area;
  }

  return { intro, footer, familyLink };
})();
