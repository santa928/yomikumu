"use strict";

function tabSequence(scope) {
  return [...scope.querySelectorAll("a[href], input, button, [tabindex]")].filter(el =>
    el.tabIndex >= 0 && !el.disabled && el.getClientRects().length && el.ownerDocument.defaultView.getComputedStyle(el).visibility === "visible")
    .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
}

function linkRoute(scope, expected) {
  const links = tabSequence(scope);
  return expected.every(([text, hash], i) => {
    const link = links[i];
    return link?.localName === "a" && link.textContent.trim() === text && link.hash === hash &&
      (!link.hasAttribute("aria-label") || link.getAttribute("aria-label") === text) &&
      scope.getElementById(hash.slice(1));
  });
}

function visitMemoProblem(doc) {
  const label = namedElement(doc, "label", "訪問メモ");
  const field = label?.control;
  return !field || field.localName !== "input" || field.type !== "text" || field.disabled || field.readOnly ||
    (field.hasAttribute("aria-label") && field.getAttribute("aria-label") !== "訪問メモ")
    ? "受付リンクはできました。「訪問メモ」のラベルを押すと入力できるように欄と結びましょう。" : "";
}

/**
 * プレビュー内の操作先を一時的にフォーカスして見た目を読む。
 * 採点前に選ばれていた親画面・プレビュー内の要素へ、スクロールせずフォーカスを戻す。
 */
function withFocusedSample(el, read) {
  const doc = el.ownerDocument;
  const previous = document.activeElement;
  const inner = doc.activeElement;
  try {
    el.focus({ preventScroll: true, focusVisible: true });
    return read();
  } finally {
    el.blur();
    if (previous === doc.defaultView.frameElement && inner !== doc.body) inner.focus({ preventScroll: true });
    else previous?.focus({ preventScroll: true });
  }
}

function hasNavyOutline(el) {
  const style = el.ownerDocument.defaultView.getComputedStyle(el);
  return style.outlineStyle === "solid" && style.outlineWidth === "3px" &&
    style.outlineOffset === "2px" && style.outlineColor === "rgb(0, 0, 128)";
}

/**
 * 動きを減らす設定の有無を同じリンクで調べ、各回のメディア設定を必ず復元する。
 * previewMotionSettingはプレビュー生成側が提供する。
 */
function quietCueProblem(doc) {
  const cue = doc.querySelector("a.cue");
  if (!cue) return "作品へ進むリンクに cue のクラスを残しましょう。";
  return withFocusedSample(cue, () => {
    for (const reduce of [true, false]) {
      const restore = previewMotionSetting(doc, reduce);
      try {
        const transform = doc.defaultView.getComputedStyle(cue).transform;
        const matrix = transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transform);
        if (reduce && !matrix.isIdentity) return "動きを減らす設定のときは、操作先の位置を動かさずに保ちましょう。";
        if (!reduce && (Math.abs(matrix.m41 - 8) > 0.1 || Math.abs(matrix.m42) > 0.1))
          return "減らす設定はできました。通常の設定では作品リンクが右へ8px移る例を残しましょう。";
        if (!hasNavyOutline(cue)) return "位置はできました。どちらの設定でも操作先の紺色の枠を残しましょう。";
      } finally { restore(); }
    }
    return "";
  });
}

const keyboardExerciseGraders = {
  "tab-route"(docs) {
    const [doc] = docs;
    if (!linkRoute(doc, [["作者へ", "#artist"], ["作品へ", "#works"]]))
      return "Tabで最初に「作者へ」、次に「作品へ」と進むように、行き先を保ってリンクごと並べましょう。";
    return "";
  },

  "visible-focus"(docs) {
    const [doc] = docs;
    const links = [...doc.querySelectorAll("nav a")];
    for (const a of links) {
      const other = links.find(link => link !== a);
      const result = withFocusedSample(a, () => {
        if (!hasNavyOutline(a)) return "操作先のリンクに、3pxの紺色の実線を2px離して付けましょう。";
        return hasNavyOutline(other) ? "線はできました。フォーカスのないリンクには同じ線を付けず、現在地を区別しましょう。" : "";
      });
      if (result) return result;
    }
    return "";
  },

  "control-names"(docs) {
    const [doc] = docs;
    if (!linkRoute(doc, [["受付時間を読む", "#hours"]])) return "まず、「こちら」の文字を「受付時間を読む」にして受付時間へ結びましょう。";
    return visitMemoProblem(doc) || signProblem(doc);
  },

  "ticket-state"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    const open = doc.querySelector(".open");
    if (!open?.textContent.includes("受付中") || !open.textContent.includes("午前") || !namedElement(doc, "p", "午後の部　受付終了"))
      return "午前の部には「受付中」、午後の部には「受付終了」と文字で残しましょう。";
    if (style(open).color !== "rgb(255, 255, 255)" || style(open).backgroundColor !== "rgb(0, 0, 128)")
      return "状態は文字で読めます。受付中の背景を紺、文字を白にして読みやすくしましょう。";
    return "";
  },

  "quiet-cue"(docs) {
    const [doc] = docs;
    return quietCueProblem(doc);
  },

  "keyboard-exhibit"(docs) {
    const [doc] = docs;
    const style = (node) => doc.defaultView.getComputedStyle(node);
    if (!linkRoute(doc, [["作品を見る", "#works"], ["受付時間を読む", "#hours"]]))
      return "まず、作品を見る、受付時間を読む、の順に行き先が分かるリンクを置きましょう。";
    const inputProblem = visitMemoProblem(doc);
    if (inputProblem) return inputProblem;
    if (tabSequence(doc)[2] !== namedElement(doc, "label", "訪問メモ").control)
      return "ラベルは結べました。二つのリンクの後にメモ欄を置き、Tabで順に移れるようにしましょう。";
    const imageProblem = signProblem(doc);
    if (imageProblem) return imageProblem;
    const state = doc.querySelector(".open");
    if (!state?.textContent.includes("受付中") || style(state).color !== "rgb(255, 255, 255)" || style(state).backgroundColor !== "rgb(0, 0, 128)")
      return "欄は使えます。午前の状態を「受付中」と文字で書き、白い文字と紺色の背景を保ちましょう。";
    const secondLink = tabSequence(doc)[1];
    if (!withFocusedSample(secondLink, () => hasNavyOutline(secondLink)))
      return "受付時間のリンクにも、操作先に来たとき紺色の枠を付けましょう。";
    return quietCueProblem(doc);
  },
};
