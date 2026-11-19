# Next.jsのローカル実習

教材ページで表示を予測し、コードを組み立てます。PCでは「今のコードをZIPで保存」で記述欄のコードを保存し、展開したフォルダーで Docker Compose を使って Next.js を起動します。手元で採点した結果ファイルを教材に読み込むと、その課題の進捗が記録されます。

「おすすめの本に詳細・検索・ページ送りを加える」では、書き出した図書室の `/recommendations` を使います。最初は一覧に題名が並び、詳細ページを作るための `app/recommendations/[id]/page.jsx` は書き出したフォルダーで新しく作れます。手元でリンクから詳細を開き、検索してページを送り、再読み込みとブラウザの「戻る」を試します。実際のページを採点する課題名は `catalog-links`、`catalog-detail`、`catalog-search` です。

テンプレートは kit/ にあります。kit/app、kit/check などの配布ファイルを変えた後は、Docker内で `node next/build-kit.cjs` を実行して kit-data.js を生成します。圧縮・展開にはMITライセンスの fflate 0.8.2 の公式 npm 配布物 umd/index.js を使います。ライセンスは vendor/fflate.LICENSE にあります。

Next.jsのページと共有レイアウトで使うファイルの配置は公式ドキュメントに沿っています。[Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) ・ [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
