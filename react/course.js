"use strict";
window.courseWorkshop = {
  id:"react", catalogTitle:"Reactの目次", heading:"Reactで画面の部品を作り、操作に応じて表示を変える", language:"App.jsx", units:[reactCards, reactWorks, reactRoles, reactSubscriptions, reactTypedQuiz, reactReading, reactBookMemos],
  intro:"JavaScriptの関数や配列を使って、表示する部品を組み合わせます。作品紹介や読書リストで、ボタンを押したり文字を入力したりしたときに、一覧や件数が変わる画面を作ります。各単元は、完成例を操作してから、短い見本と練習に進みます。",
  splitFiles:splitReactFiles, joinFiles:joinReactFiles, frame:reactFrame, prepare:code=>code, timeout:20000,
};
