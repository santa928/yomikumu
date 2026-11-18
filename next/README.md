# Next.jsのローカル実習

教材ページで表示を予測し、コードを組み立てます。PCでは「今のコードをZIPで保存」で記述欄のコードを保存し、展開したフォルダーで Docker Compose を使って Next.js を起動します。手元で採点した結果ファイルを教材に読み込むと、その課題の進捗が記録されます。

テンプレートは kit/ にあります。kit/app、kit/check などの配布ファイルを変えた後は、Docker内で `node next/build-kit.cjs` を実行して kit-data.js を生成します。圧縮・展開にはMITライセンスの fflate 0.8.2 の公式 npm 配布物 umd/index.js を使います。ライセンスは vendor/fflate.LICENSE にあります。

Next.jsのページと共有レイアウトで使うファイルの配置は公式ドキュメントに沿っています。[Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) ・ [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
