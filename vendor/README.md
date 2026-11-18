# モジュール読み込みの同梱ライブラリ

module-lexer.js は es-module-lexer 3.0.5 の JavaScript 用最小ビルド（asm.js）です。ライセンス条件は es-module-lexer.LICENSE に収録しています。[配布元](https://github.com/guybedford/es-module-lexer)

教材のファイル間で import が指す位置と名前を読み取り、手元のファイルをブラウザ内のURLでつなぎます。構文の実行と export の照合には、ブラウザのESモジュール実装を使います。ライブラリはこの章で最初に実行したときだけ読み込みます。

再生成する場合はDocker内で es-module-lexer@3.0.5 のnpm配布物を展開し、次のコマンドを使います。

```sh
npx --yes --package=esbuild@0.25.12 esbuild package/dist/lexer.minimal.asm.js --bundle --format=iife --global-name=YomikumuModuleLexer --minify --outfile=vendor/module-lexer.js
cp package/LICENSE vendor/es-module-lexer.LICENSE
```
