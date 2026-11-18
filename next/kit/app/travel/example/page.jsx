import Link from "next/link";

const stops = [
  { town: "港", name: "水辺の桟橋", href: "/travel/pier" },
  { town: "坂", name: "夕方の丘", href: "/travel/hill" },
];

export default async function Example({ searchParams }) {
  const { town = "" } = await searchParams;
  const found = stops.filter(stop => !town || stop.town === town);
  return (
    <>
      <h1>旅の案内の完成例</h1>
      <form method="get">
        <label>地区 <input name="town" defaultValue={town} /></label>
        <button>探す</button>
      </form>
      {found.length ? (
        <ul>{found.map(stop => <li key={stop.href}><Link href={stop.href}>{stop.name}</Link></li>)}</ul>
      ) : <p>該当する場所はありません。</p>}
    </>
  );
}
