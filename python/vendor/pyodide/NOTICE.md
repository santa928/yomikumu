# ブラウザ用 CPython

このディレクトリの runtime.js は、公式 npm 配布物 `pyodide@0.27.7` の pyodide.js、pyodide.asm.js、pyodide.asm.wasm、python_stdlib.zip、pyodide-lock.json を個別に gzip 圧縮し、Base64 で包んだものです。Python は CPython 3.12.7、ビルドに使用された Emscripten は 3.1.58 です。無料の静的サイトとローカルファイルの両方で使えるよう、同梱したバイト列を端末内で復元します。追加パッケージは同梱していません。

[Pyodide 0.27.7 ソース](https://github.com/pyodide/pyodide/tree/0.27.7) · [CPython 3.12.7 ソース](https://github.com/python/cpython/tree/v3.12.7) · [Emscripten 3.1.58 ソース](https://github.com/emscripten-core/emscripten/tree/3.1.58)。ライセンス本文は同じフォルダーの LICENSE-Pyodide、LICENSE-CPython、LICENSE-Emscripten にあります。
