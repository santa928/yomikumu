"use strict";

{
  const add = "def plus(x):\n    return x + 1";
  const maker = "def offset(amount):\n    def apply(x):\n        return x + amount\n    return apply";
  const wrapper = "def logged(fn):\n    def wrapper(*args, **kwargs):\n        calls.append('実行')\n        return fn(*args, **kwargs)\n    return wrapper";
  const safe = "from functools import wraps\n" + wrapper.replace("    def wrapper", "    @wraps(fn)\n    def wrapper");
  const charge = "def charge(n, extra=0):\n    \"入場の料金\"\n    if n < 0:\n        raise ValueError('枚数')\n    return n * 2 + extra";
  const decorate = "calls = []\n" + safe + "\n@logged\n" + charge;
  const watch = (label, expr, value, before) => check(label, "", { observe: expr, value, before });
  const transfer = [watch("引数と名前付き引数", "[tracked(2), tracked(3, extra=4), len(calls)]", [4, 10, 2]), check("失敗も伝わる", "", { observe: "tracked(-1)", error: "ValueError" })];
  pythonChapters.push({
    id: "66", engine: "cpython", title: "デコレーターで元の関数に処理を加える",
    goal: "デコレーターは、元の関数を書き換えずに、その前後へ処理を加える仕組みです。ここでは関数を呼ぶたびに、リスト calls に「実行」を1件追加します。料金を計算する関数にこの処理を加え、元の関数名や計算結果を引き継ぎます。",
    demo: { input: "3", prompt: "3枚で実行すると、料金の6、呼び出し回数の1、元の関数名 charge が順に表示されます。", code: decorate + "\nprint(charge(int(input())))\nprint(len(calls))\nprint(charge.__name__)" },
    lessons: [
      {
        engine: "skulpt", title: "関数そのものを渡す", text: "plus は関数そのもの、plus(3) は呼んだ結果です。名前に関数を入れたり別の関数に渡したりできると、同じ手順でいろいろな計算を試せます。",
        code: add + "\nwork = plus\nprint(work(3))", output: "4",
        quiz: ["関数を今は呼ばず、後で使えるよう渡す式は？", ["plus(4)", "plus", "'plus'", "4"], 1, "丸かっこを付けず、関数の値そのものを渡します。"],
        guide: exercise("work に関数 plus を代入して、work(5) の結果を表示しましょう。今の見本では work に plus(2) の計算結果が入っています。", "work = plus(2)\nprint(work(5))", "work = plus\nprint(work(5))", [check("関数を後で呼ぶ", "6\n", { before: add, observe: "work(9)", value: 10 })], "最初の行では plus に丸かっこを付けません。"),
        write: exercise("run_one(fn, value) を作り、渡された関数に値を一度渡して、結果をそのまま返しましょう。", "", "def run_one(fn, value):\n    return fn(value)", [watch("plus と str の返り値", "[run_one(plus, 4), run_one(str, 8)]", [5, "8"], add)], "決まった plus を直接呼ばず、受け取った fn を呼びます。"),
      },
      {
        engine: "skulpt", title: "内側の関数が外の値を覚える", text: "関数の中でもう一つ関数を作れます。内側の apply は外側の amount を使えます。apply を返して外で呼んでも、そのときに渡した amount が残ります。",
        code: maker + "\na = offset(2)\nb = offset(5)\nprint(a(3))\nprint(b(3))", output: "5\n8",
        quiz: ["a = offset(2) の後で a(6) は？", ["2", "6", "8", "関数そのもの"], 2, "a には amount が2の apply が入っています。"],
        guide: exercise("外側の値を無視する見本を直し、offset(2) と offset(5) が別々の加算を保つようにします。", maker.replace("x + amount", "x + 1"), maker, [watch("異なる設定", "[offset(2)(3), offset(5)(3)]", [5, 8])], "内側の式で外側の引数 amount を使います。"),
        write: exercise("times(rate) を作り、値を rate 倍する関数を返しましょう。2倍、3倍を別々に作って使います。", "", "def times(rate):\n    def apply(value):\n        return value * rate\n    return apply", [watch("二つの倍率", "[times(2)(4), times(3)(4)]", [8, 12])], "内側の関数から rate を読み、その関数自体を返します。"),
      },
      {
        engine: "skulpt", title: "引数と戻り値をそのまま渡す", text: "*args は位置で渡した引数をまとめ、**kwargs は名前付きの引数をまとめます。fn(*args, **kwargs) で元の関数に展開して渡し、return で結果を返します。ログ用リスト calls はここでは用意されています。",
        code: "calls = []\n" + wrapper + "\n" + charge + "\ntracked = logged(charge)\nprint(tracked(3, extra=1))\nprint(calls)", output: "7\n['実行']",
        quiz: ["元の関数が返した料金を呼出元へ渡す行は？", ["print(fn)", "return args", "return fn(*args, **kwargs)", "calls.append(fn)"], 2, "引数を渡して実行し、その結果を return します。"],
        guide: exercise("計算だけして返さない wrapper を直しましょう。各呼び出しを calls に一回記録し、元の引数と返り値を保ちます。", wrapper.replace("return fn(*args, **kwargs)", "fn(*args, **kwargs)"), wrapper, transfer.map(test => ({ ...test, before: "calls = []\n" + charge })), "fn を呼ぶ行に return を付けます。", { after: "tracked = logged(charge)" }),
        write: exercise("logged(fn) を書き、呼ぶ直前に calls に一件記録し、渡された計算の引数・返り値・例外を保ちましょう。", "", wrapper, transfer.map(test => ({ ...test, before: "calls = []\n" + charge })), "記録後、渡された fn を引数付きで呼んで返します。例外は外へ届かせます。", { after: "tracked = logged(charge)" }),
      },
      {
        engine: "skulpt", title: "@ で関数にデコレーターを付ける", text: "定義の直前の @logged は、定義した関数を logged に渡し、返ってきた関数を同じ名前にする書き方です。ここでは呼ぶたびに一件を記録し、元の計算結果も返します。",
        code: "calls = []\n" + wrapper + "\n@logged\n" + add + "\nprint(plus(2))\nprint(len(calls))", output: "3\n1",
        quiz: ["@logged を置くのと同じ適用は？", ["plus = logged(plus)", "plus = logged(plus())", "plus = 1", "logged = plus(3)"], 0, "plus を値のまま渡し、戻った関数を plus として使います。"],
        guide: exercise("用意された logged を plus に適用し、2回呼んだときだけ2件記録するようにします。", add, "@logged\n" + add, [watch("結果と記録", "[plus(2), plus(4), len(calls)]", [3, 5, 2], "calls = []\n" + wrapper)], "def plus のすぐ上に @logged を書きます。"),
        write: exercise("同じ logged を二つの別の計算に付け、double(3) は6、minus(8) は7になるよう定義しましょう。", "", "@logged\ndef double(n):\n    return n * 2\n@logged\ndef minus(n):\n    return n - 1", [watch("二つの関数で記録", "[double(3), minus(8), double(5), len(calls)]", [6, 7, 10, 3], "calls = []\n" + wrapper)], "どちらの def のすぐ上にも @logged を書きます。"),
      },
      {
        title: "wraps で名前と説明も引き継ぐ", text: "元の計算を呼ぶだけでは、外から見える名前は wrapper になります。標準ライブラリ functools の wraps(fn) を内側の関数に付けると、__name__（名前）や __doc__（最初に書いた説明）を引き継ぎます。戻り値を渡す return は別に必要です。",
        code: "calls = []\n" + safe + "\n" + charge + "\ntracked = logged(charge)\nprint(tracked.__name__)\nprint(tracked.__doc__)\nprint(tracked(3))", output: "charge\n入場の料金\n6",
        quiz: ["@wraps(fn) の効果と、return fn(...) の効果は順に？", ["回数・名前", "名前や説明・計算の返り値", "料金・引数の数", "エラー・記録の削除"], 1, "名前などの情報と、実際の呼び出しの結果は別々に引き継ぎます。"],
        guide: exercise("tracked.__name__ を読むと charge と返るように、logged を直しましょう。charge に付けた説明も引き継いでください。", safe.replace("    @wraps(fn)\n", ""), safe, [watch("名前と説明", "[tracked.__name__, tracked.__doc__]", ["charge", "入場の料金"], "calls = []\n" + charge), ...transfer.map(test => ({ ...test, before: "calls = []\n" + charge }))], "内側の def wrapper のすぐ上に @wraps(fn) を置きます。", { after: "tracked = logged(charge)" }),
        write: exercise("料金を計算する charge と書名を返す title の両方に使える logged を書きましょう。元の名前と説明を引き継ぎ、引数と返り値をそのまま渡します。例外が起きた呼び出しも1回と数え、その例外を呼び出し元に伝えてください。", "", safe, [watch("名前と説明", "[tracked.__name__, tracked.__doc__, other.__name__]", ["charge", "入場の料金", "title"], "calls = []\n" + charge), watch("別関数と元計算", "[other('月'), tracked(3, extra=2), len(calls)]", ["本:月", 8, 2], "calls = []\n" + charge), check("例外と回数", "", { before: "calls = []\n" + charge, error: "ValueError", afterError: "len(calls)", value: 1, observe: "tracked(-1)" })], "wraps で情報を引き継ぎ、呼ぶ前に記録してから fn の結果を return します。", { after: 'def title(name):\n    return "本:" + name\ntracked = logged(charge)\nother = logged(title)' }),
      },
    ],
  });
}
