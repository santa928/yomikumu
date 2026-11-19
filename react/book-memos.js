"use strict";

const memoBooks = `const books = [
  {id: "A17", title: "星の地図"},
  {id: "B24", title: "星の地図"}
];`;
const bookNumbers = memoBooks + `
function App() {
  return <ul>{books.map(book =>
    <li key={book.id}>{book.title}（{book.id}）</li>
  )}</ul>;
}`;
const memoShelf = memoBooks + `
function Memo({book}) {
  const [draft, setDraft] = useState("");
  return <label>{book.id}のメモ
    <input value={draft} onChange={event => setDraft(event.target.value)} />
  </label>;
}

function App() {
  const [shelf, setShelf] = useState(books);
  return <section>
    <button onClick={() => setShelf([...shelf].reverse())}>順番を逆にする</button>
    <ul>{shelf.map((book, index) =>
      <li key={book.id}>
        <p>{book.title}（{book.id}）</p>
        <Memo book={book} />
        <button onClick={() => setShelf(shelf.filter(other => other.id !== book.id))}>
          {book.id}を外す
        </button>
      </li>
    )}</ul>
  </section>;
}`;
const misplacedMemo = memoShelf.replace("key={book.id}", "key={index}");

const reactBookMemos = {
  id: "book-memos", title: "並べ替えても同じ本にメモを残す",
  intro: "同じ題名の本が2冊あります。片方にだけメモを書き、順番を逆にしてみましょう。管理番号を見れば、書いたメモが同じ本に残ったか確かめられます。",
  demo: {code: memoShelf, tip: "A17に「金曜に返す」と書き、順番を逆にします。どちらの本にメモが付いていますか。"},
  steps: [
    {
      title: "同じ題名の2冊を管理番号で区別する",
      explain: "題名は同じでも、それぞれの本には別の管理番号があります。books の一件から book.id を読むと、A17 または B24 が取り出せます。",
      example: bookNumbers,
      question: "A17 の本を一覧の一番下に移したら、変わるものは？",
      options: ["管理番号", "題名", "一覧での位置", "本そのもの"], correct: 2,
      feedback: "並ぶ場所が変わっても、その本の管理番号は A17 のままです。",
      task: "かっこの中に各本の管理番号を表示してください。上から「星の地図（A17）」「星の地図（B24）」と読めるようにします。",
      starter: bookNumbers.replace("（{book.id}）", "（{book.title}）"),
      build: reactBuild(bookNumbers, ["（{book.id}）","（{book.title}）"]),
      tests: [[t => t.all("#root li").map(row => row.textContent).join("/") === "星の地図（A17）/星の地図（B24）", "2冊の管理番号をそれぞれ表示します。"]],
    },
    {
      title: "並べ替えで別の本に移るメモを直す",
      explain: "見本で A17 にだけメモを書いて順番を逆にすると、メモは B24 の欄に移ります。key は React が前回の行を見分ける手掛かりです。今の key は配列の位置なので、一番上の欄が別の本になっても前の入力が残ります。",
      example: misplacedMemo,
      showPieceLines: true,
      excerpt: '<ul>{shelf.map((book, index) =>\n  <li key={index}>',
      question: "片方の行を削除しても、残った本の入力欄を同じ行として見つけられる key は？",
      options: ["配列で何番目か", "本の管理番号", "現在のメモ", "2冊共通の題名"], correct: 1,
      feedback: "その本を表す番号は、他の行を削除しても変わりません。",
      task: "見本の不具合を再現し、2冊が別々のメモを保つように直しましょう。順番を逆にしても、片方を外しても、残った本のメモを読めることを確認します。",
      reflection: "どの本に何を書き、どう並べ替えたか。修正前後の違いと、メモを保存している部品を記録する",
      starter: misplacedMemo,
      build: reactBuild(memoShelf, ["key={book.id}","key={index}"]),
      tests: [
        [t => {
          training.input("#root li:first-child input", "金曜に返す");
          training.input("#root li:nth-child(2) input", "貸出延長");
          training.click("#root section > button");
          const rows = t.all("#root li");
          return rows.length === 2 && rows[0].textContent.includes("B24") &&
            rows[0].querySelector("input").value === "貸出延長" &&
            rows[1].textContent.includes("A17") && rows[1].querySelector("input").value === "金曜に返す";
        }, "並べ替えた後も、それぞれの本に書いたメモを残します。"],
        [t => {
          training.click("#root li:first-child button");
          const rows = t.all("#root li");
          return rows.length === 1 && rows[0].textContent.includes("A17") &&
            rows[0].querySelector("input").value === "金曜に返す";
        }, "先頭を外しても、残った本のメモを保ちます。"],
      ],
    },
  ],
};
