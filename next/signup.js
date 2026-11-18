"use strict";
nextChapters.push({
  id:"signup",title:"読書会に申し込み、誤入力を直して再送する",
  goal:"架空の表示名と人数で読書会に申し込みます。完成例を手元の /signup-lab で開き、4名を送ってから2名に直してみましょう。",
  examples:[
    ["/signup-lab　送信中","申込を送っています。ボタンは送信中です。"],
    ["/signup-lab　こまどり・4名","人数は1〜3の整数を入力してください。表示名と4が残ります。"],
    ["/signup-lab　2名に直して再送","こまどりさん、2名で受付済み。受付番号が一件表示されます。"],
  ],
});
const signupExamples = {
  fields:`export default function Fields({ values }) {
  return <>
    <label>架空の表示名 <input name="reader" defaultValue={values.alias} /></label>
    <label>人数 <input name="seats" inputMode="numeric" defaultValue={values.seats} /></label>
  </>;
}`,
  rules:`export function validateRegistration(values) {
  if (!values.alias.trim()) return "表示名を入力してください。";
  if (!/^\\d+$/.test(values.seats.trim())) return "人数は1〜3の整数を入力してください。";
  return "";
}`,
  retain:`export function retain(values) {
  return { alias: "", seats: values.seats };
}`,
  action:`"use server";
import { readValues, validate, errorReply, accept } from "./server";

export async function reserve(previous, formData) {
  const values = readValues(formData);
  const message = validate(values);
  if (message) return errorReply(previous, values, message);
  return errorReply(previous, values, "受付の処理を書いてください。");
}`,
  pending:`export default function Submit({ pending, accepted }) {
  return <button type="submit">申込を送信</button>;
}`,
};
nextLessons.push(
 {
  chapter:"signup",id:"signup-send",title:"表示名と人数のフォームを送る",
  slides:[
   ["欄に名前を付けて送る","nameはサーバーに届く項目の名前です。ラベルは人が読む表示、nameは受け取り側が値を探すための指定です。「こまどり」と2を入れ、送信ボタンを押します。",'<label>架空の表示名 <input name="alias" /></label>\n<input name="seats" inputMode="numeric" />','サーバーでaliasを読むと「こまどり」、seatsを読むと文字列の「2」が届きます。'],
   ["送った値で受付を読む","フォームのactionにはデータを受け取る処理が用意されています。ボタンだけでなく、欄でEnterを押しても送信できます。",'<form action={send}>\n  <input name="alias" />\n  <button type="submit">申込を送信</button>\n</form>',"正しい表示名・人数なら「こまどりさん、2名で受付済み」と出ます。"],
  ],
  quiz:["サーバーがformData.get('alias')で名前を読む時、表示名の欄に必要なのは？",['name="alias"','name="seats"','id="river"だけ','ボタン名をaliasにする'],0,"表示名と人数を、受け取り側が探すnameで送ります。"],
  build:['<input name="①" />\n<input name="②" />',[["表示名の項目","reader","alias"],["人数の項目","seats","count"]]],right:["alias","seats"],
  file:"app/signup-lab/fields.jsx",source:signupExamples.fields,answer:signupExamples.fields.replace('name="reader"','name="alias"'),
  task:"/signup-lab/fields の表示名を正しい項目名aliasで送ります。架空名「ことり」と2名を送り、サーバーが返す表示を確かめます。",hint:"サーバーが読むaliasと、表示名のinputのnameをそろえます。",
 },{
  chapter:"signup",id:"signup-validate",title:"サーバーで送信値を検証する",
  slides:[
   ["届いた文字を調べる","キーボードを数字向けにしても、送られる値に数字以外が含まれる可能性があります。受け取ったサーバー側でも空白と範囲を確かめます。trim()は両端の空白を取り除きます。",'const seats = values.seats.trim();\nconst allowed = ["1", "2", "3"];\nallowed.includes(seats);','「 2 」は認められ、「0」「4」「1.5」「二」は人数エラーになります。'],
   ["受付前に理由を返す","validateRegistrationは問題があれば理由を、通れば空文字を返します。表示名が空白だけの時も、受付に進む前に止めます。",'if (!values.alias.trim()) return "表示名を入力してください。";\nreturn "";',"表示名が空なら、人数が正しくても受付番号は出ません。"],
  ],
  quiz:["4名の要求が届きました。サーバーが返すのは？",["4名で受付済み","1名に書き換えて受付","人数エラーと入力値","画面を閉じる"],2,"操作画面の制限に頼らず、サーバーが不正な人数を確認して拒否します。"],
  build:['const seats = values.seats.①();\nif (!["1","2","3"].②(seats)) return "人数は1〜3の整数を入力してください。";',[["空白を除く","trim","slice"],["候補に含むか","includes","join"]]],right:["trim","includes"],
  file:"app/signup-lab/rules.js",source:signupExamples.rules,answer:signupExamples.rules.replace('!/^\\d+$/.test(values.seats.trim())','!["1", "2", "3"].includes(values.seats.trim())'),
  task:"/signup-lab/validation のサーバーで、表示名は空白以外、人数は前後の空白を除いた1、2、3だけを受け付けます。それ以外は表示名または人数の理由を返してください。",hint:"数字かどうかに加え、許可された一桁かをサーバーで確認します。",
 },{
  chapter:"signup",id:"signup-retain",title:"入力エラーでも表示名と人数を保つ",
  slides:[
   ["応答を返す時に入力も返す","エラーの文だけでなく送られた値も返すと、やり直す人が全欄を入れ直さずに済みます。この教材ではretainがエラー時に戻す値を選びます。",'return { alias: values.alias, seats: values.seats };','「こよみ」と4を送ると、修正できる二つの欄に「こよみ」と4が残ります。'],
   ["間違った一欄だけを直す","フォームは戻ったvaluesをdefaultValueとして表示します。人数だけを2に変えれば、同じ表示名で再送できます。",'<input name="alias" defaultValue={state.values.alias}/>','再送時には「こよみさん、2名で受付済み」が一度出ます。'],
  ],
  quiz:["人数だけがエラーになりました。次にできるようにしたい操作は？",["両方とも必ず再入力","名前を残し人数だけ直す","画面を再起動","エラーのまま成功とする"],1,"両方の入力を保ち、利用者が間違った欄だけを直せるようにします。"],
  build:['return { alias: ①, seats: ② };',[["返す表示名",'""',"values.alias"],["返す人数","values.seats",'"1"']]],right:["values.alias","values.seats"],
  file:"app/signup-lab/retry.js",source:signupExamples.retain,answer:signupExamples.retain.replace('alias: ""','alias: values.alias'),
  task:"/signup-lab/retention で人数4を送った時、表示名・人数のどちらも元の入力を返してください。片方だけ直して再送し、受付が完了するか試します。",hint:"空文字を作らず、サーバーが受け取ったvaluesから名前と人数の両方を返します。",
 },{
  chapter:"signup",id:"signup-action",title:"検証と受付をServer Actionにつなぐ",
  slides:[
   ["サーバーで実行する関数を用意する","Server Actionはフォームから呼べるサーバー側の関数です。ファイルの最初の'use server'とexport async functionで定義できます。useActionStateを使うフォームは前の状態とFormDataを渡します。",'"use server";\nexport async function reserve(previous, formData) {\n  const values = readValues(formData);\n  // ここで検証し、結果を返す\n}',"この関数は手元のNext.jsサーバー上で実行され、結果がブラウザへ返ります。"],
   ["通った申込だけに受付番号を付ける","readValuesとvalidateは値の読み取り・検証を担当します。errorReplyは理由と元の値を、acceptは受付結果を返します。ticketはこのフォームの受付番号を二重発行しないための識別子です。",'if (message) return errorReply(previous, values, message);\nreturn accept(previous, values, formData.get("ticket"));',"不正な値に受付番号は付きません。正しい再送に一つの受付番号が付きます。"],
  ],
  quiz:["Server Actionの実行場所はどこですか。",["CSSの中","読書会の参加者のメール","スマホのキーボード","手元のNext.jsサーバー"],3,"フォームが要求を送り、サーバーで検証・受付してから結果を返します。"],
  build:['if (message) return ①(previous, values, message);\nreturn ②(previous, values, formData.get("ticket"));',[["エラー時に返す","errorReply","accept"],["有効な時に受付","accept","readValues"]]],right:["errorReply","accept"],
  file:"app/signup-lab/action.js",source:signupExamples.action,answer:signupExamples.action.replace('errorReply(previous, values, "受付の処理を書いてください。")','accept(previous, values, formData.get("ticket"))'),
  task:"/signup-lab/action のServer Actionを完成させます。検証に合わなければ理由を返し、合った時はacceptに前の状態・入力値・ticketを渡してください。",hint:"失敗分岐を通らなかった時だけ、フォームに入っていたticketを渡して受付します。",
 },{
  chapter:"signup",id:"signup-pending",title:"待機中・再入力・受付済みでボタンを切り替える",
  slides:[
   ["応答を待つ時は二重送信を止める","useActionStateが返すpendingは、サーバーからの応答を待つ間だけtrueです。この教材では受付に少し時間をかけ、送信中の表示と押せるかどうかを実際に見られます。",'const [state, send, pending] = useActionState(action, initial);\nconst accepted = state.kind === "accepted";',"クリック直後はpendingがtrueになり、応答時にfalseへ戻ります。"],
   ["結果によって次の操作を決める","エラーならpendingもacceptedもfalseです。条件を||で結ぶと、どちらか一つでもtrueのときボタンを無効にできます。",'<button disabled={pending || accepted}>\n  {pending ? "送信中" : accepted ? "受付済み" : "申込を送信"}\n</button>',"エラー時は再送可能、待機中と受付済みは送信できません。"],
  ],
  quiz:["待機中にボタンをもう一度押そうとすると？",["さらに二件受付","押せず、一件の結果を待つ","前の入力が消える","受付エラーに変わる"],1,"待機中の連打を止め、エラーなら入力を保ったまま操作を戻します。"],
  build:['<button disabled={① || ②}>申込を送信</button>',[["応答を待つ間","pending","false"],["成功した後","accepted","true"]]],right:["pending","accepted"],
  file:"app/signup-lab/submit.jsx",source:signupExamples.pending,answer:`export default function Submit({ pending, accepted }) {
  return <button type="submit" disabled={pending || accepted}>
    {pending ? "送信中" : accepted ? "受付済み" : "申込を送信"}
  </button>;
}`,
  task:"/signup-lab/pending で、状態を受け取る部品の中身を自分で書きます。待機中は「送信中」、成功は「受付済み」で送信を止め、エラーの後は「申込を送信」で再操作できます。名前を残した再送、連打しても一件の結果だけが出ることを確かめます。",hint:"ボタンの文字だけでなく、実際のdisabledをpendingとacceptedから決めます。",
 }
);
