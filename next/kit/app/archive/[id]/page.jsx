import MissingBook from "../../not-found";
import { books } from "../../../library/books";

export default async function Archive({ params }) {
  const { id } = await params;
  const book = books[0];
  if (!book) return <MissingBook />;
  return <h1>{book.title}</h1>;
}
