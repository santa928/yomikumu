import { requestPaper, relay } from "../requests";

export async function GET(request) {
  const mode = new URL(request.url).searchParams.get("mode");
  const options = mode === "keep" ? {cache:"force-cache"} :
    mode === "limit" ? {next:{revalidate:2}} : {cache:"no-store"};
  return relay(await requestPaper(request,options));
}
