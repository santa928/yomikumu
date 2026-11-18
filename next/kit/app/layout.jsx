import Link from "next/link";
import "./reading.css";

export const metadata = { title: "水辺の図書室", description: "二冊の本と読書会を案内します。" };

export default function Layout({ children }) {
  return (
    <html lang="ja">
      <body>
        <a href="#story" className="skip">本文へ</a>
        <header><Link href="/">水辺の図書室</Link></header>
        <main id="story">{children}</main>
      </body>
    </html>
  );
}
