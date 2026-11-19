# 読書カードと Tailwind CSS

`index.html` が教材の入口です。見本の `card.html` は配布済みの `reading.css` を読み込み、オフラインでも単独で開けます。

画面用の `../app/lesson.css` と `workbook.css` は、見本・解答の iframe に読み込みません。PCで記述した任意のクラス名はブラウザ内の Tailwind コンパイラで生成し、その幅・色・余白などを実際の表示から判定します。ポインタやキーボードを持たない端末では、生成された状態別の宣言を使った状態見本にも切り替えられます。

## 配信するCSSとコンパイラを更新する

このディレクトリで実行します。初回は npm から開発用パッケージを取得します。教材の受講に通信やインストールは不要です。

```sh
docker run --rm -v "${PWD}:/build" -w /build node:24-bookworm npm ci --no-audit --no-fund
docker run --rm --network none -v "${PWD}:/build" -w /build node:24-bookworm npm run build
```

`input.css` に列挙した HTML から Tailwind CLI が `reading.css` を生成します。`compiler-source.js` と Tailwind CSS の公式パッケージから、esbuild が配布用の `compiler.js` を作ります。Tailwind CSS のライセンスは `Tailwind-LICENSE.txt` に同梱しています。

[公式のCLI手順](https://tailwindcss.com/docs/installation/tailwind-cli)・[クラス名を読み取る仕組み](https://tailwindcss.com/docs/detecting-classes-in-source-files)

## 二つの幅で読書棚を開く

`shelf/index.html` は同じフォルダーの `shelf.css` を読む独立した完成例です。入力の HTML とテーマ定義から `npm run build:shelf` で再生成できます。

最終課題の「今の読書棚をZIPで保存」は学習者の記述を HTML と CSS の材料、固定した CLI の依存と Compose ファイルにまとめます。展開先で `docker compose run --rm build` を実行し、`index.html` を開きます。ZIP作成には同梱の fflate を使います。ライセンスは `fflate-LICENSE.txt` にあります。
