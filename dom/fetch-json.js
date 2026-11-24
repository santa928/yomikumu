"use strict";

const readingHtml = `<label for="reading-mode">試すデータ</label>
<select id="reading-mode">
  <option value="normal">本がある棚</option>
  <option value="other">別の本がある棚</option>
  <option value="empty">空の棚</option>
  <option value="retry">最初だけファイルが見つからない</option>
</select>
<p><button id="load" type="button">棚を読み込む</button></p>
<p id="result" role="status">棚を読み込んでください。</p>`;

const readingSetup = `
// 画面で選んだ条件を教材のファイル名にする。
const readingMode = document.querySelector("#reading-mode");
let firstAttempt = true;
readingMode.addEventListener("change", () => { firstAttempt = true; });
function nextReadingFile() {
  if (readingMode.value === "empty") return "data/empty.json";
  if (readingMode.value === "other") return "data/other.json";
  if (readingMode.value === "retry" && firstAttempt) {
    firstAttempt = false;
    return "data/missing.json";
  }
  return "data/reading.json";
}

function waitForReading(check) {
  return new Promise(resolve => {
    const result = document.querySelector("#result");
    const button = document.querySelector("#load");
    const interval = setInterval(update, 25);
    const timer = setTimeout(() => finish(false), 2500);
    function finish(ok) {
      clearTimeout(timer);
      clearInterval(interval);
      resolve(ok);
    }
    function update() {
      if (check(result.textContent, button.disabled)) finish(true);
    }
    update();
  });
}

function waitForReadingTitles(path, emptyText = "", requireReady = false) {
  return waitForReading((text, disabled) => {
    const reply = readingReply(path);
    if (!reply || reply.status < 200 || reply.status >= 300 || (requireReady && disabled)) return false;
    try {
      const titles = JSON.parse(reply.body);
      return Array.isArray(titles) && titles.every(title => typeof title === "string")
        && text === (titles.length ? titles.join(" / ") : emptyText);
    } catch { return false; }
  });
}`;

const readingBindings = `const button = document.querySelector("#load");
const result = document.querySelector("#result");`;
const readingClick = readingBindings + `

button.onclick = async () => {
  const response = await fetch(nextReadingFile());`;
const statusModel = readingClick + `
  result.textContent = response.status;
};`;
const okModel = readingClick + `
  result.textContent = response.ok ? "読めます" : "読めません";
};`;
const dataModel = readingClick + `
  if (!response.ok) return;
  const books = await response.json();
  result.textContent = books.join(" / ");
};`;
const emptyModel = readingClick + `
  if (!response.ok) {
    result.textContent = "HTTP " + response.status;
    return;
  }
  const books = await response.json();
  result.textContent = books.length ? books.join(" / ") : "本はまだありません";
};`;
const finishModel = readingBindings + `

button.onclick = async () => {
  button.disabled = true;
  result.textContent = "読み込み中";
  try {
    const response = await fetch(nextReadingFile());
    if (!response.ok) throw Error("HTTP " + response.status);
    const books = await response.json();
    result.textContent = books.length ? books.join(" / ") : "本はまだありません";
  } catch (error) {
    result.textContent = error.message + "。もう一度押してください";
  } finally {
    button.disabled = false;
  }
};`;

function readingLocalGuide() {
  const guide = node("details");
  guide.append(node("summary", "PCでJSONを書き換える"));
  const download = node("a", "教材ソースのZIPをダウンロード");
  download.href = "https://github.com/santa928/yomikumu/archive/refs/heads/main.zip";
  const prepare = node("li");
  prepare.append(download, "して展開します。DockerとComposeが使えるPCで、compose.yaml があるフォルダーをターミナルで開きます。");
  const serve = node("li", "次のコマンドで教材を配信します。初回はDockerのイメージの取得に通信が必要です。");
  serve.append(node("pre", "docker compose up web"));
  const open = node("a", "手元のJSON実習を開く");
  open.href = "http://localhost:8080/dom/index.html#fetch-json";
  const before = node("li");
  before.append(open, "を選びます。完成例で「本がある棚」を選び、「棚を読み込む」を押して、今の2冊を確認します。");
  const edit = node("li", "展開したフォルダーの dom/data/reading.json をテキストエディターで開き、2冊のタイトルを書き換えて保存します。角括弧 []、タイトルを囲む半角の二重引用符、間のコンマを残します。");
  edit.append(node("pre", '["朝の時計", "帰り道の雲"]'));
  const after = node("li", "同じページで「棚を読み込む」をもう一度押します。この例なら「朝の時計 / 帰り道の雲」と表示されます。終わったらターミナルで Ctrl+C を押します。");
  const steps = node("ol");
  steps.append(prepare, serve, before, edit, after);
  guide.append(steps);
  return guide;
}

