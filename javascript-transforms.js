"use strict";

const paperQuestions = 'const cards = [\n  { title: "月", kind: "紙", points: 2 },\n  { title: "舟", kind: "木", points: 5 },\n  { title: "星", kind: "紙", points: 3 }\n];';
const updatedPoints = 'function changePoints(cards, title, points) {\n  return cards.map(card => {\n    if (card.title === title) {\n      return { ...card, points: points };\n    }\n    return card;\n  });\n}';
const shelfFixture = 'const cards = [\n  { title: "川", kind: "風景", points: 4 },\n  { title: "灯", kind: "道具", points: 2 },\n  { title: "森", kind: "風景", points: 3 }\n];';
const listKind = 'function byKind(cards, kind) {\n  if (kind === "すべて") return cards;\n  return cards.filter(card => card.kind === kind);\n}';
const sumPoints = 'function sum(cards) {\n  return cards.reduce((total, card) => total + card.points, 0);\n}';

const javascriptTransformLessons = [
  {
    id: "js-map-names", topic: "一覧から作る", title: "全問の題名だけを並べる",
    goal: "各問を同じ方法で変換し、件数と順番を保った表示用の一覧を作る。",
    slides: [
      { title: "目次に題名だけ欲しいとき", body: "答えや点数を載せない目次には、問題カードごとに題名だけを取り出します。map は左の配列を順番に読み、矢印の右で返した値を一件ずつ新しい配列に並べます。", code: paperQuestions + "\nconst names = cards.map(card => card.title);\nconsole.log(names);" },
      { title: "題名を作ってもカードは使える", body: "map の結果を新しい名前に受け取れば、元のカードから後で点数を読めます。表示名だけの一覧と、元の一問目の点を見比べてください。", code: paperQuestions + "\nconst names = cards.map(card => card.title);\nconsole.log(names);\nconsole.log(cards[0].points);" },
    ],
    quiz: { prompt: "3問のカードを map で題名に変えます。できる表示名はいくつ？", options: ["1", "2", "3", "点数の合計と同じ"], correct: 2, reasons: ["先頭だけでなく全件を変換します。","条件で除く操作はしていません。","一件から一件ずつ作るので同じ3件です。","この操作では点数を加えません。"] },
    exercise: { field: "javascript", task: "names が、カードの並び順を保ったまま題名だけの配列を返すようにしてください。空の原稿では空の配列を返します。",
      code: "function names(cards) {\n  return cards.map(card => card.points);\n}", answer: "function names(cards) {\n  return cards.map(card => card.title);\n}", calls: paperQuestions + "\nconsole.log(names(cards));\nconsole.log(names([]));", review: 0,
      hint: "一件ごとに返したいのは points ではなく、そのカードの題名です。",
      build: { code: "function names(cards) {\n  return cards.①(card => card.②);\n}", slots: [["全件を変換", "filter", "map"], ["目次に載せる項目", "points", "title"]] },
      expected: () => [["月","舟","星"],[]], hints: ["題名だけを、月・舟・星の順に並べて返しましょう。","空の原稿も同じ変換を使って、空の一覧を返しましょう。"] },
  },
  {
    id: "js-filter-kind", topic: "一覧を絞る", title: "選んだ種類の問題だけを残す",
    goal: "一件ずつ条件を確かめ、条件に合ったカードを元の順で残す。",
    slides: [
      { title: "紙の展示だけを回る", body: "filter は矢印の右が true になった一件だけを新しい配列に残します。=== は左右が同じ値・同じ種類かを調べる記号です。「紙」のカードは二件あるので、残るのは月と星です。", code: paperQuestions + '\nconst paper = cards.filter(card => card.kind === "紙");\nconsole.log(paper.map(card => card.title));' },
      { title: "絞り込みを外したら何が戻る？", body: "紙だけの一覧を作っても、元の cards には木の問題も残っています。二つの一覧の題名を順に表示して確かめましょう。", code: paperQuestions + '\nconst paper = cards.filter(card => card.kind === "紙");\nconsole.log(paper.map(card => card.title));\nconsole.log(cards.map(card => card.title));' },
    ],
    quiz: { prompt: "同じ題材のカードだけを残したいとき、条件に合う件数が0なら filter の結果は？", options: ["元の一覧", "一件の空文字", "数の0", "空の配列"], correct: 3, reasons: ["元の一覧は残りますが、絞った結果は別です。","空文字を一件追加する指示はありません。","filter は配列を返します。","残す一件もなければ [] を返します。"] },
    exercise: { field: "javascript", task: "selectKind が、指定された種類のカードだけを返すようにしてください。教材は紙・木・布の順で試し、最後に元の一覧へ戻って題名を確かめます。",
      code: 'function selectKind(cards, kind) {\n  return cards.filter(card => card.kind === "紙");\n}', answer: 'function selectKind(cards, kind) {\n  return cards.filter(card => card.kind === kind);\n}',
      calls: paperQuestions + '\nfor (const kind of ["紙", "木", "布"]) {\n  console.log(selectKind(cards, kind).map(card => card.title));\n}\nconsole.log(cards.map(card => card.title));', review: 1,
      hint: "固定の「紙」と比べず、関数に渡された kind と一件の card.kind を比べます。",
      build: { code: "function selectKind(cards, kind) {\n  return cards.①(card => card.kind === ②);\n}", slots: [["条件に合ったものを残す", "map", "filter"], ["今回選んだ種類", '"紙"', "kind"]] },
      expected: () => [["月","星"],["舟"],[],["月","舟","星"]], hints: ["紙の二件を元の順で残しましょう。","紙はできました。木が選ばれたときは舟だけを残しましょう。","布の問題はないので空の配列です。","元の全件も後から見られるようにしましょう。"] },
  },
  {
    id: "js-points-total", topic: "一覧を集計する", title: "ゼロから全問の点を合計する",
    goal: "いままでの合計に一問の点を足し、空の一覧にも合計を返す。",
    slides: [
      { title: "いままでの合計と次の一件", body: "reduce は、いままでの結果と今の一件を関数に渡します。右端の 0 が出発点です。最初は 0 に2、次は2に5、最後は7に3を足して10になります。", code: paperQuestions + "\nconst total = cards.reduce((total, card) => total + card.points, 0);\nconsole.log(total);" },
      { title: "一問も選ばれなかった日", body: "空の配列では足す一件がありません。最初の値を0にしておくと、ゼロ点をそのまま返せます。一問のときと比べてみましょう。", code: sumPoints + "\nconsole.log(sum([]));\nconsole.log(sum([{ points: 4 }]));" },
    ],
    quiz: { prompt: "空の一覧にも合計0を返すため、reduce の出発点に置く値は？", options: ["数の0", '文字の"0"', "最初のカード", "種類の名前"], correct: 0, reasons: ["足す一件がなければ、その数が答えになります。","数の合計には数の0を使います。","空の一覧には最初のカードがありません。","種類は合計の出発点にしません。"] },
    exercise: { field: "javascript", task: "sum は全カードの points を合計して数で返します。三問では10点、一問もなければ0点です。出発点をどちらにも合う値に直してください。",
      code: sumPoints.replace(", 0);", ", 1);"), answer: sumPoints, calls: paperQuestions + "\nconsole.log(sum(cards));\nconsole.log(sum([]));\nconsole.log(sum([{ points: 7 }]));", review: 1, hint: "最初から点が付かないように、合計の出発点を0にして各問の点だけ足します。",
      build: { code: "function sum(cards) {\n  return cards.①((total, card) => total + card.points, ②);\n}", slots: [["一つの合計にまとめる", "filter", "reduce"], ["出発点", "1", "0"]] },
      expected: () => [10,0,7], hints: ["三問の2・5・3点だけを足しましょう。","三問はできました。空の一覧では合計0を返します。","一件だけでも、その一問の点を合計として返します。"] },
  },
  {
    id: "js-copy-card", topic: "元の問題を残す", title: "一枚だけ点を変えた新版を作る",
    goal: "一覧と変更する一問をコピーして、元の問題集の点を残す。",
    slides: [
      { title: "名前を付け直しても同じカード", body: "const next = card; は同じ一枚のカードを二つの名前で読めるようにします。next.points を書き換えた後に card.points を読むと、元の点も変わっています。別の点を試す前に、元を残せる形にしましょう。", code: 'const card = { title: "星", points: 3 };\nconst next = card;\nnext.points = 6;\nconsole.log(card.points);' },
      { title: "点を変える一枚を写す", body: "{ ...card, points: 6 } の三つの点は、card の項目を新しいオブジェクトへ写す指定です。その後で points だけを上書きします。元と新版を順に表示して比べましょう。", code: 'const card = { title: "星", points: 3 };\nconst next = { ...card, points: 6 };\nconsole.log(card);\nconsole.log(next);' },
      { title: "一覧の中から変える一枚を選ぶ", body: "map で新しい一覧を作り、題名が合うカードだけ新しいコピーに替えます。ほかは元のカードを読みます。舟の点を変えた前後を実行してみましょう。", setup: paperQuestions, code: updatedPoints + '\nconst next = changePoints(cards, "舟", 8);\nconsole.log(cards.map(card => card.points));\nconsole.log(next.map(card => card.points));' },
    ],
    quiz: { prompt: "元の星が3点のまま、新しい星を6点にする書き方は？", options: ["card.points = 6;", "const next = card;", "const next = { ...card, points: 6 };", "card = 6;"], correct: 2,
      reasons: ["元の一枚に直接書き込みます。","同じ一枚を別名で読むだけです。","新しい一枚に項目を写して点だけ変えます。","カードのコピーは作っていません。"] },
    exercise: { field: "javascript", task: "changePoints で題名が合う一枚だけ新版の点に更新してください。元の三枚の点と、ほかのカードの題名・点・種類は保ちましょう。",
      code: updatedPoints.replace("return { ...card, points: points };", "card.points = points;\n      return card;"), answer: updatedPoints,
      calls: paperQuestions + '\nconst revised = changePoints(cards, "舟", 8);\nconsole.log(revised.map(c => c.points));\nconsole.log(cards.map(c => c.points));\nconsole.log(revised.map(c => c.title));\nconsole.log(revised.map(c => c.kind));', review: 1,
      hint: "変更するカードを直接書き換える場所を、新しいオブジェクトを返す行に変えます。",
      build: { code: updatedPoints.replace("...card, points: points", "①, points: ②"), slots: [["元の項目を写す", "...card", "card"], ["渡された新しい点", "points", "card.points"]] },
      expected: () => [[2,8,3],[2,5,3],["月","舟","星"],["紙","木","紙"]], hints: ["新版では舟だけが8点になります。","新版はできました。元の舟は5点のままになるよう、一枚をコピーしましょう。","点の変更で作品名も残るようにしましょう。","点と名前はできました。種類もコピーします。"] },
  },
  {
    id: "js-revise-set", topic: "問題集の仕上げ", title: "別原稿から、絞り込みと新版の集計を作る",
    goal: "選んだ種類の問題と合計を確かめ、全件へ戻ったとき元の点数が残るようにする。",
    slides: [
      { title: "種類を選び、全件に戻る", body: "「表示する種類」を選ぶと、該当する題名と合計点が変わります。まず風景、次に布を選び、最後に「すべて」に戻してみましょう。元の川・灯・森はいつでも読めます。", setup: shelfFixture + "\n" + listKind + "\n" + sumPoints, variant: { name: "kind", label: "表示する種類", options: ["すべて", "風景", "道具", "布"] }, code: 'const shown = byKind(cards, kind);\nconsole.log(shown.map(card => card.title));\nconsole.log(sum(shown));' },
      { title: "新版の点と元の点を同じ条件で比べる", body: "元の問題集から新版を作ります。新版の「道具」では灯が6点、元の「道具」では2点です。下の種類を変え、元と新版の合計を一行ずつ比べます。", setup: shelfFixture + "\n" + updatedPoints + "\n" + listKind + "\n" + sumPoints, variant: { name: "kind", label: "比べる種類", options: ["道具", "すべて", "風景"] }, code: 'const next = changePoints(cards, "灯", 6);\nconsole.log(sum(byKind(cards, kind)));\nconsole.log(sum(byKind(next, kind)));' },
    ],
    quiz: { prompt: "新版だけ灯の点を変えた後、元の全問の合計を確かめるには？", options: ["新版の道具だけ合計", "元の cards をそのまま合計", "最後の一問を表示", "元のすべてを0にする"], correct: 1,
      reasons: ["新版かつ一種類の点になります。","全問題の元の点が入っている一覧です。","全件の合計になりません。","原稿の点が失われます。"] },
    exercise: { field: "javascript", task: "別原稿は、川（風景4点）・灯（道具2点）・森（風景3点）です。種類を選ぶとその分の合計、選択を「すべて」に戻すと全問の合計を返してください。用意した新版は灯だけ6点です。元の全件は9点、新版の全件は13点になります。",
      code: listKind.replace('  if (kind === "すべて") return cards;\n', "") + "\n" + sumPoints.replace(", 0);", ", 1);"),
      answer: listKind + "\n" + sumPoints, calls: shelfFixture + "\n" + updatedPoints + '\nconst revised = changePoints(cards, "灯", 6);\nconsole.log(sum(byKind(cards, "風景")));\nconsole.log(sum(byKind(cards, "布")));\nconsole.log(sum(byKind(revised, "道具")));\nconsole.log(sum(byKind(revised, "すべて")));\nconsole.log(sum(byKind(cards, "すべて")));', review: 0,
      hint: "最初に、合計の出発点を0にします。次に、種類が「すべて」のときは絞る前の一覧を返しましょう。",
      build: { code: listKind.replace('return cards;', 'return ①;') + "\n" + sumPoints.replace(", 0);", ", ②);"), slots: [["選択を外した一覧", "cards", "[]"], ["空でも使える合計の出発点", "0", "1"]] },
      expected: () => [7,0,6,13,9], hints: ["風景二問だけの点を足すと7です。出発点も確かめましょう。","風景はできました。該当する問題のない布は0点です。","新版の道具は6点の灯だけです。","絞れました。「すべて」に戻した新版には全三問が入ります。","新版はできました。元の全問に戻ると9点です。"] },
  },
];
