export const routeChecks = {
  request: {
    file: "app/notice/page.jsx",
    checks: [
      ["案内のURLがHTMLを返す", async ({ http }) => (await http("/notice")).headers.get("content-type")?.includes("text/html")],
      ["見出しに「夜の読書室」と出る", async ({ page }) => { await page.goto("/notice"); return page.getByRole("heading", { name: "夜の読書室", exact: true }).isVisible(); }],
    ],
  },
  restart: {
    file: "app/open/page.jsx",
    checks: [
      ["起動中のページへ接続できる", async ({ http }) => (await http("/open")).ok],
      ["再開した受付に「午後の受付」と出る", async ({ page }) => { await page.goto("/open"); return page.getByText("午後の受付", { exact: true }).isVisible(); }],
    ],
  },
  format: {
    file: "app/api/shelf/route.js",
    checks: [
      ["JSONとして応答する", async ({ http }) => (await http("/api/shelf")).headers.get("content-type")?.includes("application/json")],
      ["棚の名前が「北の棚」、冊数が数の2", async ({ http }) => { const data = await (await http("/api/shelf")).json(); return data.shelf === "北の棚" && data.count === 2; }],
    ],
  },
  query: {
    file: "app/api/pick/route.js",
    checks: [
      ["条件を付けないと二冊を返す", async ({ http }) => (await (await http("/api/pick")).json()).length === 2],
      ...[["町","lamp"], ["水辺","reed"], ["山",""]].map(([topic, id]) =>
        ["種類が「" + topic + "」の原稿だけを返す", async ({ http }) => {
          const rows = await (await http("/api/pick?topic=" + encodeURIComponent(topic))).json();
          return Array.isArray(rows) && rows.map(item => item.id).join(",") === id;
        }]),
    ],
  },
  layout: {
    file: "app/room/layout.jsx",
    checks: ["/room", "/room/guide"].map((url, index) =>
      [url + " に共通の見出しと固有の本文がある", async ({ page }) => {
        await page.goto(url);
        return await page.getByRole("heading", { name: "北の読書室", exact: true }).isVisible()
          && await page.getByText(index ? "本は一人二冊までです。" : "受付で本を選べます。", { exact: true }).isVisible();
      }]),
  },
  dynamic: {
    file: "app/archive/[id]/page.jsx",
    checks: [["reed","葦の小舟"], ["lamp","坂の灯"], ["unknown","本が見つかりません"]].map(([id, name]) =>
      [id + " を直接開くと「" + name + "」", async ({ page }) => {
        await page.goto("/archive/" + id);
        return page.getByRole("heading", { name, exact: true }).isVisible();
      }]),
  },
};