const readingUnit = {
  id: "fetch-json",
  title: "サーバーからデータを取得して一覧に表示する",
  intro: "JSONは文字や数、一覧をテキストにしてやり取りする形式です。練習ではサーバーに置いた本の一覧をブラウザから読み込み、画面に表示します。公開教材から開けばそのまま試せます。手元の index.html をダブルクリックして開くと、ブラウザの制限で JSON を取得できないため、手元ではウェブサーバー経由で開いてください。手元でデータを変える手順は「PCでJSONを書き換える」にあります。",
  guide: readingLocalGuide,
  setup: readingSetup,
  frame: readingFrame,
  demo: {
    html: readingHtml,
    code: finishModel,
    tip: "「最初だけファイルが見つからない」を選び、二度押して読書棚が出るまでを試しましょう。「空の棚」も選んで、404のときとの違いを確認できます。教材ページが実際にHTTPで応答を受け取り、練習画面のfetchに応答番号と本文を渡します。",
  },
  steps: [
    {
      title: "応答の番号で、取得の結果を知る（fetch）",
      html: readingHtml,
      explain: "fetchにファイル名を渡すと、ブラウザはサーバーにそのファイルを求めます。awaitで返事を待ち、response.statusで応答番号を読みます。番号は返事の種類を表し、たとえば200なら取得成功、404ならファイルが見つからなかったことを表します。見本は data/reading.json を指定しているので、棚を選び直して押しても200です。nextReadingFile()を使うと、代わりに選んだ棚のファイル名を渡せます。",
      example: statusModel.replace("nextReadingFile()", '"data/reading.json"'),
      question: "200が入っているものはどれですか。",
      options: ["response.status", "ファイル名", "本の配列", "ボタンの文字"],
      correct: 0,
      feedback: "応答の番号はresponse.statusで読みます。",
      task: "選択欄に対応するファイル名を返す nextReadingFile() は用意済みです。そのファイル名を fetch に渡し、応答番号を表示します。「空の棚」では200、「最初だけファイルが見つからない」の最初の操作では404です。",
      starter: readingClick + `
  result.textContent = response.ok;
};`,
      build: [statusModel.replace("response.status", "response.《1》"), ["status", "ok"]],
      tests: [
        [async t => { t.q("#reading-mode").value = "empty"; t.click("#load"); return waitForReading(text => text === "200"); }, "空の棚の応答番号は200です。response.statusを確認しましょう。"],
        [async t => { t.q("#reading-mode").value = "retry"; t.click("#load"); return waitForReading(text => text === "404"); }, "最初の試行はサーバーが404を返します。届いた番号を表示しましょう。"],
      ],
    },
    {
      title: "取得に成功したかを調べる（response.ok）",
      html: readingHtml,
      explain: "ファイルが見つからないと、サーバーから 404（見つからない）という返事が届きます。返事は届いたので await fetch(...) の次の行へ進みますが、response.ok は false です。200番台なら true です。通信が切れて返事が届かなかった場合は、await fetch(...) がエラーになります。",
      example: readingClick + `
  result.textContent = response.ok;
};`,
      question: "サーバーから404が届いたとき、response.okは何になりますか。",
      options: ["true", "false", "404", "ファイル名"],
      correct: 1,
      feedback: "404も応答です。response.okがfalseなので、本文を読む前に失敗時の処理へ進めます。",
      task: "response.okを使い、読み進められる応答では「読めます」、404では「読めません」と表示します。",
      starter: statusModel,
      build: [okModel.replace("response.ok", "response.《1》"), ["ok", "status"]],
      tests: [
        [async t => { t.click("#load"); return waitForReading(text => text === "読めます"); }, "200のときは「読めます」と表示しましょう。"],
        [async t => { t.q("#reading-mode").value = "retry"; t.click("#load"); return waitForReading(text => text === "読めません"); }, "404のときはresponse.okがfalseです。「読めません」と表示しましょう。"],
      ],
    },
    {
      title: "届いたJSONを配列として読み込む",
      html: readingHtml,
      explain: 'JSONはデータを文字で書き表す形式です。配布時の data/reading.json の本文は ["雲の地図", "星の台所"] です。await response.json() で本文をJavaScriptの配列に変え、books[0] で最初の本を読めます。別の棚を選ぶと別のJSONが届きます。',
      example: dataModel.replace('books.join(" / ")', "books[0]"),
      question: 'books が ["風の標本", "星の台所"] のとき、books[0] はどれですか。',
      options: ["200", "雲の地図", "風の標本", "空の配列"],
      correct: 2,
      feedback: "添字0は、配列の最初の要素を指します。",
      task: '成功のときだけ response.json() で配列を読み、本を「 / 」でつないで表示します。例は「雲の地図 / 星の台所」です。',
      starter: dataModel.replace("await response.json()", "response"),
      build: [dataModel.replace("await response.json()", "《1》"), ["await response.json()", "response"]],
      tests: [
        [async t => { t.click("#load"); return waitForReadingTitles("data/reading.json"); }, "await response.json()で本文を配列に変え、届いたタイトルを「 / 」でつなぎましょう。"],
        [async t => { t.q("#reading-mode").value = "other"; t.click("#load"); return waitForReadingTitles("data/other.json"); }, "別の棚を選んだら、その応答の配列からタイトルを読みましょう。"],
      ],
    },
    {
      title: "一覧が空の場合とファイルがない場合を分ける",
      html: readingHtml,
      explain: "空の棚のJSONは [] です。200で応答が届き、配列のlengthが0です。404では、先にresponse.okを調べて失敗と分かるため、応答の本文を本の配列として読みません。",
      example: emptyModel,
      question: "「本はまだありません」と表示する条件はどれですか。",
      options: ["どの応答でも", "応答が404", "通信の途中", "成功し、配列の件数が0"],
      correct: 3,
      feedback: "棚を読むことに成功したあと、配列の件数を見て空だと判断します。",
      task: "空の配列には「本はまだありません」、本がある場合は本の名前、404には「HTTP 404」を表示します。",
      starter: emptyModel.replace('books.length ? books.join(" / ") : "本はまだありません"', 'books.join(" / ")'),
      build: [emptyModel.replace("books.length ?", "《1》 ?"), ["books.length", "!books.length"]],
      tests: [
        [async t => { t.q("#reading-mode").value = "empty"; t.click("#load"); return waitForReadingTitles("data/empty.json", "本はまだありません"); }, "応答が成功したら、配列の件数に応じてタイトルか0件の案内を表示しましょう。"],
        [async t => { t.q("#reading-mode").value = "retry"; t.click("#load"); return waitForReading(text => text === "HTTP 404"); }, "失敗時には番号を表示し、JSONを読まずに処理を終えましょう。"],
        [async t => { t.q("#reading-mode").value = "other"; t.click("#load"); return waitForReadingTitles("data/other.json", "本はまだありません"); }, "配列の件数が1以上なら、その本の名前を表示しましょう。"],
      ],
    },
    {
      title: "練習：成功・失敗を表示して、もう一度取得できるようにする",
      html: readingHtml,
      explain: "押したら待機中の表示にし、ボタンを一時的に止めます。response.okがfalseの場合はthrowでcatchの処理へ進めます。成功しても失敗してもfinallyでボタンを戻せば、同じボタンから読み直せます。「最初だけファイルが見つからない」では、ひと押し目が404で、次は本がある棚を読みます。",
      example: finishModel,
      question: "成功したあとも失敗したあとも、ボタンを使えるようにする行はどこに書きますか。",
      options: ["finally", "fetchより前だけ", "成功時の表示の直後だけ", "catchの中だけ"],
      correct: 0,
      feedback: "finallyは成功時にも失敗時にも実行されます。",
      task: "待機中は「読み込み中」と表示して連打を止めます。404なら「HTTP 404。もう一度押してください」と案内します。空の成功と本がある成功を分け、どの結果でも次に押せるようにしてください。",
      showPieceLines: true,
      starter: finishModel.replace('if (!response.ok) throw Error("HTTP " + response.status);', "// 応答が失敗したら、番号を付けてcatchへ移す。")
        .replace("button.disabled = false;", "// 成功したあとも失敗したあとも、ボタンを使える状態に戻す。"),
      build: [finishModel.replace("!response.ok", "《1》").replace("button.disabled = false;", "button.disabled = 《2》;"),
        ["!response.ok", "response.ok"], ["false", "true"]],
      tests: [
        [t => { t.q("#reading-mode").value = "retry"; t.click("#load"); return t.q("#load").disabled && t.q("#result").textContent === "読み込み中"; }, "待っている間は「読み込み中」と表示し、ボタンを止めましょう。"],
        [async () => waitForReading(text => text === "HTTP 404。もう一度押してください"), "ファイルがないときに「HTTP 404。もう一度押してください」と表示しましょう。"],
        [t => !t.q("#load").disabled, "404の案内は表示できました。finally でボタンをもう一度押せる状態に戻しましょう。"],
        [async t => { t.click("#load"); return waitForReadingTitles("data/reading.json", "本はまだありません", true); }, "同じボタンをもう一度押したら、新しく届いた本を表示しましょう。"],
        [async t => { t.q("#reading-mode").value = "empty"; t.click("#load"); return waitForReadingTitles("data/empty.json", "本はまだありません", true); }, "応答が成功したら、配列の件数に応じてタイトルか0件の案内を表示しましょう。"],
        [async t => { t.q("#reading-mode").value = "other"; t.click("#load"); return waitForReadingTitles("data/other.json", "本はまだありません", true); }, "応答の本文が変わっても、届いた本のタイトルを表示しましょう。"],
      ],
    },
  ],
};
