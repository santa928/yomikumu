import { booksFor } from "../../../library/books";

export async function GET(request) {
  const topic = new URL(request.url).searchParams.get("topic");
  return Response.json(booksFor(topic));
}
