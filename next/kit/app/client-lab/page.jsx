import { readBook } from "./book-store";
import Bookmark from "./Bookmark";

export default async function ClientLab({ searchParams }) {
  const { book } = await searchParams;
  const selected = await readBook(book || "bridge");
  return <section>
    <h1>栞の係</h1>
    <nav aria-label="原稿を選ぶ"><a href="?book=bridge">石橋の本</a> ・ <a href="?book=fern">羊歯の本</a></nav>
    <Bookmark title={selected.title} copies={selected.copies} />
  </section>;
}
