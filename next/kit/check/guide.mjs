const spring = [
  { id: "river", title: "川辺の読書会", seats: 2 },
  { id: "hill", title: "丘の読書会", seats: 0 },
  { id: "bridge", title: "橋の読書会", seats: 1 },
];
const autumn = [
  { id: "river", title: "夕方の詩の会", seats: 0 },
  { id: "lamp", title: "灯りの会", seats: 4 },
];
const titles = [...spring, ...autumn].map(item => item.title);

function hasSeats(text, seats) {
  const compact = text.replace(/\s/g, "");
  return seats === 0 ? compact.includes("満席") : new RegExp("残席" + seats + "(?![0-9])").test(compact);
}
async function goByLink(page, link, pathname) {
  if (!await link.isVisible()) return false;
  await Promise.all([
    page.waitForURL(url => url.pathname === pathname, { timeout: 4000 }),
    link.click(),
  ]);
  return true;
}
async function listed(page, expected, edition) {
  if (!await page.getByRole("heading", { name: "読書会の一覧", exact: true }).isVisible()) return false;
  const ids = await page.locator("main a[href]").evaluateAll(links => [...new Set(links.map(a => new URL(a.href).pathname).filter(path => /^\/meetings\/[^/]+$/.test(path)))].sort());
  if (JSON.stringify(ids) !== JSON.stringify(expected.map(item => "/meetings/" + item.id).sort())) return false;
  for (const title of titles) {
    const link = page.getByRole("link", { name: new RegExp(title) });
    const item = expected.find(record => record.title === title);
    if (!item) {
      if (await link.count()) return false;
      continue;
    }
    if (await link.count() !== 1 || !await link.isVisible()) return false;
    const address = new URL(await link.getAttribute("href"), page.url());
    if (address.pathname !== "/meetings/" + item.id || (address.searchParams.get("edition") || "spring") !== edition) return false;
    const row = await link.evaluate(node => {
      let current = node;
      while (current && current.tagName !== "BODY") {
        if (current.querySelectorAll('a[href*="/meetings/"]').length > 1) break;
        if (/満席|残席/.test(current.innerText)) return current.innerText;
        current = current.parentElement;
      }
      return "";
    });
    if (!hasSeats(row, item.seats)) return false;
  }
  return true;
}

async function submitTown(page, town) {
  const field = page.getByLabel("地区", { exact: true });
  if (await field.count() !== 1) return false;
  if (await field.evaluate(node => node.tagName === "SELECT")) await field.selectOption(town);
  else await field.fill(town);
  const form = field.locator("xpath=ancestor::form[1]");
  const button = form.getByRole("button").first();
  if (!await button.isVisible()) return false;
  if (await form.evaluate(node => node.method.toLowerCase()) !== "get") return false;
  const path = new URL(page.url()).pathname;
  await Promise.all([
    page.waitForURL(url => url.pathname === path && url.searchParams.get("town") === town, { timeout: 4000 }),
    button.click(),
  ]);
  const response = await page.reload();
  if (!response?.ok() || response.request().method() !== "GET") return false;
  return true;
}
async function detail(page, item, town) {
  return await page.getByRole("heading", { name: item.title, exact: true }).isVisible()
    && (await page.locator("main").innerText()).includes(town)
    && hasSeats(await page.locator("main").innerText(), item.seats);
}

const meetingTests = [
  ["春の一覧で三つの回ごとのリンクと、それぞれの残席を表示する", async ({ page }) => {
    await page.goto("/meetings");
    return listed(page, spring, "spring");
  }],
  ["春の一件を一覧から開き、港の川辺の読書会と残席2を確認する", async ({ page }) => {
    await page.goto("/meetings");
    return await goByLink(page, page.getByRole("link", { name: /川辺の読書会/ }), "/meetings/river")
      && await detail(page, spring[0], "港");
  }],
  ["秋に切り替えると原稿が変わり、2件のリンク・地区・残席を保持する", async ({ page }) => {
    await page.goto("/meetings?edition=autumn");
    if (!await listed(page, autumn, "autumn")) return false;
    if (!await submitTown(page, "港")) return false;
    return new URL(page.url()).searchParams.get("edition") === "autumn" && await listed(page, [autumn[1]], "autumn");
  }],
  ["春の港は二件、坂は一件、条件に合う回がない地区では案内が出る", async ({ page }) => {
    for (const [town, expected] of [["港", [spring[0], spring[2]]], ["坂", [spring[1]]], ["山", []]]) {
      await page.goto("/meetings?town=" + encodeURIComponent(town));
      if (!await listed(page, expected, "spring")) return false;
    }
    return page.getByText("該当する回はありません。", { exact: true }).isVisible();
  }],
  ["直接開いた同じidも秋の原稿で変わり、満席・残席4・対象なしを出し分ける", async ({ page }) => {
    await page.goto("/meetings/river?edition=autumn");
    if (!await detail(page, autumn[0], "坂")) return false;
    await page.goto("/meetings/lamp?edition=autumn");
    if (!await detail(page, autumn[1], "港")) return false;
    await page.goto("/meetings/hill?edition=autumn");
    return page.getByText("読書会が見つかりません", { exact: true }).isVisible();
  }],
];

