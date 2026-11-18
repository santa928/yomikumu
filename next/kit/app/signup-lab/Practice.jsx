import { randomUUID } from "node:crypto";
import SignupForm from "./Form";
import { reserve } from "./action";
import { submitForm } from "./actions";

export default function Practice({ practice = "example" }) {
  const action = practice === "action" ? reserve : submitForm.bind(null, practice);
  return <main><h1>夕暮れの読書会</h1>
    <p>教材用の申込です。「こまどり」など架空の表示名と、1〜3の人数を使ってください。</p>
    <SignupForm action={action} ticket={randomUUID()} practice={practice}/>
  </main>;
}
