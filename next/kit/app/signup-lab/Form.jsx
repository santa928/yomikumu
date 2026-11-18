"use client";
import { useActionState } from "react";
import Fields from "./fields";
import Submit from "./submit";

const initial = {kind:"ready",values:{alias:"",seats:"1"},message:"",revision:0};
export default function SignupForm({ action, ticket, practice }) {
  const [state, send, pending] = useActionState(action, initial);
  const accepted = state.kind === "accepted";
  return <form action={send} aria-busy={pending}>
    <input type="hidden" name="ticket" value={ticket}/>
    <fieldset key={state.revision} disabled={accepted || pending}>
      <legend>架空の読書会への申込</legend>
      {practice === "fields" ? <Fields values={state.values}/> : <>
        <label>架空の表示名 <input name="alias" defaultValue={state.values.alias}/></label>
        <label>人数 <input name="seats" inputMode="numeric" defaultValue={state.values.seats}/></label>
      </>}
    </fieldset>
    {practice === "pending" ? <Submit pending={pending} accepted={accepted}/> :
      <button type="submit" disabled={pending || accepted}>{pending ? "送信中" : accepted ? "受付済み" : "申込を送信"}</button>}
    <p role="status">{pending ? "申込を送っています。" : state.message}</p>
    {accepted && <p>受付番号 <output>{state.receipt}</output></p>}
  </form>;
}
