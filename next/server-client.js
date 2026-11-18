"use strict";

nextChapters.push({
  "id": "client",
  "title": "整理室から届いた本に、ブラウザで栞をはさむ",
  "goal": "PCの完成例 /client-lab で本を選び、お気に入りを入れて外します。原稿を読んだサーバーと、その後の操作を受けるブラウザの仕事を確かめます。",
  "examples": [
    [
      "/client-lab?book=bridge",
      "石橋のスケッチ　所蔵 3 冊　押した回数 0"
    ],
    [
      "/client-lab?book=fern",
      "羊歯の標本帳　所蔵 5 冊　押した回数 0"
    ],
    [
      "羊歯の本で二回押した後",
      "羊歯の標本帳　お気に入りに入れる　押した回数 2"
    ]
  ]
});

nextLessons.push({
  "id": "server-book",
  "title": "整理室の原稿をサーバーで読む",
  "slides": [
    [
      "原稿がある場所で読んでから返す",
      "ブラウザには整理室のファイルがありません。サーバー側のページは教材の readBook に本の番号を渡し、ファイルにある一冊を読みます。await は、その読み取りが終わるのを待つ印です。",
      "const selected = await readBook(\"bridge\");\nreturn <h1>{selected.title}</h1>;",
      "/client-lab/read には「石橋のスケッチ」が届きます。"
    ],
    [
      "URLから受け取った番号で一冊を選ぶ",
      "同じページで本を選びたいときは、住所の ?book= に続く番号を使います。値がないときは || で最初の本を選びます。",
      "const { book } = await searchParams;\nconst selected = await readBook(book || \"bridge\");",
      "?book=fern を開くと整理室で二冊目が選ばれ、「羊歯の標本帳」という見出しを受け取ります。"
    ]
  ],
  "quiz": [
    "ローカルの整理室ファイルを直接読めるのは？",
    [
      "訪問者のボタン",
      "サーバーの readBook",
      "画面の CSS",
      "URL の文字だけ"
    ],
    1,
    "原稿はサーバーのファイルです。読む役をサーバー側に置きます。"
  ],
  "build": [
    "const selected = ① readBook(②);",
    [
      [
        "読めるまで待つ",
        "await",
        "return"
      ],
      [
        "URLにある番号を使う",
        "book || \"bridge\"",
        "\"bridge\""
      ]
    ]
  ],
  "right": [
    "await",
    "book || \"bridge\""
  ],
  "task": "/client-lab/read で、番号のない住所は「石橋のスケッチ」、?book=fern は「羊歯の標本帳」をサーバーで読んで見出しとして返してください。",
  "hint": "最初の一冊が出たら、readBook に固定の番号を渡していないかを見直します。",
  "chapter": "client",
  "file": "app/client-lab/read/page.jsx",
  "source": "import { readBook } from \"../book-store\";\n\nexport default async function Reading({ searchParams }) {\n  const { book } = await searchParams;\n  const selected = await readBook(\"bridge\");\n  return <h1>{selected.title}</h1>;\n}",
  "answer": "import { readBook } from \"../book-store\";\n\nexport default async function Reading({ searchParams }) {\n  const { book } = await searchParams;\n  const selected = await readBook(book || \"bridge\");\n  return <h1>{selected.title}</h1>;\n}"
}, {
  "id": "book-props",
  "title": "本の題名と冊数だけを子に渡す",
  "slides": [
    [
      "ブラウザが使う値に絞る",
      "整理用メモを含む一冊から、公開の札に必要な題名と冊数だけを選びます。親から名前付きで子に渡す値を props と呼びます。",
      "<BookLabel title={selected.title} copies={selected.copies} />",
      "題名の文字と冊数の数値が届きます。整理記号は利用者の札に渡りません。"
    ],
    [
      "子では受け取った数をそのまま表示する",
      "BookLabel は表示に必要な二項目で働きます。受け取る側でファイルを開く手順はありません。",
      "function BookLabel({ title, copies }) {\n  return <p>{title} · 所蔵 {copies} 冊</p>;\n}",
      "羊歯の標本帳に切り替えれば、同じ札でも所蔵 5 冊になります。"
    ]
  ],
  "quiz": [
    "サーバーの一冊から、この札に渡すのは？",
    [
      "ファイルを読む関数",
      "内部整理記号も含む全件",
      "整理室の場所",
      "題名と冊数"
    ],
    3,
    "親で必要な文字と数を選ぶと、子はその二項目で表示できます。"
  ],
  "build": [
    "<BookLabel title={①} copies={②} />",
    [
      [
        "札に出す題名",
        "selected.title",
        "selected.filing"
      ],
      [
        "札に出す数",
        "selected.copies",
        "0"
      ]
    ]
  ],
  "right": [
    "selected.title",
    "selected.copies"
  ],
  "task": "/client-lab/props で選んだ本の題名と所蔵冊数を子に渡します。bridge は3冊、fern は5冊です。公開札に整理用の filing を含めないようにします。",
  "hint": "題名が合ったら、親が子に渡す copies の値を原稿と対応させます。",
  "chapter": "client",
  "file": "app/client-lab/props/page.jsx",
  "source": "import { readBook } from \"../book-store\";\nimport BookLabel from \"./BookLabel\";\n\nexport default async function Shelf({ searchParams }) {\n  const { book } = await searchParams;\n  const selected = await readBook(book || \"bridge\");\n  return <BookLabel title={selected.title} copies={0} />;\n}",
  "answer": "import { readBook } from \"../book-store\";\nimport BookLabel from \"./BookLabel\";\n\nexport default async function Shelf({ searchParams }) {\n  const { book } = await searchParams;\n  const selected = await readBook(book || \"bridge\");\n  return <BookLabel title={selected.title} copies={selected.copies} />;\n}"
}, {
  "id": "client-switch",
  "title": "クリックを待つボタンをブラウザに置く",
  "slides": [
    [
      "押せる部品の入口を示す",
      "人が押すまで待つ栞には最初の行に \"use client\" と書きます。部品の初期表示が届き、ブラウザに操作がつながると onClick の関数が働きます。",
      "\"use client\";\nconst [saved, setSaved] = useState(false);",
      "最初は栞なし。saved に true が入ると栞ありに変わります。"
    ],
    [
      "押すたびに前の状態を反転する",
      "setSaved に関数を渡すと、直前の値を使って次の値を決められます。!value は true と false を入れ替えます。",
      "onClick={() => setSaved(value => !value)}",
      "一回押すと栞あり、もう一度押すと栞なしに戻ります。"
    ]
  ],
  "quiz": [
    "訪問者が押すのを待つ処理の場所は？",
    [
      "ブラウザで動くClient Component",
      "整理室のJSON",
      "CSSファイル",
      "サーバーのファイル読込"
    ],
    0,
    "クリックに反応する部品は use client の入口より内側に置きます。"
  ],
  "build": [
    "①;\nonClick={() => setSaved(value => ②)}",
    [
      [
        "クリックを待つ部品の宣言",
        "\"use client\"",
        "\"use server\""
      ],
      [
        "次の状態",
        "!value",
        "true"
      ]
    ]
  ],
  "right": [
    "\"use client\"",
    "!value"
  ],
  "task": "/client-lab/switch を直接開くと「栞なし」。一回押せば「栞あり」、もう一回押せば「栞なし」に戻します。押した状態を aria-pressed にも反映します。",
  "hint": "一回のクリックが合ったら、常に同じ値を入れていないかを見ます。",
  "chapter": "client",
  "file": "app/client-lab/switch/Switch.jsx",
  "source": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Switch() {\n  const [saved, setSaved] = useState(false);\n  return <button type=\"button\" aria-pressed={saved} onClick={() => setSaved(true)}>\n    {saved ? \"栞あり\" : \"栞なし\"}\n  </button>;\n}",
  "answer": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Switch() {\n  const [saved, setSaved] = useState(false);\n  return <button type=\"button\" aria-pressed={saved} onClick={() => setSaved(value => !value)}>\n    {saved ? \"栞あり\" : \"栞なし\"}\n  </button>;\n}"
}, {
  "id": "client-count",
  "title": "お気に入りの切替回数を更新する",
  "slides": [
    [
      "お気に入りと押した回数を分ける",
      "栞の有無は二通りですが、回数は増え続けます。useState(0) で0から始まる数を別に持ちます。",
      "const [count, setCount] = useState(0);",
      "直接ページを開いたとき、回数欄に 0 と出ます。"
    ],
    [
      "一回の操作で二つの値を更新する",
      "一回押したら栞を切り替え、前回の回数に1を足します。親から渡された題名は同じまま使えます。",
      "setSaved(value => !value);\nsetCount(value => value + 1);",
      "二回押すと栞は外れ、押した回数は 2 です。"
    ]
  ],
  "quiz": [
    "栞を入れて外した直後、押した回数はいくつ？",
    [
      "0",
      "1",
      "3",
      "2"
    ],
    3,
    "栞の有無と操作回数を別々に保存するので、外した操作も一回に数えます。"
  ],
  "build": [
    "setSaved(value => ①);\nsetCount(value => ②);",
    [
      [
        "栞の有無",
        "!value",
        "false"
      ],
      [
        "押した回数",
        "value + 1",
        "1"
      ]
    ]
  ],
  "right": [
    "!value",
    "value + 1"
  ],
  "task": "/client-lab/press?book=fern で親から来た「羊歯の標本帳」のお気に入りを切り替えます。直接開くと未登録・0回。以後のクリックごとに1を足し、登録を外した時も回数を残してください。",
  "hint": "一回で1を表示できたら二回目・三回目を試し、前の回数から更新します。",
  "chapter": "client",
  "file": "app/client-lab/press/Favorite.jsx",
  "source": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Favorite({ title }) {\n  const [saved, setSaved] = useState(false);\n  const [count, setCount] = useState(0);\n  function toggle() {\n    setSaved(value => !value);\n    setCount(1);\n  }\n  return <>\n    <button type=\"button\" aria-pressed={saved} onClick={toggle}>{title}をお気に入り</button>\n    <p role=\"status\">押した回数 {count}</p>\n  </>;\n}",
  "answer": "\"use client\";\nimport { useState } from \"react\";\n\nexport default function Favorite({ title }) {\n  const [saved, setSaved] = useState(false);\n  const [count, setCount] = useState(0);\n  function toggle() {\n    setSaved(value => !value);\n    setCount(value => value + 1);\n  }\n  return <>\n    <button type=\"button\" aria-pressed={saved} onClick={toggle}>{title}をお気に入り</button>\n    <p role=\"status\">押した回数 {count}</p>\n  </>;\n}"
});
