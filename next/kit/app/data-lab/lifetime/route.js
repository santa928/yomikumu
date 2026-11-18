import { requestPaper, relay } from "../requests";

export async function GET(request) {
  return relay(await requestPaper(request, { cache: "force-cache" }));
}
