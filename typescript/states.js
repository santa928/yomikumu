"use strict";
const answerState = 'type Answer = { kind: "waiting" } | { kind: "scored"; points: number };';
const hintShape = 'type Card = { text: string; hint?: string };';
tsChapters.push({
  title: "回答の状態とヒントの有無で表示を変える",
  intro: "回答する前は案内を表示し、採点した後は得点を表示します。状態を切り替えて、label が返す文字列を確かめましょう。",
  demo: ["回答前の表示", "採点後の表示"],
  code: n => answerState + '\nfunction label(a: Answer) {\n  if (a.kind === "waiting") return "回答してください";\n  return a.points + "点";\n}\nconsole.log(label(' + (n ? '{kind:"scored", points:2}' : '{kind:"waiting"}') + '));'
});
tsLessons.push({
  id: "union", chapter: 1, title: "状態の候補を二つにする",
  why: '回答の状態を表す変数に、どの値を代入できるか決めます。"open" | "done" の縦線は「どちらか」という選択の印です。この型をユニオンといいます。',
  before: 'type Stage = "open" | "done";\nlet stage: Stage = "open";\nconsole.log(stage);',
  after: 'type Stage = "open" | "done";\nlet stage: Stage = "done";\nconsole.log(stage);', change: "stage を回答済みに変える",
  question: ['type Stage = "open" | "done" に入る値は？', ['"other"', '4', '"done"', 'true'],2,"縦線で並べた二つの文字のどちらかを選びます。"],
  prompt:'クイズの状態を表す Stage の値は "waiting" と "scored" の二種類だけ。stage を "waiting" で開始してください。',
  template:'type Stage = "waiting" § §;\nlet stage: Stage = §;',
  slots:[["候補のつなぎ方","|","&"],["回答後の候補",'"scored"','"closed"'],["開始時",'"waiting"','"scored"']],
  starter:'type Stage = "waiting";\nlet stage: Stage = "waiting";',
  contract:'const __a:Stage="waiting", __b:Stage="scored";\n// @ts-expect-error 第三の状態は対象外\nconst __bad:Stage="other";\nconst __start:Stage=stage;',
  contractHint:"Stage に waiting と scored だけを許す型を書きます。",
  probes:[trial("stage","waiting","最初は回答前の waiting にします。")]
},{
  id:"narrow", chapter:1, title:"採点済みのときだけ points を読む",
  why:'Answer のうち、points を持つのは kind が "scored" の場合だけです。先に "waiting" の場合の値を return すると、残りの行では TypeScript が a の型を絞り込み、a.points を読めます。',
  before:answerState+'\nfunction pointsLabel(a: Answer) { return a.points + "点"; }\nconsole.log(pointsLabel({kind:"waiting"}));',
  after:answerState+'\nfunction pointsLabel(a: Answer) {\n  if (a.kind === "waiting") return "未回答";\n  return a.points + "点";\n}\nconsole.log(pointsLabel({kind:"waiting"}));',change:"回答前の表示を先に返す",
  question:["回答前の Answer から読める項目は？",["points","hint","text","kind"],3,"kind は両方の状態にあります。points は採点済みのときだけ使えます。"],
  prompt:'result(a) は waiting のとき「受付中」、scored のときはその点数に「点」を付けます。0点や5点でも使えるようにしてください。',
  template:answerState+'\nfunction result(a: Answer): string {\n  if (a.kind === §) return §;\n  return §;\n}',
  slots:[["先に見る状態",'"waiting"','"scored"'],["回答前の文字",'"受付中"','"終了"'],["得点の表示",'a.points + "点"','"1点"']],
  starter:answerState+'\nfunction result(a: Answer): string {\n  return a.points + "点";\n}',
  contract:'const __label: (a: Answer) => string = result;',contractHint:"Answer を受け文字を返す result を用意します。",
  probes:[trial('result({kind:"waiting"})',"受付中","回答前は「受付中」を返しましょう。"),trial('result({kind:"scored",points:0})',"0点","kind が scored なら、0 点のときも points を使います。"),trial('result({kind:"scored",points:5})',"5点","実際の点数を表示します。")]
},{
  id:"optional", chapter:1,title:"ヒントがあるときだけ読む",
  why:'すべての問題にヒントがあるとは限りません。hint?: string の ? は省略可能の印です。hint ?? "ヒントなし" は、値がないときだけ右の案内を使います。空文字は値の一つです。',
  before:hintShape+'\nconst card:Card={text:"星",hint:"夜空"};\nconsole.log(card.hint ?? "ヒントなし");',
  after:hintShape+'\nconst card:Card={text:"星"};\nconsole.log(card.hint ?? "ヒントなし");', change:"問題からヒントだけを外す",
  question:["hint を指定しなかったとき、card.hint の値は？",["数の0","空白文字","undefined（値がない）","true"],2,"省略した項目を読むと undefined です。"],
  prompt:"readHint(card) はヒントがあればその文字、項目がなければ「自分で考える」を返します。空文字を指定したときは空文字を残します。",
  template:hintShape+'\nfunction readHint(card: Card): string {\n  return card.hint § §;\n}',
  slots:[["値がないときだけ切り替える","??","||"],["項目がない場合",'"自分で考える"','"ヒントなし"']],
  starter:hintShape+'\nfunction readHint(card: Card): string {\n  return card.hint;\n}',
  contract:'const __read:(card:Card)=>string=readHint; const __blank:Card={text:"森"};',contractHint:"hint を省略した Card も受け取れる関数にします。",
  probes:[trial('readHint({text:"池",hint:"水辺"})',"水辺","card.hint に文字列があればその値を返します。"),trial('readHint({text:"星"})',"自分で考える","ヒントなし用の案内を返してください。"),trial('readHint({text:"星",hint:""})',"","hint に空文字を指定した場合は空文字を返します。")]
},{
  id:"result-sign",chapter:1,title:"回答前はヒント、採点後は得点を表示する",
  why:'採点後はすぐに得点を返します。回答前は hint を読み、ヒントを省略した問題には代わりの案内を返します。',
  before:answerState+'\n'+hintShape+'\nfunction sign(a:Answer,c:Card) {\n  if(a.kind==="scored") return a.points+"点";\n  return c.hint ?? "挑戦";\n}\nconsole.log(sign({kind:"waiting"},{text:"月"}));',
  after:answerState+'\n'+hintShape+'\nfunction sign(a:Answer,c:Card) {\n  if(a.kind==="scored") return a.points+"点";\n  return c.hint ?? "挑戦";\n}\nconsole.log(sign({kind:"scored",points:2},{text:"月"}));',change:"採点済みの状態を渡す",
  question:["採点後に画面に出す得点は、どの項目から読みますか。",["points","hint","kind","text"],0,"kind が scored のときは points を使います。"],
  prompt:"案内 guide(a,card) を作ります。回答前にヒントがあればその文字、なければ「考え中」。回答後は「得点 」と点数をつなげます。",
  template:answerState+'\n'+hintShape+'\nfunction guide(a:Answer,card:Card):string {\n  if(a.kind==="scored") return §;\n  return card.hint § §;\n}',
  slots:[["得点の表示",'"得点 " + a.points','"得点 0"'],["ヒントの確認","??","&&"],["ヒントなし",'"考え中"','"終了"']],
  starter:answerState+'\n'+hintShape+'\nfunction guide(a:Answer,card:Card):string {\n  return "考え中";\n}',
  contract:'const __guide:(a:Answer,c:Card)=>string=guide;',contractHint:"guide が状態と問題を受けて文字を返す形にします。",
  probes:[trial('guide({kind:"waiting"},{text:"庭"})',"考え中","回答前の問題に hint がなければ「考え中」を返します。"),trial('guide({kind:"waiting"},{text:"庭",hint:"草花"})',"草花","ヒントがある問題はその文字を表示します。"),trial('guide({kind:"scored",points:0},{text:"庭",hint:"草花"})',"得点 0","回答後はヒントより得点を優先します。"),trial('guide({kind:"scored",points:3},{text:"森"})',"得点 3","「得点 」の後ろに a.points の値を表示します。")]
});
