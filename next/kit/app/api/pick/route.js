import { booksFor } from "../../../library/books";

export function GET(request) {
  const topic = new URL(request.url).searchParams.get("kind");
  return Response.json(booksFor(topic));
}
