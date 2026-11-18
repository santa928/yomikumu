import Link from "next/link";
import MissingBook from "../../not-found";
import { books } from "../../../library/books";

export default async function Book({ params }) {
  const { id } = await params;
  const book = books.find(item => item.id === id);
  if (!book) return <MissingBook />;
  return <><h1>{book.title}</h1><p>種類　{book.topic}</p><Link href="/">一覧に戻る</Link></>;
}
