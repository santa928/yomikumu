"use strict";

{
  const seats = (outputs, variable = "seats") => [9, 10, 11].map((n, i) =>
    check("残り" + n + "席", outputs[i], { before: variable + " = " + n }));
  const tickets = outputs => [0, 1, 3].map((n, i) => check(n + "枚の番号札", outputs[i], { before: "count = " + n }));
  pythonChapters.push({
    id: "55", title: "残席の案内と番号札",
    goal: "満席に近いときは案内を変え、必要な枚数だけ番号札を出します。",
    demo: {
      prompt: "1行目は残席、2行目は出したい札の枚数です。残席を9と10、札を0と3にして比べましょう。",
      code: 'seats = int(input())\ncount = int(input())\nif seats >= 10:\n    print("団体受付")\nelse:\n    print("個人受付")\nfor number in range(count):\n    print(number + 1)',
      input: "10\n3",
    },
    lessons: [
      {
        title: "ちょうど10席は条件に入る？", text: "比べた答えをそのまま表示できます。>= は「以上」で、同じ数も含みます。True は条件に合う、False は合わないという答えです。",
        code: "print(9 >= 10)\nprint(10 >= 10)", output: "False\nTrue",
        quiz: ["残席が順に 9、10、11 のとき seats >= 10 は？", ["全部 True", "False、False、True", "False、True、True", "True、True、False"], 2, "10 と 11 は「10以上」に入ります。"],
        guide: exercise("残席がちょうど10席のときも True を出すよう、比較を一か所変えましょう。", "print(seats > 10)", "print(seats >= 10)", seats(["False\n", "True\n", "True\n"]), "ちょうど10席を含めるには >= が使えます。"),
        write: exercise("10席より少ないときだけ True を表示しましょう。「より小さい」は < です。", "", "print(seats < 10)", seats(["True\n", "False\n", "False\n"]), "9席は対象、10席ちょうどは対象外です。"),
      },
      {
        title: "条件に合う行を一段下げる", text: "if の後に条件を書き、末尾に : を付けます。次の行を半角空白4個分下げると、条件が True のときだけその行が動きます。",
        code: 'seats = 10\nif seats >= 10:\n    print("団体受付")\nprint("開場")', output: "団体受付\n開場",
        quiz: ["seats を 9 に変えると残る表示は？", ["団体受付だけ", "開場だけ", "両方", "何も出ない"], 1, "開場の行は左端から始まるため、席数にかかわらず動きます。"],
        guide: exercise("「団体受付」を10席以上の時だけ出すため、表示の行を字下げしましょう。", 'if seats >= 10:\nprint("団体受付")', 'if seats >= 10:\n    print("団体受付")', seats(["", "団体受付\n", "団体受付\n"]), "if の次の print の前に半角空白を4個入れます。"),
        write: exercise("残席が10より少ないときだけ「残りわずか」を表示し、最後にいつも「開場」を表示しましょう。", "", 'if seats < 10:\n    print("残りわずか")\nprint("開場")', seats(["残りわずか\n開場\n", "開場\n", "開場\n"]), "最後の「開場」は if の外に置きます。"),
      },
      {
        title: "二つの案内を出し分ける", text: "条件が合わない場合も案内したいときは、if と同じ位置に else: を書きます。その次を字下げすると、必ずどちらか一方だけが動きます。",
        code: 'seats = 9\nif seats >= 10:\n    print("団体")\nelse:\n    print("個人")', output: "個人",
        quiz: ["ちょうど10席のときに通る側は？", ["else の側", "両方", "どちらも通らない", "if の側"], 3, "10 >= 10 は True なので、if の直下だけを通ります。"],
        guide: exercise("9席以下で「個人」、10席以上で「団体」になるよう、else の表示を変えましょう。", 'if seats >= 10:\n    print("団体")\nelse:\n    print("団体")', 'if seats >= 10:\n    print("団体")\nelse:\n    print("個人")', seats(["個人\n", "団体\n", "団体\n"]), "else の下の案内だけを「個人」にします。"),
        write: exercise("別の展示では10席ちょうどまで「小会場」、11席以上は「大会場」と案内します。合う方を一行表示しましょう。", "", 'if seats > 10:\n    print("大会場")\nelse:\n    print("小会場")', seats(["小会場\n", "小会場\n", "大会場\n"]), "ちょうど10席を「小会場」に含めましょう。"),
      },
      {
        title: "番号札一枚分を書く", text: "繰り返す前に、札一枚に何を載せるか決めます。最初の位置を0と数えても、お客さんに渡す番号は1から。表示の直前で1を足します。",
        code: "position = 0\nprint(position + 1)", output: "1",
        quiz: ["position が 2 の札に表示する番号は？", ["1", "2", "3", "4"], 2, "位置 2 に 1 を足すので、3枚目の札です。"],
        guide: exercise("位置そのものを出す見本に1を足し、1から始まる札にしましょう。", "print(position)", "print(position + 1)", [check("先頭", "1\n", { before: "position = 0" }), check("3枚目", "3\n", { before: "position = 2" })], "position に 1 を足した値を表示します。"),
        write: exercise("整理券を20番から始めます。position が 0 の札では20、1の札では21を表示しましょう。", "", "print(20 + position)", [check("先頭", "20\n", { before: "position = 0" }), check("次の札", "21\n", { before: "position = 1" })], "位置が0のときに20になる足し算を作ります。"),
      },
      {
        title: "range の終わりと回数", text: "for は値を一つずつ取り出して、字下げした行を繰り返します。range(3) が渡す位置は 0、1、2 の3個。終わりの3は含めません。range(0) なら一度も動きません。",
        code: "for position in range(3):\n    print(position + 1)", output: "1\n2\n3",
        quiz: ["range(3) の位置をそのまま出すと？", ["1、2、3", "0、1、2", "0、1、2、3", "3だけ"], 1, "0から始まり、3の直前で止まります。"],
        guide: exercise("いつも3枚出す見本を、用意された count 枚だけ出すコードに変えましょう。", "for position in range(3):\n    print(position + 1)", "for position in range(count):\n    print(position + 1)", tickets(["", "1\n", "1\n2\n3\n"]), "range の丸かっこに枚数を入れます。"),
        write: exercise("10番から始まる番号札を count 枚出しましょう。0枚なら何も表示しません。", "", "for position in range(count):\n    print(10 + position)", tickets(["", "10\n", "10\n11\n12\n"]), "回数は count のまま、表示する番号の始まりを10にします。"),
      },
    ],
  });
}
