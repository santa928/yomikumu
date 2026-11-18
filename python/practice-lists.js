"use strict";

{
  const records = [[], [30], [15, 30, 60, 120]];
  function cases(expected) {
    return records.map((list, i) => check(["記録なし", "30分だけ", "境界と複数件"][i], expected[i] + "\n", {
      before: "minutes = " + JSON.stringify(list), observe: "minutes", value: list,
      hint: i === 2 ? "15分・30分・60分・120分を別々にたどり、どれを残すか、何に変えるかを見直しましょう。" : "",
    }));
  }
  pythonChapters.push({
    id: "59", title: "読書時間を選び、分から時間に直す",
    goal: "読んだ時間を分から時間に変え、短い記録を除いた一覧を作ります。",
    demo: { prompt: "30と入力すると、30分以上の記録が時間単位で表示されます。次は60と入力し、どの記録が残るか比べましょう。", input: "30",
      code: "limit = int(input())\nminutes = [15, 30, 60, 120]\nprint([m / 60 for m in minutes if m >= limit])" },
    lessons: [
      {
        title: "空のリストに一件ずつ足す", text: "元の読書記録を残したまま表示用の一覧を作ります。最初は空の []。append(値) は末尾に一件加えます。/ は割り算で、分を60で割れば時間になります。",
        code: "minutes = [30, 60]\nhours = []\nfor m in minutes:\n    hours.append(m / 60)\nprint(hours)", output: "[0.5, 1.0]",
        quiz: ["30分と60分を時間単位に直すと、記録は何件になりますか。", ["0件", "1件", "2件のまま", "60件"], 2, "一つの記録に対して一つを加えるので、値だけが変わります。"],
        guide: exercise("分のまま追加する見本を直し、時間にした一覧を表示しましょう。元の minutes は残します。", "hours = []\nfor m in minutes:\n    hours.append(m)\nprint(hours)", "hours = []\nfor m in minutes:\n    hours.append(m / 60)\nprint(hours)", cases(["[]", "[0.5]", "[0.25, 0.5, 1.0, 2.0]"]), "append の丸かっこの中で、分を表す m を60で割ります。"),
        write: exercise("読書ごとに感想を書く5分を加えた別の一覧を作り、表示しましょう。元の minutes はそのまま残します。", "", "with_notes = []\nfor m in minutes:\n    with_notes.append(m + 5)\nprint(with_notes)", cases(["[]", "[35]", "[20, 35, 65, 125]"]), "新しいリストへ m + 5 を一件ずつ追加します。"),
      },
      {
        title: "同じ変換を内包表記で読む", text: "[式 for 名前 in リスト] は、新しい一覧を作る内包表記です。右で一件取り出し、左の式を新しい値にします。for と append で作った一覧と同じ結果になります。",
        code: "minutes = [30, 60]\nprint([m / 60 for m in minutes])", output: "[0.5, 1.0]",
        quiz: ["[m + 2 for m in [5, 8]] の結果は？", ["[7, 10]", "[5, 8]", "[2]", "[5, 8, 2]"], 0, "各値に2を足して新しい一覧に入れます。"],
        guide: exercise("見本の変換部分を直し、1分を60秒として秒の一覧を作りましょう。", "print([m / 60 for m in minutes])", "print([m * 60 for m in minutes])", cases(["[]", "[1800]", "[900, 1800, 3600, 7200]"]), "秒は分より数が大きくなるので60を掛けます。"),
        write: exercise("各記録の時間を2倍にした別の一覧を表示しましょう。元の値を残します。", "", "print([m * 2 for m in minutes])", cases(["[]", "[60]", "[30, 60, 120, 240]"]), "新しい値を書く位置に m * 2 を置きます。"),
      },
      {
        title: "値を変えずに選ぶ", text: "内包表記の末尾に if m >= 30 と書くと、30分以上の記録だけが新しいリストに入ります。元の [15, 30, 60] からは30と60が残ります。",
        code: "minutes = [15, 30, 60]\nprint([m for m in minutes if m >= 30])", output: "[30, 60]",
        quiz: ["30分以上を残したときに変わるのは？", ["残る記録の単位", "条件外の記録を除いた件数", "元の minutes の値", "すべての値が2倍"], 1, "残した30と60の値は同じで、15だけが外れます。"],
        guide: exercise("30分ちょうども残るように比較を直しましょう。", "print([m for m in minutes if m > 30])", "print([m for m in minutes if m >= 30])", cases(["[]", "[30]", "[30, 60, 120]"]), "等しい場合を含める記号は >= です。"),
        write: exercise("短い読書だけを調べます。30分より短い記録を分のまま一覧にしましょう。", "", "print([m for m in minutes if m < 30])", cases(["[]", "[]", "[15]"]), "境界の30分は入れず、左側に入れる値は m のままです。"),
      },
      {
        title: "残した記録だけ単位を変える", text: "if m >= 30 で30分以上の記録を選び、選んだ値を m / 60 で時間に直します。30分は0.5時間、60分は1.0時間として新しいリストに入ります。",
        code: "minutes = [15, 30, 60]\nprint([m / 60 for m in minutes if m >= 30])", output: "[0.5, 1.0]",
        quiz: ["60分以上を残して時間にすると、[30, 60, 120] は？", ["[60, 120]", "[0.5, 1.0, 2.0]", "[1.0, 2.0]", "[2.0]"], 2, "元の60と120を選び、それぞれ60で割ります。"],
        guide: exercise("30分以上の代わりに、60分以上を残して時間に変えましょう。", "print([m / 60 for m in minutes if m >= 30])", "print([m / 60 for m in minutes if m >= 60])", cases(["[]", "[]", "[1.0, 2.0]"]), "選ぶ条件の右だけを60にします。"),
        write: exercise("30分を超えた読書記録だけを選び、それぞれに感想を書く10分を足した一覧を表示しましょう。", "", "print([m + 10 for m in minutes if m > 30])", cases(["[]", "[]", "[70, 130]"]), "30分ちょうどを外す条件と、残した値に10を足す式を分けて書きます。"),
      },
    ],
  });
}
