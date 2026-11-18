"use strict";

const printTitle = 'import { title } from "./questions.js";\nconsole.log(title);';
const addScores = 'import { score } from "./score.js";\nconsole.log(score(2, 3));\nconsole.log(score(5, 1));';
const validatePoints = 'export function check(points) {\n  if (points < 0) {\n    throw new Error("配点は0以上です");\n  }\n  return points;\n}';
const tryPoints = 'import { check } from "./score.js";\nfor (const points of [3, -1, 0]) {\n  try {\n    console.log(check(points));\n  } catch (error) {\n    console.log(error.message);\n  }\n}';
const deskFile = 'export const cards = [\n  { title: "舟", points: 2 },\n  { title: "窓", points: 5 }\n];';
const auditFile = 'import { cards } from "./questions.js";\nimport { check } from "./score.js";\nfor (const card of cards) {\n  console.log(card.title);\n  console.log(check(card.points));\n}';

const javascriptModuleLessons = [
  {
    id: "js-file-value", title: "隣のファイルから題名を読む", topic: "ファイルを分ける",
    goal: "questions.js にある題名を main.js で読み込み、コンソールに表示する。",
    slides: [
      { title: "questions.js の title をほかのファイルでも使う", body: "展示の題名を questions.js に置きました。export は「この名前をほかのファイルでも使えます」という印です。main.js を開くと、ここで用意した title を読んで表示する行があります。", filename: "questions.js", files: { "main.js": printTitle }, code: 'export const title = "月の切手";' },
      { title: "どのファイルの、どの名前？", body: "import の波かっこに、読みたい名前を書きます。from の後の ./ は同じ場所のファイルを指します。questions.js と title の両方が合っているので、実行すると「森の本」と表示されます。", filename: "main.js", files: { "questions.js": 'export const title = "森の本";' }, code: printTitle },
    ],
    quiz: { prompt: '「./question.js が見つかりません」と出ました。題名を書いたファイルが questions.js なら、最初に見直すのは？', options: ["点数", "from の後のファイル名", "文字の色", "console.log の個数"], correct: 1,
      reasons: ["点の計算はまだ始まっていません。","実際のファイル名に合わせて ./questions.js と指定します。","見た目の指定は読み込み先を変えません。","まず読み込み先を見つけます。"] },
    exercise: { field: "javascript", filename: "main.js", files: { "questions.js": 'export const title = "星のしおり";' },
      task: "main.js の読み込み先を直し、questions.js の title を表示してください。コンソールに「星のしおり」が一行出れば成功です。",
      code: printTitle.replace("./questions.js","./question.js"), answer: printTitle, review: 1,
      hint: "「questions.js を読む」を開き、ファイル名と export の後の名前を見比べましょう。",
      build: { code: 'import { ① } from "②";\nconsole.log(title);', slots: [["questions.js から読み込む名前", "name", "title"], ["題名が入るファイル", "./questions.js", "./question.js"]] },
      expected: () => ["星のしおり"], hints: ["questions.js から読み込んだ title を表示しましょう。"],
      moduleTrial: { files: { "questions.js": 'export const title = "水辺の舟";' }, values: ["水辺の舟"], hint: "最初の題名は表示できました。questions.js の題名が変わっても、その title を読み込んで表示しましょう。" } },
  },
  {
    id: "js-file-score", title: "score.js の関数を main.js から呼ぶ", topic: "ファイルを分ける",
    goal: "score.js の関数を読み込み、二組の点数をそれぞれ合計する。",
    slides: [
      { title: "export で関数をほかのファイルでも使う", body: "score.js には、今の点とボーナスを足す関数を書きます。function の前に export を付けると、別のファイルから score という名前で呼べます。", filename: "score.js", files: { "main.js": addScores }, code: "export function score(now, bonus) {\n  return now + bonus;\n}" },
      { title: "受け取った関数は、丸かっこを付けて呼ぶ", body: "main.js は計算の中身を持たなくても、読み込んだ score に二つの値を渡せます。3点と1点の別々のボーナスをどちらも試しましょう。", filename: "main.js", files: { "score.js": "export const score = (now, bonus) => now + bonus;" }, code: addScores },
    ],
    quiz: { prompt: "ファイルは見つかりましたが「その名前の export がありません」と出ました。次に見るのは？", options: ["開始点の値", "行の色", "import の名前と export の名前", "空行の数"], correct: 2,
      reasons: ["名前が見つかった後に値を調べます。","読み込む名前には影響しません。","score と scores のような違いを調べます。","名前は空行の数で変わりません。"] },
    exercise: { field: "javascript", filename: "score.js", files: { "main.js": addScores },
      task: "main.js は score という名前の関数を読み込みます。score.js の関数名を合わせてください。実行すると score(2, 3) は5、score(5, 1) は6を返します。",
      code: "export function scores(now, bonus) {\n  return now + bonus;\n}", answer: "export function score(now, bonus) {\n  return now + bonus;\n}", review: 0, hint: "main.js が import で受け取る名前を確かめましょう。",
      build: { code: "① function ②(now, bonus) {\n  return now + bonus;\n}", slots: [["他のファイルへ渡せるようにする印", "export", "import"], ["呼ばれる名前", "scores", "score"]] },
      expected: () => [5,6], hints: ["2点に3を加えて5を返しましょう。","一回目はできました。別の引数でも渡された二つの点を足しましょう。"] },
  },
  {
    id: "js-throw", title: "負の配点をエラーにする", topic: "間違いを知らせる",
    goal: "正常な値は返し、負の配点だけは理由を付けて呼び出し元に知らせる。",
    slides: [
      { title: "配点に負の数が渡されたら？", body: "check は0以上の点数をそのまま返します。負の数なら throw で処理を中断します。new Error の丸かっこの中に、エラーの理由を書きます。", filename: "score.js", files: { "main.js": 'import { check } from "./score.js";\nconsole.log(check(3));' }, code: validatePoints },
      { title: "エラーのファイル名・行番号・理由を読む", body: "今度は -1 を渡します。score.js で理由を送る行に来たため、普通の戻り値は表示されません。ファイル名、行、理由を読んでください。", filename: "main.js", files: { "score.js": validatePoints }, code: 'import { check } from "./score.js";\nconsole.log(check(-1));' },
    ],
    quiz: { prompt: "負の点を見つけた時点で通常の採点を終え、理由を送る行は？", options: ['console.log("負の点");', "return 0;", "const points = 0;", 'throw new Error("負の点");'], correct: 3,
      reasons: ["文字は出ますが処理はそのまま続きます。","正常な0点に見えてしまいます。","元の問題の異常を知らせられません。","通常の計算を中断し、その理由を呼んだ側へ送ります。"] },
    exercise: { field: "javascript", filename: "score.js", files: { "main.js": tryPoints }, task: "0点は正常な配点です。負の数だけ理由「配点は0以上です」を送り、3と0はそのまま返すように条件を直してください。用意した呼び出し元が順に結果を表示します。",
      code: validatePoints.replace("points < 0","points <= 0"), answer: validatePoints, review: 0, hint: "0を異常に含めず、0より小さい場合を調べます。",
      build: { code: validatePoints.replace("points < 0", "points ① 0").replace("throw new Error", "② new Error"), slots: [["異常にする範囲", "<", "<="], ["理由を送って止める指定", "return", "throw"]] },
      expected: () => [3,"配点は0以上です",0], hints: ["正常な3点をそのまま返しましょう。","負の点では「配点は0以上です」というエラーを出しましょう。","負の点の扱いはできました。0点は正常なので数の0を返します。"] },
  },
  {
    id: "js-catch", title: "エラーの理由を表示し、次の配点を調べる", topic: "間違いを知らせる",
    goal: "使えない一問の理由を表示し、その次の正常な問題へ進む。",
    slides: [
      { title: "try で関数を呼び、catch でエラーを受け取る", body: "try の中で関数を呼び、問題が起きたときだけ catch に進みます。catch (error) で受け取ったエラーの理由は、error.message で読めます。", filename: "main.js", files: { "score.js": validatePoints }, code: 'import { check } from "./score.js";\ntry {\n  console.log(check(-2));\n} catch (error) {\n  console.log(error.message);\n}' },
      { title: "異常な一問の次も確認する", body: "一問ごとに try と catch を使うと、真ん中の配点で理由を受け取ったあとに、最後の0点も読めます。三行のどれが理由で、どれが数かを見比べてください。", filename: "main.js", files: { "score.js": validatePoints }, code: tryPoints },
    ],
    quiz: { prompt: "チェック中に例外が起きたとき、その理由を受け取る場所は？", options: ["catch の中", "import の中", "配列の先頭", "return の後"], correct: 0, reasons: ["catch が理由を受け取って、案内の行を実行できます。","import はファイルから名前を読みます。","配列の位置とは別です。","return を実行すると関数は終わります。"] },
    exercise: { field: "javascript", filename: "main.js", files: { "score.js": validatePoints }, task: "3点、-1点、0点を読みます。エラーの回だけ「未確認」を実際に届いた理由へ変え、次の0点まで表示してください。",
      code: tryPoints.replace("console.log(error.message)", 'console.log("未確認")'), answer: tryPoints, review: 1, hint: "catch が受け取った error の message を表示します。",
      build: { code: tryPoints.replace("catch (error)", "① (error)").replace("console.log(error.message)", "console.log(②)"), slots: [["理由を受け取る場所", "catch", "if"], ["届いた理由", '"未確認"', "error.message"]] },
      expected: () => [3,"配点は0以上です",0], hints: ["正常な一問の点を表示しましょう。","最初の点は読めました。固定の言葉を、届いたエラーの理由に変えましょう。","理由の次も処理を続け、0点を表示しましょう。"],
      moduleTrial: { files: { "score.js": validatePoints.replace("配点は0以上です", "原稿を確認") }, values: [3,"原稿を確認",0], hint: "点は合っています。エラーメッセージが変わっても、その回の error.message を表示しましょう。" } },
  },
  {
    id: "js-file-audit", title: "問題集を読み込み、一問の配点を直す", topic: "ファイルの中の値を調べる",
    goal: "読んだ値と予想した値を比べ、別ファイルの誤った配点だけを修正する。",
    slides: [
      { title: "読み込めたのに、合計が違う", body: "ファイル名と公開名が合っているのでプログラムは動いています。舟は2点、窓は5点で、正しい合計は7点です。予想、各問の点、実際の合計の順に出すと、違いが窓の配点にあると分かります。", filename: "main.js", files: { "questions.js": deskFile.replace("points: 5","points: 3") }, code: 'import { cards } from "./questions.js";\nconsole.log("予想", 7);\nfor (const card of cards) console.log(card.title, card.points);\nconsole.log("実際", cards[0].points + cards[1].points);' },
      { title: "questions.js の配点を直して再実行", body: "questions.js の窓の点を5にして実行すると、最後の行に合計の7が出ます。次の練習では問題集の見本を手元に保存し、そのファイルを読み込んで修正できます。", filename: "questions.js", files: { "main.js": auditFile + "\nconsole.log(cards[0].points + cards[1].points);", "score.js": validatePoints }, code: deskFile },
    ],
    quiz: { prompt: "予想7、実際5と出て、舟が2点、窓が3点でした。窓を5点に直すには、最初にどこを調べる？", options: ["catch の名前", "ファイルの拡張子", "questions.js の窓の points", "全部の行を消す"], correct: 2, reasons: ["例外の発生は報告されていません。","読み込み済みの二件が表示されています。","どのカードの実際の値が違うか分かっています。","正しい舟はそのまま残せます。"] },
    exercise: { field: "javascript", filename: "questions.js", importFile: true, files: { "main.js": auditFile, "score.js": validatePoints },
      task: "正しい配点は「舟」が2点、「窓」が5点です。questions.js の誤りを一件直し、二問の題名と点を確かめてください。「問題集の見本を保存」から手元に置いたファイルも読み込めます。",
      code: deskFile.replace("points: 5","points: 3"), answer: deskFile, review: 0, hint: "舟の題名と点が合っていたら、窓の points の数字を確認します。",
      build: { code: deskFile.replace('title: "窓", points: 5','title: "①", points: ②'), slots: [["二問目の題名", "舟", "窓"], ["窓の配点", "3", "5"]] },
      expected: () => ["舟",2,"窓",5], hints: ["一問目の題名は舟です。","舟の点は2です。","舟は合っています。二問目の題名を窓にしましょう。","舟は合っています。窓の配点は5になるように直しましょう。"] },
  },
];
