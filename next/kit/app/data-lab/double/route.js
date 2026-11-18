import { requestPaper } from "../requests";

export const dynamic = "force-dynamic";
export async function GET(request) {
  const response = await requestPaper(request, { cache: "no-store" });
  const paper = await response.json();
  return Response.json({ title: paper.title, edition: 1, publishedAt: paper.publishedAt });
}
