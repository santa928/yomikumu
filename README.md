# よみくむ

スライドでコードを読み、自分で書いて確かめる、日本語のプログラミング学習サイトです。Web制作はHTMLで作品名を変えるところから、Pythonは1行のコードで文字を表示するところから始められます。

[よみくむで学習を始める](https://santa928.github.io/yomikumu/)

## 作りたいものから選ぶ

| 入口 | 学ぶ順序と作るもの |
| --- | --- |
| [Web制作](https://santa928.github.io/yomikumu/#paths/web) | HTML/CSSで作品展を作り、JavaScriptで操作と採点を加えます。TypeScriptで問題の型を決め、Reactで読書リストを作り、Next.jsで複数ページの読書会サイトに進みます。CSSの余白を学んだら、Tailwind CSSの読書カードにも進めます。 |
| [Python](https://santa928.github.io/yomikumu/#paths/python) | 基礎では入力した名前を表示するところから、名簿の件数を辞書で集計するまでを学びます。クラス入門で2冊の本の記録を分けたら、実践でCSVの集計とテストへ、またはOOPで継承やデコレーターへ進めます。 |

各単元はスライド、四択、コード練習の順に進めます。スマホではコードの一部をタップで組み、PCでは自分で書いて試せます。入力の途中でスライドを見直しても下書きに戻れます。利用料・アカウント登録は不要です。

Next.jsのスライドと組み立てはスマホから開けます。PCの記述課題では教材から自分のコードをZIPで持ち出し、Docker Composeで実サーバーを起動します。初回は依存の取得に通信を使います。実行と採点結果の読み込みは各課題の「PCで起動して採点する手順」に沿って進めてください。

Pythonの[CSV実習](https://santa928.github.io/yomikumu/python/index.html#csv/demo)では、読書時間を集計し、不正な行があれば行番号を表示します。PC用のZIPには練習用CSVとテストが入っています。展開後はPython 3だけで実行できます。

同じブラウザでは前回の位置と練習の下書きを保存します。別の端末で続けるときは、コース目次の「進捗と下書きの引き継ぎ」からファイルを渡してください。進捗ファイルには自分が入力したコードも入ります。公開するリポジトリに追加する必要はありません。

## 手元で開く

オフラインで使うときは、このリポジトリをダウンロードして展開し、`index.html` をブラウザで開いてください。手元の教材を同じWi-Fiのスマホで試すときは、PC上で次のコマンドを実行し、スマホからPCのアドレスとポート8080を開きます。終了は Ctrl+C です。

```sh
docker compose up web
```

[作品紹介とJavaScript入門の到達点・教材の基準](docs/course.md)

開発時の操作確認は `docker compose run --build --rm test` で実行できます。テスト用イメージの初回取得後、ブラウザ検証は外部通信なしで動きます。

## 教材を編集する

| 変更したいもの | 編集する場所 |
| --- | --- |
| HTML/CSSのスライド・問題文・解答例 | [html-css/lessons](html-css/lessons)。目次の順番は同じディレクトリの `index.js` で決まります。 |
| HTML/CSSの採点・ヒント | [html-css/grading](html-css/grading)。たとえば画面幅で列数を変える `content-break` は、教材が `html-css/lessons/responsive-works.js`、採点が `html-css/grading/responsive.js` にあります。両方を同じ単元IDで探せます。 |
| JavaScriptの教材と実行画面 | [javascript/lessons](javascript/lessons) に教材、[javascript](javascript) に実行と画面表示があります。DOM操作の教材は [dom](dom) にあります。 |
| コース選択・学習位置と下書き | [app](app)。コースの入口は `learning-paths.js`、端末間で記録を引き継ぐ処理は `path-progress.js` です。 |

Python・Tailwind CSS・TypeScript・React・Next.jsの教材はそれぞれのコース名のディレクトリにあります。ルートの `ink.css` や画像は、練習中のHTMLから同じ名前で参照する教材素材です。

[CSV実習のファイル](python/csv-kit)を変更したときは、リポジトリのルートで `docker run --rm --network none -v "$PWD/python:/course/python" python:3.12-bookworm python -B /course/python/build-csv-kit.py` を実行し、配布ZIPを更新します。

HTML/CSSとJavaScriptの入口は [app/start.js](app/start.js) の順にスクリプトを読み込みます。新しい教材ファイルを増やすときは、対応するコースの `lessons/index.js` より前に登録します。HTML/CSSの採点を変えたら `docker compose run --build --rm test node tests/course.cjs`、旧ブックマークからの再開を確かめるには `docker compose run --build --rm test node tests/legacy-entry.cjs` を使います。
