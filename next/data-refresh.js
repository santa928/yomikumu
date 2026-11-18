"use strict";

nextChapters.push({
  "id": "refresh",
  "title": "待っている原稿と古い版を見分ける",
  "goal": "PCの /data-lab で原稿の版・時刻・応答速度・一時失敗を自分で設定します。同じURLに二度要求し、本の整理が終わったあとに届く応答を比べましょう。",
  "examples": [
    [
      "毎回取得の同じURLを二度読む",
      "09:00 第1版 → 原稿を変更 → 09:15 第2版"
    ],
    [
      "保持した同じURLを二度読む",
      "09:00 第1版 → 原稿を変更 → 09:00 第1版"
    ],
    [
      "遅い場合・ない本・失敗",
      "遅い　応答待ち → 題名／ない本　404／一時的な失敗　503"
    ]
  ]
});

nextLessons.push({
  "id": "two-reads",
  "chapter": "refresh",
  "title": "同じ住所の原稿を二度読む",
  "slides": [
    [
      "原稿の版と時刻を手元で動かす",
      "/data-lab の「原稿を設定」で版と時刻を書き替えられます。「二度取得」の住所を同じまま開き直すと、原稿から届いた二つの値を比べられます。",
      "const paper = await response.json();\nreturn Response.json({ edition: paper.edition, publishedAt: paper.publishedAt });",
      "第1版 09:00 から第2版 09:15 に設定した後は、同じ住所が2と09:15を返します。"
    ]
  ],
  "quiz": [
    "同じURLで新しい版番号を知らせるには？",
    [
      "現在の paper.edition を返す",
      "1を毎回返す",
      "別のURLにする",
      "時刻の文字を消す"
    ],
    0,
    "版は原稿側が持つ数です。応答から毎回読みます。"
  ],
  "build": [
    "{ edition: ①, publishedAt: ② }",
    [
      [
        "版の数",
        "paper.edition",
        "1"
      ],
      [
        "原稿の時刻",
        "paper.publishedAt",
        "Date.now()"
      ]
    ]
  ],
  "right": [
    "paper.edition",
    "paper.publishedAt"
  ],
  "file": "app/data-lab/double/route.js",
  "task": "版と時刻を変えてから同じ /data-lab/double を二度開きます。新しい版番号と原稿時刻の両方がJSONに出るようにしてください。",
  "source": "import { requestPaper } from \"../requests\";\n\nexport const dynamic = \"force-dynamic\";\nexport async function GET(request) {\n  const response = await requestPaper(request, { cache: \"no-store\" });\n  const paper = await response.json();\n  return Response.json({ title: paper.title, edition: 1, publishedAt: paper.publishedAt });\n}",
  "answer": "import { requestPaper } from \"../requests\";\n\nexport const dynamic = \"force-dynamic\";\nexport async function GET(request) {\n  const response = await requestPaper(request, { cache: \"no-store\" });\n  const paper = await response.json();\n  return Response.json({ title: paper.title, edition: paper.edition, publishedAt: paper.publishedAt });\n}",
  "hint": "時刻が変わっても版が1なら、返す値が固定か確かめます。"
}, {
  "id": "hold-fresh",
  "chapter": "refresh",
  "title": "保持する読み方と毎回の読み方を選ぶ",
  "slides": [
    [
      "同じ原稿をどの時点で取り直すか",
      "サーバー側の fetch は、cache: \"force-cache\" を渡すと取得した応答を保持し、\"no-store\" なら次も原稿へ要求します。教材の requestPaper は同じ原稿URLへこれらの設定で実際にHTTP要求します。",
      "const policy = mode === \"keep\" ? \"force-cache\" : \"no-store\";\nawait requestPaper(request, { cache: policy });",
      "更新後も keep は先に読んだ版。fresh は原稿の新しい版です。"
    ]
  ],
  "quiz": [
    "原稿を更新した直後にも最初の版を使いたいときの指定は？",
    [
      "\"no-store\"",
      "\"force-cache\"",
      "404",
      "503"
    ],
    1,
    "force-cache は保持した応答を使える読み方です。"
  ],
  "build": [
    "mode === \"keep\" ? ① : ②",
    [
      [
        "保持して使う",
        "\"force-cache\"",
        "\"no-store\""
      ],
      [
        "毎回取りに行く",
        "\"no-store\"",
        "\"force-cache\""
      ]
    ]
  ],
  "right": [
    "\"force-cache\"",
    "\"no-store\""
  ],
  "file": "app/data-lab/policy/route.js",
  "task": "/data-lab の新しい実験で初版を設定し「保持」と「毎回取得」を開きます。その後原稿を更新しても mode=keep は初版、mode=fresh は新版を返すようにしてください。",
  "source": "import { requestPaper, relay } from \"../requests\";\n\nexport async function GET(request) {\n  const mode = new URL(request.url).searchParams.get(\"mode\");\n  const policy = mode === \"keep\" ? \"no-store\" : \"no-store\";\n  return relay(await requestPaper(request, { cache: policy }));\n}",
  "answer": "import { requestPaper, relay } from \"../requests\";\n\nexport async function GET(request) {\n  const mode = new URL(request.url).searchParams.get(\"mode\");\n  const policy = mode === \"keep\" ? \"force-cache\" : \"no-store\";\n  return relay(await requestPaper(request, { cache: policy }));\n}",
  "hint": "毎回取得が合ったら、keep の分岐に渡す cache を確認します。"
}, {
  "id": "expire",
  "chapter": "refresh",
  "title": "保持した原稿を期限後に更新する",
  "slides": [
    [
      "短い間だけ同じ版を使う",
      "next.revalidate の数は再検証までの秒数です。期限を過ぎた最初の要求には旧版が返り、裏で原稿を取り直すことがあります。少し後で再び同じ住所を開くと新版が届きます。",
      "await requestPaper(request, { next: { revalidate: 2 } });",
      "初版取得の直後は同じ版が届きます。2秒を超えてから読み直し、再検証完了後に新版へ変わります。"
    ]
  ],
  "quiz": [
    "期限を過ぎた最初の要求で旧版が届いたら？",
    [
      "必ず永久に古い",
      "データを削除",
      "再検証が進むので少し後にもう一度読む",
      "別のIDへ変える"
    ],
    2,
    "期限後の要求で再検証が始まり、次の読み取りで新しい応答が使えます。"
  ],
  "build": [
    "{ next: { ①: ② } }",
    [
      [
        "期限の指定",
        "revalidate",
        "status"
      ],
      [
        "今回の秒数",
        "2",
        "0"
      ]
    ]
  ],
  "right": [
    "revalidate",
    "2"
  ],
  "file": "app/data-lab/lifetime/route.js",
  "task": "この本を2秒間は同じ版で読み、その後、元を更新した版と時刻へ切り替わる /data-lab/lifetime を作ります。新しい実験名で試してください。",
  "source": "import { requestPaper, relay } from \"../requests\";\n\nexport async function GET(request) {\n  return relay(await requestPaper(request, { cache: \"force-cache\" }));\n}",
  "answer": "import { requestPaper, relay } from \"../requests\";\n\nexport async function GET(request) {\n  return relay(await requestPaper(request, { next: { revalidate: 2 } }));\n}",
  "hint": "ずっと旧版なら期限の指定を、すぐ新版になるなら毎回取得になっていないかを確認します。"
}, {
  "id": "paper-wait",
  "chapter": "refresh",
  "title": "遅い応答の間に待機を伝える",
  "slides": [
    [
      "届く前にできる案内を置く",
      "/data-lab で待ち時間を0.9秒に設定してください。本を読むときは await より前で「読込中」を出し、同じボタンを一時停止します。応答後は題名を出して再び押せるようにします。",
      "setBusy(true);\nsetNote(\"読込中\");\nconst response = await fetch(url);",
      "待つ間は読込中。応答後は本の題名です。"
    ]
  ],
  "quiz": [
    "遅い読込が続く間の札に出す言葉は？",
    [
      "本が見つかりません",
      "終了",
      "一時的な失敗",
      "読込中"
    ],
    3,
    "待機、対象なし、失敗は別の出来事です。"
  ],
  "build": [
    "setBusy(①);\nsetNote(②);",
    [
      [
        "連打を止める",
        "true",
        "false"
      ],
      [
        "待っている人への札",
        "\"読込中\"",
        "\"開始前\""
      ]
    ]
  ],
  "right": [
    "true",
    "\"読込中\""
  ],
  "file": "app/data-lab/wait/ReadState.jsx",
  "task": "/data-lab/wait の「本を読む」で、応答前は「読込中」と操作停止、終了後は届いた題名と次の操作を表示してください。",
  "source": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function ReadState({ run }) {\n  const [note, setNote] = useState(\"開始前\");\n  const [busy, setBusy] = useState(false);\n  async function read(id) {\n    setBusy(true);\n    setNote(\"開始前\");\n    try {\n      const query = new URLSearchParams({ run, id });\n      const res = await fetch(\"/data-lab/origin?\" + query, { cache: \"no-store\" });\n      if (res.status === 404) setNote(\"本が見つかりません\");\n      else if (!res.ok) setNote(\"一時的な失敗\");\n      else setNote((await res.json()).title);\n    } catch { setNote(\"一時的な失敗\"); }\n    finally { setBusy(false); }\n  }\n  return <>\n    <button disabled={busy} onClick={() => read(\"tide\")}>本を読む</button>\n    <button disabled={busy} onClick={() => read(\"missing\")}>ない本を読む</button>\n    <p role=\"status\">{note}</p>\n  </>;\n}",
  "answer": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function ReadState({ run }) {\n  const [note, setNote] = useState(\"開始前\");\n  const [busy, setBusy] = useState(false);\n  async function read(id) {\n    setBusy(true);\n    setNote(\"読込中\");\n    try {\n      const query = new URLSearchParams({ run, id });\n      const res = await fetch(\"/data-lab/origin?\" + query, { cache: \"no-store\" });\n      if (res.status === 404) setNote(\"本が見つかりません\");\n      else if (!res.ok) setNote(\"一時的な失敗\");\n      else setNote((await res.json()).title);\n    } catch { setNote(\"一時的な失敗\"); }\n    finally { setBusy(false); }\n  }\n  return <>\n    <button disabled={busy} onClick={() => read(\"tide\")}>本を読む</button>\n    <button disabled={busy} onClick={() => read(\"missing\")}>ない本を読む</button>\n    <p role=\"status\">{note}</p>\n  </>;\n}",
  "hint": "取得を待つ前に状態を変更します。"
}, {
  "id": "paper-fail",
  "chapter": "refresh",
  "title": "一時的な失敗を知らせる",
  "slides": [
    [
      "届いたHTTP応答の成否を読む",
      "サーバーが一時的に原稿を出せないときは 503 という状態の番号を返します。fetch が応答を受け取っても response.ok は false になります。まず応答の成功を確かめます。",
      "if (!response.ok) return \"一時的な失敗\";\nreturn (await response.json()).title;",
      "正常なら題名。一時失敗に設定した原稿は「一時的な失敗」となります。"
    ]
  ],
  "quiz": [
    "503が返ったときに案内することは？",
    [
      "そのIDに本がないと断定",
      "今は読めないので一時的な失敗と知らせる",
      "必ず成功したと言う",
      "永久にボタンを止める"
    ],
    1,
    "一時的な失敗では原稿が復旧してから再び試せます。"
  ],
  "build": [
    "if (!①) return ②;",
    [
      [
        "応答が成功か",
        "response.ok",
        "response.title"
      ],
      [
        "一時的な失敗時",
        "\"一時的な失敗\"",
        "\"開始前\""
      ]
    ]
  ],
  "right": [
    "response.ok",
    "\"一時的な失敗\""
  ],
  "file": "app/data-lab/fail/Reading.jsx",
  "task": "原稿の状態を「一時失敗」にして /data-lab/fail で本を読みます。503と成功を区別し、一時的な失敗と、正常時の題名を表示してください。",
  "source": "\"use client\";\nimport Scenario from \"../Scenario\";\n\nasync function describe(response) {\n  if (!response.ok) return \"開始前\";\n  return (await response.json()).title;\n}\nexport default function Reading({ run }) {\n  return <Scenario run={run} describe={describe} />;\n}",
  "answer": "\"use client\";\nimport Scenario from \"../Scenario\";\n\nasync function describe(response) {\n  if (!response.ok) return \"一時的な失敗\";\n  return (await response.json()).title;\n}\nexport default function Reading({ run }) {\n  return <Scenario run={run} describe={describe} />;\n}",
  "hint": "応答に title がある前提で読み進めず、まず ok を確かめます。"
}, {
  "id": "paper-missing",
  "chapter": "refresh",
  "title": "存在しない本に合う案内を出す",
  "slides": [
    [
      "404はその住所の対象がない印",
      "「ない本を読む」は本当に存在しない番号を要求します。対象なしなら404、一時的に処理できない場合は503です。先に404を調べ、ほかの失敗と分けます。",
      "if (response.status === 404) return \"本が見つかりません\";\nif (!response.ok) return \"一時的な失敗\";",
      "ない本では「本が見つかりません」、実在する本の503は「一時的な失敗」と出ます。"
    ]
  ],
  "quiz": [
    "存在しないIDで返る番号は？",
    [
      "200",
      "0",
      "404",
      "503"
    ],
    2,
    "404は指定した本が見つからないことを表します。"
  ],
  "build": [
    "if (response.① === ②) return \"本が見つかりません\";",
    [
      [
        "状態番号の項目",
        "status",
        "ok"
      ],
      [
        "対象がない番号",
        "404",
        "503"
      ]
    ]
  ],
  "right": [
    "status",
    "404"
  ],
  "file": "app/data-lab/missing/Reading.jsx",
  "task": "/data-lab/missing の「ない本を読む」で対象なしを伝えます。実在する本の一時失敗を同じ表示にせず、正常な原稿もそのまま読めるようにしてください。",
  "source": "\"use client\";\nimport Scenario from \"../Scenario\";\n\nasync function describe(response) {\n  if (!response.ok) return \"一時的な失敗\";\n  return (await response.json()).title;\n}\nexport default function Reading({ run }) {\n  return <Scenario run={run} describe={describe} />;\n}",
  "answer": "\"use client\";\nimport Scenario from \"../Scenario\";\n\nasync function describe(response) {\n  if (response.status === 404) return \"本が見つかりません\";\n  if (!response.ok) return \"一時的な失敗\";\n  return (await response.json()).title;\n}\nexport default function Reading({ run }) {\n  return <Scenario run={run} describe={describe} />;\n}",
  "hint": "対象なしを先に分けてから、その他の失敗に進みます。"
}, {
  "id": "paper-retry",
  "chapter": "refresh",
  "title": "下書きを保って同じ原稿へ再試行する",
  "slides": [
    [
      "設定を戻したあと、もう一度本を読む",
      "失敗の札を消すだけではサーバーの状態は確かめられません。再試行ボタンから最初と同じ read を呼ぶと、新しい応答が届きます。読書メモの欄はその場所に残します。",
      "<button onClick={read}>再試行</button>",
      "一時失敗から正常へ設定を戻して再試行すると、書きかけのメモを保ったまま新版の題名が届きます。"
    ]
  ],
  "quiz": [
    "再試行ボタンが行うことは？",
    [
      "表示だけ成功にする",
      "メモを消す",
      "別ページへ移動",
      "同じ住所へ新しい要求を送る"
    ],
    3,
    "元の住所へ再び要求し、復旧後に実際に届いた値を表示します。"
  ],
  "build": [
    "{phase === ① && <button onClick={②}>再試行</button>}",
    [
      [
        "再試行を出す状態",
        "\"failed\"",
        "\"waiting\""
      ],
      [
        "もう一度呼ぶ操作",
        "read",
        "setNote"
      ]
    ]
  ],
  "right": [
    "\"failed\"",
    "read"
  ],
  "file": "app/data-lab/retry/Retry.jsx",
  "task": "/data-lab/retry で、取得失敗後の再試行から同じURLへ新たに要求します。原稿を正常に戻してから再試行し、題名が読めて読書メモが残るようにしてください。",
  "source": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Retry({ run }) {\n  const [note, setNote] = useState(\"開始前\");\n  const [phase, setPhase] = useState(\"ready\");\n  async function read() {\n    setPhase(\"waiting\");\n    setNote(\"読込中\");\n    try {\n      const query = new URLSearchParams({ run, id: \"tide\" });\n      const response = await fetch(\"/data-lab/origin?\" + query, { cache: \"no-store\" });\n      if (!response.ok) throw Error(\"取得できません\");\n      setNote((await response.json()).title);\n      setPhase(\"ready\");\n    } catch {\n      setNote(\"一時的な失敗\");\n      setPhase(\"failed\");\n    }\n  }\n  return <>\n    <label>読書メモ <input /></label>\n    <button disabled={phase === \"waiting\"} onClick={read}>本を読む</button>\n    {phase === \"failed\" && <button onClick={() => setNote(\"再試行\")}>再試行</button>}\n    <p role=\"status\">{note}</p>\n  </>;\n}",
  "answer": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Retry({ run }) {\n  const [note, setNote] = useState(\"開始前\");\n  const [phase, setPhase] = useState(\"ready\");\n  async function read() {\n    setPhase(\"waiting\");\n    setNote(\"読込中\");\n    try {\n      const query = new URLSearchParams({ run, id: \"tide\" });\n      const response = await fetch(\"/data-lab/origin?\" + query, { cache: \"no-store\" });\n      if (!response.ok) throw Error(\"取得できません\");\n      setNote((await response.json()).title);\n      setPhase(\"ready\");\n    } catch {\n      setNote(\"一時的な失敗\");\n      setPhase(\"failed\");\n    }\n  }\n  return <>\n    <label>読書メモ <input /></label>\n    <button disabled={phase === \"waiting\"} onClick={read}>本を読む</button>\n    {phase === \"failed\" && <button onClick={read}>再試行</button>}\n    <p role=\"status\">{note}</p>\n  </>;\n}",
  "hint": "再試行の表示があるなら次はクリックしたときの処理を調べます。"
});
