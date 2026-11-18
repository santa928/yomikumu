import "server-only";

// 教材内の原稿サーバーだけを読む。runで各実験の原稿とキャッシュを分ける。
export async function requestPaper(request, options) {
  const input = new URL(request.url);
  const origin = new URL("http://127.0.0.1:"+(process.env.PORT || "3000")+"/data-lab/origin");
  origin.searchParams.set("run",input.searchParams.get("run") || "desk");
  origin.searchParams.set("id",input.searchParams.get("id") || "tide");
  return fetch(origin, options);
}
export async function relay(response) {
  return Response.json(await response.json(), {status:response.status,headers:{"Cache-Control":"no-store"}});
}
