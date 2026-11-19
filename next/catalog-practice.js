"use strict";

{
  const title = `import Link from "next/link";

export default function RecommendationTitle({ book }) {
  return <span>{book.title}</span>;
}
`;

  const detail = `import Link from "next/link";
import { notFound } from "next/navigation";
import { recommendations } from "../../../library/recommendations";

export default async function Recommendation({ params }) {
  const book = recommendations[0];
  return (
    <>
      <h1>{book.title}</h1>
      <p>{book.summary}</p>
    </>
  );
}
`;

  const list = `import Link from "next/link";
import { recommendations } from "../../library/recommendations";
import RecommendationTitle from "../../library/recommendation-title";

const pageSize = 2;

export default async function Recommendations({ searchParams }) {
  const { q: rawQuery, page: rawPage } = await searchParams;
  // URLの検索語で絞り、表示する2冊を切り出す。
  const q = "";
  const matches = recommendations;
  const totalPages = 1;
  const currentPage = 1;
  const visible = matches;

  function address(page) {
    return { pathname: "/recommendations", query: { page } };
  }

  return (
    <>
      <h1>おすすめの本</h1>
      <form action="/recommendations" method="get" autoComplete="off">
        <label>検索語 <input name="q" defaultValue={q} /></label>{" "}
        <button type="submit">検索する</button>
      </form>
      {visible.length > 0 ? (
        <>
          <ul>{visible.map(book => (
            <li key={book.id}><RecommendationTitle book={book} /></li>
          ))}</ul>
          <nav aria-label="ページ送り">
            <p>{currentPage} / {totalPages} ページ</p>
            {currentPage > 1 && <Link href={address(currentPage - 1)}>前のページ</Link>}{" "}
            {currentPage < totalPages && <Link href={address(currentPage + 1)}>次のページ</Link>}
          </nav>
        </>
      ) : <p>条件に合う本はありません。</p>}
    </>
  );
}
`;

  const detailAnswer = detail.replace("  const book = recommendations[0];", `  const { id } = await params;
  const book = recommendations.find(item => item.id === id);
  if (!book) notFound();`).replace(
    "      <p>{book.summary}</p>",
    '      <p>{book.summary}</p>\n      <Link href="/recommendations">おすすめの一覧へ戻る</Link>',
  );
  const listAnswer = list.replace(`  const q = "";
  const matches = recommendations;
  const totalPages = 1;
  const currentPage = 1;
  const visible = matches;`, `  const q = typeof rawQuery === "string" ? rawQuery.trim() : "";
  const matches = recommendations.filter(book =>
    book.title.includes(q) || book.topic.includes(q));
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const requested = Number(rawPage);
  const currentPage = Number.isInteger(requested) && requested >= 1 && requested <= totalPages
    ? requested : 1;
  const start = (currentPage - 1) * pageSize;
  const visible = matches.slice(start, start + pageSize);`).replace("query: { page }", "query: { q, page }");

  nextChapters.push({
    id: "catalog-practice",
    title: "おすすめの本に詳細・検索・ページ送りを加える",
    goal: "水辺の図書室に「おすすめの本」の棚を加えます。スマホでは表示例を見てコードを組み立て、PCでは同じ図書室を Docker で起動して作ったページを操作します。",
    examples: [
      ["/recommendations/reed", "葦の小舟\n葦を編んだ小舟が、ゆっくり流れを下ります。"],
      ["/recommendations/missing", "おすすめの本が見つかりません\nおすすめの一覧へ戻る"],
      ["/recommendations?q=水辺&page=2", "検索語　水辺\n夕暮れの桟橋・港の地図\n2 / 2 ページ"],
    ],
  });

  nextLessons.push({
    id: "catalog-links", chapter: "catalog-practice", title: "一覧の本を詳細へのリンクにする",
    slides: [
      ["表示されている題名をリンクにする", "図書室の「おすすめの本」には、最初は題名だけが並びます。一覧から題名を表示する RecommendationTitle に、表示したい本 book が渡ります。まずこの部品を修正します。", '<RecommendationTitle book={book} />\n// 部品の中\nreturn <span>{book.title}</span>;', "span は文字を表示します。リンクへ変えると、題名を押せるようになります。"],
      ["本の id で別々のリンク先を作る", "本のデータには、題名と短い識別名 id があります。Link で題名を囲み、開く住所 href の末尾に id をつなげます。", '<Link href={"/recommendations/" + book.id}>{book.title}</Link>', "「葦の小舟」なら /recommendations/reed。「渡し船の手紙」なら /recommendations/ferry。次の課題でリンク先のページを作ります。"],
    ],
    quiz: ["「渡し船の手紙」の id は ferry です。題名を押すと、どの URL を開きますか。", ["/recommendations/reed", "/recommendations", "/recommendations/ferry", "/ferry/recommendations"], 2, "リンク先は /recommendations/ の後ろにその本の id をつないだ住所です。"],
    build: ['<① href={"/recommendations/" + ②}>{book.title}</①>', [["Next.jsのリンク", "Link", "span"], ["住所の末尾に入れる値", "book.title", "book.id"]]],
    right: ["Link", "book.id"], file: "library/recommendation-title.jsx", pcPath: "/recommendations",
    task: "一覧の題名をリンクに変え、開く住所に一冊ずつ違う id を付けてください。リンク先のページは次の課題で追加します。",
    source: title, answer: title.replace("<span>{book.title}</span>", '<Link href={"/recommendations/" + book.id}>{book.title}</Link>'),
    hint: "span を Link に替えます。href は /recommendations/ と book.id を + でつなぎます。",
  }, {
    id: "catalog-detail", chapter: "catalog-practice", title: "詳細ページを新しく作る",
    slides: [
      ["一覧とは別に詳細用ファイルを作る", "おすすめの一覧用 page.jsx は用意してあります。PCで展開した ZIP の app/recommendations に [id] フォルダーを作り、その中に page.jsx を追加します。角かっこもフォルダー名に含めます。", "app/recommendations/page.jsx       → /recommendations\napp/recommendations/[id]/page.jsx  → /recommendations/reed", "詳細用のファイルを追加する前は /recommendations/reed が開けません。追加した後は、同じ [id] フォルダーで /recommendations/dusk も開けます。"],
      ["本の id でリンク先を作る", "一覧のリンクは、本のデータに付けた短い識別名 id を URL の末尾につなげます。book.title がリンクの文字、href が開く住所です。", '<Link href={"/recommendations/" + book.id}>{book.title}</Link>', "id が reed の本を押すと /recommendations/reed に進みます。"],
      ["URL の id と同じ本を探す", "詳細のページでは params を await して id を取り出します。find で id が一致する一冊を探し、その本の題名と紹介文を表示します。", "const { id } = await params;\nconst book = recommendations.find(item => item.id === id);", "dusk は「夕暮れの桟橋」。URLを直接開いた場合も同じ本が表示されます。"],
      ["知らない id には案内を出す", "どの本にも id が一致しなければ、find の結果は undefined です。題名を読む前に notFound() を呼ぶと、recommendations フォルダーに用意した not-found.jsx の案内が表示されます。", 'if (!book) notFound();\n<Link href="/recommendations">おすすめの一覧へ戻る</Link>', "存在しない id では「おすすめの本が見つかりません」と表示され、一覧から選び直せます。"],
    ],
    quiz: ["/recommendations/dusk を直接開くとき、どの値で本を探しますか。", ["一覧の先頭の番号", "検索語 q", "params に入る dusk", "本の表示順"], 2, "一覧を経由しなくても、開いた住所から同じ id を読めます。"],
    build: ["const { id } = await ①;\nconst book = recommendations.find(item => item.id === ②);", [["住所の末尾を受け取る", "params", "searchParams"], ["本と照らし合わせる値", "0", "id"]]],
    right: ["params", "id"], file: "app/recommendations/[id]/page.jsx", pcPath: "/recommendations", pcCreate: true,
    companionIds: ["catalog-links"],
    task: "前の課題で作ったリンクから開く詳細ページを追加します。本の題名と紹介文を表示し、詳細から一覧へ戻るリンクを加えます。reed と dusk を開き、missing では見つからない案内が表示されるか確かめます。",
    source: detail, answer: detailAnswer,
    hint: "まず recommendations[0] を URL の id で探す処理に変えます。見つからないときは notFound() へ進み、見つかったときは題名と紹介文、一覧へ戻る Link を表示します。",
  }, {
    id: "catalog-search", chapter: "catalog-practice", title: "検索語とページ番号を URL に残す",
    slides: [
      ["フォームで検索語を URL に送る", "フォームの method に get を指定します。検索欄の name が q なら、「水辺」と入力して送ると URL に ?q=水辺 が付きます。このフォームが送るのは検索語だけなので、新しく検索すると前の page は消え、1ページ目から見られます。", '<form action="/recommendations" method="get" autoComplete="off">\n  <label>検索語 <input name="q" defaultValue={q} /></label>\n  <button type="submit">検索する</button>\n</form>', "2ページ目から「町」で検索すると /recommendations?q=町 を開きます。"],
      ["URL から検索語を読み直す", "一覧ページは searchParams から q と page を読みます。検索語の前後にある空白を trim で取り除き、題名か種類にその文字が含まれる本を残します。文字が空なら全冊が残ります。", 'const { q: rawQuery, page: rawPage } = await searchParams;\nconst q = typeof rawQuery === "string" ? rawQuery.trim() : "";\nconst matches = recommendations.filter(book =>\n  book.title.includes(q) || book.topic.includes(q));', "水辺なら4冊、町なら2冊。何も見つからないときは案内を表示します。"],
      ["絞った結果から2冊を選ぶ", "1ページに2冊表示します。Math.ceil は割り算の端数を切り上げて総ページ数を求めます。ページ番号がない場合や範囲外の場合は1を使います。2ページ目は、検索結果の先頭から2冊を飛ばして、次の2冊を選びます。", "const start = (currentPage - 1) * pageSize;\nconst visible = matches.slice(start, start + pageSize);", "水辺の1ページ目には「葦の小舟」と「渡し船の手紙」、2ページ目には「夕暮れの桟橋」と「港の地図」が出ます。"],
      ["ページ送りのリンクに検索語を付ける", "Link に住所の pathname と条件の query を渡します。ページを送るときは q を残し、page だけを変えます。ブラウザで戻ったときも URL から検索語を読み直せるよう、フォームには autoComplete を off にしてあります。", 'const href = { pathname: "/recommendations", query: { q, page: 2 } };\n<Link href={href}>次のページ</Link>', "水辺の2ページ目を再読み込みしても夕暮れの桟橋と港の地図が出ます。"],
    ],
    quiz: ["「水辺」の結果の2ページ目から「町」で検索するとき、どの URL にしますか。", ["/recommendations?q=町", "/recommendations?q=町&page=2", "/recommendations?q=水辺", "/recommendations?page=2"], 0, "新しい検索では q だけを送ります。page がなければ1ページ目です。"],
    build: ['{ pathname: "/recommendations", query: { ①, ②: 2 } }', [["ページを送っても残す検索条件", "q", "searchParams"], ["2ページ目を表す項目", "id", "page"]]],
    right: ["q", "page"], file: "app/recommendations/page.jsx", pcPath: "/recommendations",
    task: "題名か種類で検索し、2冊ずつ表示します。「水辺」の2ページ目で再読み込みし、「町」で検索すると1ページ目、ブラウザで戻ると「水辺」の2ページ目になることを確かめます。0件のときは案内を表示します。",
    source: list, answer: listAnswer,
    hint: "まず q で絞り、それから slice で2冊を選びます。最初のページは1番ですが、配列の最初は0番です。検索フォームは q だけを送り、ページ送りのリンクは q と page を渡します。",
  });
}
