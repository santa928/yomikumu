# コースの説明を点検するとき

用語を定義するだけでなく、「似た技術や直前の単元と何が違うか」「何をどこに書くか」「何が実際に動くか」を見本の前に明らかにする。同じ結果になる書き方を比較するときは、入力や見た目をそろえ、どの操作や規則を変えたかが分かるようにする。環境が変わると成り立たない値や動作には、見本の条件を書く。

## 今回の点検範囲

全10コースの紹介と直接開いた目次を確認し、説明が役割・前提・実際の教材と合っているか確かめた。各コースの最初の見本と、違いを取り違えやすい下記の後続課題を点検した。各コースの全スライドを読み直したという意味ではない。書き換えの対象は紹介・見本の説明・Tailwind CSSの比較と前提確認で、課題のURL・採点・保存形式は引き継ぐ。

| コース | 点検した入口・代表課題 | 確かめた違い |
| --- | --- | --- |
| HTML / CSS | `#first-edit/1`、`#class/2` | タグの役割とCSSの見た目。HTMLの名前だけでスタイルは変わらず、CSSの規則と対応する。 |
| JavaScript | `#js-sign/1`、`#js-add/1` | 見出しを書き換える教材用関数とJavaScriptそのもの。数の足し算と文字をつなぐ操作。 |
| JavaScriptの画面操作 | `dom/#elements/1`・`/2` | HTMLファイルと、ブラウザ内で現在表示しているDOM。JavaScriptで選ぶ要素と、CSSで決める見た目。 |
| TypeScript | `typescript/#infer/slide`、`#unknown/slide` | 実行前の型検査と、実行時の値チェック。外から来る値は型注釈だけで検証されない。 |
| React | `react/#components/1`、`#work-list/1` | HTMLのタグとJavaScript内のJSX。要素を直接探して更新する代わりに、データに応じた表示を書く。 |
| Next.js | `next/#request/slide/2`、`#server-book/slide/1` | Reactの部品と、部品をURLに結び付けるNext.jsの決まり。サーバーでしか参照できないファイル。 |
| Tailwind CSS | Web制作の紹介、`tailwind/#contents`、`#padding/slide` | 名前とルールを手書きする場合と、用意された名前からCSSを生成する場合を、同じ余白で比較。生成したCSSを適用しない場合も確認する。 |
| Python基礎 | `python/#54/1/slide`・`#54/4/slide` | Pythonとブラウザ上の教材の役割。コードが値を表示する操作と、値を受け取る操作。 |
| Python実践 | `python/#63/1/slide/practice`、`#59/1–2`、`#61/2`、`#62/1–2`、`#csv/4` | 基礎の構文を、条件や入力を変えても動く処理に組み合わせる。CSVの文字を数に変える、ファイルの後片付け、実行中のデータ確認。 |
| Python OOP | `python/#63/1–3`（実践と共通） | 本ごとのデータと操作を同じ決まりで扱う。別の名前が同じ記録を指す場合と、別々に記録を作る場合。 |

Tailwind CSSの比較は標準の `--spacing: 0.25rem` が前提。手書きの `.card { padding: 1rem; }` と、教材同梱の生成器が出す `.p-4` の指定を適用した表示は、上下左右とも同じになる。ルートの文字サイズを変更しても等しいこと、`p-4` の名前だけでは余白が変わらないことを `tests/course-picker.cjs` で確認する。

## 技術資料

- Webの仕様: [HTML](https://html.spec.whatwg.org/multipage/syntax.html)、[CSSの規則](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Syntax/Introduction)、[DOM](https://dom.spec.whatwg.org/)、[JavaScriptの演算](https://tc39.es/ecma262/#sec-applystringornumericbinaryoperator)
- [Tailwind CSSのクラス](https://tailwindcss.com/docs/styling-with-utility-classes)、[内側の余白](https://tailwindcss.com/docs/padding)、[CSS生成時のクラス検出](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [TypeScriptの型の消去](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types)、[ReactのJSX](https://react.dev/learn/writing-markup-with-jsx)、[Reactのstate](https://react.dev/learn/state-as-a-snapshot)、[Next.jsのページ](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Pythonの組み込み関数](https://docs.python.org/ja/3/library/functions.html)、[クラス](https://docs.python.org/ja/3/tutorial/classes.html)、[CSV](https://docs.python.org/ja/3/library/csv.html)、[データクラス](https://docs.python.org/ja/3/library/dataclasses.html)
