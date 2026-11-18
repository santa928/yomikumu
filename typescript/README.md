# 型付きクイズ入門

`index.html` を開いて受講できます。型検査または動く見本を初めて使うと、同じフォルダーに同梱した公式 TypeScript 6.0.3、標準ライブラリの型定義、日本語診断を一度読み込みます。教材の配信・受講に外部の実行サービスは使いません。

`build.cjs` が配布用の `compiler-data.js` を生成します。このフォルダーで次のコマンドを使います。初回のパッケージ取得にネット接続が必要です。

```sh
docker run --rm -v "${PWD}:/build" -w /build node:24-bookworm npm ci --no-audit --no-fund
docker run --rm --network none -v "${PWD}:/build" -w /build node:24-bookworm npm run build
```

型検査は実行用と別の Worker にある仮想ファイルで行います。編集行は answer.ts の診断に対応します。型検査を通ったコードは教材の保存領域から分離した JavaScript 実行環境に渡し、型と実際の値を個別に確かめます。進捗と下書きのキーは `yomikumu/typescript/v1` です。