export const guideChecks = {
  "travel-list": {
    file: "app/travel/page.jsx",
    checks: [["水辺の桟橋", "pier"], ["夕方の丘", "hill"]].map(([name, id]) => [
      name + " のリンクを一覧で押すと、その詳細の住所を開ける",
      async ({ page }) => {
        await page.goto("/travel");
        const anchor = page.getByRole("link", { name, exact: true });
        if (!await goByLink(page, anchor, "/travel/" + id)) return false;
        await page.getByRole("heading", { name, exact: true }).waitFor({ timeout: 3500 });
        return true;
      },
    ]),
  },
  "travel-detail": {
    file: "app/travel/hill/page.jsx",
    checks: [
      ["丘の住所を直接開くと「夕方の丘」と「石段を上ります。」を読める", async ({ page }) => {
        await page.goto("/travel/hill");
        return await page.getByRole("heading", { name: "夕方の丘", exact: true }).isVisible() && await page.getByText("石段を上ります。", { exact: true }).isVisible();
      }],
      ["丘から「旅の一覧へ」を押すと一覧ページに戻る", async ({ page }) => {
        await page.goto("/travel/hill");
        const back = page.getByRole("link", { name: "旅の一覧へ", exact: true });
        return goByLink(page, back, "/travel");
      }],
    ],
  },
  "travel-search": {
    file: "app/travel/search/page.jsx",
    checks: [
      ["地区を指定しないと二つの目的地が出る", async ({ page }) => {
        await page.goto("/travel/search");
        return await page.getByText("水辺の桟橋", { exact: true }).isVisible() && await page.getByText("夕方の丘", { exact: true }).isVisible();
      }],
      ["フォームで坂をGET送信して丘だけを表示する", async ({ page }) => {
        await page.goto("/travel/search");
        return await submitTown(page, "坂") && await page.getByText("夕方の丘", { exact: true }).isVisible() && !await page.getByText("水辺の桟橋", { exact: true }).isVisible();
      }],
      ["港を直接開くと桟橋だけが出て、山では該当なしが出る", async ({ page }) => {
        await page.goto("/travel/search?town=" + encodeURIComponent("港"));
        if (!await page.getByText("水辺の桟橋", { exact: true }).isVisible() || await page.getByText("夕方の丘", { exact: true }).isVisible()) return false;
        await page.goto("/travel/search?town=" + encodeURIComponent("山"));
        return await page.getByText("該当する場所はありません。", { exact: true }).isVisible() && !await page.getByText("水辺の桟橋", { exact: true }).isVisible() && !await page.getByText("夕方の丘", { exact: true }).isVisible();
      }],
    ],
  },
  "travel-meta": {
    file: "app/travel/note/page.jsx",
    checks: [
      ["ページ本文の見出しとタブの名前を別々に表示する", async ({ page }) => {
        await page.goto("/travel/note");
        return await page.title() === "港の道順" && await page.getByRole("heading", { name: "桟橋までの道" }).isVisible();
      }],
      ["HTMLのdescriptionに指定した道順と目印の紹介がある", async ({ page }) => {
        await page.goto("/travel/note");
        return (await page.locator('meta[name="description"]').getAttribute("content")) === "桟橋までの道順と目印を紹介します。";
      }],
    ],
  },
  "travel-image": {
    file: "app/travel/photo/page.jsx",
    checks: [
      ["港の画像が実際に読み込まれ、元の3対2の比率で見える", async ({ page }) => {
        await page.goto("/travel/photo");
        const img = page.locator("main img").first();
        if (!await img.isVisible()) return false;
        return img.evaluate(async node => {
          await node.decode();
          const url = new URL(node.currentSrc);
          const rect = node.getBoundingClientRect();
          return (url.pathname === "/harbor.png" || url.searchParams.get("url") === "/harbor.png") && node.naturalWidth > 0 && Math.abs(rect.width / rect.height - 1.5) < 0.03;
        });
      }],
      ["画像に赤い太陽と白い帆の代替テキストがある", async ({ page }) => {
        await page.goto("/travel/photo");
        return page.getByRole("img", { name: "港の赤い太陽と白い帆", exact: true }).isVisible();
      }],
    ],
  },
  "meeting-project": { file: "library/guide.jsx", checks: meetingTests },
  "meeting-export": {
    file: "app/meetings/layout.jsx",
    companionFiles: ["library/guide.jsx"],
    checks: [
      ["一覧と詳細に「海辺の読書会場」があり、書き出した各本文も表示する", async ({ page }) => {
        for (const [url, main] of [["/meetings", "読書会の一覧"], ["/meetings/river", "川辺の読書会"]]) {
          await page.goto(url);
          if (!await page.getByRole("heading", { name: "海辺の読書会場", exact: true }).isVisible() || !await page.getByRole("heading", { name: main, exact: true }).isVisible()) return false;
        }
        return true;
      }],
      ...meetingTests,
    ],
  },
};
