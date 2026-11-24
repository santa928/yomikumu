"use strict";

nextChapters.push({
  "id": "client",
  "title": "データはサーバーで読み、クリックはブラウザで扱う",
  "goal": "/client-lab で本を選び、お気に入りに追加してから外してみましょう。本のデータを読む処理はサーバーで、ボタンの操作に応じて表示を変える処理はブラウザで実行します。",
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
  "title": "サーバーでファイルを読み、その内容をページに表示する",
  "slides": [
    [
      "inventory.json から一冊を読み込む",
      "教材の inventory.json はサーバー側にあります。readBook がサーバーで本のデータを読み、await で完了を待ってから題名を表示します。ブラウザに必要なのは表示する題名で、ファイルを開くコードをブラウザに渡す必要はありません。",
      "const selected = await readBook(\"bridge\");\nreturn <h1>{selected.title}</h1>;",
      "/client-lab/read には「石橋のスケッチ」が届きます。"
    ],
    [
      "URL の book で一冊を選ぶ",
      "URL の ?book= に続く値が本の id です。book の指定がなければ、|| の右側に書いた bridge を使います。",
      "const { book } = await searchParams;\nconst selected = await readBook(book || \"bridge\");",
      "?book=fern を付けて開くと、id が fern の本を読み込み、見出しが「羊歯の標本帳」に変わります。"
    ]
  ],
  "quiz": [
    "この例で inventory.json を直接読むのは？",
    [
      "ブラウザのボタン",
      "サーバーの readBook",
      "画面の CSS",
      "URL の文字だけ"
    ],
    1,
    "readBook はサーバー上で inventory.json を開きます。"
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
        "URL にある本の id",
        "book || \"bridge\"",
        "\"bridge\""
      ]
    ]
  ],
  "right": [
    "await",
    "book || \"bridge\""
  ],
  "task": "/client-lab/read で、book を指定しないときは「石橋のスケッチ」、?book=fern は「羊歯の標本帳」をサーバーで読んで見出しとして返してください。",
  "hint": "最初の一冊が出たら、readBook に固定の idを渡していないかを見直します。",
  "chapter": "client",
  "file": "app/client-lab/read/page.jsx",
  "source": "import { readBook } from \"../book-store\";\n\nexport default async function Reading({ searchParams }) {\n  const { book } = await searchParams;\n  const selected = await readBook(\"bridge\");\n  return <h1>{selected.title}</h1>;\n}",
  "answer": "import { readBook } from \"../book-store\";\n\nexport default async function Reading({ searchParams }) {\n  const { book } = await searchParams;\n  const selected = await readBook(book || \"bridge\");\n  return <h1>{selected.title}</h1>;\n}"
}, {
  "id": "book-props",
  "title": "サーバーから表示用のデータを子の部品に渡す",
  "slides": [
    [
      "ブラウザが使う値に絞る",
      "selected は選んだ本のデータです。親コンポーネントから BookLabel に、表示に使う title と copies を渡します。このように名前を付けて渡す値を props と呼びます。",
      "<BookLabel title={selected.title} copies={selected.copies} />",
      "BookLabel が受け取るのは題名と冊数の二つです。整理用の filing はサーバー側に残ります。"
    ],
    [
      "子では受け取った数をそのまま表示する",
      "BookLabel は受け取った title と copies を本文に表示します。",
      "function BookLabel({ title, copies }) {\n  return <p>{title} · 所蔵 {copies} 冊</p>;\n}",
      "羊歯の標本帳に切り替えれば、同じ BookLabel に「所蔵 5 冊」と表示されます。"
    ]
  ],
  "quiz": [
    "この例で親が BookLabel に渡す値は？",
    [
      "ファイルを読む関数",
      "内部整理記号も含む全件",
      "JSON ファイルのパス",
      "題名と冊数"
    ],
    3,
    "親で必要な文字と数を選ぶと、子はその二項目で表示できます。"
  ],
  "build": [
    "<BookLabel title={①} copies={②} />",
    [
      [
        "表示する題名",
        "selected.title",
        "selected.filing"
      ],
      [
        "表示する冊数",
        "selected.copies",
        "0"
      ]
    ]
  ],
  "right": [
    "selected.title",
    "selected.copies"
  ],
  "task": "/client-lab/props で選んだ本の題名と所蔵冊数を子に渡します。bridge は3冊、fern は5冊です。BookLabel の props には整理用の filing を含めません。",
  "hint": "題名が合ったら、親が子に渡す copies の値をselected.copies と比べましょう。",
  "chapter": "client",
  "file": "app/client-lab/props/page.jsx",
  "source": "import { readBook } from \"../book-store\";\nimport BookLabel from \"./BookLabel\";\n\nexport default async function Shelf({ searchParams }) {\n  const { book } = await searchParams;\n  const selected = await readBook(book || \"bridge\");\n  return <BookLabel title={selected.title} copies={0} />;\n}",
  "answer": "import { readBook } from \"../book-store\";\nimport BookLabel from \"./BookLabel\";\n\nexport default async function Shelf({ searchParams }) {\n  const { book } = await searchParams;\n  const selected = await readBook(book || \"bridge\");\n  return <BookLabel title={selected.title} copies={selected.copies} />;\n}"
}, {
  "id": "client-switch",
  "title": "クリックで変わる表示をブラウザ側の部品にする",
  "slides": [
    [
      "クリックに反応する部品を作る",
      "ボタンの状態を変えるコンポーネントのファイルの先頭に \"use client\" と書きます。ブラウザでボタンをクリックすると、onClick に指定した関数が実行されます。",
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
      "本の JSON ファイル",
      "CSSファイル",
      "サーバーのファイル読込"
    ],
    0,
    "このボタンは Client Component で、ブラウザがクリックを受け取って saved を更新します。"
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
  "title": "ブラウザ側の部品でクリック回数を記録する",
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
