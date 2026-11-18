"use strict";

{
  const fare = "class Fare:\n    def __init__(self, rate):\n        self.rate = rate\n    def price(self, days):\n        return self.rate * days";
  const child = fare + "\nclass LongFare(Fare):\n    def price(self, days):\n        return super().price(days) - 1";
  const delegate = "class Ticket:\n    def __init__(self, policy):\n        self.policy = policy\n    def price(self, days):\n        return self.policy.price(days)";
  const swap = fare + "\nclass Flat:\n    def price(self, days):\n        return 8";
  const quote = (label, expr, value, before) => check(label, "", { observe: expr, value, before });
  pythonChapters.push({
    id: "64", title: "料金の種類を増やす・計算役を取り替える",
    goal: "本の貸出料金を、基本料金を引き継ぐ種類と、計算役を渡して差し替える方式で試します。",
    demo: { input: "3", prompt: "貸出日数を入力し、通常、長期の割引、固定料金へ切り替えた結果を読みましょう。",
      code: child + "\nclass Flat:\n    def price(self, days):\n        return 8\n" + delegate + "\ndays = int(input())\nt = Ticket(Fare(4))\nprint(t.price(days))\nt.policy = LongFare(4)\nprint(t.price(days))\nt.policy = Flat()\nprint(t.price(days))" },
    lessons: [
      {
        title: "共通の料金を一か所に置く", text: "貸出料金の基本を Fare にまとめます。計算方法が同じ二つの料金表は、初期化で渡す単価だけを変えます。このあと他の種類が土台として使うクラスを基底クラスと呼びます。",
        code: fare + "\nprint(Fare(2).price(3))\nprint(Fare(4).price(3))", output: "6\n12",
        quiz: ["同じ計算で単価だけを変えたいときに渡す値は？", ["初期化時の rate", "メソッド名", "クラス名", "戻り値の種類"], 0, "同じ Fare に別の rate を渡せば、日数に応じた額が変わります。"],
        guide: exercise("3日借りる例の単価だけを2から5に変え、料金を表示します。", "p = Fare(2)\nprint(p.price(3))", "p = Fare(5)\nprint(p.price(3))", [check("3日分の料金", "15\n", { before: fare, observe: "p.rate", value: 5 })], "Fare に渡す単価を5にします。"),
        write: exercise("Fare を定義してください。作成時に単価を受け取り、price(days) で利用日数分の額を返します。", "", fare, [quote("単価と日数", "[Fare(3).price(2), Fare(7).price(0)]", [6, 0])], "単価を self.rate に保存し、日数は呼ぶたびに掛けます。"),
      },
      {
        title: "土台の初期化と計算を引き継ぐ", text: "class LongFare(Fare): と書くと、Fare の初期化や操作を引き継ぎます。変更したい price だけを定義し直し、super().price(days) で土台の計算を呼べます。",
        code: child + "\nprint(LongFare(4).price(3))", output: "11",
        quiz: ["LongFare(4) の rate の初期設定をするのは？", ["値がなくなる", "Fare から引き継いだ __init__", "price", "super という数"], 1, "__init__ を上書きしていないので基底クラスの初期化が働きます。"],
        guide: exercise("LongFare の割引を1円から2円に変え、基底の計算を使い続けましょう。", child, child.replace("days) - 1", "days) - 2"), [quote("土台と割引", "[issubclass(LongFare, Fare), LongFare(4).price(3), LongFare(6).price(2)]", [true, 10, 10])], "基底の金額から引く数を2にします。"),
        write: exercise("用意された Fare を引き継ぐ ExtraFare を作り、基本の貸出額に3円だけ加えた値を返しましょう。", "", "class ExtraFare(Fare):\n    def price(self, days):\n        return super().price(days) + 3", [quote("初期化の引継ぎ", "[issubclass(ExtraFare, Fare), ExtraFare(2).price(4), ExtraFare(5).price(1)]", [true, 11, 8], fare)], "Fare を土台に指定し、price だけを上書きします。"),
      },
      {
        title: "持っている部品に計算を頼む", text: "Ticket は料金表そのものではなく、渡された料金表を policy に持つ受付です。self.policy.price(days) のように別の道具に作業を任せることを委譲と呼びます。",
        code: fare + "\n" + delegate + "\nt = Ticket(Fare(2))\nprint(t.price(3))\nt.policy = Fare(5)\nprint(t.price(3))", output: "6\n15",
        quiz: ["同じ受付で料金表を替えるときに変更するのは？", ["Ticket のクラス名", "すべての日数", "受付の policy", "元の料金表のコード"], 2, "受付が参照している計算役を別のものに置き換えます。"],
        guide: exercise("受付の単価を2から5へ切り替え、同じ受付と3日で二つの額を表示しましょう。", "t = Ticket(Fare(2))\nprint(t.price(3))\nt.policy = Fare(2)\nprint(t.price(3))", "t = Ticket(Fare(2))\nprint(t.price(3))\nt.policy = Fare(5)\nprint(t.price(3))", [check("一つの受付を更新", "6\n15\n", { before: fare + "\n" + delegate })], "二度目に渡す Fare の単価だけを変えます。"),
        write: exercise("Ticket を作り、渡された policy の price へ日数を渡してください。通常料金から全日一律8円の Flat に差し替えても使えるようにします。", "", delegate, [quote("通常・固定へ差し替え", "[first, t.price(9)]", [12, 8], swap)], "自分で単価を決めず、self.policy.price(days) の値を返します。", { after: "t = Ticket(Fare(4))\nfirst = t.price(3)\nt.policy = Flat()" }),
      },
      {
        title: "変更要望に合わせて構成を選ぶ", text: "新しい料金の種類なら、土台の初期化と計算を引き継ぐ方法が使えます。同じ受付の記録先や料金表を途中で入れ替える要望なら、受付が持つ部品を交換できます。",
        code: swap + "\n" + delegate + "\nt = Ticket(Fare(3))\nprint(t.price(2))\nt.policy = Flat()\nprint(t.price(2))", output: "6\n8",
        quiz: ["同じ受付を残し、夕方にだけ記録先を交換したい。自然な作りは？", ["受付を毎回新クラスにする", "受付が記録役を持ち、差し替える", "全件を削除する", "日数しか渡さない"], 1, "交換したい役割を、受付とは別の部品として持ちます。"],
        guide: exercise("同じ受付を保ち、二回目は固定8円の料金表に差し替えてください。", "t = Ticket(Fare(3))\nprint(t.price(2))\nt.policy = Fare(3)\nprint(t.price(2))", "t = Ticket(Fare(3))\nprint(t.price(2))\nt.policy = Flat()\nprint(t.price(2))", [check("固定へ変更", "6\n8\n", { before: swap + "\n" + delegate, observe: "isinstance(t.policy, Flat)", value: true })], "二回目の policy に Flat() を入れます。"),
        write: exercise("受付 Recorder に記録先を渡し、save(value) を呼ぶとその記録先に append するように作りましょう。途中で dest を入れ替え、前後の記録が混ざらないことを調べます。", "", "class Recorder:\n    def __init__(self, dest):\n        self.dest = dest\n    def save(self, value):\n        self.dest.append(value)", [quote("別々の記録先", "[morning, evening]", [["月"], ["舟"]])], "受付が持つ dest にその都度書きます。切替え前の記録先を固定しないようにします。", { after: "morning = []\nevening = []\nr = Recorder(morning)\nr.save('月')\nr.dest = evening\nr.save('舟')" }),
      },
    ],
  });
}
