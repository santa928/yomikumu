"use strict";

const exhibitionTitles = 'const titles = ["月の版画", "森の冊子", "星の栞"];';
const edgeCalls = 'edges(["池"]);\nedges(["星", "森", "月"]);';
const deckFixture = 'const cards = makeDeck();\nshowCard(cards, 0);\nshowCard([cards[1], cards[0]], 0);\nshowCard([cards[1]], 0);';
const deckSource = 'function makeDeck() {\n  return [\n    { title: "港の版画", answer: "青" },\n    { title: "森の本", answer: "木" }\n  ];\n}';
const showCardSource = 'function showCard(cards, index) {\n  const { title, answer } = cards[index];\n  console.log(title);\n  console.log(answer);\n}';

const javascriptCardLessons = [
  {
    id: "js-title-list", topic: "問題をまとめる", title: "問題の名前を一つの一覧にする",
    goal: "一つの名前で、順番のある複数の値を扱う。",
    slides: [
      { title: "展示を回る順に名前を書き留める", body: "「月の版画」「森の冊子」「星の栞」の順にクイズを出します。[ と ] の中に、値をカンマで区切って並べます。この順番付きの一覧を配列と呼びます。見本のコンソールには三つの名前が入った一つの配列が出ます。", code: exhibitionTitles + "\nconsole.log(titles);" },
      { title: "一問だけでも同じ形", body: "問題が一つだけの日も、角かっこで囲むと一件の配列になります。文字の「月」と、一件だけ入った配列をコンソールで見比べてみましょう。", code: 'console.log("月");\nconsole.log(["月"]);' },
    ],
    quiz: { prompt: "「紙」「木」の順に入った一つの配列は？", options: ['"紙、木"', '["紙", "木"]', '["木", "紙"]', '"紙"'], correct: 1,
      reasons: ["一続きの文字です。","角かっこの中に二つの値が順に並んでいます。","木が先に並んでいます。","一件の文字だけです。"] },
    exercise: { field: "javascript", task: "夜の展示は「街灯」「夜空」「朝霧」の順です。titles を三つの文字を持つ配列にし、その配列を一回コンソールに出してください。",
      code: 'const titles = "街灯、夜空、朝霧";\nconsole.log(titles);', answer: 'const titles = ["街灯", "夜空", "朝霧"];\nconsole.log(titles);', review: 0,
      hint: "三つの名前を個別に引用符で囲み、角かっこの中でカンマで区切ります。",
      build: { code: 'const titles = ["①", "②", "朝霧"];\nconsole.log(titles);', slots: [["一問目", "夜空", "街灯"], ["二問目", "街灯", "夜空"]] },
      expected: () => [["街灯","夜空","朝霧"]], hints: ["一続きの文字ではなく、街灯・夜空・朝霧をこの順に入れた一つの配列を表示しましょう。"] },
  },
  {
    id: "js-list-position", topic: "一覧の位置", title: "先頭と末尾の問題を読む",
    goal: "配列の位置が0から始まることを確かめ、何件あっても最後の問題を選ぶ。",
    slides: [
      { title: "一問目の位置は0", body: "titles[0] は、配列 titles の先頭を読む書き方です。角かっこの中の位置を添字と呼びます。二問目の添字は1です。見本で二行を比べましょう。", code: exhibitionTitles + "\nconsole.log(titles[0]);\nconsole.log(titles[1]);" },
      { title: "末尾から数える", body: "titles.at(-1) は配列の末尾から一つ目を読みます。件数を数えなくても最後の一問に届きます。問題が一つだけなら先頭と末尾は同じ問題です。", code: 'const titles = ["池"]; \nconsole.log(titles[0]);\nconsole.log(titles.at(-1));' },
    ],
    quiz: { prompt: '["月", "森", "星"] の .at(-1) で読める名前は？', options: ["月", "森", "星", "空の文字"], correct: 2, reasons: ["月は添字0の先頭です。","森は二件目です。","末尾から一つ目に星があります。","この配列には問題が入っています。"] },
    exercise: { field: "javascript", task: "edges は渡された問題一覧の先頭、次に末尾を一行ずつ表示します。一問だけの「池」でも三問の一覧でも使えるようにしてください。",
      code: "function edges(titles) {\n  console.log(titles[0]);\n  console.log(titles[1]);\n}", answer: "function edges(titles) {\n  console.log(titles[0]);\n  console.log(titles.at(-1));\n}", calls: edgeCalls, review: 1,
      hint: "件数が変わるので、最後の位置を固定しない書き方が使えます。",
      build: { code: "function edges(titles) {\n  console.log(titles[①]);\n  console.log(titles.at(②));\n}", slots: [["先頭の位置", "0", "1"], ["後ろから一つ目", "-1", "1"]] },
      expected: () => ["池","池","星","月"], hints: ["一問だけの一覧では先頭の「池」を出しましょう。","最初の表示はできました。一問だけなら末尾も「池」です。","三問に変わったら新しい一覧の先頭を読みます。","最後に、三問の一覧の末尾「月」を表示しましょう。"] },
  },
  {
    id: "js-each-title", topic: "一覧を順に読む", title: "問題を一件ずつ読み上げる",
    goal: "件数に合わせて同じ表示を繰り返し、問題の並び順を保つ。",
    slides: [
      { title: "今の一問だけに名前を付ける", body: "for (const title of titles) は、一覧 titles の先頭から値を一つずつ title に受け取ります。中の表示は問題の数だけ実行されます。", code: exhibitionTitles + "\nfor (const title of titles) {\n  console.log(title);\n}" },
      { title: "並べ替えた原稿をそのまま読む", body: "問題数も順番も、渡された配列で決まります。まず一問、次に順番を変えた二問を渡します。関数の中の表示は同じ一行のままです。", code: 'function read(titles) {\n  for (const title of titles) {\n    console.log(title);\n  }\n}\nread(["森"]);\nread(["森", "月"]);' },
    ],
    quiz: { prompt: '["栞", "版画"] を for...of で読むと、初回に受け取る値は？', options: ["0", "配列全体", "版画", "栞"], correct: 3, reasons: ["この書き方で受け取るのは添字ではなく値です。","一回には一件だけ受け取ります。","版画は二回目です。","並びの先頭にある栞です。"] },
    exercise: { field: "javascript", task: "readAll が渡された問題名を、先頭から一行ずつ表示するようにしてください。一問でも三問でも、原稿の順にすべて読みます。",
      code: "function readAll(titles) {\n  console.log(titles[0]);\n}", answer: "function readAll(titles) {\n  for (const title of titles) {\n    console.log(title);\n  }\n}", calls: 'readAll(["池"]);\nreadAll(["月", "星", "森"]);', review: 0,
      hint: "for...of の中の表示で一件ずつ受け取った名前を使います。",
      build: { code: "function readAll(titles) {\n  for (const title ① titles) {\n    console.log(②);\n  }\n}", slots: [["一覧から受け取る指定", "of", "in"], ["今の一問", "titles", "title"]] },
      expected: () => ["池","月","星","森"], hints: ["一問の原稿から先頭を表示しましょう。","三問の原稿の一件目を読みましょう。","先頭は読めました。繰り返して二件目も表示しましょう。","最後の問題まで原稿の順に表示します。"] },
  },
  {
    id: "js-card-fields", topic: "一問の中身", title: "問題の題名と答えを一組にする",
    goal: "一問分の値に項目名を付け、欲しい項目を名前で読む。",
    slides: [
      { title: "題名を動かしても答えがついてくる形", body: "同じ問題の題名と答えを波かっこの中にまとめます。title と answer は項目の名前です。項目名の右にコロンを置き、その項目の値を書きます。このように項目名と値を組にしたものをオブジェクトと呼びます。", code: 'const card = { title: "夜空の色", answer: "紺" };\nconsole.log(card);' },
      { title: "ドットの後に欲しい名前を書く", body: "card.answer は、カードから answer の値だけを読む書き方です。項目が書かれた順番を変えても、その名前を使えば同じ答えを読めます。", code: 'const card = { answer: "紺", title: "夜空の色" };\nconsole.log(card.title);\nconsole.log(card.answer);' },
    ],
    quiz: { prompt: 'card = { title: "栞の色", answer: "赤" } のとき、「赤」を読む式は？', options: ["card.answer", "card.title", '"answer"', "card[0]"], correct: 0, reasons: ["答えの項目を名前で読めます。","題名の「栞の色」を読みます。","項目名と同じ文字になります。","このオブジェクトに0という項目はありません。"] },
    exercise: { field: "javascript", task: "makeCard が、渡された題名を title、答えを answer として一問にまとめ、返すようにしてください。確認用コードが二つのカードから題名と答えを読みます。",
      code: "function makeCard(name, reply) {\n  return { title: name, answer: name };\n}", answer: "function makeCard(name, reply) {\n  return { title: name, answer: reply };\n}",
      calls: 'const first = makeCard("月の色", "黄");\nconst next = makeCard("木の実", "栗");\nconsole.log(first.title);\nconsole.log(first.answer);\nconsole.log(next.answer);', review: 1,
      hint: "項目名はそのまま使い、値を引数から読みます。", build: { code: "function makeCard(name, reply) {\n  return { title: ①, answer: ② };\n}", slots: [["題名の値", "name", "reply"], ["答えの値", "name", "reply"]] },
      expected: () => ["月の色","黄","栗"], hints: ["一件目の題名を title に入れましょう。","題名はできました。answer にその問題の答えを入れましょう。","別のカードの答えも、渡された reply から取りましょう。"] },
  },
  {
    id: "js-unpack-card", topic: "必要な項目だけ読む", title: "カードから表示名だけを取り出す",
    goal: "項目名を指定してオブジェクトから値を受け取る。",
    slides: [
      { title: "表示する題名だけが欲しい", body: "const { title } = card; は card の title を読んで、同じ名前で使えるようにする一行です。このように、まとまりの中から欲しい値を受け取る書き方を分割代入と呼びます。", code: 'const card = { title: "水面", answer: "銀" };\nconst { title } = card;\nconsole.log(title);' },
      { title: "順番が違っても名前で届く", body: "答えが先に書かれたカードでも、波かっこの中で title を指定すると題名が届きます。二つの項目が欲しいときはカンマで並べます。", code: 'const card = { answer: "紙", title: "栞の素材" };\nconst { title, answer } = card;\nconsole.log(title);\nconsole.log(answer);' },
    ],
    quiz: { prompt: "題名だけを title として受け取る書き方は？", options: ["const { answer } = card;", "const { title } = card;", 'const title = "card";', "const title = 0;"], correct: 1, reasons: ["答えを読みます。","項目名 title を指定しています。","card と同じつづりの文字です。","固定の数を入れています。"] },
    exercise: { field: "javascript", task: "showName がカードから title を取り出し、題名だけを一行表示するようにしてください。確認用コードは項目の順が違う二問を渡します。",
      code: "function showName(card) {\n  const { answer } = card;\n  console.log(answer);\n}", answer: "function showName(card) {\n  const { title } = card;\n  console.log(title);\n}", calls: 'showName({ title: "月", answer: "黄" });\nshowName({ answer: "栗", title: "森" });', review: 0,
      hint: "波かっこの中の項目名と、次の行で表示する名前をそろえます。",
      build: { code: "function showName(card) {\n  const { ① } = card;\n  console.log(②);\n}", slots: [["欲しい項目名", "answer", "title"], ["表示する名前", "answer", "title"]] },
      expected: () => ["月","森"], hints: ["答えの「黄」ではなく、題名の「月」を出しましょう。","項目の順が変わっても、名前 title から題名を読みましょう。"] },
  },
  {
    id: "js-question-deck", topic: "問題集の仕上げ", title: "並び替えても題名と正答を一緒に読む",
    goal: "問題一覧を自分で作り、位置で一件を選んで、その中の項目を名前で読む。",
    slides: [
      { title: "位置で一問を選び、名前で中身を読む", body: "cards[1] で一覧から二問目を選んでから、title と answer を取り出します。先にどの一問か、次にどの項目かを決める二段階です。", code: 'const cards = [{ title: "窓", answer: "四角" }, { title: "月", answer: "丸" }];\nconst { title, answer } = cards[1];\nconsole.log(title);\nconsole.log(answer);' },
      { title: "順番を変えたら一問目の名前も変わる", body: "二問目だった月のカードを先頭にした一覧を作ります。先頭を読み直すと題名も答えも月の組に入れ替わります。一件だけの一覧でも同じ手順です。", code: 'const windowCard = { title: "窓", answer: "四角" };\nconst moonCard = { title: "月", answer: "丸" };\nconst cards = [moonCard, windowCard];\nconsole.log(cards[0].title);\nconsole.log(cards[0].answer);' },
    ],
    quiz: { prompt: "並びが変わっても、選んだ一問の正答を読む順序は？", options: ["答えを固定してから位置を選ぶ","毎回先頭の答えを読む","位置でカードを選んで、その answer を読む","一覧全体を文字にする"], correct: 2, reasons: ["別の問題の答えになるかもしれません。","選んだのが二問目なら一致しません。","同じカードの題名と答えをまとめて使えます。","具体的な一問の答えを選べません。"] },
    exercise: { field: "javascript", task: "原稿は一問目が「港の版画」／答え「青」、二問目が「森の本」／答え「木」です。makeDeck で二問をこの順に返し、showCard では渡された位置の題名と答えを二行に出してください。別の順や一問だけでも確かめます。",
      code: deckSource.replace('title: "森の本", answer: "木"', 'title: "森の本", answer: "青"') + "\n" + showCardSource.replace("cards[index]", "cards[0]"),
      answer: deckSource + "\n" + showCardSource, calls: deckFixture + "\nshowCard(cards, 1);", review: 0,
      hint: "二問目の答えを原稿とそろえ、cards の角かっこの中で引数 index を使いましょう。",
      build: { code: deckSource.replace('answer: "木"', 'answer: "①"') + "\n" + showCardSource.replace("cards[index]", "cards[②]"),
        slots: [["森の本の正答", "青", "木"], ["読む位置を指定する値", "0", "index"]] },
      expected: () => ["港の版画","青","森の本","木","森の本","木","森の本","木"], hints: ["一問目の題名を読めるようにしましょう。","一問目の正答は「青」です。","並べ替えた一覧の先頭は「森の本」です。","二問目の題名はできました。答えには「木」を入れましょう。","一問だけの一覧の先頭も読めるようにしましょう。","その一問と同じカードから答えを読みます。","先頭だけでなく、引数が1なら二問目を選びましょう。","二問目の答え「木」を同じカードから表示しましょう。"] },
  },
];
