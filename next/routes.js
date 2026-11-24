"use strict";

const nextChapters = [{
  id: "routes", title: "URLごとに表示するページやデータを決める",
  goal: "URLを開くと二冊の一覧が出て、一冊を選ぶとその本のページへ進みます。PCの実習では、手元で Next.js を起動し、URLと表示の対応を確かめます。",
  examples: [["/", "今月の本　葦の小舟・坂の灯"], ["/books/reed", "葦の小舟　種類　水辺"], ["/api/books?topic=町", '[{"id":"lamp","title":"坂の灯","topic":"町"}]']],
}];

const nextLessons = [{
  id: "request", chapter: "routes", title: "フォルダー名でページのURLを決める",
  slides: [
    ["URLを開くと何が届く？", "ブラウザのアドレス欄から /notice を開くと、ブラウザはサーバー（ページやデータを返す側）に「/notice のページをください」と頼みます。この読み取りの要求が GET です。届いた HTML をブラウザが読み取ると、見出しが表示されます。", "GET /notice", "画面に「本日の案内」という見出しが出ます。"],
    ["/notice の表示を変えるファイル", "見出しの表示を返す関数はReactの書き方です。Next.jsではその関数を app/notice/page.jsx に置くと、フォルダー名から /notice というURLが決まります。見出しの文字を変えて再読み込みしても、フォルダー名を変えていないのでURLは同じです。", 'export default function Notice() {\n  return <h1>本日の案内</h1>;\n}', "この例で届く見出しは「本日の案内」です。"],
  ],
  quiz: ["/notice を開いた時、ブラウザに送られるのは？", ["page.jsx のソースコード", "ページとして読み取れるHTML", "compose.yaml の内容", "サーバーの起動ログ"], 1, "取ってきたHTMLをブラウザが見出しとして表示します。"],
  build: ['app/①/page.jsx → GET /notice → <h1>②</h1>', [["フォルダー名", "notice", "notices"], ["新しい見出し", "夜の読書室", "本日の案内"]]],
  right: ["notice","夜の読書室"], file: "app/notice/page.jsx", task: "/notice の見出しを「夜の読書室」に変えてください。",
  source: 'export default function Notice() {\n  return <h1>本日の案内</h1>;\n}',
  answer: 'export default function Notice() {\n  return <h1>夜の読書室</h1>;\n}',
  hint: "URLをそのままに、h1で囲まれた文字を変えます。",
}, {
  id: "restart", chapter: "routes", title: "PCでサーバーを起動・停止・再開する",
  slides: [
    ["サーバーを起動する", "ZIPを展開し、compose.yaml と同じ場所でターミナルを開きます。この一行で教材用のサーバーが起動します。初回は必要なソフトを取得します。", "docker compose up --build -d web", "http://localhost:3090/open を開くと「午前の受付」が見えます。localhostは今使っているPCです。"],
    ["サーバーを停止してから再開する", "stop はサーバーを止める操作です。ブラウザで再読み込みして接続できなくなったら start で再開します。編集したファイルはPCのフォルダーにあります。", "docker compose stop web\ndocker compose start web", "再開後に /open を再読み込みすると、「午前の受付」がまた表示されます。"],
  ],
  quiz: ["停止後に同じURLを再読み込みして接続できません。次の操作は？", ["ページの見出しを変える", "URLの末尾を変える", "サーバーを再開する", "もう一度停止する"], 2, "サーバーを再開すれば、同じ URL でページを開けます。"],
  build: ["docker compose ① web\ndocker compose ② web", [["一時停止する", "stop", "start"], ["再開する", "stop", "start"]]], right: ["stop","start"],
  file: "app/open/page.jsx", task: "受付表示を「午後の受付」に書き換えます。PCで一度停止し、再開した /open で午後の表示を読んでください。",
  source: 'export default function Open() {\n  return <p>午前の受付</p>;\n}', answer: 'export default function Open() {\n  return <p>午後の受付</p>;\n}', hint: "pの内側を変えます。停止中は接続できず、再開後に変更した文字が出ることを実際に試します。",
}, {
  id: "format", chapter: "routes", title: "ページではなくプログラムで読めるデータを返す（JSON）",
  slides: [
    ["画面用のHTMLとデータ用のJSONを比べる", "/notice が画面用の HTML を返すのに対し、/api/shelf はプログラムが読める形のデータを返します。その形式が JSON です。この例では shelf から棚の名前を、count から冊数を取り出せます。", '{"shelf":"南の棚","count":2}', "shelfから棚の名前を読み、countから数の2を読めます。"],
    ["GETに応える関数を用意する", "app/api/shelf/route.js に GET を置くと、/api/shelf への要求をこの関数で扱えます。Response.json は渡した値をJSONの応答にします。", 'export function GET() {\n  return Response.json({ shelf: "南の棚", count: 2 });\n}', "/api/shelf では棚のデータを読み、/notice では見出しを読みます。"],
  ],
  quiz: ["棚の冊数を足し算に使うとき、JSONのどれを読みますか。", ["shelf の文字列", "shelf の文字数", "count の数", "JSON の項目数"], 2, "countを数で渡すと、受け取った側でそのまま足せます。"],
  build: ['export function ①() {\n  return Response.②({ shelf: "北の棚", count: 2 });\n}', [["読む要求を受ける", "GET", "page"], ["JSONで返す", "json", "textContent"]]], right: ["GET","json"],
  file: "app/api/shelf/route.js", task: "別の棚を案内します。/api/shelf のJSONで shelf を「北の棚」、count を数の2にしてください。",
  source: 'export function GET() {\n  return Response.json({ shelf: "南の棚", count: 2 });\n}', answer: 'export function GET() {\n  return Response.json({ shelf: "北の棚", count: 2 });\n}', hint: "棚名は引用符で囲みます。冊数は引用符を付けずに数で返します。",
}, {
  id: "query", chapter: "routes", title: "URLの末尾に絞り込み条件を付ける",
  slides: [
    ["疑問符の後は一覧の条件", "/api/pick に ?topic=町 を付けると、本の種類を指定できます。? に続くこの部分をクエリと呼びます。水辺の本を選ぶときは topic の値を水辺に変えます。", "/api/pick?topic=町", "二冊のうち、種類が町の「坂の灯」だけを返したい場面です。"],
    ["URLから絞り込み条件を読み取る", "request.url は実際に開いたURLです。searchParams.get に付けた名前を書くと値を受け取れます。付いていないときは null です。用意した booksFor は、条件がなければ全冊を返します。", 'const topic = new URL(request.url).searchParams.get("topic");\nreturn Response.json(booksFor(topic));', "topic=水辺なら「葦の小舟」、条件なしなら二冊です。"],
  ],
  quiz: ["町の本を水辺の本へ切り替えるとき、変える場所は？", ["/apiを消す", "topicの右側", "GETの関数名", "本の配列全体"], 1, "同じ一覧に付ける条件の値を変えます。"],
  build: ['new URL(request.url).①.get("②")', [["条件を取り出す", "searchParams", "textContent"], ["条件の名前", "kind", "topic"]]], right: ["searchParams","topic"],
  file: "app/api/pick/route.js", task: "URLの topic で本を選びます。町、水辺、条件なし、該当なしで、返す件数が順に1・1・2・0になるようにしてください。",
  source: 'import { booksFor } from "../../../library/books";\nexport function GET(request) {\n  const topic = new URL(request.url).searchParams.get("kind");\n  return Response.json(booksFor(topic));\n}', answer: 'import { booksFor } from "../../../library/books";\nexport function GET(request) {\n  const topic = new URL(request.url).searchParams.get("topic");\n  return Response.json(booksFor(topic));\n}', hint: "URLで送った条件とgetに書いた名前を見比べましょう。",
}, {
  id: "layout", chapter: "routes", title: "ページを移動しても共通の見出しを残す（layout）",
  slides: [
    ["共通の見出しとページごとの内容を分ける", "受付から利用案内へ移るとき、部屋の名前は同じにします。共通部分を layout.jsx に置き、その場所にあるページごとの中身を children で受け取ります。", '<section><h2>準備室</h2>{children}</section>', "受付でも利用案内でも見出しは準備室です。本文は入れ替わります。"],
  ],
  quiz: ["共通の見出しを一か所で替えるファイルは？", ["app/room/page.jsx", "app/room/guide/page.jsx", "app/api/shelf/route.js", "二つのページの親のlayout.jsx"], 3, "同じ親のlayoutに書いた見出しは、その下の両方のページに表示されます。"],
  build: ["<section><h2>①</h2>{②}</section>", [["共通の名前", "北の読書室", "準備室"], ["ページごとの中身", "children", "topic"]]], right: ["北の読書室","children"],
  file: "app/room/layout.jsx", task: "受付 /room と利用案内 /room/guide を「北の読書室」にします。両方でこの見出しと、それぞれの今の本文を読めるようにしてください。",
  source: 'export default function RoomLayout({ children }) {\n  return <section><h2>準備室</h2>{children}</section>;\n}', answer: 'export default function RoomLayout({ children }) {\n  return <section><h2>北の読書室</h2>{children}</section>;\n}', hint: "見出しだけを直し、本文を差し込むchildrenを残します。",
}, {
  id: "dynamic", chapter: "routes", title: "URLに含まれる識別子で詳細ページを切り替える",
  slides: [
    ["URL の末尾を本の id として読む", "app/archive/[id]/page.jsx は /archive/ の後に別々の id を指定して開けるページです。/archive/lamp を開くと、params から lamp を取り出せます。", 'const { id } = await params;', "reedを直接開けばreed、lampを直接開けばlampが届きます。"],
    ["配列から id が一致する本を探す", "find は条件に合う先頭の一件を返します。どれも一致しなければ undefined を返します。その場合は、用意したMissingBookという部品を返して「本が見つかりません」と案内します。", 'const book = books.find(item => item.id === id);\nif (!book) return <MissingBook />;', "lampでは「坂の灯」。一覧にない id では一覧へ戻る案内が出ます。"],
  ],
  quiz: ["どの詳細を開いても先頭の本になるコードは？", ["books.find(item => item.id === id)", "await params", "books[0]", "MissingBook"], 2, "books[0] は URL の id に関係なく配列の先頭を返します。"],
  build: ["const book = books.①(item => item.id === ②);", [["条件に合う一件", "find", "map"], ["URL の id", "id", "0"]]], right: ["find","id"],
  file: "app/archive/[id]/page.jsx", task: "貸出記録の別ページを完成させます。/archive/reed と /archive/lamp でそれぞれの本を表示し、存在しない id では見つからない案内を出してください。",
  source: 'import MissingBook from "../../not-found";\nimport { books } from "../../../library/books";\nexport default async function Archive({ params }) {\n  const { id } = await params;\n  const book = books[0];\n  if (!book) return <MissingBook />;\n  return <h1>{book.title}</h1>;\n}', answer: 'import MissingBook from "../../not-found";\nimport { books } from "../../../library/books";\nexport default async function Archive({ params }) {\n  const { id } = await params;\n  const book = books.find(item => item.id === id);\n  if (!book) return <MissingBook />;\n  return <h1>{book.title}</h1>;\n}', hint: "一冊目を表示できたら、もう一冊の id と、一覧にない id でも試しましょう。",
}];
