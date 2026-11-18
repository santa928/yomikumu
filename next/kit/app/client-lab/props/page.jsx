import { readBook } from "../book-store";
import BookLabel from "./BookLabel";

export default async function Shelf({ searchParams }) {
  const { book } = await searchParams;
  const selected = await readBook(book || "bridge");
  return <BookLabel title={selected.title} copies={0} />;
}
