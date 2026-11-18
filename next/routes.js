"use strict";

const nextChapters = [{
  id: "routes", title: "図書室の一覧と本の住所を作る",
  goal: "URLを開くと二冊の一覧が出て、一冊を選ぶとその本のページへ進みます。PCで答えを書くときは手元のNext.jsが実際の要求を受け取ります。",
  examples: [["/", "今月の本　葦の小舟・坂の灯"], ["/books/reed", "葦の小舟　種類　水辺"], ["/api/books?topic=町", '[{"id":"lamp","title":"坂の灯","topic":"町"}]']],
}];

const nextLessons = [{
  id: "request", chapter: "routes", title: "住所を開いて、ひとつの見出しを受け取る",
  slides: [
    ["URLを開くと何が届く？", "URLはページの住所です。ブラウザで /notice を開くと、その住所の内容をください、と要求します。手元のサーバーは、見出しを含むHTMLで応えます。", "GET /notice", "画面に「本日の案内」という見出しが出ます。"],
    ["ファイル名を住所に結び付ける", "app の中で notice フォルダーに置いた page.jsx が /notice のページになります。見出しの文字を変更し、同じ住所を読み直すと、新しい文字が表示されます。", 'export default function Notice() {\n  return <h1>本日の案内</h1>;\n}', "この例で届く見出しは「本日の案内」です。"],
  ],
  quiz: ["/notice を開いた時、ブラウザに送られるのは？", ["編集したフォルダー全部", "ページとして読み取れるHTML", "Dockerの設定", "パソコンの名前"], 1, "取ってきたHTMLをブラウザが見出しとして表示します。"],
  build: ['app/①/page.jsx → GET /notice → <h1>②</h1>', [["ページの住所", "notice", "notices"], ["新しい見出し", "夜の読書室", "本日の案内"]]],
  right: ["notice","夜の読書室"], file: "app/notice/page.jsx", task: "夜の回のため、/notice の見出しを「夜の読書室」に変えてください。",
  source: 'export default function Notice() {\n  return <h1>本日の案内</h1>;\n}',
  answer: 'export default function Notice() {\n  return <h1>夜の読書室</h1>;\n}',
  hint: "URLをそのままに、h1で囲まれた文字を変えます。",
}, {
  id: "restart", chapter: "routes", title: "PCで受け付ける・止める・もう一度開く",
  slides: [
    ["受付を始める", "ZIPを展開し、compose.yaml と同じ場所でターミナルを開きます。この一行で教材用のサーバーが起動します。初回は必要なソフトを取得します。", "docker compose up --build -d web", "http://localhost:3090/open を開くと「午前の受付」が見えます。localhostは今使っているPCです。"],
    ["いったん閉めて、同じ住所へ戻る", "stop はサーバーを止める操作です。ブラウザで再読み込みして接続できなくなったら start で再開します。編集したファイルはPCのフォルダーにあります。", "docker compose stop web\ndocker compose start web", "同じ住所を再読み込みすると、また受付を読めます。"],
  ],
  quiz: ["停止後に同じURLを再読み込みして接続できません。次の操作は？", ["本の名前を消す", "URLに別の本を足す", "サーバーを再開する", "すべてのソースを消す"], 2, "要求を受け取るサーバーを再開すると、同じ住所に応答が戻ります。"],
  build: ["docker compose ① web\ndocker compose ② web", [["一時停止する", "stop", "start"], ["再開する", "stop", "start"]]], right: ["stop","start"],
  file: "app/open/page.jsx", task: "受付表示を「午後の受付」に書き換えます。PCで一度停止し、再開した /open で午後の表示を読んでください。",
  source: 'export default function Open() {\n  return <p>午前の受付</p>;\n}', answer: 'export default function Open() {\n  return <p>午後の受付</p>;\n}', hint: "pの内側を変えます。停止中は接続できず、再開後に変更した文字が出ることを実際に試します。",
}, {
  id: "format", chapter: "routes", title: "人が読むページと、プログラムが読む棚のデータ",
  slides: [
    ["棚の名前を項目として受け取る", "別のプログラムが冊数を使う場合は、飾ったページより、名前と値の組の方が扱いやすくなります。JSONはこの組を文字で渡す形式です。", '{"shelf":"南の棚","count":2}', "shelfから棚の名前を読み、countから数の2を読めます。"],
    ["GETに応える関数を用意する", "app/api/shelf/route.js に GET を置くと、/api/shelf への要求をこの関数で扱えます。Response.json は渡した値をJSONの応答にします。", 'export function GET() {\n  return Response.json({ shelf: "南の棚", count: 2 });\n}', "/api/shelf では棚のデータを読み、/notice では見出しを読みます。"],
  ],
  quiz: ["棚の冊数を足し算に使うとき、JSONのどれを読みますか。", ["URLの長さ", "shelf の色", "count の数", "ブラウザの幅"], 2, "countを数で渡すと、受け取った側でそのまま足せます。"],
  build: ['export function ①() {\n  return Response.②({ shelf: "北の棚", count: 2 });\n}', [["読む要求を受ける", "GET", "page"], ["JSONで返す", "json", "textContent"]]], right: ["GET","json"],
  file: "app/api/shelf/route.js", task: "別の棚を案内します。/api/shelf のJSONで shelf を「北の棚」、count を数の2にしてください。",
  source: 'export function GET() {\n  return Response.json({ shelf: "南の棚", count: 2 });\n}', answer: 'export function GET() {\n  return Response.json({ shelf: "北の棚", count: 2 });\n}', hint: "棚名は引用符で囲みます。冊数は引用符を付けずに数で返します。",
}, {
  id: "query", chapter: "routes", title: "同じ一覧に、URLで条件を渡す",
  slides: [
    ["疑問符の後は一覧の条件", "本の一覧の住所に ?topic=町 を足すと、topicという名前で町という条件を渡せます。別の種類に変えても一覧の住所は /api/pick のままです。", "/api/pick?topic=町", "二冊のうち、種類が町の「坂の灯」だけを返したい場面です。"],
    ["付けた名前と読む名前を合わせる", "request.url は実際に開いたURLです。searchParams.get に付けた名前を書くと値を受け取れます。付いていないときは null です。用意した booksFor は、条件がなければ全冊を返します。", 'const topic = new URL(request.url).searchParams.get("topic");\nreturn Response.json(booksFor(topic));', "topic=水辺なら「葦の小舟」、条件なしなら二冊です。"],
  ],
  quiz: ["町の本を水辺の本へ切り替えるとき、変える場所は？", ["/apiを消す", "topicの右側", "GETの関数名", "本の配列全体"], 1, "同じ一覧に付ける条件の値を変えます。"],
  build: ['new URL(request.url).①.get("②")', [["条件を取り出す", "searchParams", "textContent"], ["URLの名前", "kind", "topic"]]], right: ["searchParams","topic"],
  file: "app/api/pick/route.js", task: "URLの topic で本を選びます。町、水辺、条件なし、該当なしで、返す件数が順に1・1・2・0になるようにしてください。",
  source: 'import { booksFor } from "../../../library/books";\nexport function GET(request) {\n  const topic = new URL(request.url).searchParams.get("kind");\n  return Response.json(booksFor(topic));\n}', answer: 'import { booksFor } from "../../../library/books";\nexport function GET(request) {\n  const topic = new URL(request.url).searchParams.get("topic");\n  return Response.json(booksFor(topic));\n}', hint: "URLで送った条件とgetに書いた名前を見比べましょう。",
}, {
  id: "layout", chapter: "routes", title: "二つのページで同じ見出しを使う",
  slides: [
    ["移動しても部屋の名前を残す", "受付から利用案内へ移るとき、部屋の名前は同じにします。共通部分を layout.jsx に置き、その場所にあるページごとの中身を children で受け取ります。", '<section><h2>準備室</h2>{children}</section>', "受付でも利用案内でも見出しは準備室です。本文は入れ替わります。"],
  ],
  quiz: ["共通の見出しを一か所で替えるファイルは？", ["どちらかの画像", "二つのURLの文字", "本のJSON", "二つのページの親のlayout.jsx"], 3, "同じ親のlayoutに書いた見出しは、その下の両方のページに表示されます。"],
  build: ["<section><h2>①</h2>{②}</section>", [["共通の名前", "北の読書室", "準備室"], ["ページごとの中身", "children", "topic"]]], right: ["北の読書室","children"],
  file: "app/room/layout.jsx", task: "受付 /room と利用案内 /room/guide を「北の読書室」にします。両方でこの見出しと、それぞれの今の本文を読めるようにしてください。",
  source: 'export default function RoomLayout({ children }) {\n  return <section><h2>準備室</h2>{children}</section>;\n}', answer: 'export default function RoomLayout({ children }) {\n  return <section><h2>北の読書室</h2>{children}</section>;\n}', hint: "見出しだけを直し、本文を差し込むchildrenを残します。",
}, {
  id: "dynamic", chapter: "routes", title: "本ごとの住所から、該当する一冊を探す",
  slides: [
    ["住所の最後を本の番号として使う", "app/archive/[id]/page.jsx の角かっこは、ここだけ住所によって違う、という意味です。/archive/lamp なら params に入った id は lamp です。", 'const { id } = await params;', "reedを直接開けばreed、lampを直接開けばlampが届きます。"],
    ["原稿の中から一致した本だけを出す", "find は条件に合う先頭の一件を返します。どれも合わなければ値がありません。その場合は、用意したMissingBookという部品を返して「本が見つかりません」と案内します。", 'const book = books.find(item => item.id === id);\nif (!book) return <MissingBook />;', "lampでは「坂の灯」。原稿にない番号では一覧へ戻る案内が出ます。"],
  ],
  quiz: ["どの詳細を開いても先頭の本になるコードは？", ["books.find(item => item.id === id)", "await params", "books[0]", "MissingBook"], 2, "0番に固定すると、住所で受け取ったidを一度も見ません。"],
  build: ["const book = books.①(item => item.id === ②);", [["条件に合う一件", "find", "map"], ["住所から来た値", "id", "0"]]], right: ["find","id"],
  file: "app/archive/[id]/page.jsx", task: "貸出記録の別ページを完成させます。/archive/reed と /archive/lamp でそれぞれの本を表示し、存在しない番号では見つからない案内を出してください。",
  source: 'import MissingBook from "../../not-found";\nimport { books } from "../../../library/books";\nexport default async function Archive({ params }) {\n  const { id } = await params;\n  const book = books[0];\n  if (!book) return <MissingBook />;\n  return <h1>{book.title}</h1>;\n}', answer: 'import MissingBook from "../../not-found";\nimport { books } from "../../../library/books";\nexport default async function Archive({ params }) {\n  const { id } = await params;\n  const book = books.find(item => item.id === id);\n  if (!book) return <MissingBook />;\n  return <h1>{book.title}</h1>;\n}', hint: "一冊目を表示できたら、存在するもう一冊と、原稿にない番号でも試しましょう。",
}];
