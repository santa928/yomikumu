async function firstPaint({ page, http }, path, inspect) {
  const response = await http(path);
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return false;
  const context = await page.context().browser().newContext({ javaScriptEnabled: false });
  try {
    const first = await context.newPage();
    await first.goto(response.url);
    return await inspect(first);
  } finally { await context.close(); }
}
const titleIs = name => page => page.getByRole("heading",{name,exact:true}).isVisible();
const origin = "/client-lab";
export const clientChecks = {
  "server-book": {
    file: "app/client-lab/read/page.jsx",
    checks: [
      ["直接開いた初期HTMLに最初の題名がある", env => firstPaint(env,origin+"/read",titleIs("石橋のスケッチ"))],
      ["fern の初期HTMLに二冊目の題名がある", env => firstPaint(env,origin+"/read?book=fern",titleIs("羊歯の標本帳"))]
    ]
  },
  "book-props": {
    file: "app/client-lab/props/page.jsx",
    checks: [
      ["それぞれの題名が初期表示に届く", async env => {
        for(const [id,title] of [["bridge","石橋のスケッチ"],["fern","羊歯の標本帳"]])
          if(!await firstPaint(env,origin+"/props?book="+id,titleIs(title))) return false;
        return true;
      }],
      ["原稿の二種類の所蔵数を読める", async ({page}) => {
        for(const [id,n] of [["bridge",3],["fern",5]]) {
          await page.goto(origin+"/props?book="+id);
          if(!await page.getByText(new RegExp("所蔵\\s*"+n+"\\s*冊")).isVisible()) return false;
        }
        return true;
      }],
      ["内部の整理用記号をブラウザへの応答に含めない",async ({http}) => {
        for(const id of ["bridge","fern"]) {
          const html = await (await http(origin+"/props?book="+id)).text();
          if(html.includes("整理室の例示記号")) return false;
        }
        return true;
      }]
    ]
  },
  "client-switch": {
    file: "app/client-lab/switch/Switch.jsx",
    checks: [
      ["直接開くと未選択の栞がある", env=>firstPaint(env,origin+"/switch",async p=>
        await p.getByRole("button",{name:"栞なし",pressed:false}).isVisible())],
      ["クリックすると栞が付く", async({page})=>{
        await page.goto(origin+"/switch");
        await page.getByRole("button",{name:"栞なし"}).click();
        return page.getByRole("button",{name:"栞あり",pressed:true}).isVisible();
      }],
      ["再クリックで栞を外し、キーボードでも戻せる",async({page})=>{
        await page.getByRole("button",{name:"栞あり"}).click();
        const button=page.getByRole("button",{name:"栞なし",pressed:false});
        if(!await button.isVisible()) return false;
        await button.press("Enter");
        return page.getByRole("button",{name:"栞あり",pressed:true}).isVisible();
      }]
    ]
  },
  "client-count": {
    file:"app/client-lab/press/Favorite.jsx",
    checks:[
      ["直接届いた題名、未選択のボタン、0回が見える",env=>firstPaint(env,origin+"/press?book=fern",async p=>
        await titleIs("羊歯の標本帳")(p) && await p.getByRole("button",{name:/羊歯の標本帳/,pressed:false}).isVisible()
        && /押した回数\s*0/.test(await p.getByRole("status").innerText()))],
      ["最初のクリックで選択中・1回になる",async({page})=>{
        await page.goto(origin+"/press?book=fern"); await page.getByRole("button",{name:/羊歯の標本帳/}).click();
        return await page.getByRole("button",{name:/羊歯の標本帳/,pressed:true}).isVisible() && /押した回数\s*1/.test(await page.getByRole("status").innerText());
      }],
      ["2回目と3回目も前の回数から更新する",async({page})=>{
        for(const n of [2,3]) {
          await page.getByRole("button",{name:/羊歯の標本帳/}).click();
          if(!await page.getByRole("button",{pressed:n%2===1,name:/羊歯の標本帳/}).isVisible() ||
            !new RegExp("押した回数\\s*"+n+"$").test(await page.getByRole("status").innerText())) return false;
        }
        return true;
      }]
    ]
  }
};
