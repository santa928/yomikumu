import { readBook } from "../book-store";

export default async function Reading({ searchParams }) {
  const { book } = await searchParams;
  const selected = await readBook("bridge");
  return <h1>{selected.title}</h1>;
}
