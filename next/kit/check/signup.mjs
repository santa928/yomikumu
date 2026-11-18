const pathFor = practice => "/signup-lab/" + practice;
const notice = page => page.locator("form p[role=status]");
const alias = page => page.getByRole("textbox", {name:"架空の表示名"});
const seats = page => page.getByRole("textbox", {name:"人数"});

async function fill(page, practice, name, count) {
  await page.goto(pathFor(practice));
  await alias(page).fill(name);
  await seats(page).fill(count);
}
async function submit(page) {
  const response = page.waitForResponse(r => r.request().method() === "POST" &&
    new URL(r.url()).pathname.startsWith("/signup-lab/"), {timeout:8000});
  await page.getByRole("button",{name:"申込を送信",exact:true}).click();
  const reply = await response;
  return reply.ok();
}
async function says(page, text) {
  await notice(page).filter({hasText:text}).waitFor({timeout:3500});
  return true;
}
async function accepted(page, expected) {
  await says(page,expected);
  return await page.locator("form output").count() === 1 && Boolean((await page.locator("form output").textContent())?.trim());
}
async function rejectByServer(page, practice, name, count, reason) {
  await fill(page,practice,name,count);
  if (!await submit(page)) return false;
  await says(page,reason);
  return await page.locator("form output").count() === 0 && await page.getByRole("button",{name:"申込を送信"}).isEnabled();
}
const file = name => "app/signup-lab/" + name;
export const signupChecks = {
  "signup-send":{
    file:file("fields.jsx"),
    checks:[
      ["人数がseatsの項目として届く",async({page})=>{
        await fill(page,"fields","ことり","2");
        return page.locator("form").evaluate(form=>new FormData(form).get("seats")==="2");
      }],
      ["表示名と2名をPOSTで送り、受付結果が届く",async({page})=>
        await submit(page) && await accepted(page,"ことりさん、2名で受付済み")],
    ],
  },
  "signup-validate":{
    file:file("rules.js"),
    checks:[
      ["空白だけの表示名をサーバーで拒否する",({page})=>rejectByServer(page,"validation","　 ","1","表示名")],
      ["範囲外・小数・数以外の人数は受付しない",async({page})=>{
        for(const value of ["0","4","1.5","二"])
          if(!await rejectByServer(page,"validation","つばき",value,"人数")) return false;
        return true;
      }],
      ["1と3を両方受け付ける",async({page})=>{
        for(const value of ["1","3"]){
          await fill(page,"validation","つばき"," "+value+" ");
          if(!await submit(page) || !await accepted(page,"つばきさん、"+value+"名で受付済み")) return false;
        }
        return true;
      }],
    ],
  },
  "signup-retain":{
    file:file("retry.js"),
    checks:[
      ["4名はエラーになり再操作できる",({page})=>rejectByServer(page,"retention","こよみ","4","人数")],
      ["エラー直後の両方の欄に送った文字が残る",async({page})=>
        await alias(page).inputValue()==="こよみ" && await seats(page).inputValue()==="4"],
      ["人数だけを変えて再送すると同じ名前の受付が一件できる",async({page})=>{
        await seats(page).fill("2");return await submit(page) && await accepted(page,"こよみさん、2名で受付済み");
      }],
    ],
  },
  "signup-action":{
    file:file("action.js"),
    checks:[
      ["本物のPOSTで送った不正値は理由を返して拒否する",({page})=>rejectByServer(page,"action","こはく","4","人数")],
      ["修正後に受付番号を一つ返す",async({page})=>{
        if(await alias(page).inputValue()!=="こはく") return false;
        await seats(page).fill("3");
        return await submit(page) && await accepted(page,"こはくさん、3名で受付済み");
      }],
    ],
  },
  "signup-pending":{
    file:file("submit.jsx"),
    checks:[
      ["エラーの後は表示名・人数を保ち、再送ボタンが使える",async({page})=>
        await rejectByServer(page,"pending","ひばり","4","人数") &&
        await alias(page).inputValue()==="ひばり" && await seats(page).inputValue()==="4"],
      ["送信中の表示で再送を止め、連打してもPOSTと受付番号が一件になる",async({page})=>{
        await seats(page).fill("2");
        let posts=0;
        const record=req=>{if(req.method()==="POST" && new URL(req.url()).pathname===pathFor("pending")) posts++;};
        page.on("request",record);
        try {
          await page.getByRole("button",{name:"申込を送信"}).click();
          const waiting=page.getByRole("button",{name:"送信中",exact:true});
          await waiting.waitFor({timeout:3000});
          if(!await waiting.isDisabled()) return false;
          await waiting.evaluate(b=>b.click());
          return await accepted(page,"ひばりさん、2名で受付済み") && posts===1;
        } finally {page.off("request",record);}
      }],
      ["受付完了後のボタンは無効で、成功表示を重ねない",async({page})=>
        await page.getByRole("button",{name:"受付済み",exact:true}).isDisabled() && await page.locator("form output").count()===1],
    ],
  },
};
