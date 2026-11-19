"use strict";

// 両方の入口で同じ順に読み込む。各コースの index.js は章ごとの定義をまとめる。
const workbookScripts = [
  "html-css/lessons/exhibition.js",
  "html-css/lessons/contact.js",
  "html-css/lessons/typography.js",
  "html-css/lessons/boxes.js",
  "html-css/lessons/profiles.js",
  "html-css/lessons/flex.js",
  "html-css/lessons/grid.js",
  "html-css/lessons/responsive-works.js",
  "html-css/lessons/keyboard.js",
  "html-css/lessons/profile-project.js",
  "html-css/lessons/index.js",

  "javascript/lessons/choices.js",
  "javascript/lessons/functions.js",
  "javascript/lessons/counters.js",
  "javascript/lessons/cards.js",
  "javascript/lessons/transforms.js",
  "javascript/lessons/modules.js",
  "javascript/lessons/index.js",

  "javascript/runner.js",
  "javascript/module-files.js",
  "javascript/workbook.js",

  "app/progress.js",
  "html-css/preview.js",

  "html-css/grading/common.js",
  "html-css/grading/html.js",
  "html-css/grading/css.js",
  "html-css/grading/boxes.js",
  "html-css/grading/authors.js",
  "html-css/grading/flex.js",
  "html-css/grading/grid.js",
  "html-css/grading/responsive.js",
  "html-css/grading/keyboard.js",
  "html-css/grading/profile.js",
  "html-css/grading/project.js",
  "html-css/grading/index.js",

  "app/path-location.js",
  "app/path-progress.js",
  "app/learning-paths.js",
  "app/workbook.js",
];

// file:// で直接開いた教材でも動くよう、通常の script を追加する。
// async=false にすると並行して取得し、上の順に実行する。最後の workbook.js が画面を開く。
for (const path of workbookScripts) {
  const script = document.createElement("script");
  script.async = false;
  script.src = path;
  document.head.append(script);
}
