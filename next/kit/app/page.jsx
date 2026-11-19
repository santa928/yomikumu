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
      <nav aria-label="実習の入口">
        <h2>実習の入口</h2>
        <ul>
          <li><Link href="/client-lab">お気に入りの栞を試す</Link></li>
          <li><Link href="/data-lab">読書原稿の版を変える</Link></li>
          <li><Link href="/signup-lab">読書会に申し込む</Link></li>
          <li><Link href="/travel">旅の案内を見る</Link></li>
          <li><Link href="/meetings">読書会の日程を見る</Link></li>
          <li><Link href="/recommendations">おすすめの本を探す</Link></li>
        </ul>
      </nav>
    </>
  );
}
