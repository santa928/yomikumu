import { requestPaper, relay } from "../requests";

export async function GET(request) {
  const mode = new URL(request.url).searchParams.get("mode");
  const policy = mode === "keep" ? "no-store" : "no-store";
  return relay(await requestPaper(request, { cache: policy }));
}
