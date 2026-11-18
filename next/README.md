# Next.jsのローカル実習

Pagesのスライド・表示予測・タップ組み立てから、PCのDocker Composeで動くNext.jsへ進みます。教材の「今のコードをZIPで保存」は記述欄の下書きをファイルに入れます。手元で実行した採点結果を戻すと記述の達成を記録できます。

テンプレートは kit/ にあります。kit/app、kit/check などの配布ファイルを変えた後は、Docker内で `node next/build-kit.cjs` を実行して kit-data.js を生成します。圧縮・展開にはMITライセンスの fflate 0.8.2 の公式 npm 配布物 umd/index.js を使います。ライセンスは vendor/fflate.LICENSE にあります。

Next.jsのページと共有レイアウトで使うファイルの配置は公式ドキュメントに沿っています。[Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) ・ [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
