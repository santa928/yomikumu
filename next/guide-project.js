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
    id: "guide-project", title: "旅の案内と読書会のサイトを作る",
    goal: "旅の案内で一覧と詳細ページを作り、地区で絞り込めるようにします。PC の完成例 /travel/example で「港」「坂」「山」を順に検索してみましょう。最後に、同じ仕組みで読書会の一覧と残席を表示します。",
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
      ["完成例で行き先を選ぶ", "PCの /travel/example では、地区を空にして「探す」と二つの目的地が出ます。桟橋の名前を押すと、桟橋の詳細ページが開きます。詳細の URL を直接開いても同じ案内を読めます。", "一覧  /travel/example\n詳細  /travel/pier", "水辺の桟橋を選ぶと「港の入口です。」と読めます。"],
      ["フォルダーとリンク先を結ぶ", "app/travel/hill/page.jsx は /travel/hill で開けます。Link の href に移動先のパスを書き、タグの間にはリンク名を置きます。", '<Link href="/travel/pier">水辺の桟橋</Link>', "水辺の桟橋の文字から /travel/pier に進みます。"],
    ],
    quiz: ["丘の詳細ページを直接開くパスは？", ["/travel", "/travel/hill", "/travel?name", "/page.jsx"], 1, "app/travel/hill/page.jsx に対応するパスは /travel/hill です。"],
    build: ['<Link href="①">②</Link>', [["丘へのパス", "/travel/hill", "/travel"], ["リンクの名前", "夕方の丘", "次へ"]]],
    right: ["/travel/hill", "夕方の丘"], file: "app/travel/page.jsx", source: travel, answer: travel.replace("      </ul>", '        <li><Link href="/travel/hill">夕方の丘</Link></li>\n      </ul>'),
    task: "桟橋の見本のすぐ下に、夕方の丘へのリンクをもう一つ加えます。/travel を開き、二つの行き先を押せるようにしてください。", hint: "桟橋の li の一行を手本に、href とリンク名を丘に合わせます。",
  }, {
    id: "travel-detail", chapter: "guide-project", title: "詳細を直接開いて、一覧へ戻る",
    slides: [
      ["詳細ページに一覧へのリンクを置く", "詳細ページを直接開くと、ブラウザの「戻る」では旅の一覧へ移動できないことがあります。各ページに道順と、一覧へのリンクを載せます。", '<p>港の入口です。</p>\n<Link href="/travel">旅の一覧へ</Link>', "桟橋のページから「旅の一覧へ」を押すと、二つの目的地に戻れます。"],
      ["丘の道順と戻り先を書く", "丘のページにも、見出しの下に道順を書きます。一覧へのリンク先は桟橋と同じ /travel です。", "見出し　夕方の丘\n道順　石段を上ります。\n戻る先　/travel", "/travel/hill を直接開いても「旅の一覧へ」から /travel に移れます。"],
    ],
    quiz: ["丘の詳細ページから旅の一覧へ移動するには、どのリンクを置きますか。", ["丘の詳細をもう一度開くリンク", "桟橋の詳細へのリンク", "旅の一覧へのリンク", "地区の検索結果へのリンク"], 2, "前の画面を開いていなくても一覧に進めます。"],
    build: ['<p>①</p>\n<Link href="②">旅の一覧へ</Link>', [["丘の道順", "石段を上ります。", "港の入口です。"], ["戻り先", "/travel", "/travel/hill"]]],
    right: ["石段を上ります。", "/travel"], file: "app/travel/hill/page.jsx", source: hill,
    answer: hill.replace("<p>町を見おろせます。</p>", '<p>石段を上ります。</p>\n      <Link href="/travel">旅の一覧へ</Link>'),
    task: "/travel/hill に「夕方の丘」「石段を上ります。」を載せ、「旅の一覧へ」から一覧へ戻れるようにします。", hint: "直リンクで正しい丘が出たら、一覧へ戻るリンクを足します。",
  }, {
    id: "travel-search", chapter: "guide-project", title: "GET で地区を送り、検索結果を表示する",
    slides: [
      ["検索した地区を URL に残す", "GET のフォームは、入力欄の name と値をURL の ? の後ろに付けます。Next.js のページでは await searchParams で受け取ります。検索後の URL をコピーすると同じ地区の一覧を開けます。", '<form method="get"><input name="town" /><button>探す</button></form>\nconst { town = "" } = await searchParams;', "坂を送ると /travel/search?town=坂 です。"],
      ["条件なし・一致あり・該当なし", "filter は条件に合う記録だけで新しい一覧を作ります。!town は地区の指定が空という意味です。|| はどちらかが真なら残します。", 'const found = stops.filter(stop => !town || stop.town === town);', "空の地区なら両方、港なら桟橋だけ、山なら「該当する場所はありません。」です。"],
    ],
    quiz: ["候補がない「山」を送ったときの案内は？", ["水辺の桟橋", "二つの目的地すべて", "夕方の丘", "該当する場所はありません。"], 3, "一致が0件でも、結果と次の入力欄を読めるようにします。"],
    build: ['GET /travel/search?①=坂\nstop.town === ②', [["地区の欄名", "town", "id"], ["URL から受け取る値", "town", '"港"']]],
    right: ["town", "town"], file: "app/travel/search/page.jsx", source: search,
    answer: search.replace("const found = stops;", "const found = stops.filter(stop => !town || stop.town === town);"),
    task: "用意された地区欄と表示を使い、一覧を作る一行を直します。港なら桟橋、坂なら丘、空欄なら両方、山なら該当なしを表示します。", hint: "固定した地区名を使わず、受け取った town を各 stop.town と比べます。",
  }, {
    id: "travel-meta", chapter: "guide-project", title: "タブの名前とページの説明を加える",
    slides: [
      ["見出しとタブの名前を見分ける", "画面の h1 と、ブラウザのタブに出る名前は別々に用意できます。ページから metadata を export して title を指定すると、そのページを開いたタブに表示されます。", 'export const metadata = { title: "旅の道順" };', "タブは「旅の道順」と表示されます。本文の見出しはそのままです。"],
      ["ページの説明を metadata に書く", "description は、そのページで何が読めるかを一文にします。metadata に指定すると HTML の head に description として出ます。", 'export const metadata = {\n  title: "旅の道順",\n  description: "道の曲がり角を案内します。",\n};', "タブの名前と、ページの説明の両方がHTMLに含まれます。"],
    ],
    quiz: ["タブの名前になる指定は？", ["metadata.title", "img.alt", "input.name", "metadata.description"], 0, "title がタブの名前、description が短い紹介です。"],
    build: ['export const metadata = { ①: "港の道順", ②: "桟橋までの道順と目印を紹介します。" };', [["タブ名", "title", "name"], ["紹介文", "description", "alt"]]],
    right: ["title", "description"], file: "app/travel/note/page.jsx", source: note,
    answer: note.replace('{ title: "案内" }', '{\n  title: "港の道順",\n  description: "桟橋までの道順と目印を紹介します。",\n}'),
    task: "本文の「桟橋までの道」を残し、このページのタブ名を「港の道順」、説明を「桟橋までの道順と目印を紹介します。」にします。", hint: "タブ名まで変わったら、同じ metadata に説明の項目を足します。",
  }, {
    id: "travel-image", chapter: "guide-project", title: "版画に大きさと代わりの説明を付ける",
    slides: [
      ["手元の一枚を表示する", "public にある港の版画は /harbor.png で使えます。Next の Image に元の画像の幅・高さを渡すと、読込み前にも縦横の比率が分かります。この版画は幅144、高さ96です。", '<Image src="/harbor.png" width={144} height={96} alt="港の版画" />', "横長の版画が、元の3対2の比率で表示されます。"],
      ["画像の目印を alt に書く", "案内の目印は、港に浮かぶ白い帆と赤い太陽です。alt にはファイル名の代わりに、画像に何が描かれているかを書きます。", 'alt="港の赤い太陽と白い帆"', "画像を見ずに読んでも、港を見分ける二つの目印が伝わります。"],
    ],
    quiz: ["この版画の代替テキストとして読者の役に立つのは？", ["harbor.png", "画像", "港の赤い太陽と白い帆", "幅144"], 2, "赤い太陽と白い帆が、絵から読み取れる目印です。"],
    build: ['<Image src="①" width={144} height={96} alt="②" />', [["手元の版画", "/harbor.png", "/public/harbor.png"], ["読める目印", "港の赤い太陽と白い帆", "ファイル1"]]],
    right: ["/harbor.png", "港の赤い太陽と白い帆"], file: "app/travel/photo/page.jsx", source: photo,
    answer: photo.replace('alt=""', 'alt="港の赤い太陽と白い帆"'),
    task: "画像の場所と大きさを使い、空の alt に「港の赤い太陽と白い帆」を入れます。ページを開いて画像が表示されることも確かめましょう。", hint: "画像が出たら、色と帆を読み取れる代替テキストを設定します。",
  }, {
    id: "meeting-project", chapter: "guide-project", title: "読書会の一覧と詳細に残席を表示する",
    slides: [
      ["春と秋の読書会データを確認する", "library/meetings.js に春と秋の読書会データがあります。id は詳細ページの URL に使う識別子、title は会の名前、town は地区、seats は残席です。同じ id でも、春と秋で会の名前や残席が変わります。", '春 river 川辺の読書会・港・2席 ／ hill 丘の読書会・坂・0席 ／ bridge 橋の読書会・港・1席\n秋 river 夕方の詩の会・坂・0席 ／ lamp 灯りの会・港・4席', "春の /meetings/river は川辺の読書会、?edition=autumn を付けると夕方の詩の会です。"],
      ["一覧に各回の詳細リンクを表示する", "ページから MeetingList に、選んだ季節の読書会データ records、地区 town、季節 edition を渡します。各回の id と edition から詳細 URL を作り、title をリンク名にします。", 'const href = "/meetings/" + item.id + "?edition=" + edition;\n<a href={href}>{item.title}</a>', "秋の灯りの会を押すと /meetings/lamp?edition=autumn へ進みます。"],
      ["絞り込み、残席、見つからない時", "GETフォームで地区を選ぶときは、表示中の版を隠し入力で送れます。詳細には一件の record が渡ります。席が0なら満席、指定した id の読書会がなければ「読書会が見つかりません」と表示しましょう。", '<input type="hidden" name="edition" value={edition} />\nrecord.seats === 0 ? "満席" : "残席 " + record.seats', "秋の港は灯りの会の残席4。山で探すと「該当する回はありません。」。秋の /meetings/hill は見つかりません。"],
    ],
    quiz: ["秋の港で空席のある読書会を探すと、どの詳細ページを開けますか。", ["川辺の読書会", "灯りの会", "夕方の詩の会", "丘の読書会"], 1, "秋の港に該当するのは残席 4 の「灯りの会」です。その id と edition をリンクに含めます。"],
    build: ['① → 灯りの会を押す → ②', [["秋の港だけを開く", "/meetings?edition=autumn&town=港", "/meetings?edition=spring"], ["選んだ回へ進む", "/meetings/lamp?edition=autumn", "/meetings/river?edition=spring"]]],
    right: ["/meetings?edition=autumn&town=港", "/meetings/lamp?edition=autumn"], file: "library/guide.jsx", source: guide, answer: project,
    task: "読書会データを使って一覧と詳細を作ります。見出し「読書会の一覧」、各回へのリンクと残席、地区のGETフォームを作ります。詳細には回の見出し、地区、残席を表示します。0席は「満席」、地区の0件は「該当する回はありません。」、存在しない回は「読書会が見つかりません」と案内します。春の読書会を一つ開いたら、秋への切替、地区が空欄の場合、該当する回がない場合も試しましょう。", hint: "records から表示した回と、リンクの id・edition をそろえます。一覧が動いたら、record の有無と seats の0を分けて詳細を仕上げます。",
  }, {
    id: "meeting-export", chapter: "guide-project", title: "完成したコードを ZIP に保存して別のフォルダーで起動する",
    slides: [
      ["一覧と詳細に共通の会場名を置く", "layout の children には、開いたページの本文が入ります。children の前に会場名の見出しを置くと、一覧と詳細の両方に表示されます。", 'return <section><h2>海辺の読書会場</h2>{children}</section>;', "一覧にも個別の回にも「海辺の読書会場」が出て、各ページの本文も読めます。"],
      ["書き出したファイルで開き直す", "記述欄に完成コードをそろえ「今のコードをZIPで保存」を押します。旧サーバーを止め、別の空フォルダーにZIPを展開。新しい compose.yaml の場所で起動します。同じファイルを使っているかを、自分の会場名と秋の港の結果で確かめます。", "元のフォルダー　docker compose stop web\n新しいフォルダー　docker compose up --build -d web\n開く　http://localhost:3090/meetings?edition=autumn&town=港", "新しいフォルダーで起動したサイトでも、「灯りの会」を選ぶと残席 4 と表示されます。"],
      ["再起動して同じ URL を開く", "新しいフォルダーのサーバーを止めたら、開いていたページを再読み込みして接続が止まったことを確認します。start で再開したら同じ URL を開き、読書会の詳細と、該当する回がない場合の表示を確認してから採点します。", "docker compose stop web\ndocker compose start web\ndocker compose run --build --rm check meeting-export", "採点コマンドは再開後のページと HTTP 応答を確認します。停止中は自分でページを再読み込みして、接続できなくなることを確かめます。"],
    ],
    quiz: ["ZIP に保存したコードが新しいフォルダーでも動くか確かめるには？", ["ZIP の中に compose.yaml があるか見る", "元のサーバーで一覧を開く", "新しいサーバーを起動し、一覧から詳細を開き直す", "記述欄を開き直して会場名を見る"], 2, "書き出したソースに含まれるページを、再起動したサーバーで操作します。"],
    build: ["① で止める → ② で再開し、同じ詳細 URL を開く", [["停止", "docker compose stop web", "docker compose start web"], ["再開", "docker compose start web", "docker compose stop web"]]],
    right: ["docker compose stop web", "docker compose start web"], file: "app/meetings/layout.jsx", source: layout, companionIds: ["meeting-project"],
    answer: layout.replace("試作中", "海辺の読書会場"), task: "会場の見出しを「海辺の読書会場」に変え、前の課題で書いた一覧・詳細と一緒にZIPへ保存しましょう。新しいフォルダーで起動し、停止・再開した後、同じ詳細ページで edition を変え、春と秋の読書会が表示されるか確かめます。", hint: "会場名が出ても本文が見えないときは children を見直します。読書会の一覧・詳細の下書きも一緒に書き出します。",
  });
}
