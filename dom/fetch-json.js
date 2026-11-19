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
    const observer = new MutationObserver(update);
    const timer = setTimeout(() => finish(false), 2500);
    function finish(ok) {
      clearTimeout(timer);
      observer.disconnect();
      resolve(ok);
    }
    function update() {
      if (check(result.textContent, button.disabled)) finish(true);
    }
    observer.observe(result, { childList: true });
    observer.observe(button, { attributes: true, attributeFilter: ["disabled"] });
    update();
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

const readingUnit = {
  id: "fetch-json",
  title: "JSONで読書棚を更新する",
  intro: "サーバーに置いたJSONを読み、届いた本で読書棚を更新します。この単元はHTTPで配信されたページで開いてください。Dockerで手元から開くときは、教材フォルダーで docker compose up web を実行して http://localhost:8080/dom/index.html#fetch-json を開きます。",
  setup: readingSetup,
  frame: readingFrame,
  demo: {
    html: readingHtml,
    code: finishModel,
    tip: "「最初だけファイルが見つからない」を選び、二度押して読書棚が出るまでを試しましょう。「空の棚」も選んで、404のときとの違いを確認できます。教材ページが実際にHTTPで応答を受け取り、練習画面のfetchに応答番号と本文を渡します。",
  },
  steps: [
    {
      title: "fetchで届いた応答番号を読む",
      html: readingHtml,
      explain: "fetchにファイル名を渡すと、ブラウザはサーバーにそのファイルを求めます。awaitで応答を待ち、response.statusで応答番号を読みます。見本は data/reading.json を指定しているので、棚を選び直して押しても200です。nextReadingFile()を使うと、代わりに選んだ棚のファイル名を渡せます。",
      example: statusModel.replace("nextReadingFile()", '"data/reading.json"'),
      question: "200が入っているものはどれですか。",
      options: ["response.status", "ファイル名", "本の配列", "ボタンの文字"],
      correct: 0,
      feedback: "応答の番号はresponse.statusで読みます。",
      task: "nextReadingFile()で選んだファイル名をfetchに渡し、応答番号を表示します。「空の棚」では200、「最初だけファイルが見つからない」の最初の操作では404です。",
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
      title: "response.okで読み進めるか決める",
      html: readingHtml,
      explain: "ファイルが見つからないと、サーバーは404という応答を返します。この場合、fetchのawaitは終わって次の行へ進みます。response.okは200番台ならtrue、404ならfalseです。応答が届かない通信の失敗では、fetch自体がエラーになります。",
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
      title: "response.json()で本の配列を読む",
      html: readingHtml,
      explain: 'JSONはデータを文字で書き表す形式です。data/reading.json の本文は ["雲の地図", "星の台所"] です。await response.json() で本文をJavaScriptの配列に変え、books[0] で最初の本を読めます。別の棚を選ぶと別のJSONが届きます。',
      example: dataModel.replace('books.join(" / ")', "books[0]"),
      question: "見本で「別の本がある棚」を選ぶと、books[0]はどれになりますか。",
      options: ["200", "雲の地図", "風の標本", "空の配列"],
      correct: 2,
      feedback: "別の棚の本文は [\"風の標本\"] です。先頭の要素は風の標本です。",
      task: '成功のときだけ response.json() で配列を読み、本を「 / 」でつないで表示します。例は「雲の地図 / 星の台所」です。',
      starter: dataModel.replace("await response.json()", "response"),
      build: [dataModel.replace("await response.json()", "《1》"), ["await response.json()", "response"]],
      tests: [
        [async t => { t.click("#load"); return waitForReading(text => text === "雲の地図 / 星の台所"); }, "応答は本文を入れた箱です。await response.json()で箱の中から配列を取り出しましょう。"],
        [async t => { t.q("#reading-mode").value = "other"; t.click("#load"); return waitForReading(text => text === "風の標本"); }, "本の名前はコードに固定せず、届いた配列から読みましょう。"],
      ],
    },
    {
      title: "本が0冊の成功と404を分ける",
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
        [async t => { t.q("#reading-mode").value = "empty"; t.click("#load"); return waitForReading(text => text === "本はまだありません"); }, "200の空の配列では、件数が0の場合の案内を表示しましょう。"],
        [async t => { t.q("#reading-mode").value = "retry"; t.click("#load"); return waitForReading(text => text === "HTTP 404"); }, "失敗時には番号を表示し、JSONを読まずに処理を終えましょう。"],
        [async t => { t.q("#reading-mode").value = "other"; t.click("#load"); return waitForReading(text => text === "風の標本"); }, "配列の件数が1以上なら、その本の名前を表示しましょう。"],
      ],
    },
    {
      title: "失敗しても同じボタンで読み直す",
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
        [async t => { t.click("#load"); return waitForReading((text, disabled) => text === "雲の地図 / 星の台所" && !disabled); }, "同じボタンをもう一度押したら、新しく届いた本を表示しましょう。"],
        [async t => { t.q("#reading-mode").value = "empty"; t.click("#load"); return waitForReading((text, disabled) => text === "本はまだありません" && !disabled); }, "空の成功では本がないことを案内しましょう。"],
        [async t => { t.q("#reading-mode").value = "other"; t.click("#load"); return waitForReading((text, disabled) => text === "風の標本" && !disabled); }, "応答の本文が変わっても、届いた本のタイトルを表示しましょう。"],
      ],
    },
  ],
};
