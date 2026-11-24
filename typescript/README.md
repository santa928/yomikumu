# TypeScriptコース

`index.html` はコースの目次です。クイズの問題・得点・回答を題材に、JavaScriptに型を加える方法を学びます。型検査または動く見本を初めて使うと、同じフォルダーに同梱した公式 TypeScript 6.0.3、標準ライブラリの型定義、日本語診断を一度読み込みます。教材の配信・受講に外部の実行サービスは使いません。

`build.cjs` が配布用の `compiler-data.js` を生成します。このフォルダーで次のコマンドを使います。初回のパッケージ取得にネット接続が必要です。

```sh
docker run --rm -v "${PWD}:/build" -w /build node:24-bookworm npm ci --no-audit --no-fund
docker run --rm --network none -v "${PWD}:/build" -w /build node:24-bookworm npm run build
```

型検査は実行用と別の Worker にある仮想ファイルで行います。編集行は answer.ts の診断に対応します。型検査を通ったコードは教材の保存領域から分離した JavaScript 実行環境に渡し、型と実際の値を個別に確かめます。進捗と下書きのキーは `yomikumu/typescript/v1` です。

画面を操作する課題では、JavaScript コースの `../dom/runner.js`、`guard.js`、同梱の Acorn を必要時に読み込みます。表示用画面と採点用画面を別々の iframe に置き、回答欄やローカルのJSON例を実際に操作します。

複数ファイルの実践は `index.html#practical` から開きます。共有型、JSONの配点確認、クラスの見本に続いて、4つのファイルを編集する実習があります。公式コンパイラの診断からファイルと該当行を開けます。隔離された既存のJavaScript実行環境で、10通りのJSON入力と、二つの `QuizRound` を作ってから採点した結果を確かめます。

実習で書いたファイルは既存の進捗データに保存します。「現在のプロジェクトをZIPで保存」で、下書きと実行用の確認ファイルを取得できます。ZIPのREADMEにあるDocker手順で、同じ TypeScript 6.0.3 の `tsc` とNode.jsを使って検証できます。
