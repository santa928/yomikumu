import "server-only";
import { randomUUID } from "node:crypto";

export function readValues(data) {
  const field = name => typeof data.get(name) === "string" ? data.get(name).slice(0, 80) : "";
  return { alias: field("alias"), seats: field("seats") };
}

export function validate(values) {
  if (!values.alias.trim()) return "表示名を入力してください。";
  if (!/^[1-3]$/.test(values.seats.trim())) return "人数は1〜3の整数を入力してください。";
  return "";
}

export function errorReply(previous, values, message) {
  return { kind:"error", values, message, revision:(previous.revision || 0) + 1 };
}

// このローカル教材は登録者名を保存しない。同じフォームからの再送には同じ受付番号を返す。
const receipts = new Map();
export async function accept(previous, values, ticket) {
  if (typeof ticket !== "string" || !/^[a-f0-9-]{36}$/i.test(ticket))
    return errorReply(previous, values, "フォームを開き直して送信してください。");
  await new Promise(resolve => setTimeout(resolve, 350));
  if (!receipts.has(ticket)) {
    if (receipts.size >= 500) receipts.delete(receipts.keys().next().value);
    receipts.set(ticket, randomUUID().slice(0, 8));
  }
  return {
    kind:"accepted",
    values,
    message:values.alias.trim() + "さん、" + values.seats.trim() + "名で受付済み",
    receipt:receipts.get(ticket),
    revision:(previous.revision || 0) + 1,
  };
}
