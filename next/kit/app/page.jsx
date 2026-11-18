import Link from "next/link";
import { booksFor } from "../library/books";

export default async function Library({ searchParams }) {
  const { topic } = await searchParams;
  const matches = booksFor(topic);
  return (
    <>
      <h1>今月の本</h1>
      <nav aria-label="本の種類"><Link href="/">全部</Link> ・ <Link href="/?topic=水辺">水辺</Link> ・ <Link href="/?topic=町">町</Link></nav>
      {matches.length ? <ul>{matches.map(book => (
        <li key={book.id}><Link href={"/books/" + book.id}>{book.title}</Link></li>
      ))}</ul> : <p>この種類の本はありません。</p>}
      <p><a href="/api/books">同じ本をJSONで読む</a></p>
    </>
  );
}
