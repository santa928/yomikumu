"use strict";

// 各教材群のID定義を一か所ずつ持ち寄る。classic scriptはこのファイルより先に読み込む。
const htmlCssExerciseGraders = {
  ...htmlExerciseGraders,
  ...cssExerciseGraders,
  ...boxesExerciseGraders,
  ...authorsExerciseGraders,
  ...flexExerciseGraders,
  ...gridExerciseGraders,
  ...responsiveExerciseGraders,
  ...keyboardExerciseGraders,
  ...profileExerciseGraders,
  ...repairExerciseGraders,
};

/**
 * HTML/CSS演習の公開入口。各採点は最初の問題を返し、すべて満たすと空文字を返す。
 * docsはexercise.widthsの順（未指定時は通常のプレビュー幅）。
 * responsiveはプレビュー生成側の既定値360px・720pxを使う。
 * 未知のidも従来どおり空文字を返す。
 */
function exerciseResult(id, docs) {
  const grade = Object.prototype.hasOwnProperty.call(htmlCssExerciseGraders, id) ? htmlCssExerciseGraders[id] : null;
  return grade ? grade(docs) : "";
}
