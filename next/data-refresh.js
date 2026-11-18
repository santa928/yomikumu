"use strict";

nextChapters.push({
  "id": "refresh",
  "title": "データの読み込みと更新を確かめる",
  "goal": "/data-lab で本の版と時刻を変え、同じ URL をもう一度開いて表示を比べます。応答に時間がかかる場合や、読み込みに失敗した場合も試せます。",
  "examples": [
    [
      "毎回取得で同じ URL を二度開く",
      "09:00 第1版 → 版と時刻を変更 → 09:15 第2版"
    ],
    [
      "応答を保持して同じ URL を二度開く",
      "09:00 第1版 → 版と時刻を変更 → 09:00 第1版"
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
  "title": "同じ URL で更新前後の値を読む",
  "slides": [
    [
      "版と時刻を変えて応答を比べる",
      "/data-lab の「原稿を設定」で版と時刻を書き替えられます。「二度取得」を開いて、返された edition と publishedAt を見ましょう。設定を変えて同じ URL を開き直すと、値の変化が分かります。",
      "const paper = await response.json();\nreturn Response.json({ edition: paper.edition, publishedAt: paper.publishedAt });",
      "第1版 09:00 から第2版 09:15 に設定した後は、同じ URL の応答に 2 と 09:15 が含まれます。"
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
    "取得した JSON の edition に、現在の版番号が入っています。"
  ],
  "build": [
    "{ edition: ①, publishedAt: ② }",
    [
      [
        "版番号",
        "paper.edition",
        "1"
      ],
      [
        "設定した時刻",
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
  "task": "/data-lab/double が、取得した版番号と時刻を JSON で返すようにしてください。一度開いてから版と時刻を変え、同じ URL で両方の値が更新されるか確かめましょう。",
  "source": "import { requestPaper } from \"../requests\";\n\nexport const dynamic = \"force-dynamic\";\nexport async function GET(request) {\n  const response = await requestPaper(request, { cache: \"no-store\" });\n  const paper = await response.json();\n  return Response.json({ title: paper.title, edition: 1, publishedAt: paper.publishedAt });\n}",
  "answer": "import { requestPaper } from \"../requests\";\n\nexport const dynamic = \"force-dynamic\";\nexport async function GET(request) {\n  const response = await requestPaper(request, { cache: \"no-store\" });\n  const paper = await response.json();\n  return Response.json({ title: paper.title, edition: paper.edition, publishedAt: paper.publishedAt });\n}",
  "hint": "時刻が変わっても版が1なら、返す値が固定か確かめます。"
}, {
  "id": "hold-fresh",
  "chapter": "refresh",
  "title": "取得した応答を保存するか、毎回取り直すかを選ぶ",
  "slides": [
    [
      "fetch の cache オプションを比べる",
      "サーバー側の fetch は、cache: \"force-cache\" を渡すと取得した応答を保持し、\"no-store\" なら開くたびにサーバーから取得します。requestPaper はこの設定を使って、同じ URL に HTTP リクエストを送ります。",
      "const policy = mode === \"keep\" ? \"force-cache\" : \"no-store\";\nawait requestPaper(request, { cache: policy });",
      "更新後に keep で読むと保存済みの版、fresh で読むと更新後の版が返ります。"
    ]
  ],
  "quiz": [
    "版番号を更新した直後にも最初の版を使いたいときの指定は？",
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
  "task": "/data-lab の新しい実験で初版を設定し「保持」と「毎回取得」を開きます。その後に版番号を変えたとき、mode=keep は初版、mode=fresh は新版を返すようにしてください。",
  "source": "import { requestPaper, relay } from \"../requests\";\n\nexport async function GET(request) {\n  const mode = new URL(request.url).searchParams.get(\"mode\");\n  const policy = mode === \"keep\" ? \"no-store\" : \"no-store\";\n  return relay(await requestPaper(request, { cache: policy }));\n}",
  "answer": "import { requestPaper, relay } from \"../requests\";\n\nexport async function GET(request) {\n  const mode = new URL(request.url).searchParams.get(\"mode\");\n  const policy = mode === \"keep\" ? \"force-cache\" : \"no-store\";\n  return relay(await requestPaper(request, { cache: policy }));\n}",
  "hint": "毎回取得が合ったら、keep の分岐に渡す cache を確認します。"
}, {
  "id": "expire",
  "chapter": "refresh",
  "title": "キャッシュした応答を期限後に更新する",
  "slides": [
    [
      "短い間だけ同じ版を使う",
      "next.revalidate の数は再検証までの秒数です。期限を過ぎた最初の要求には旧版が返り、サーバーがバックグラウンドでデータを取り直すことがあります。更新が終わると、同じ URL で新版を読めます。",
      "await requestPaper(request, { next: { revalidate: 2 } });",
      "初版取得の直後は同じ版が届きます。2秒を超えてから読み直し、再検証完了後に新版へ変わります。"
    ]
  ],
  "quiz": [
    "期限を過ぎた最初の要求で旧版が届いたら？",
    [
      "更新はできない",
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
  "task": "/data-lab/lifetime で一度取得した応答を 2 秒間使います。版と時刻を変更し、期限を過ぎて再検証が終わると新しい値が返るようにしてください。新しい実験名で試してください。",
  "source": "import { requestPaper, relay } from \"../requests\";\n\nexport async function GET(request) {\n  return relay(await requestPaper(request, { cache: \"force-cache\" }));\n}",
  "answer": "import { requestPaper, relay } from \"../requests\";\n\nexport async function GET(request) {\n  return relay(await requestPaper(request, { next: { revalidate: 2 } }));\n}",
  "hint": "ずっと旧版なら期限の指定を、すぐ新版になるなら毎回取得になっていないかを確認します。"
}, {
  "id": "paper-wait",
  "chapter": "refresh",
  "title": "応答を待つ間は「読込中」と表示する",
  "slides": [
    [
      "fetch の前に表示を更新する",
      "/data-lab で待ち時間を0.9秒に設定してください。本を読むときは await より前で「読込中」を出し、その間はボタンを押せないようにします。応答後は題名を出して再び押せるようにします。",
      "setBusy(true);\nsetNote(\"読込中\");\nconst response = await fetch(url);",
      "待つ間は読込中。応答後は本の題名です。"
    ]
  ],
  "quiz": [
    "「本を読む」を押してから応答が届くまで、画面に表示するのは？",
    [
      "本が見つかりません",
      "終了",
      "一時的な失敗",
      "読込中"
    ],
    3,
    "取得がまだ終わっていないので「読込中」と表示します。"
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
        "応答を待つ間の表示",
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
  "task": "/data-lab/wait の「本を読む」で、取得中は「読込中」と表示してボタンを無効にします。取得できたら本の題名を表示し、またボタンを押せるようにしてください。",
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
      "この実習では、サーバーが本のデータを一時的に返せないとき、HTTP ステータスコード 503 を返します。fetch が応答を受け取っても response.ok は false になります。まず応答の成功を確かめます。",
      "if (!response.ok) return \"一時的な失敗\";\nreturn (await response.json()).title;",
      "成功したら題名が表示されます。設定を「一時失敗」にすると「一時的な失敗」と表示されます。"
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
    "503 なら、サーバーが復旧した後で同じ本の取得を試せます。"
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
  "task": "「原稿の状態」を「一時失敗」にして /data-lab/fail で本を読みます。503と成功を区別し、一時的な失敗と、正常時の題名を表示してください。",
  "source": "\"use client\";\nimport Scenario from \"../Scenario\";\n\nasync function describe(response) {\n  if (!response.ok) return \"開始前\";\n  return (await response.json()).title;\n}\nexport default function Reading({ run }) {\n  return <Scenario run={run} describe={describe} />;\n}",
  "answer": "\"use client\";\nimport Scenario from \"../Scenario\";\n\nasync function describe(response) {\n  if (!response.ok) return \"一時的な失敗\";\n  return (await response.json()).title;\n}\nexport default function Reading({ run }) {\n  return <Scenario run={run} describe={describe} />;\n}",
  "hint": "応答に title がある前提で読み進めず、まず ok を確かめます。"
}, {
  "id": "paper-missing",
  "chapter": "refresh",
  "title": "存在しない本に合う案内を出す",
  "slides": [
    [
      "指定した本がないときは 404 が返る",
      "「ない本を読む」を押すと、一覧にない本の id でデータを取得します。対象なしなら404、一時的に処理できない場合は503です。先に404を調べ、ほかの失敗と分けます。",
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
        "ステータスコードの項目",
        "status",
        "ok"
      ],
      [
        "本が見つからない場合のコード",
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
  "task": "/data-lab/missing で「ない本を読む」を押したら「本が見つかりません」と表示します。一覧にある本では、取得できたら題名を、503 が返ったら「一時的な失敗」を表示してください。",
  "source": "\"use client\";\nimport Scenario from \"../Scenario\";\n\nasync function describe(response) {\n  if (!response.ok) return \"一時的な失敗\";\n  return (await response.json()).title;\n}\nexport default function Reading({ run }) {\n  return <Scenario run={run} describe={describe} />;\n}",
  "answer": "\"use client\";\nimport Scenario from \"../Scenario\";\n\nasync function describe(response) {\n  if (response.status === 404) return \"本が見つかりません\";\n  if (!response.ok) return \"一時的な失敗\";\n  return (await response.json()).title;\n}\nexport default function Reading({ run }) {\n  return <Scenario run={run} describe={describe} />;\n}",
  "hint": "対象なしを先に分けてから、その他の失敗に進みます。"
}, {
  "id": "paper-retry",
  "chapter": "refresh",
  "title": "書きかけのメモを残して本の取得をやり直す",
  "slides": [
    [
      "設定を戻したあと、もう一度本を読む",
      "「再試行」を押したら最初と同じ read を呼び、サーバーから届いた応答を表示します。読書メモの入力欄を残しておけば、失敗する前に書いていたメモも読み返せます。",
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
      "同じ URL に新しいリクエストを送る"
    ],
    3,
    "同じ URL にもう一度リクエストし、復旧後に受け取った値を表示します。"
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
  "task": "/data-lab/retry で、取得失敗後の再試行から同じURLへ新たに要求します。「原稿の状態」を「正常」に戻してから再試行し、題名が読めて読書メモが残るようにしてください。",
  "source": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Retry({ run }) {\n  const [note, setNote] = useState(\"開始前\");\n  const [phase, setPhase] = useState(\"ready\");\n  async function read() {\n    setPhase(\"waiting\");\n    setNote(\"読込中\");\n    try {\n      const query = new URLSearchParams({ run, id: \"tide\" });\n      const response = await fetch(\"/data-lab/origin?\" + query, { cache: \"no-store\" });\n      if (!response.ok) throw Error(\"取得できません\");\n      setNote((await response.json()).title);\n      setPhase(\"ready\");\n    } catch {\n      setNote(\"一時的な失敗\");\n      setPhase(\"failed\");\n    }\n  }\n  return <>\n    <label>読書メモ <input /></label>\n    <button disabled={phase === \"waiting\"} onClick={read}>本を読む</button>\n    {phase === \"failed\" && <button onClick={() => setNote(\"再試行\")}>再試行</button>}\n    <p role=\"status\">{note}</p>\n  </>;\n}",
  "answer": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Retry({ run }) {\n  const [note, setNote] = useState(\"開始前\");\n  const [phase, setPhase] = useState(\"ready\");\n  async function read() {\n    setPhase(\"waiting\");\n    setNote(\"読込中\");\n    try {\n      const query = new URLSearchParams({ run, id: \"tide\" });\n      const response = await fetch(\"/data-lab/origin?\" + query, { cache: \"no-store\" });\n      if (!response.ok) throw Error(\"取得できません\");\n      setNote((await response.json()).title);\n      setPhase(\"ready\");\n    } catch {\n      setNote(\"一時的な失敗\");\n      setPhase(\"failed\");\n    }\n  }\n  return <>\n    <label>読書メモ <input /></label>\n    <button disabled={phase === \"waiting\"} onClick={read}>本を読む</button>\n    {phase === \"failed\" && <button onClick={read}>再試行</button>}\n    <p role=\"status\">{note}</p>\n  </>;\n}",
  "hint": "再試行の表示があるなら次はクリックしたときの処理を調べます。"
});
