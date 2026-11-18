const stops = [
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
}
