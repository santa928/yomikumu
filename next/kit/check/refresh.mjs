import { randomUUID } from "node:crypto";
const root = "/data-lab";
const freshId = () => "check-" + randomUUID();
async function setPaper(page, run, patch = {}) {
  const response = await page.request.post(root+"/origin?run="+run, {data:{
    title:"潮だまり通信", edition:1, publishedAt:"09:00", delay:0, state:"ok", ...patch
  }});
  if(!response.ok()) throw Error("原稿の設定に失敗しました。");
}
async function json(http,path) {
  const response = await http(path);
  if(!response.ok) throw Error("取得できませんでした。");
  return response.json();
}
const update = {edition:2,publishedAt:"10:15"};
const hasVersion = (data,n,time) => data.edition===n && data.publishedAt===time;
async function waitNote(page, text) {
  await page.getByRole("status").filter({hasText:text}).waitFor({timeout:7500});
  return (await page.getByRole("status").innerText())===text;
}
export const refreshChecks={
  "two-reads":{file:"app/data-lab/double/route.js",checks:[
    ["初版の番号と原稿時刻をHTTPで読める",async({page,http})=>{
      const run=freshId();
      await setPaper(page,run);
      return hasVersion(await json(http,root+"/double?run="+run),1,"09:00");
    }],
    ["同じURLに二度要求し、変更した番号と時刻を読める",async({page,http})=>{
      const run=freshId(), path=root+"/double?run="+run;
      await setPaper(page,run); const a=await json(http,path);
      await setPaper(page,run,update); const b=await json(http,path);
      return a.title==="潮だまり通信" && hasVersion(a,1,"09:00") && hasVersion(b,2,"10:15");
    }]
  ]},
  "hold-fresh":{file:"app/data-lab/policy/route.js",checks:[
    ["毎回取得では変更した原稿が届く",async({page,http})=>{
      const run=freshId(), path=root+"/policy?mode=fresh&run="+run;
      await setPaper(page,run); const a=await json(http,path);
      await setPaper(page,run,update); const b=await json(http,path);
      return hasVersion(a,1,"09:00") && hasVersion(b,2,"10:15");
    }],
    ["同じ保持用URLは初版を返し、毎回取得のURLは新版を返す",async({page,http})=>{
      const run=freshId(), keep=root+"/policy?mode=keep&run="+run, fresh=root+"/policy?mode=fresh&run="+run;
      await setPaper(page,run); const a=await json(http,keep);
      await setPaper(page,run,update); const b=await json(http,keep), c=await json(http,fresh);
      return hasVersion(a,1,"09:00") && hasVersion(b,1,"09:00") && hasVersion(c,2,"10:15");
    }]
  ]},
  "expire":{file:"app/data-lab/lifetime/route.js",checks:[
    ["初回はその原稿の版と時刻が届く",async({page,http})=>{
      const run=freshId(); await setPaper(page,run);
      return hasVersion(await json(http,root+"/lifetime?run="+run),1,"09:00");
    }],
    ["期限内は初版を保ち、期限後の実HTTP要求で新版に変わる",async({page,http})=>{
      const run=freshId(), path=root+"/lifetime?run="+run;
      await setPaper(page,run); const first=await json(http,path);
      await setPaper(page,run,update); const soon=await json(http,path);
      if(!hasVersion(first,1,"09:00") || !hasVersion(soon,1,"09:00")) return false;
      await new Promise(resolve=>setTimeout(resolve,2150));
      for(let n=0;n<12;n++) {
        if(hasVersion(await json(http,path),2,"10:15")) return true;
        await new Promise(resolve=>setTimeout(resolve,180));
      }
      return false;
    }]
  ]},
  "paper-wait":{file:"app/data-lab/wait/ReadState.jsx",checks:[
    ["遅い応答が届いたあとで題名が読める",async({page})=>{
      const run=freshId(); await setPaper(page,run,{delay:180,title:"波の便り"});
      await page.goto(root+"/wait?run="+run); await page.getByRole("button",{name:"本を読む",exact:true}).click();
      return waitNote(page,"波の便り");
    }],
    ["応答前に読込中と操作停止を示し、応答後に次の操作を許す",async({page})=>{
      const run=freshId(); await setPaper(page,run,{delay:900,title:"岸の便り"});
      await page.goto(root+"/wait?run="+run);
      const button=page.getByRole("button",{name:"本を読む",exact:true});
      await button.click();
      if(await page.getByRole("status").innerText()!=="読込中" || !await button.isDisabled()) return false;
      return await waitNote(page,"岸の便り") && await button.isEnabled();
    }]
  ]},
  "paper-fail":{file:"app/data-lab/fail/Reading.jsx",checks:[
    ["成功時に実際の原稿名を表示する",async({page})=>{
      const run=freshId(); await setPaper(page,run,{title:"岸の夜"});
      await page.goto(root+"/fail?run="+run); await page.getByRole("button",{name:"本を読む",exact:true}).click();
      return waitNote(page,"岸の夜");
    }],
    ["503の応答を受けて失敗を伝える",async({page})=>{
      const run=freshId(); await setPaper(page,run,{state:"fail"}); await page.goto(root+"/fail?run="+run);
      const incoming=page.waitForResponse(res=>res.url().includes("/data-lab/origin?"));
      await page.getByRole("button",{name:"本を読む",exact:true}).click();
      return (await incoming).status()===503 && await waitNote(page,"一時的な失敗");
    }]
  ]},
  "paper-missing":{file:"app/data-lab/missing/Reading.jsx",checks:[
    ["実在する本の一時失敗を区別する",async({page})=>{
      const run=freshId(); await setPaper(page,run,{state:"fail"}); await page.goto(root+"/missing?run="+run);
      await page.getByRole("button",{name:"本を読む",exact:true}).click(); return waitNote(page,"一時的な失敗");
    }],
    ["不在のIDの404に対象なしの案内を出し、存在する本に戻れる",async({page})=>{
      const run=freshId(); await setPaper(page,run,{title:"潮風の記録"}); await page.goto(root+"/missing?run="+run);
      const incoming=page.waitForResponse(res=>res.url().includes("/data-lab/origin?"));
      await page.getByRole("button",{name:"ない本を読む"}).click();
      if((await incoming).status()!==404 || !await waitNote(page,"本が見つかりません")) return false;
      await page.getByRole("button",{name:"本を読む",exact:true}).click(); return waitNote(page,"潮風の記録");
    }]
  ]},
  "paper-retry":{file:"app/data-lab/retry/Retry.jsx",checks:[
    ["失敗時にメモを残し、再試行ボタンを出す",async({page})=>{
      const run=freshId(); await setPaper(page,run,{state:"fail"}); await page.goto(root+"/retry?run="+run);
      await page.getByLabel("読書メモ").fill("続きは港から");
      await page.getByRole("button",{name:"本を読む"}).click();
      return await waitNote(page,"一時的な失敗") && await page.getByRole("button",{name:"再試行"}).isVisible()
        && await page.getByLabel("読書メモ").inputValue()==="続きは港から";
    }],
    ["復旧後、同じURLに再度要求し、届いた題名と下書きを確認できる",async({page})=>{
      const run=freshId(); await setPaper(page,run,{state:"fail"}); await page.goto(root+"/retry?run="+run);
      const urls=[]; page.on("request",r=>{if(r.url().includes("/data-lab/origin?")) urls.push(r.url());});
      await page.getByLabel("読書メモ").fill("明日読む"); await page.getByRole("button",{name:"本を読む"}).click();
      if(!await waitNote(page,"一時的な失敗")) return false;
      await setPaper(page,run,{title:"戻った便り",...update});
      await page.getByRole("button",{name:"再試行"}).click();
      return await waitNote(page,"戻った便り") && urls.length===2 && urls[0]===urls[1]
        && await page.getByLabel("読書メモ").inputValue()==="明日読む";
    }]
  ]}
};
