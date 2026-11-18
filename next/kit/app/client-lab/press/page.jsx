import { readBook } from "../book-store";
import Favorite from "./Favorite";

export default async function Page({ searchParams }) {
  const { book } = await searchParams;
  const selected = await readBook(book || "bridge");
  return <main><h1>{selected.title}</h1><Favorite title={selected.title} /></main>;
}
