import Link from "next/link";

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
}
