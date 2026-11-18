"use strict";

{
  const travel = `import Link from "next/link";

export default function Travel() {
  return (
    <>
      <h1>旅の案内</h1>
      <ul>
        <li><Link href="/travel/pier">水辺の桟橋</Link></li>
      </ul>
      <nav aria-label="旅の道具">
        <Link href="/travel/search">地区から探す</Link>{" "}
        <Link href="/travel/note">道順</Link>{" "}
        <Link href="/travel/photo">港の版画</Link>
      </nav>
    </>
  );
}`;

  const hill = `import Link from "next/link";

export default function Hill() {
  return (
    <>
      <h1>夕方の丘</h1>
      <p>町を見おろせます。</p>
    </>
  );
}`;

  const search = `const stops = [
  { name: "水辺の桟橋", town: "港" },
  { name: "夕方の丘", town: "坂" },
];

export default async function Search({ searchParams }) {
  const { town = "" } = await searchParams;
  const found = stops;
  return (
    <>
      <h1>目的地を探す</h1>
      <form method="get">
        <label>地区 <input name="town" defaultValue={town} /></label>
        <button>探す</button>
      </form>
      {found.length ? (
        <ul>{found.map(stop => <li key={stop.name}>{stop.name}</li>)}</ul>
      ) : <p>該当する場所はありません。</p>}
    </>
  );
}`;

  const note = `export const metadata = { title: "案内" };

export default function Note() {
  return <h1>桟橋までの道</h1>;
}`;

  const photo = `import Image from "next/image";

export default function Photo() {
  return (
    <>
      <h1>港の版画</h1>
      <Image src="/harbor.png" width={144} height={96} alt="" />
    </>
  );
}`;

  const guide = `export function MeetingList({ records, town, edition }) {
  return <p>読書会の一覧を作ります。</p>;
}

export function MeetingDetail({ record }) {
  return <p>回ごとの残席を表示します。</p>;
}`;

  const layout = `export default function MeetingsLayout({ children }) {
  return <section><h2>試作中</h2>{children}</section>;
}`;

  const project = `export function MeetingList({ records, town, edition }) {
  const found = records.filter(item => !town || item.town === town);
  return (
    <>
      <h1>読書会の一覧</h1>
      <form method="get">
        <input type="hidden" name="edition" value={edition} />
        <label>地区 <input name="town" defaultValue={town} /></label>
        <button>探す</button>
      </form>
      {found.length ? (
        <ul>{found.map(item => (
          <li key={item.id}>
            <a href={\`/meetings/\${item.id}?edition=\${edition}\`}>{item.title}</a>
            {" "}{item.seats === 0 ? "満席" : \`残席 \${item.seats}\`}
          </li>
        ))}</ul>
      ) : <p>該当する回はありません。</p>}
    </>
  );
}

export function MeetingDetail({ record }) {
  if (!record) return <h1>読書会が見つかりません</h1>;
  return (
    <>
      <h1>{record.title}</h1>
      <p>{record.town}</p>
      <p>{record.seats === 0 ? "満席" : \`残席 \${record.seats}\`}</p>
    </>
  );
}`;

  nextChapters.push({
    id: "guide-project", title: "旅の案内を作り、読書会サイトを持ち出す",
    goal: "港と坂の旅案内を順に作ったら、別原稿で読書会の一覧・詳細・残席を自作します。PCの完成例は /travel/example です。地区を「港」「坂」「山」に変え、結果を選んでください。",
    examples: [
      ["/travel/example?town=港", "水辺の桟橋 → 詳細に「港の入口です。」"],
      ["/meetings?edition=spring&town=港", "川辺の読書会　残席 2\n橋の読書会　残席 1"],
      ["/meetings/river?edition=autumn", "夕方の詩の会\n坂\n満席"],
      ["/meetings?edition=autumn&town=山", "該当する回はありません。"],
    ],
  });
  nextLessons.push({
    id: "travel-list", chapter: "guide-project", title: "旅の一覧から二つの目的地へ進む",
    slides: [
      ["完成例で行き先を選ぶ", "PCの /travel/example では、地区を空にして「探す」と二つの目的地が出ます。桟橋の名前を押すと、その住所の詳しい案内が開きます。一覧と詳細を別ページにすると、詳細の住所だけを渡すこともできます。", "一覧  /travel/example\n詳細  /travel/pier", "水辺の桟橋を選ぶと「港の入口です。」と読めます。"],
      ["フォルダーとリンク先を結ぶ", "app/travel/hill/page.jsx の住所は /travel/hill です。Link の href にその住所を書き、タグの間には行く先が分かる名前を置きます。", '<Link href="/travel/pier">水辺の桟橋</Link>', "水辺の桟橋の文字から /travel/pier に進みます。"],
    ],
    quiz: ["丘の住所だけを友達に送るなら？", ["/travel", "/travel/hill", "/travel?name", "/page.jsx"], 1, "詳細ページはその住所を直接開いても読めます。"],
    build: ['<Link href="①">②</Link>', [["丘の住所", "/travel/hill", "/travel"], ["リンクの名前", "夕方の丘", "次へ"]]],
    right: ["/travel/hill", "夕方の丘"], file: "app/travel/page.jsx", source: travel, answer: travel.replace("      </ul>", '        <li><Link href="/travel/hill">夕方の丘</Link></li>\n      </ul>'),
    task: "桟橋の見本のすぐ下に、夕方の丘へのリンクをもう一つ加えます。/travel を開き、二つの行き先を押せるようにしてください。", hint: "桟橋の li の一行を手本に、href とリンク名を丘に合わせます。",
  }, {
    id: "travel-detail", chapter: "guide-project", title: "詳細を直接開いて、一覧へ戻る",
    slides: [
      ["直接開いた読者にも帰り道を", "友達から詳細の住所だけ届いた人は、ひとつ前のページを知りません。詳しい道順と、一覧へのリンクを各詳細ページに置きます。", '<p>港の入口です。</p>\n<Link href="/travel">旅の一覧へ</Link>', "桟橋のページから「旅の一覧へ」を押すと、二つの目的地に戻れます。"],
      ["別の原稿を丘の詳細に使う", "丘への案内には、場所が見えることより、どの道を歩くかを書くよう頼まれました。見出し、道順、戻る先を順に確認しましょう。", "見出し　夕方の丘\n道順　石段を上ります。\n戻る先　/travel", "住所 /travel/hill を最初に開いた人にも、次に何をするかが伝わります。"],
    ],
    quiz: ["詳細を直接開いた読者に必要なのは？", ["必ずブラウザを閉じる操作", "前の画面の記憶", "どこに戻るか分かる一覧へのリンク", "同じページを再読するだけ"], 2, "前の画面を開いていなくても一覧に進めます。"],
    build: ['<p>①</p>\n<Link href="②">旅の一覧へ</Link>', [["丘の道順", "石段を上ります。", "港の入口です。"], ["戻り先", "/travel", "/travel/hill"]]],
    right: ["石段を上ります。", "/travel"], file: "app/travel/hill/page.jsx", source: hill,
    answer: hill.replace("<p>町を見おろせます。</p>", '<p>石段を上ります。</p>\n      <Link href="/travel">旅の一覧へ</Link>'),
    task: "別原稿に合わせて /travel/hill に「夕方の丘」「石段を上ります。」を載せ、「旅の一覧へ」から一覧へ戻れるようにします。", hint: "直リンクで正しい丘が出たら、一覧へ戻るリンクを足します。",
  }, {
    id: "travel-search", chapter: "guide-project", title: "GETで地区を送り、空の結果にも応える",
    slides: [
      ["地区を住所に残す", "GET のフォームは、入力欄の name と値を住所の ? の後ろに付けます。Next.js のページでは await searchParams で受け取ります。住所をコピーすると同じ地区の一覧を開けます。", '<form method="get"><input name="town" /><button>探す</button></form>\nconst { town = "" } = await searchParams;', "坂を送ると /travel/search?town=坂 です。"],
      ["条件なし・一致あり・該当なし", "filter は条件に合う記録だけで新しい一覧を作ります。!town は地区の指定が空という意味です。|| はどちらかが真なら残します。", 'const found = stops.filter(stop => !town || stop.town === town);', "空の地区なら両方、港なら桟橋だけ、山なら「該当する場所はありません。」です。"],
    ],
    quiz: ["候補がない「山」を送ったときの案内は？", ["いつも桟橋", "必ず一覧全件", "エラーで停止", "該当する場所はありません。"], 3, "一致が0件でも、結果と次の入力欄を読めるようにします。"],
    build: ['GET /travel/search?①=坂\nstop.town === ②', [["地区の欄名", "town", "id"], ["住所から受け取る値", "town", '"港"']]],
    right: ["town", "town"], file: "app/travel/search/page.jsx", source: search,
    answer: search.replace("const found = stops;", "const found = stops.filter(stop => !town || stop.town === town);"),
    task: "用意された地区欄と表示を使い、一覧を作る一行を直します。港なら桟橋、坂なら丘、空欄なら両方、山なら該当なしを表示します。", hint: "固定した地区名を使わず、受け取った town を各 stop.town と比べます。",
  }, {
    id: "travel-meta", chapter: "guide-project", title: "タブの名前とページの説明を加える",
    slides: [
      ["見出しとタブの名前を見分ける", "画面の h1 と、ブラウザのタブに出る名前は別々に用意できます。ページから metadata を export して title を指定すると、その住所のタブ名になります。", 'export const metadata = { title: "旅の道順" };', "タブは「旅の道順」と表示されます。本文の見出しはそのままです。"],
      ["住所の短い説明を書く", "description は、そのページで何が読めるかを一文にします。metadata に指定すると HTML の head に description として出ます。", 'export const metadata = {\n  title: "旅の道順",\n  description: "道の曲がり角を案内します。",\n};', "タブの名前と、ページの説明の両方がHTMLに含まれます。"],
    ],
    quiz: ["タブの名前になる指定は？", ["metadata.title", "img.alt", "input.name", "本文に書いた最初の数字"], 0, "title がタブの名前、description が短い紹介です。"],
    build: ['export const metadata = { ①: "港の道順", ②: "桟橋までの道順と目印を紹介します。" };', [["タブ名", "title", "name"], ["紹介文", "description", "alt"]]],
    right: ["title", "description"], file: "app/travel/note/page.jsx", source: note,
    answer: note.replace('{ title: "案内" }', '{\n  title: "港の道順",\n  description: "桟橋までの道順と目印を紹介します。",\n}'),
    task: "本文の「桟橋までの道」を残し、このページのタブ名を「港の道順」、説明を「桟橋までの道順と目印を紹介します。」にします。", hint: "タブ名まで変わったら、同じ metadata に説明の項目を足します。",
  }, {
    id: "travel-image", chapter: "guide-project", title: "版画に大きさと代わりの説明を付ける",
    slides: [
      ["手元の一枚を表示する", "public にある港の版画は /harbor.png で使えます。Next の Image に元の画像の幅・高さを渡すと、読込み前にも縦横の比率が分かります。この版画は幅144、高さ96です。", '<Image src="/harbor.png" width={144} height={96} alt="港の版画" />', "横長の版画が、元の3対2の比率で表示されます。"],
      ["見えないときにも手がかりを渡す", "案内の目印は、港に浮かぶ白い帆と赤い太陽です。alt にはファイル名の代わりに、読者が受け取る手がかりを書きます。", 'alt="港の赤い太陽と白い帆"', "画像を見ずに読んでも、港を見分ける二つの目印が伝わります。"],
    ],
    quiz: ["この版画の代替テキストとして読者の役に立つのは？", ["harbor.png", "画像", "港の赤い太陽と白い帆", "幅144"], 2, "赤い太陽と白い帆が、絵から読み取れる目印です。"],
    build: ['<Image src="①" width={144} height={96} alt="②" />', [["手元の版画", "/harbor.png", "/public/harbor.png"], ["読める目印", "港の赤い太陽と白い帆", "ファイル1"]]],
    right: ["/harbor.png", "港の赤い太陽と白い帆"], file: "app/travel/photo/page.jsx", source: photo,
    answer: photo.replace('alt=""', 'alt="港の赤い太陽と白い帆"'),
    task: "画像の場所と大きさを使い、空の alt に「港の赤い太陽と白い帆」を入れます。実際に画像が読めることも確かめましょう。", hint: "画像が出たら、色と帆を読み取れる代替テキストを設定します。",
  }, {
    id: "meeting-project", chapter: "guide-project", title: "別原稿から読書会の一覧・詳細・残席を自作する",
    slides: [
      ["読者の依頼と二つの原稿", "読者は地区を選び、空席のある回を押して残席を知りたいそうです。library/meetings.js に春と秋の原稿があります。id は住所、title は回の名前、town は地区、seats は残席です。春と秋で同じ id の内容も変わります。", '春 river 川辺の読書会・港・2席 ／ hill 丘の読書会・坂・0席 ／ bridge 橋の読書会・港・1席\n秋 river 夕方の詩の会・坂・0席 ／ lamp 灯りの会・港・4席', "春の /meetings/river は川辺の読書会、?edition=autumn を付けると夕方の詩の会です。"],
      ["まず一件を通して読む", "ページ側は原稿から選んだ records、地区 town、版 edition を MeetingList に渡します。id を使って詳細の住所を作り、選んだ版をリンクにも残します。会の名称は原稿の title を使います。", 'const href = "/meetings/" + item.id + "?edition=" + edition;\n<a href={href}>{item.title}</a>', "秋の灯りの会を押すと /meetings/lamp?edition=autumn へ進みます。"],
      ["絞り込み、残席、見つからない時", "GETフォームで地区を選ぶときは、表示中の版を隠し入力で送れます。詳細には一件の record が渡ります。席が0なら満席、記録がない住所なら「読書会が見つかりません」と表示しましょう。", '<input type="hidden" name="edition" value={edition} />\nrecord.seats === 0 ? "満席" : "残席 " + record.seats', "秋の港は灯りの会の残席4。山で探すと「該当する回はありません。」。秋の /meetings/hill は見つかりません。"],
    ],
    quiz: ["秋の原稿で、港に席のある回へ進む正しい道は？", ["春の川辺に固定する", "秋の港の一覧から灯りの会の詳細へ", "どの回でも同じ残席を出す", "地区を送ると版を消す"], 1, "地区と版を一覧に保ち、読者の選んだ回のidで詳細に進みます。"],
    build: ['① → 灯りの会を押す → ②', [["秋の港だけを開く", "/meetings?edition=autumn&town=港", "/meetings?edition=spring"], ["選んだ回へ進む", "/meetings/lamp?edition=autumn", "/meetings/river?edition=spring"]]],
    right: ["/meetings?edition=autumn&town=港", "/meetings/lamp?edition=autumn"], file: "library/guide.jsx", source: guide, answer: project,
    task: "別原稿から作る卒業制作です。見出し「読書会の一覧」、各回へのリンクと残席、地区のGETフォームを作ります。詳細には回の見出し、地区、残席を表示します。0席は「満席」、地区の0件は「該当する回はありません。」、存在しない回は「読書会が見つかりません」と案内します。春の一件を通せたら、秋・空欄・対象なしでも試しましょう。", hint: "records から表示した回と、リンクの id・edition をそろえます。一覧が動いたら、record の有無と seats の0を分けて詳細を仕上げます。",
  }, {
    id: "meeting-export", chapter: "guide-project", title: "仕上げたソースを持ち出して再起動する",
    slides: [
      ["一覧と詳細に共通の会場名を置く", "layout の children にはその住所の本文が入ります。会場名を同じ見出しで囲み、一覧から詳細へ移っても読者が同じ会場にいると分かるようにします。", 'return <section><h2>海辺の読書会場</h2>{children}</section>;', "一覧にも個別の回にも「海辺の読書会場」が出て、各ページの本文も読めます。"],
      ["書き出したファイルで開き直す", "記述欄に完成コードをそろえ「今のコードをZIPで保存」を押します。旧サーバーを止め、別の空フォルダーにZIPを展開。新しい compose.yaml の場所で起動します。同じファイルを使っているかを、自分の会場名と秋の港の結果で確かめます。", "元のフォルダー　docker compose stop web\n新しいフォルダー　docker compose up --build -d web\n開く　http://localhost:3090/meetings?edition=autumn&town=港", "移した側でも灯りの会を選べ、残席4が出ます。"],
      ["停止、再開、同じ住所を再読", "新しいフォルダーのサーバーを止めたら、開いていたページを再読み込みして接続が止まったことを確認します。start 後に同じ住所を開き直し、詳細・対象なしを試して最後の採点をします。", "docker compose stop web\ndocker compose start web\ndocker compose run --build --rm check meeting-export", "採点結果は再開後のページとHTTP応答を確かめます。停止中の接続も自分で見比べられます。"],
    ],
    quiz: ["新しいフォルダーで持ち出しに成功したか確かめる操作は？", ["ZIP名を読むだけ", "元の画面を見続ける", "新しいサーバーを起動し、一覧から詳細を開き直す", "すべてを削除する"], 2, "書き出したソースに含まれるページを、再起動したサーバーで操作します。"],
    build: ["① で止める → ② で再開し、同じ詳細URLを再読", [["停止", "docker compose stop web", "docker compose start web"], ["再開", "docker compose start web", "docker compose stop web"]]],
    right: ["docker compose stop web", "docker compose start web"], file: "app/meetings/layout.jsx", source: layout,
    answer: layout.replace("試作中", "海辺の読書会場"), task: "会場の見出しを「海辺の読書会場」に変え、前の課題で書いた一覧・詳細と一緒にZIPへ保存しましょう。新しいフォルダーで起動し、停止・再開した後、春と秋の読書会を同じ住所で確かめます。", hint: "会場名が出ても本文が見えないときは children を見直します。読書会の一覧・詳細の下書きも一緒に書き出します。",
  });
}
