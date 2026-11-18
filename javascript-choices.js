"use strict";

const borderInputs = [2, 3, 4, 5, 6, 7];
const countInputs = [0, 1, 3];
const signsForScore = 'if (initialScore >= 6) {\n  console.log("合格");\n} else if (initialScore >= 3) {\n  console.log("もう一歩");\n} else {\n  console.log("再挑戦");\n}';
const numberLoop = 'for (let number = 1; number <= questionCount; number = number + 1) {\n  console.log(number);\n}';

const javascriptChoiceLessons = [
  {
    id: "js-compare", topic: "境目を決める", title: "ちょうどの点数を含める",
    goal: "「以上」を一つの式にし、境目の前と後の真偽を試す。",
    slides: [
      { title: "3点ちょうどでも入れる？", body: "会場の札には「3点以上で入場」とあります。>= は左の数が右の数と同じか、それより大きいかを調べます。2点と3点で実行して、コンソールの真偽を見比べましょう。", code: "console.log(initialScore >= 3);", variableStart: true, inputs: [2, 3, 4] },
      { title: "「より大きい」なら等しい点を含まない", body: "> に変えると、3点ちょうどは条件から外れます。真偽を見比べるときは、境目そのものを一度試しましょう。", code: "console.log(3 >= 3);\nconsole.log(3 > 3);" },
    ],
    quiz: { prompt: "3点ちょうどで true になる式は？", options: ["3 > 3", "3 < 3", "3 >= 3", "3 + 3"], correct: 2,
      reasons: ["同じ数なので「より大きい」は false です。", "同じ数なので「より小さい」は false です。", ">= は同じ数も含みます。", "これは数の6を得る式です。"] },
    exercise: { field: "javascript", variableStart: true, inputs: [3, 4, 5], task: "夜の部の入場条件は4点以上です。開始点が条件に合うかを、真偽で一行に表示してください。4点ちょうども入れます。",
      code: "console.log(initialScore > 4);", answer: "console.log(initialScore >= 4);", review: 0,
      hint: "「以上」には、同じ点を含む >= を使えます。", build: { code: "console.log(initialScore ① ②);", slots: [["同じ点を含める印", ">", ">="], ["境目の点", "3", "4"]] },
      expected: start => [start >= 4], hints: ["4点が true、3点が false になる境目を作りましょう。"] },
  },
  {
    id: "js-two-doors", topic: "条件で分ける", title: "条件に応じて一方の案内を出す",
    goal: "真偽を見て、入場と待機のどちらか一つを表示する。",
    slides: [
      { title: "条件に合うときだけ表示する", body: "if の丸かっこに条件、続く波かっこの中に実行する行を置きます。3点なら「入場」が出ます。2点ではその行を飛ばすので、コンソールの出力は空です。", code: 'if (initialScore >= 3) {\n  console.log("入場");\n}', variableStart: true, inputs: [2, 3] },
      { title: "条件に合わない人にも案内する", body: "else の中には、条件が false のときに実行する行を置きます。今度は2点の人にも「待機」と案内できます。", code: 'if (initialScore >= 3) {\n  console.log("入場");\n} else {\n  console.log("待機");\n}', variableStart: true, inputs: [2, 3] },
    ],
    quiz: { prompt: "if の条件が false のときに進むのはどこ？", options: ["if の中だけ", "両方の中", "最初からやり直す", "else の中"], correct: 3,
      reasons: ["if の中は true のときに進みます。", "この二つから一方に進みます。", "条件を読み直す指定はありません。", "条件に合わなかった場合をここに書きます。"] },
    exercise: { field: "javascript", variableStart: true, inputs: [3, 4, 5], task: "4点以上なら「通過」、それより低ければ「待機」と表示してください。どの点でも、案内は一行だけ出します。",
      code: 'if (initialScore >= 4) {\n  console.log("通過");\n}', answer: 'if (initialScore >= 4) {\n  console.log("通過");\n} else {\n  console.log("待機");\n}', review: 1, hint: "通過しない人の行は else の波かっこに入れます。",
      build: { code: 'if (initialScore >= 4) {\n  console.log("①");\n} else {\n  console.log("②");\n}', slots: [["4点以上の案内", "通過", "待機"], ["それ以外の案内", "通過", "待機"]] },
      expected: start => [start >= 4 ? "通過" : "待機"], hints: ["4点以上では「通過」、4点に届かないときは「待機」を出しましょう。"] },
  },
  {
    id: "js-three-messages", topic: "条件の順番", title: "点数に合う三つのメッセージを選ぶ",
    goal: "条件を上から確かめ、いちばん高い点の案内まで届くようにする。",
    slides: [
      { title: "二番目の条件はいつ調べる？", body: "最初の条件に合わなかったとき、else if でもう一つの条件を調べます。5点以上で「金」、3点以上で「銀」、それ以外で「銅」です。点数を選んで三つの表示を試せます。",
        code: 'if (initialScore >= 5) {\n  console.log("金");\n} else if (initialScore >= 3) {\n  console.log("銀");\n} else {\n  console.log("銅");\n}', variableStart: true, inputs: [2, 3, 5] },
      { title: "先に当てはまったところで決まる", body: "この見本では3点以上を先に調べます。5点もそこで「銀」に決まり、次の「金」に届きません。高い点を先に調べると、重なった条件を区別できます。", code: 'if (initialScore >= 3) {\n  console.log("銀");\n} else if (initialScore >= 5) {\n  console.log("金");\n} else {\n  console.log("銅");\n}', variableStart: true, inputs: [5, 3, 2] },
    ],
    quiz: { prompt: "「6点以上は合格、3点以上はもう一歩」のとき、6点には両方の条件が当てはまります。どちらから調べる？", options: ["6点以上", "3点以上", "点を表示した後で決める", "条件の順はいつも同じ結果"], correct: 0,
      reasons: ["合格に当たる人を先に選び、残った人から3点以上を選べます。", "6点の人も先に「もう一歩」に入ります。", "案内の前に条件を確かめます。", "条件が重なると、先に当たったほうが採用されます。"] },
    exercise: { field: "javascript", variableStart: true, inputs: borderInputs, task: "本番のクイズは6点以上で「合格」、3〜5点で「もう一歩」、2点以下で「再挑戦」です。条件の順を決め、どの点でも案内を一つだけ表示してください。",
      code: signsForScore.replace(">= 6", ">= 3"), answer: signsForScore, review: 1,
      hint: "6点以上の人も3点以上です。重なるところでは、先に選びたい案内の条件を上に置きます。",
      build: { code: signsForScore.replace(">= 6", ">= ①").replace(">= 3", ">= ②"), slots: [["合格の境目", "3", "6"], ["もう一歩の境目", "3", "6"]] },
      expected: start => [start >= 6 ? "合格" : start >= 3 ? "もう一歩" : "再挑戦"], hints: ["合格を先に選び、残りから3点以上を選びましょう。6点と3点ちょうどの案内も確かめます。"] },
  },
  {
    id: "js-numbers", topic: "同じ手順を繰り返す", title: "出題する数だけ問題番号を表示する",
    goal: "一回分の表示を繰り返し、問題数がゼロのときは何も出さない。",
    slides: [
      { title: "まず一問分だけ書く", body: "最初の番号は1です。一行に表示したら番号を1増やすと、同じ表示の行で二問目も書けます。問題が増えるたびに、この二行を手で足すのは大変です。", code: "let number = 1;\nconsole.log(number);\nnumber = number + 1;\nconsole.log(number);" },
      { title: "最初・続ける条件・次の一歩", body: "for の丸かっこには、番号を1から始める指定、続ける条件、1回終わるたびに行う更新を順に書きます。<= は「以下」です。questionCount は選んだ問題数です。3問と0問で、コンソールの行数を比べましょう。",
        code: numberLoop, variableStart: true, inputs: [3, 0, 1], inputLabel: "問題数" },
    ],
    quiz: { prompt: "問題数が0です。番号1から、番号が問題数以下の間だけ表示すると何行出る？", options: ["1行", "0行", "3行", "いつまでも続く"], correct: 1,
      reasons: ["最初から 1 <= 0 が false です。", "最初の条件が false なので表示する行へ進みません。", "3問のときの行数です。", "続ける条件が最初から成立しません。"] },
    exercise: { field: "javascript", variableStart: true, inputs: countInputs, inputLabel: "問題数",
      task: "問題数 questionCount が3なら1、2、3を一行ずつ、1なら1だけ、0なら空の出力にしてください。繰り返す条件を直して最後の番号も出してください。",
      code: numberLoop.replace("<= questionCount", "< questionCount"), answer: numberLoop, review: 1,
      hint: "最後の番号と問題数が同じときも表示するため、続ける条件に「等しい」を含めます。",
      build: { code: numberLoop.replace("= 1;", "= ①;").replace("<= questionCount", "② questionCount"), slots: [["最初の番号", "0", "1"], ["最後の番号を含む条件", "<", "<="]] },
      expected: count => Array.from({ length: count }, (_, i) => i + 1), hints: ["1から始め、最後の番号まで一行ずつ表示しましょう。"], extraHint: "問題数を超えて表示しています。0問なら一行も出さず、3問なら3で止めましょう。" },
  },
];
