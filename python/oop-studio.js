"use strict";

{
  const setting = "def mark(label):\n    events.append('設定' + label)\n    def decorate(fn):\n        return fn\n    return decorate";
  const apply = setting.replace("        return fn", "        events.append('適用' + label)\n        return fn");
  const call = apply.replace("        return fn", "        def wrapper(*args, **kwargs):\n            events.append('呼出' + label)\n            return fn(*args, **kwargs)\n        return wrapper");
  const counts = "def counter(label):\n    history = []\n    def decorate(fn):\n        def wrapper(*args, **kwargs):\n            history.append(label)\n            return fn(*args, **kwargs)\n        wrapper.history = history\n        return wrapper\n    return decorate";
  const record = "from functools import wraps\ndef recorder(label):\n    history = []\n    def decorate(fn):\n        @wraps(fn)\n        def wrapper(*args, **kwargs):\n            try:\n                result = fn(*args, **kwargs)\n            except ValueError:\n                history.append(label + '失敗')\n                raise\n            history.append(label + '成功')\n            return result\n        wrapper.history = history\n        return wrapper\n    return decorate";
  const job = "def pages(n, extra=0):\n    '読んだページ'\n    if n < 0:\n        raise ValueError('ページ')\n    return n + extra";
  const twoJobs = job + "\ndef title(name):\n    return '本:' + name";
  const arrange = "blue = recorder('青')\nred = recorder('赤')\na = blue(pages)\nb = blue(title)\nc = red(pages)";
  const retry = "try:\n    a(-1)\nexcept ValueError:\n    problem = True\nelse:\n    problem = False\nnext_value = a(3, extra=2)";
  const obs = (name, expr, value, before) => check(name, "", { observe: expr, value, before });
  pythonChapters.push({
    id: "67", engine: "cpython", title: "設定付きのデコレーターで成功と失敗を記録する",
    goal: "読書記録の関数を呼ぶたびに、成功か失敗かを履歴に残します。同じ設定を使う関数は一つの履歴を共有します。",
    demo: { input: "-1", prompt: "最初のページ数に -1 を入力すると「もう一度」と表示されます。そのあと4ページと2ページの記録が続き、最後に青と赤それぞれの履歴が表示されます。",
      code: record + "\n" + twoJobs + "\n" + arrange + "\ntry:\n    print(a(int(input())))\nexcept ValueError:\n    print('もう一度')\nprint(a(4))\nprint(c(2))\nprint(a.history)\nprint(c.history)" },
    lessons: [
      {
        engine: "skulpt", title: "デコレーターに設定をいつ渡すか確かめる", text: "mark('青') を呼ぶと、events に「設定青」が追加され、関数 decorate が返ります。この時点で選んだのはラベルだけです。どの関数に適用するかは次の手順で指定します。",
        code: "events = []\n" + setting + "\nblue = mark('青')\nprint(events)", output: "['設定青']",
        quiz: ["mark('青') を呼んだ直後に終わっていることは？", ["元の関数の実行", "設定の選択", "すべての読書記録", "料金計算"], 1, "まだどの関数に付けるかも、いつ呼ぶかも決まっていません。"],
        guide: exercise("設定の「青」を「赤」に変え、設定時点の記録を一件だけ表示しましょう。mark と events は用意されています。", "plan = mark('青')\nprint(events)", "plan = mark('赤')\nprint(events)", [check("設定だけ記録", "['設定赤']\n", { before: "events = []\n" + setting, observe: "callable(plan)", value: true })], "mark に渡すラベルを変え、返った関数はまだ呼びません。"),
        write: exercise("mark に「朝」、「夜」を順に渡し、返ってきた関数を morning と night に代入しましょう。ここでは代入までを書きます。", "", "morning = mark('朝')\nnight = mark('夜')", [obs("設定が二回", "[events, callable(morning), callable(night)]", [["設定朝", "設定夜"], true, true], "events = []\n" + setting)], "異なるラベルで mark を二度呼び、それぞれの返り値を保管します。"),
      },
      {
        engine: "skulpt", title: "デコレーターを付ける時点を確かめる", text: "plan = mark('青') の次に plan(pages) とすると、内側の decorate が一度動きます。ここで初めてどの関数を扱うかが決まります。まだページ数を渡してはいません。",
        code: "events = []\n" + apply + "\n" + job + "\nplan = mark('青')\ntracked = plan(pages)\nprint(events)", output: "['設定青', '適用青']",
        quiz: ["適用はどの行？", ["def pages の説明文", "plan = mark('青')", "tracked = plan(pages)", "tracked(4)"], 2, "受け取った設定に、関数そのものを渡す行です。"],
        guide: exercise("plan に pages(3) の計算結果を渡すと、そのあと tracked(4) を呼べません。関数 pages を plan に渡すように直しましょう。", "plan = mark('青')\ntracked = plan(pages(3))", "plan = mark('青')\ntracked = plan(pages)", [obs("関数へ適用", "[events, tracked(4)]", [["設定青", "適用青"], 4], "events = []\n" + apply + "\n" + job)], "plan に渡すときは pages の後ろの丸かっこを外します。"),
        write: exercise("「夜」を一度設定し、同じ設定を pages と title の二つの関数へ順に適用して a、b に入れましょう。", "", "night = mark('夜')\na = night(pages)\nb = night(title)", [obs("一設定を二関数へ", "[events, a(2), b('雲')]", [["設定夜", "適用夜", "適用夜"], 2, "本:雲"], "events = []\n" + apply + "\n" + twoJobs)], "night を2回呼び、1回目に pages、2回目に title を渡します。"),
      },
      {
        engine: "skulpt", title: "関数を呼ぶたびに1件記録する", text: "内側の wrapper は、関数を呼んだそのときに動きます。設定と適用は一度だけでも、実際の呼び出しが二回なら呼出の記録は二件です。",
        code: "events = []\n" + call + "\n" + job + "\ntracked = mark('青')(pages)\nprint(tracked(3))\nprint(events)", output: "3\n['設定青', '適用青', '呼出青']",
        quiz: ["正しい順番は？", ["設定→適用→呼出", "適用→設定→呼出", "呼出→設定→適用", "設定→呼出→適用"], 0, "設定を選び、関数に付けてから、値を渡して使います。"],
        guide: exercise("tracked をもう一度呼び、3、5の二件を表示してから events を表示しましょう。", "tracked = mark('青')(pages)\nprint(tracked(3))\nprint(events)", "tracked = mark('青')(pages)\nprint(tracked(3))\nprint(tracked(5))\nprint(events)", [check("二回の呼出", "3\n5\n['設定青', '適用青', '呼出青', '呼出青']\n", { before: "events = []\n" + call + "\n" + job })], "設定をやり直さず、tracked(5) を追加します。"),
        write: exercise("「朝」の設定を title に一度だけ適用し、「月」「海」の順に二度呼んで、二つの結果を表示しましょう。", "", "tracked = mark('朝')(title)\nprint(tracked('月'))\nprint(tracked('海'))", [check("記録と表示", "本:月\n本:海\n", { before: "events = []\n" + call + "\n" + twoJobs, observe: "events", value: ["設定朝", "適用朝", "呼出朝", "呼出朝"] })], "一つの tracked を使い続けると、設定と適用は一回、呼出は二回になります。"),
      },
      {
        engine: "skulpt", title: "同じ設定の関数で履歴を共有する", text: "history = [] を counter(label) の中、decorate の外に置きます。設定を作るたびに一つのリストができ、同じ設定を付けた関数が共有します。wrapper.history は、呼び出し後に一覧を読むための属性です。",
        code: counts + "\n" + twoJobs + "\nblue = counter('青')\nred = counter('赤')\na = blue(pages)\nb = blue(title)\nc = red(pages)\na(3)\nb('月')\nprint(a.history)\nprint(c.history)", output: "['青', '青']\n[]",
        quiz: ["青の二関数を一回ずつ、赤の一関数を一回呼んだ件数は？", ["青1・赤2", "両方3", "青2・赤1", "どちらも0"], 2, "history は同じ設定の間で共有し、別設定には別リストがあります。"],
        guide: exercise("赤の関数にも青の設定を付けた誤りを直し、a と b の記録を別々にします。両方を一回ずつ呼びます。", "blue = counter('青')\nred = counter('赤')\na = blue(pages)\nb = blue(pages)\na(1)\nb(3)", "blue = counter('青')\nred = counter('赤')\na = blue(pages)\nb = red(pages)\na(1)\nb(3)", [obs("設定別の記録", "[a.history, b.history]", [["青"], ["赤"]], counts + "\n" + job)], "二つ目の関数には red の設定を使います。"),
        write: exercise("counter(label) を作り、一つの設定を付けた関数は履歴を共有し、別の設定は独立させましょう。呼び出すとラベルを一つ記録し、関数の結果を返します。", "", counts, [obs("二つの設定と三つの関数", "[a.history, b.history, c.history, result]", [["青", "青"], ["青", "青"], ["赤"], 5], twoJobs)], "history を外側の設定関数の中に置きます。返す wrapper には同じ history を持たせます。", { after: "blue = counter('青')\nred = counter('赤')\na = blue(pages)\nb = blue(title)\nc = red(pages)\nresult = a(5)\nb('月')\nc(2)" }),
      },
      {
        title: "失敗を履歴に残し、次の呼び出しを試す", text: "青の設定で負のページ数を渡すと「青失敗」が履歴に残ります。except の中に raise とだけ書くと、その ValueError を呼び出し元でも受け取れます。そこで例外を処理したあと、次の呼び出しが成功すると「青成功」が追加されます。",
        code: record + "\n" + twoJobs + "\n" + arrange + "\n" + retry + "\nprint(next_value)\nprint(a.history)\nprint(c.history)", output: "5\n['青失敗', '青成功']\n[]",
        quiz: ["青で一度失敗し、同じ青で成功した後の履歴は？", ["失敗だけ", "成功だけ", "青失敗・青成功の順", "赤に両方残る"], 2, "失敗も記録し、例外を外で扱った後は次の呼び出しでまた使えます。"],
        guide: exercise("元の例外を消してしまう recorder を直します。失敗を記録し、呼出元が受け取った後に、同じ関数で成功できるようにします。", record.replace("                raise\n", "                return 0\n"), record, [obs("失敗後に同じ関数で復帰", "[problem, next_value, a.history]", [true, 5, ["青失敗", "青成功"]], twoJobs)], "except で失敗を記録した後、raise で同じ ValueError を外へ渡します。", { after: arrange + "\n" + retry }),
        write: exercise("recorder(label) を定義し、「海」と「森」の履歴を別々に残しましょう。同じ設定を適用した関数は履歴を共有します。元の関数の名前・説明・引数・返り値を保ち、ValueError が起きたら失敗を記録して、同じ例外を呼び出し元に伝えてください。", "", record, [obs("元の名前と説明", "[a.__name__, a.__doc__, b.__name__]", ["pages", "読んだページ", "title"], twoJobs), obs("失敗・復帰・設定の独立", "[problem, next_value, b('舟'), c(4), a.history, c.history]", [true, 5, "本:舟", 4, ["海失敗", "海成功", "海成功"], ["森成功"]], twoJobs)], "wraps、設定ごとの history、ValueError の再送出を一つずつ確かめます。", { after: arrange.replaceAll("'青'", "'海'").replaceAll("'赤'", "'森'") + "\n" + retry }),
      },
    ],
  });
}
