import { readFile, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";
const starter = { edition: 1, title: "潮だまり通信", publishedAt: "09:00", delay: 0, state: "ok" };
function recordPath(request) {
  const raw = new URL(request.url).searchParams.get("run") || "desk";
  return /^[a-z0-9-]{1,72}$/.test(raw) ? join(tmpdir(),"yomikumu-paper-"+raw+".json") : null;
}
function json(value, status = 200) {
  return Response.json(value,{status,headers:{"Cache-Control":"no-store"}});
}
export async function POST(request) {
  const file = recordPath(request);
  if (!file) return json({message:"実験名を確認"},400);
  let draft;
  try { draft = await request.json(); } catch { return json({message:"JSONを確認"},400); }
  if (!draft || !Number.isSafeInteger(draft.edition) || draft.edition < 1 || typeof draft.title !== "string" ||
      !draft.title.trim() || draft.title.length > 80 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.publishedAt) ||
      !Number.isInteger(draft.delay) || draft.delay < 0 || draft.delay > 2000 || !["ok","fail"].includes(draft.state))
    return json({message:"版・題名・時刻・待ち時間・状態を確認"},400);
  const record = { edition:draft.edition, title:draft.title, publishedAt:draft.publishedAt, delay:draft.delay, state:draft.state };
  const temporary = file+"-"+randomUUID();
  await writeFile(temporary,JSON.stringify(record));
  await rename(temporary,file);
  return json(record);
}
export async function GET(request) {
  const file = recordPath(request);
  if (!file) return json({message:"実験名を確認"},400);
  let record = starter;
  try { record = JSON.parse(await readFile(file,"utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  if (record.delay) await new Promise(resolve=>setTimeout(resolve,record.delay));
  if ((new URL(request.url).searchParams.get("id") || "tide") !== "tide") return json({message:"本が見つかりません"},404);
  if (record.state === "fail") return json({message:"一時的な失敗"},503);
  return json({title:record.title,edition:record.edition,publishedAt:record.publishedAt});
}
