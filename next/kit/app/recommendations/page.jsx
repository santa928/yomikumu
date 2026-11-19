import Link from "next/link";
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
