"use strict";

function isBuiltCss(css) {
  return css.trim() && !/@(?:import|tailwind|theme|source)\b/i.test(css);
}

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
      if (!isBuiltCss(css)) {
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

function statusLocalInstructions(mode) {
  return `<section><h2>PCでCSSを生成し直す</h2>
    ${mode === "tap" ? "<p>スマホでは上の練習で状態ごとの名前を確かめられます。手元でのCSS生成はPCで行います。</p>" : ""}
    <button id="get-status-kit" type="button">故障した読書棚をZIPで保存</button>
    <ol>
      <li>Docker と Compose が使えるPCでZIPを展開し、compose.yaml のあるフォルダーでターミナルを開きます。</li>
      <li>次の一行を実行します。初回はNodeのイメージとTailwind CLIを取得するため、ネット接続が必要です。<pre>docker compose run --rm build</pre></li>
      <li>同じフォルダーの index.html を開きます。「貸出中にする」を押すと文字は変わりますが、2状態の色は同じです。開発者ツールで状態の文字を選ぶと、要素の class には text-emerald-700 または text-rose-700 が入っています。</li>
      <li>生成された shelf.css をエディターで開き、<code>.text-emerald-700</code> と <code>.text-rose-700</code> を検索します。最初はどちらの色の指定も見つかりません。</li>
      <li>status.js の statusClass を直します。利用可の available と貸出中の borrowed に、それぞれ上で選んだクラス名を文字列で書きます。書き方は「見本を一か所変える」で読み返せます。</li>
      <li>同じコマンドをもう一度実行します。新しい shelf.css を開いて同じ二つの名前を検索し、今度は両方に文字色の指定があることを確かめます。</li>
      <li>index.html を再読み込みして状態を切り替え、文字色を比べます。幅を狭めると縦、640px以上では横に並びます。Tabキーでボタンに移ると輪郭が見えます。</li>
    </ol>
    <label>生成した shelf.css を選ぶ <input id="status-built-css" type="file" accept=".css,text/css"></label>
    <p id="status-local-result" role="status"></p></section>`;
}

function bindStatusLocal(unit, state) {
  const input = document.getElementById("status-built-css");
  const result = document.getElementById("status-local-result");
  let activeFile;
  if (state.localDone) result.textContent = "手元で生成したCSSを確認済みです。";
  document.getElementById("get-status-kit").onclick = () => {
    saveFile("reading-status-shelf.zip", window.readingStatusProject(statusScript, statusButtonClasses), "application/zip");
  };
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    activeFile = file;
    input.value = "";
    state.localDone = false;
    save();
    result.textContent = "CSSの表示を確認しています。";
    const current = () => input.isConnected && activeFile === file;
    try {
      const css = await file.text();
      if (!current()) return;
      if (!isBuiltCss(css)) {
        result.textContent = "生成後の shelf.css を選んでください。input.css は生成前の材料です。";
        return;
      }
      const checks = await evaluateReading(unit, statusBookColors, css);
      if (!current()) return;
      const missing = checks.find(item => !item.ok);
      if (missing) {
        result.textContent = "読み込んだCSSを確認しましょう。" + missing.check.hint;
        return;
      }
      state.localDone = true;
      save();
      result.textContent = "生成したCSSで2状態の文字色・幅・フォーカスを確認しました。";
    } catch {
      if (current()) result.textContent = "CSSを読み込めませんでした。生成した shelf.css を選び直してください。";
    }
  };
}
