"use strict";

{
  const fare = "class Fare:\n    def __init__(self, rate):\n        self.rate = rate\n    def price(self, days):\n        return self.rate * days";
  const child = fare + "\nclass LongFare(Fare):\n    def price(self, days):\n        return super().price(days) - 1";
  const delegate = "class Ticket:\n    def __init__(self, policy):\n        self.policy = policy\n    def price(self, days):\n        return self.policy.price(days)";
  const swap = fare + "\nclass Flat:\n    def price(self, days):\n        return 8";
  const quote = (label, expr, value, before) => check(label, "", { observe: expr, value, before });
  pythonChapters.push({
    id: "64", title: "貸出料金の計算方法を切り替える",
    goal: "同じ貸出日数で、通常料金、割引料金、固定料金を順に計算します。料金の計算はクラスにまとめます。",
    demo: { input: "3", prompt: "貸出日数に3を入力すると12、11、8と表示されます。日数を変えたとき、どの金額が変わるか試しましょう。",
      code: child + "\nclass Flat:\n    def price(self, days):\n        return 8\n" + delegate + "\ndays = int(input())\nt = Ticket(Fare(4))\nprint(t.price(days))\nt.policy = LongFare(4)\nprint(t.price(days))\nt.policy = Flat()\nprint(t.price(days))" },
    lessons: [
      {
        title: "共通の料金を一か所に置く", text: "貸出料金の基本を Fare にまとめます。計算方法が同じ二つの料金表は、初期化で渡す単価だけを変えます。次の例では、別のクラスが Fare の初期化や計算を引き継ぎます。このとき、元の Fare を基底クラスと呼びます。",
        code: fare + "\nprint(Fare(2).price(3))\nprint(Fare(4).price(3))", output: "6\n12",
        quiz: ["同じ計算で単価だけを変えたいときに渡す値は？", ["初期化時の rate", "メソッド名", "クラス名", "戻り値の種類"], 0, "同じ Fare に別の rate を渡せば、日数に応じた額が変わります。"],
        guide: exercise("3日借りる例の単価だけを2から5に変え、料金を表示します。", "p = Fare(2)\nprint(p.price(3))", "p = Fare(5)\nprint(p.price(3))", [check("3日分の料金", "15\n", { before: fare, observe: "p.rate", value: 5 })], "Fare に渡す単価を5にします。"),
        write: exercise("Fare を定義してください。作成時に単価を受け取り、price(days) で利用日数分の額を返します。", "", fare, [quote("単価と日数", "[Fare(3).price(2), Fare(7).price(0)]", [6, 0])], "単価を self.rate に保存し、日数は呼ぶたびに掛けます。"),
      },
      {
        title: "Fare の初期化と計算を引き継ぐ", text: "class LongFare(Fare): と書くと、Fare の初期化や操作を引き継ぎます。変更したい price だけを定義し直し、super().price(days) で Fare の料金計算を呼べます。",
        code: child + "\nprint(LongFare(4).price(3))", output: "11",
        quiz: ["LongFare(4) の rate の初期設定をするのは？", ["値がなくなる", "Fare から引き継いだ __init__", "price", "super という数"], 1, "__init__ を上書きしていないので基底クラスの初期化が働きます。"],
        guide: exercise("LongFare の割引を1円から2円に変え、基底の計算を使い続けましょう。", child, child.replace("days) - 1", "days) - 2"), [quote("通常料金から2円引き", "[issubclass(LongFare, Fare), LongFare(4).price(3), LongFare(6).price(2)]", [true, 10, 10])], "Fare の price が返した金額から2を引きます。"),
        write: exercise("用意された Fare を引き継ぐ ExtraFare を作り、基本の貸出額に3円だけ加えた値を返しましょう。", "", "class ExtraFare(Fare):\n    def price(self, days):\n        return super().price(days) + 3", [quote("初期化の引継ぎ", "[issubclass(ExtraFare, Fare), ExtraFare(2).price(4), ExtraFare(5).price(1)]", [true, 11, 8], fare)], "class ExtraFare(Fare): と書き、price だけを定義し直します。"),
      },
      {
        title: "Ticket から料金表の price を呼ぶ", text: "Ticket は、作成時に受け取った料金表を self.policy に保存します。t.price(3) を呼ぶと、その料金表の price(3) で金額を計算します。このように別のオブジェクトに処理を任せることを委譲と呼びます。",
        code: fare + "\n" + delegate + "\nt = Ticket(Fare(2))\nprint(t.price(3))\nt.policy = Fare(5)\nprint(t.price(3))", output: "6\n15",
        quiz: ["同じ t を使い続けながら料金表を替えるには、どこを変更しますか。", ["Ticket のクラス名", "すべての日数", "t の policy", "元の料金表のコード"], 2, "t.policy に別の料金表を代入すると、次の t.price(3) はその料金表を使います。"],
        guide: exercise("同じ t で3日分の料金を2回表示しましょう。1回目は単価2円、2回目は単価5円の料金表を使います。", "t = Ticket(Fare(2))\nprint(t.price(3))\nt.policy = Fare(2)\nprint(t.price(3))", "t = Ticket(Fare(2))\nprint(t.price(3))\nt.policy = Fare(5)\nprint(t.price(3))", [check("単価2円と5円の料金", "6\n15\n", { before: fare + "\n" + delegate })], "二度目に渡す Fare の単価だけを変えます。"),
        write: exercise("Ticket を作り、渡された policy の price へ日数を渡してください。通常料金から全日一律8円の Flat に差し替えても使えるようにします。", "", delegate, [quote("通常・固定へ差し替え", "[first, t.price(9)]", [12, 8], swap)], "自分で単価を決めず、self.policy.price(days) の値を返します。", { after: "t = Ticket(Fare(4))\nfirst = t.price(3)\nt.policy = Flat()" }),
      },
      {
        title: "同じインスタンスで料金表や記録先を替える", text: "t.policy = Flat() の前後で、同じ t.price(2) が6と8を返します。料金表を t の属性として持たせたので、t を作り直さずに計算方法を替えられます。次の課題では同じ方法で記録先を替えます。",
        code: swap + "\n" + delegate + "\nt = Ticket(Fare(3))\nprint(t.price(2))\nt.policy = Flat()\nprint(t.price(2))", output: "6\n8",
        quiz: ["同じインスタンスで記録先のリストを替えたいとき、どの書き方が使えますか。", ["リストごとに新しいクラスを定義する", "記録先のリストを属性に持ち、その属性を更新する", "全件を削除する", "日数しか渡さない"], 1, "書き込むたびに属性からリストを読めば、属性を変えるだけで記録先が切り替わります。"],
        guide: exercise("2回目の t.price(2) が固定料金の8円を返すように、t の料金表を差し替えましょう。", "t = Ticket(Fare(3))\nprint(t.price(2))\nt.policy = Fare(3)\nprint(t.price(2))", "t = Ticket(Fare(3))\nprint(t.price(2))\nt.policy = Flat()\nprint(t.price(2))", [check("固定へ変更", "6\n8\n", { before: swap + "\n" + delegate, observe: "isinstance(t.policy, Flat)", value: true })], "二回目の policy に Flat() を入れます。"),
        write: exercise("Recorder を作るときに記録先のリスト dest を渡し、save(value) でそのリストに値を追加しましょう。途中で dest に別のリストを代入したら、それ以降の値は新しいリストに追加します。", "", "class Recorder:\n    def __init__(self, dest):\n        self.dest = dest\n    def save(self, value):\n        self.dest.append(value)", [quote("別々の記録先", "[morning, evening]", [["月"], ["舟"]])], "save の中で self.dest.append(value) を呼ぶと、その時点の記録先に値を追加できます。", { after: "morning = []\nevening = []\nr = Recorder(morning)\nr.save('月')\nr.dest = evening\nr.save('舟')" }),
      },
    ],
  });
}
