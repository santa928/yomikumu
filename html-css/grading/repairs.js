"use strict";

/** ラベルで選べる欄に値を入れ、実際にフォームに含まれる名前と値を検査する。 */
function repairEmailField(doc) {
  const form = doc.querySelector("form");
  const field = namedElement(doc, "label", "連絡先")?.control;
  if (!form || field?.form !== form || field.disabled || field.readOnly) return null;
  const previous = field.value;
  try {
    field.value = "a@example.com";
    return new FormData(form).get("email") === field.value ? field : null;
  } finally {
    field.value = previous;
  }
}

const repairExerciseGraders = {
  "repair-image"([doc]) {
    const image = doc.querySelector('img[data-course-file="assets/port.png"]');
    return image?.alt === "港に浮かぶ舟" ? "" : "assets の中の画像を表示し、説明を残しましょう。";
  },
  "repair-color"([doc]) {
    const headings = [...doc.querySelectorAll("h2")];
    const colors = headings.map(heading => doc.defaultView.getComputedStyle(heading).color);
    return colors[0] === "rgb(0, 0, 128)" && colors[1] === "rgb(0, 128, 0)" ? "" : "次の展示は紺、開催中は緑になる指定を調べましょう。";
  },
  "form-entry"([doc]) {
    return repairEmailField(doc) ? "" : "連絡先の値を email という項目名で受け取れるようにしましょう。";
  },
  "form-email"([doc]) {
    const field = repairEmailField(doc);
    if (!field) return "連絡先から入力でき、送る項目に email が含まれるか確認しましょう。";
    const previous = field.value;
    try {
      for (const [value, valid] of [["", false], ["hello", false], ["a@example.com", true]]) {
        field.value = value;
        if (field.validity.valid !== valid) return "空欄・hello・a@example.com の3通りを試しましょう。";
      }
      return "";
    } finally {
      field.value = previous;
    }
  },
};
