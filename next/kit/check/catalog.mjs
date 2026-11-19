const list = "/recommendations";
const backName = "おすすめの一覧へ戻る";
const title = "おすすめの本";
const waterFirst = ["葦の小舟", "渡し船の手紙"];
const waterSecond = ["夕暮れの桟橋", "港の地図"];
const town = ["坂の灯", "丘の時計"];

function heading(page, name) {
  return page.getByRole("heading", { level: 1, name, exact: true });
}

async function navigate(page, urlMatches, action) {
  await Promise.all([page.waitForURL(urlMatches, { timeout: 8000 }), action()]);
}

function listUrl(query, pageNumber) {
  return url => url.pathname === list
    && url.searchParams.get("q") === query
    && url.searchParams.get("page") === pageNumber;
}

async function search(page, term) {
  const field = page.getByLabel("検索語", { exact: true });
  await field.fill(term, { timeout: 3000 });
  await navigate(page, listUrl(term, null), () => field.press("Enter"));
}

async function shows(page, expected, pageNumber) {
  await heading(page, title).waitFor({ timeout: 5000 });
  const names = await page.locator("main ul li").allTextContents();
  if (names.length !== expected.length || !names.every((name, index) => name.trim() === expected[index])) return false;
  if (!pageNumber) return true;
  return page.getByRole("navigation", { name: "ページ送り", exact: true })
    .getByText(pageNumber, { exact: true }).isVisible();
}

export const catalogChecks = {
  "catalog-links": {
    file: "library/recommendation-title.jsx",
    checks: [
      ["本の題名がリンクになり、それぞれのIDがリンク先の末尾に付く", async ({ page }) => {
        await page.goto(list);
        for (const [name, id] of [[waterFirst[0], "reed"], [waterFirst[1], "ferry"]]) {
          const link = page.getByRole("link", { name, exact: true });
          if (!await link.isVisible()) return false;
          if (new URL(await link.getAttribute("href"), page.url()).pathname !== list + "/" + id) return false;
        }
        return true;
      }],
    ],
  },
  "catalog-detail": {
    file: "app/recommendations/[id]/page.jsx",
    createFile: true,
    companionFiles: ["library/recommendation-title.jsx"],
    checks: [
      ["app/recommendations/[id]/page.jsx を作り、直接開いた本の題名と紹介文を表示する", async ({ page }) => {
        const response = await page.goto(list + "/reed");
        return response?.ok() && await heading(page, "葦の小舟").isVisible()
          && await page.getByText("葦を編んだ小舟が、ゆっくり流れを下ります。", { exact: true }).isVisible();
      }],
      ["図書室の入口からおすすめの一覧を開き、「葦の小舟」のリンクで題名と紹介文を読む", async ({ page }) => {
        await page.goto("/");
        await navigate(page, url => url.pathname === list, () =>
          page.getByRole("link", { name: "おすすめの本を探す", exact: true }).click());
        await navigate(page, url => url.pathname === list + "/reed", () =>
          page.getByRole("link", { name: "葦の小舟", exact: true }).click());
        await heading(page, "葦の小舟").waitFor({ timeout: 5000 });
        return page.getByText("葦を編んだ小舟が、ゆっくり流れを下ります。", { exact: true }).isVisible();
      }],
      ["別の本の住所を直接開くと、その本の題名と紹介文が出る", async ({ page }) => {
        const response = await page.goto(list + "/dusk");
        return response?.ok() && await heading(page, "夕暮れの桟橋").isVisible()
          && await page.getByText("夕暮れの桟橋で、波と足音に耳を澄まします。", { exact: true }).isVisible();
      }],
      ["詳細と見つからない案内のそれぞれから一覧へ戻れる", async ({ page }) => {
        for (const [id, name] of [["dusk", "夕暮れの桟橋"], ["missing", "おすすめの本が見つかりません"]]) {
          await page.goto(list + "/" + id);
          if (!await heading(page, name).isVisible()) return false;
          const link = page.getByRole("link", { name: backName, exact: true });
          if (!await link.isVisible()) return false;
          await navigate(page, url => url.pathname === list, () => link.click());
          await heading(page, title).waitFor({ timeout: 5000 });
        }
        return true;
      }],
    ],
  },
  "catalog-search": {
    file: "app/recommendations/page.jsx",
    checks: [
      ["検索条件なしで、全6冊の最初の2冊と1 / 3 ページを表示する", async ({ page }) => {
        await page.goto(list);
        return shows(page, waterFirst, "1 / 3 ページ");
      }],
      ["検索語を送ると URL に q が付き、水辺の結果だけを2冊ずつ表示する", async ({ page }) => {
        await page.goto(list);
        await search(page, "水辺");
        return shows(page, waterFirst, "1 / 2 ページ");
      }],
      ["水辺の結果の2ページ目に進むと q と page が残り、再読み込みしても同じ結果になる", async ({ page }) => {
        await page.goto(list + "?q=" + encodeURIComponent("水辺"));
        await navigate(page, listUrl("水辺", "2"), () =>
          page.getByRole("link", { name: "次のページ", exact: true }).click({ timeout: 5000 }));
        await page.reload();
        if (!await shows(page, waterSecond, "2 / 2 ページ")) return false;
        if (await page.getByRole("link", { name: "次のページ", exact: true }).count()) return false;
        const previous = page.getByRole("link", { name: "前のページ", exact: true });
        await navigate(page, url => url.pathname === list && url.searchParams.get("q") === "水辺"
          && (url.searchParams.get("page") || "1") === "1", () => previous.click({ timeout: 5000 }));
        return shows(page, waterFirst, "1 / 2 ページ");
      }],
      ["2ページ目から別の語で検索すると1ページ目になり、ブラウザで戻ると前の検索語と2ページ目に戻る", async ({ page }) => {
        await page.goto(list + "?q=" + encodeURIComponent("水辺") + "&page=2");
        await search(page, "町");
        if (!await shows(page, town, "1 / 1 ページ")) return false;
        await page.goBack();
        return listUrl("水辺", "2")(new URL(page.url()))
          && await page.getByLabel("検索語", { exact: true }).inputValue() === "水辺"
          && await shows(page, waterSecond, "2 / 2 ページ");
      }],
      ["題名の一部で1冊を探し、該当なしでは案内を出し、範囲外のページは1ページ目を表示する", async ({ page }) => {
        await page.goto(list + "?q=" + encodeURIComponent("時計"));
        if (!await shows(page, ["丘の時計"], "1 / 1 ページ")) return false;
        await page.goto(list + "?q=" + encodeURIComponent("雪"));
        if (!await shows(page, []) || !await page.getByText("条件に合う本はありません。", { exact: true }).isVisible()) return false;
        await page.goto(list + "?q=" + encodeURIComponent("水辺") + "&page=99");
        return shows(page, waterFirst, "1 / 2 ページ");
      }],
    ],
  },
};
