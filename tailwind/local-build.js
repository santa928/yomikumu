"use strict";

function localInstructions(mode) {
  return `<section><h2>PCで自分のファイルを開く</h2>
    <p>${mode === "tap" ? "スマホの練習は上の「表示と答えを確かめる」で完了です。" : ""}書いたHTMLとCSSはZIPで保存できます。index.html には各カードに付けたクラス、input.css には自分で指定した色が入ります。</p>
    <button id="get-kit" type="button">今の読書棚をZIPで保存</button>
    <ol><li>Docker と Compose が使えるPCでZIPを展開し、compose.yaml のあるフォルダーでターミナルを開きます。</li>
    <li>次の一行を実行します。初回は Node のイメージと Tailwind CLI を取得するためネット接続が必要です。CLI が HTML のクラスから shelf.css を作ります。<pre>docker compose run --rm build</pre></li>
    <li>同じフォルダーの index.html をブラウザで開き、幅を狭めたり広げたりして2枚のカードが縦並びから横並びに変わるかを確かめます。各カードの「本の紹介」も開いてみましょう。</li>
    <li>index.html の書名や input.css の色を一か所変えたら、同じコマンドをもう一度実行し、開いたページを再読み込みします。</li></ol>
    <p>課題で指定した色と間隔のときに、生成したファイルを選ぶと、二つの幅と両方のテーマ色をこの画面でも確かめられます。</p>
    <label>生成した shelf.css を選ぶ <input id="built-css" type="file" accept=".css,text/css"></label>
    <p id="local-result" role="status"></p></section>`;
}

function bindLocal(unit, draft, state, validTheme) {
  const result = document.getElementById("local-result");
  if (state.localDone) result.textContent = "手元で生成したCSSを確認済みです。";
  document.getElementById("get-kit").onclick = () => {
    if (!validTheme()) { result.textContent = "色の定義を見本と比べてから保存してください。"; return; }
    saveFile("reading-shelf.zip", window.readingProject(draft), "application/zip");
    result.textContent = "今のクラスとテーマを入れました。展開してコマンドに進みましょう。";
  };
  document.getElementById("built-css").onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const css = await file.text();
      if (!css.trim() || /@(?:import|tailwind|theme|source)\b/i.test(css)) {
        result.textContent = "生成後の shelf.css を選んでください。input.css は生成前の材料です。";
        return;
      }
      const checks = await evaluateReading(unit, draft, css);
      const gap = checks.find(item => !item.ok);
      if (gap) { result.textContent = "読み込んだCSSを確認しましょう。" + gap.check.hint; return; }
      state.localDone = true;
      save();
      result.textContent = "読み込んだCSSで、幅639pxでは縦、640pxでは横に並びました。2枚のカードの文字色も一致しています。";
    } catch { result.textContent = "CSSを読み込めませんでした。生成した shelf.css を選び直してください。"; }
  };
}
