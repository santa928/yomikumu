"use strict";
const hintHtml = `<button id="trigger" aria-controls="hint" aria-expanded="false">ヒント</button>
<section id="hint" hidden><p>光を夜の海へ送る建物です。</p><button id="close">閉じる</button></section>
<label>建物の名前 <input id="answer"></label>`;
const hintRefs = `const trigger = document.querySelector("#trigger");
const hint = document.querySelector("#hint");
const close = document.querySelector("#close");
const answer = document.querySelector("#answer");`;
const hintCode = hintRefs + `
function show(open) {
  hint.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));
  if (open) close.focus();
  else answer.focus();
}
trigger.onclick = () => show(hint.hidden);
close.onclick = () => show(false);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !hint.hidden) show(false);
});`;
const keyTest = t=>{
  t.q("#close").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
  return t.q("#hint").hidden;
};
const accessibleHint = [
  [t=>t.q("#trigger").getAttribute("aria-expanded")==="false" && t.q("#hint").hidden && t.q("#trigger").getAttribute("aria-controls")==="hint","最初は閉じた表示とaria-expanded=falseをそろえ、aria-controlsでhintを指します。"],
  [t=>{t.click("#trigger");return !t.q("#hint").hidden && t.q("#trigger").getAttribute("aria-expanded")==="true";},"開いている時は表示とaria-expanded=trueをそろえます。"],
  [t=>{t.click("#close");return t.q("#hint").hidden && t.q("#trigger").getAttribute("aria-expanded")==="false";},"閉じた時も見た目と読み上げ用の状態を一緒に戻します。"],
];
const keyboardDomUnit = {
  id:"keyboard", title:"キーボードで操作できる画面を作る",focusTests:true,
  intro:"作品名を答えるクイズに、マウスなしでも開けるヒントを作ります。Tabで操作する場所を選び、Enterで開き、Escapeで閉じます。今キーボードで操作する位置をフォーカスと呼びます。ヒントを閉じたらフォーカスを回答欄に戻し、すぐ入力を再開できるようにします。",
  demo:{html:hintHtml,code:hintCode,tip:"ヒントのボタンにTabで移り、Enterで開きます。Escapeで閉じた後、そのまま「灯台」と入力してみてください。"},
  steps:[
    {
      title:"ボタンでヒントを開く",html:hintHtml,
      explain:"hiddenが付いた要素は表示されません。hiddenをfalseにすると読めます。buttonはキーボードでも押せるので、最初からbuttonを使います。",
      example:hintRefs+'\ntrigger.onclick = () => { hint.hidden = true; };',
      question:"ヒントをボタンで開けるようにする指定はどれですか。",options:["hint.hidden = true","trigger.hidden = true","hint.hidden = false","answer.value = false"],correct:2,feedback:"ヒントのhiddenをfalseにして、隠れていた内容を表示します。",
      task:"ボタンを押してヒントが開くよう、trueを一か所変えましょう。",
      build:[hintRefs+'\n《1》.onclick = () => { hint.hidden = 《2》; };',["trigger","close"],["false","true"]],
      tests:[[t=>t.q("#hint").hidden,"最初はヒントを閉じておきます。"],[t=>{t.click("#trigger");return !t.q("#hint").hidden;},"ボタンを押したときにhiddenをfalseにします。"]],
    },
    {
      title:"押されたキーを調べ、Escapeのときだけ閉じる",html:hintHtml,
      explain:"keydownはキーを押した時に起きます。event.keyで押されたキー名を読みます。見本はEnterで閉じます。Escapeで閉じるよう条件を変えましょう。",
      example:hintRefs+'\ntrigger.onclick = () => { hint.hidden = false; };\ndocument.addEventListener("keydown", event => {\n  if (event.key === "Enter") hint.hidden = true;\n});',
      question:"Escape以外の文字を打っても閉じないようにするには何を比べますか。",options:["欄の長さ","event.key","buttonの色","時刻"],correct:1,feedback:"event.keyと文字列のEscapeを比較し、目的のキーを押した時だけ閉じます。",
      task:"「Escape」の時だけ閉じるようにしてください。Aを押しても表示を保ちます。",
      build:[hintRefs+'\ntrigger.onclick = () => { hint.hidden = false; };\ndocument.addEventListener(《1》, event => {\n  if (event.key === 《2》) hint.hidden = true;\n});',['"keydown"','"click"'],['"Escape"','"Enter"']],
      tests:[[t=>{t.click("#trigger");t.q("#close").dispatchEvent(new KeyboardEvent("keydown",{key:"a",bubbles:true}));return !t.q("#hint").hidden;},"開いた後、ほかのキーでは読み続けられるようにします。"],[keyTest,"Escapeキーを調べ、押された場合だけ閉じます。"]],
    },
    {
      title:"開いたら「閉じる」ボタンに操作位置を移す",html:hintHtml,
      explain:"フォーカスとは、いまキーボードで操作する場所です。focus()で移動できます。開いてから「閉じる」へ移すと、キーを押してすぐ閉じられます。",
      example:hintRefs+'\ntrigger.onclick = () => {\n  hint.hidden = false;\n  answer.focus();\n};',
      question:"開いた直後にEnterで「閉じる」を押せるようにするには、どこへ移りますか。",options:["非表示の見出し","回答の文字列","ページの外","閉じるボタン"],correct:3,feedback:"見えるようになった閉じるボタンにfocus()を呼びます。",
      task:"見本の移動先を変え、開いたら「閉じる」ボタンがフォーカスされるようにします。",
      build:[hintRefs+'\ntrigger.onclick = () => {\n  hint.hidden = 《1》;\n  《2》.focus();\n};',["false","true"],["close","answer"]],
      tests:[[t=>{t.click("#trigger");return !t.q("#hint").hidden;},"まずヒントを表示します。"],[t=>document.activeElement===t.q("#close"),"表示された閉じるボタンにfocus()を呼びます。"]],
    },
    {
      title:"閉じたらキーボードの操作位置を入力欄に戻す",html:hintHtml,
      explain:"閉じたパネルのボタンは使えなくなります。次にしたい操作へfocus()を移せば、最初からTabで探し直す手間がありません。このクイズでは回答欄に戻します。",
      example:hintRefs+'\ntrigger.onclick = () => { hint.hidden = false; close.focus(); };\nclose.onclick = () => {\n  hint.hidden = true;\n  trigger.focus();\n};',
      question:"このクイズで、ヒントを閉じてすぐ答えを書くにはどこへ戻りますか。",options:["回答欄","見出し","閉じたボタン","ページの終端"],correct:0,feedback:"回答欄にフォーカスを戻せば、そのまま続きを入力できます。",
      task:"閉じるボタンを押した直後の移動先を、回答欄へ変えましょう。書きかけの文字も残します。",
      build:[hintRefs+'\ntrigger.onclick = () => { hint.hidden = false; close.focus(); };\nclose.onclick = () => {\n  hint.hidden = 《1》;\n  《2》.focus();\n};',["true","false"],["answer","trigger"]],
      tests:[[t=>{t.type("#answer","灯");t.click("#trigger");t.click("#close");return t.q("#hint").hidden;},"閉じるボタンでヒントを隠します。"],[t=>document.activeElement===t.q("#answer") && t.q("#answer").value==="灯","回答欄へ戻し、入力の続きを書ける状態にします。"]],
    },
    {
      title:"読み上げ用の名前と開閉状態をそろえる",html:hintHtml,
      explain:"ボタンの文字「ヒント」が読み上げ名になります。aria-controlsは操作する領域のidを、aria-expandedは開いているかを伝えます。setAttributeで属性の文字列を変更できます。",
      example:hintCode.replace('String(open)','"false"'),
      question:"開いている時に読み上げへ伝える属性値はどれですか。",options:['hidden="true"','aria-controls="false"','aria-expanded="true"','role="hidden"'],correct:2,feedback:"開閉ボタンにaria-expandedを設定し、見える状態と同じ値にします。",
      task:"見本で常にfalseになっている属性値を修正し、閉じた時はfalse、開いた時はtrueにします。",
      build:[hintCode.replace('hint.hidden = !open;', 'hint.hidden = 《1》;').replace('String(open)', '《2》'),["!open","open"],["String(open)",'"false"']],
      tests:accessibleHint,
    },
    {
      title:"練習：ヒントを開き、閉じたら入力欄へ戻る",
      html:hintHtml.replace("光を夜の海へ送る建物です。","夜空に淡い帯を作る星の集まりです。").replace("建物の名前","天体の名前"),
      explain:"開く時と閉じる時で、表示・読み上げ用の状態・次の操作位置を一緒に決めます。ボタンで閉じる時もEscapeで閉じる時も同じ処理を呼べます。",
      example:hintRefs+'\nfunction returnToAnswer() {\n  hint.hidden = true;\n  answer.focus();\n}\nclose.onclick = returnToAnswer;',
      question:"ヒントを閉じた直後に整っている組み合わせはどれですか。",options:["表示中・true・回答欄","非表示・false・回答欄","非表示・true・閉じる","表示中・false・ヒント"],correct:1,feedback:"非表示、aria-expanded=false、回答欄にフォーカスの三つを合わせます。",
      task:"星などを答えるクイズに、キーボードで操作できるヒントを作ります。「ヒント」で開いて閉じるボタンへ移り、「閉じる」かEscapeで閉じて回答欄へ戻ります。元のボタン名と書きかけの回答を保ち、開閉状態を見た目と読み上げでそろえてください。",
      starter:hintRefs+'\n',build:[hintCode.replace('!open;', '《1》;').replace('else answer.focus();','else 《2》.focus();').replace('event.key === "Escape"','event.key === 《3》'),["!open","open"],["answer","trigger"],['"Escape"','"Enter"']],
      tests:[
        ...accessibleHint,
        [t=>{t.type("#answer","天");t.click("#trigger");return document.activeElement===t.q("#close");},"開いたら閉じるボタンに移ります。"],
        [t=>{t.q("#close").dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));return t.q("#hint").hidden && t.q("#trigger").getAttribute("aria-expanded")==="false" && document.activeElement===t.q("#answer") && t.q("#answer").value==="天";},"Escapeでも閉じ、開閉状態とフォーカスを更新して書きかけの回答へ戻ります。"],
        [t=>{t.click("#trigger");t.click("#close");return document.activeElement===t.q("#answer") && (t.q("#trigger").getAttribute("aria-label") || t.q("#trigger").textContent).includes("ヒント");},"閉じるボタンからも回答へ戻り、ヒントというボタン名を保ちます。"],
      ],
    },
  ],
};
