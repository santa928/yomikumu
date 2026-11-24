"use strict";

const paperQuestions = 'const cards = [\n  { title: "月", kind: "紙", points: 2 },\n  { title: "舟", kind: "木", points: 5 },\n  { title: "星", kind: "紙", points: 3 }\n];';
const updatedPoints = 'function changePoints(cards, title, points) {\n  return cards.map(card => {\n    if (card.title === title) {\n      return { ...card, points: points };\n    }\n    return card;\n  });\n}';
const shelfFixture = 'const cards = [\n  { title: "川", kind: "風景", points: 4 },\n  { title: "灯", kind: "道具", points: 2 },\n  { title: "森", kind: "風景", points: 3 }\n];';
const listKind = 'function byKind(cards, kind) {\n  if (kind === "すべて") return cards;\n  return cards.filter(card => card.kind === kind);\n}';
const sumPoints = 'function sum(cards) {\n  return cards.reduce((total, card) => total + card.points, 0);\n}';

const javascriptTransformLessons = [
  {
    id: "js-map-names", topic: "一覧から作る", title: "map で一覧を別の形に変換する",
    goal: "各問を同じ方法で変換し、件数と順番を保った表示用の一覧を作る。",
    slides: [
      { title: "map で各カードの題名を取り出す", body: "カードの配列から「月」「舟」「星」という題名だけの配列を作ります。map は左の配列を順番に読み、矢印の右で返した値を一件ずつ新しい配列に並べます。", code: paperQuestions + "\nconst names = cards.map(card => card.title);\nconsole.log(names);" },
      { title: "変換した後も元の点数を読める", body: "map の結果を新しい名前に受け取れば、元のカードから後で点数を読めます。表示名だけの一覧と、元の一問目の点を見比べてください。", code: paperQuestions + "\nconst names = cards.map(card => card.title);\nconsole.log(names);\nconsole.log(cards[0].points);" },
    ],
    quiz: { prompt: "3問のカードを map で題名に変えます。できる表示名はいくつ？", options: ["1", "2", "3", "点数の合計と同じ"], correct: 2, reasons: ["先頭だけでなく全件を変換します。","条件で除く操作はしていません。","一件から一件ずつ作るので同じ3件です。","この操作では点数を加えません。"] },
    exercise: { field: "javascript", task: "names が、カードの並び順を保ったまま題名だけの配列を返すようにしてください。カードが0件なら空の配列を返します。",
      code: "function names(cards) {\n  return cards.map(card => card.points);\n}", answer: "function names(cards) {\n  return cards.map(card => card.title);\n}", calls: paperQuestions + "\nconsole.log(names(cards));\nconsole.log(names([]));", review: 0,
      hint: "一件ごとに返したいのは points ではなく、そのカードの題名です。",
      build: { code: "function names(cards) {\n  return cards.①(card => card.②);\n}", slots: [["全件を変換", "filter", "map"], ["配列から取り出す項目", "points", "title"]] },
      expected: () => [["月","舟","星"],[]], hints: ["題名だけを、月・舟・星の順に並べて返しましょう。","カードが0件のときは、空の配列を返しましょう。"] },
  },
  {
    id: "js-filter-kind", topic: "一覧を絞る", title: "filter で条件に合う項目だけを選ぶ",
    goal: "一件ずつ条件を確かめ、条件に合ったカードを元の順で残す。",
    slides: [
      { title: "種類が「紙」のカードを選ぶ", body: "filter はカードを一件ずつ調べ、矢印の右の式が true になったカードを新しい配列に残します。=== は左右が同じ値・同じ種類かを調べる記号です。「紙」のカードは二件あるので、残るのは月と星です。", code: paperQuestions + '\nconst paper = cards.filter(card => card.kind === "紙");\nconsole.log(paper.map(card => card.title));' },
      { title: "絞り込みの前後で題名を比べる", body: "紙だけの一覧を作っても、元の cards には木の問題も残っています。二つの一覧の題名を順に表示して確かめましょう。", code: paperQuestions + '\nconst paper = cards.filter(card => card.kind === "紙");\nconsole.log(paper.map(card => card.title));\nconsole.log(cards.map(card => card.title));' },
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
    id: "js-points-total", topic: "一覧を集計する", title: "reduce で一覧の数値を合計する",
    goal: "いままでの合計に一問の点を足し、空の一覧にも合計を返す。",
    slides: [
      { title: "いままでの合計と次の一件", body: "reduce は、いままでの結果と今の一件を関数に渡します。右端の 0 が出発点です。最初は 0 に2、次は2に5、最後は7に3を足して10になります。", code: paperQuestions + "\nconst total = cards.reduce((total, card) => total + card.points, 0);\nconsole.log(total);" },
      { title: "空の配列の合計はどうなる？", body: "空の配列では足す一件がありません。最初の値を0にしておくと、ゼロ点をそのまま返せます。一問のときと比べてみましょう。", code: sumPoints + "\nconsole.log(sum([]));\nconsole.log(sum([{ points: 4 }]));" },
    ],
    quiz: { prompt: "空の一覧にも合計0を返すため、reduce の出発点に置く値は？", options: ["数の0", '文字の"0"', "最初のカード", "種類の名前"], correct: 0, reasons: ["足す一件がなければ、その数が答えになります。","数の合計には数の0を使います。","空の一覧には最初のカードがありません。","種類は合計の出発点にしません。"] },
    exercise: { field: "javascript", task: "sum は全カードの points を合計して数で返します。三問では10点、一問もなければ0点です。出発点をどちらにも合う値に直してください。",
      code: sumPoints.replace(", 0);", ", 1);"), answer: sumPoints, calls: paperQuestions + "\nconsole.log(sum(cards));\nconsole.log(sum([]));\nconsole.log(sum([{ points: 7 }]));", review: 1, hint: "最初から点が付かないように、合計の出発点を0にして各問の点だけ足します。",
      build: { code: "function sum(cards) {\n  return cards.①((total, card) => total + card.points, ②);\n}", slots: [["一つの合計にまとめる", "filter", "reduce"], ["出発点", "1", "0"]] },
      expected: () => [10,0,7], hints: ["三問の2・5・3点だけを足しましょう。","三問はできました。空の一覧では合計0を返します。","一件だけでも、その一問の点を合計として返します。"] },
  },
  {
    id: "js-copy-card", topic: "元の問題を残す", title: "元の配列を変えず、一件だけ変更する",
    goal: "一覧と変更する一問をコピーして、元の問題集の点を残す。",
    slides: [
      { title: "別の変数に入れても同じオブジェクトを指す", body: "const next = card; は同じ一枚のカードを二つの名前で読めるようにします。next.points を書き換えた後に card.points を読むと、元の点も変わっています。この見本では card.points も6と表示されます。", code: 'const card = { title: "星", points: 3 };\nconst next = card;\nnext.points = 6;\nconsole.log(card.points);' },
      { title: "コピーしたオブジェクトだけ点数を変える", body: "{ ...card, points: 6 } の三つの点は、card の項目を新しいオブジェクトへ写す指定です。その後で points だけを上書きします。元の card と新しい next を順に表示し、それぞれの points を比べましょう。", code: 'const card = { title: "星", points: 3 };\nconst next = { ...card, points: 6 };\nconsole.log(card);\nconsole.log(next);' },
      { title: "配列から変更する一件を選ぶ", body: "map で新しい一覧を作り、題名が合うカードだけ新しいコピーに替えます。ほかは元のカードを読みます。実行すると、元の一覧では舟が5点、新しい一覧では8点と分かります。", setup: paperQuestions, code: updatedPoints + '\nconst next = changePoints(cards, "舟", 8);\nconsole.log(cards.map(card => card.points));\nconsole.log(next.map(card => card.points));' },
    ],
    quiz: { prompt: "元の星が3点のまま、新しい星を6点にする書き方は？", options: ["card.points = 6;", "const next = card;", "const next = { ...card, points: 6 };", "card = 6;"], correct: 2,
      reasons: ["元の一枚に直接書き込みます。","同じ一枚を別名で読むだけです。","新しい一枚に項目を写して点だけ変えます。","カードのコピーは作っていません。"] },
    exercise: { field: "javascript", task: "changePoints が、指定された題名のカードだけ配点を変えた新しい配列を返すようにしてください。「舟」を8点にしても、元の配列の「舟」は5点です。ほかの項目とカードはそのまま残します。",
      code: updatedPoints.replace("return { ...card, points: points };", "card.points = points;\n      return card;"), answer: updatedPoints,
      calls: paperQuestions + '\nconst revised = changePoints(cards, "舟", 8);\nconsole.log(revised.map(c => c.points));\nconsole.log(cards.map(c => c.points));\nconsole.log(revised.map(c => c.title));\nconsole.log(revised.map(c => c.kind));', review: 1,
      hint: "変更するカードを直接書き換える場所を、新しいオブジェクトを返す行に変えます。",
      build: { code: updatedPoints.replace("...card, points: points", "①, points: ②"), slots: [["元の項目を写す", "...card", "card"], ["渡された新しい点", "points", "card.points"]] },
      expected: () => [[2,8,3],[2,5,3],["月","舟","星"],["紙","木","紙"]], hints: ["新しい配列では舟だけが8点になります。","更新後の点は合っています。元の舟は5点のままになるよう、一枚をコピーしましょう。","点の変更で作品名も残るようにしましょう。","点と名前はできました。種類もコピーします。"] },
  },
  {
    id: "js-revise-set", topic: "問題集の仕上げ", title: "一覧を絞り込み、一件を変更して合計を比べる",
    goal: "選んだ種類の問題と合計を確かめ、全件へ戻ったとき元の点数が残るようにする。",
    slides: [
      { title: "種類を選び、全件に戻る", body: "「表示する種類」を選ぶと、該当する題名と合計点が変わります。まず風景、次に布を選び、最後に「すべて」に戻してみましょう。元の川・灯・森はいつでも読めます。", setup: shelfFixture + "\n" + listKind + "\n" + sumPoints, variant: { name: "kind", label: "表示する種類", options: ["すべて", "風景", "道具", "布"] }, code: 'const shown = byKind(cards, kind);\nconsole.log(shown.map(card => card.title));\nconsole.log(sum(shown));' },
      { title: "配点を変えた前後で合計を比べる", body: "「灯」の配点を2点から6点に変えた配列を next に入れます。「比べる種類」を変えると、一行目には元の合計、二行目には変更後の合計が出ます。", setup: shelfFixture + "\n" + updatedPoints + "\n" + listKind + "\n" + sumPoints, variant: { name: "kind", label: "比べる種類", options: ["道具", "すべて", "風景"] }, code: 'const next = changePoints(cards, "灯", 6);\nconsole.log(sum(byKind(cards, kind)));\nconsole.log(sum(byKind(next, kind)));' },
    ],
    quiz: { prompt: "next の灯の点を変えた後、元の全問の合計を求めるには？", options: ["next の「道具」だけ合計", "元の cards をそのまま合計", "最後の一問を表示", "元のすべてを0にする"], correct: 1,
      reasons: ["変更後の「道具」の点だけになります。","全問題の元の点が入っている一覧です。","全件の合計になりません。","元の点数が失われます。"] },
    exercise: { field: "javascript", task: "byKind は選んだ種類のカードを、「すべて」なら全カードを返します。sum はその配列の合計点を返します。この二つの関数を直してください。全問の合計は元の配列では9点、「灯」を2点から6点に変えた配列では13点です。",
      code: listKind.replace('  if (kind === "すべて") return cards;\n', "") + "\n" + sumPoints.replace(", 0);", ", 1);"),
      answer: listKind + "\n" + sumPoints, calls: shelfFixture + "\n" + updatedPoints + '\nconst revised = changePoints(cards, "灯", 6);\nconsole.log(sum(byKind(cards, "風景")));\nconsole.log(sum(byKind(cards, "布")));\nconsole.log(sum(byKind(revised, "道具")));\nconsole.log(sum(byKind(revised, "すべて")));\nconsole.log(sum(byKind(cards, "すべて")));', review: 0,
      hint: "最初に、合計の出発点を0にします。次に、種類が「すべて」のときは絞る前の一覧を返しましょう。",
      build: { code: listKind.replace('return cards;', 'return ①;') + "\n" + sumPoints.replace(", 0);", ", ②);"), slots: [["選択を外した一覧", "cards", "[]"], ["空でも使える合計の出発点", "0", "1"]] },
      expected: () => [7,0,6,13,9], hints: ["風景二問だけの点を足すと7です。出発点も確かめましょう。","風景はできました。該当する問題のない布は0点です。","変更後の「道具」は6点の灯だけです。","絞れました。変更後も「すべて」を選ぶと三問とも合計します。","変更後の合計は合っています。元の三問の合計は9点です。"] },
  },
];
