import Link from "next/link";

export default function MissingRecommendation() {
  return (
    <>
      <h1>おすすめの本が見つかりません</h1>
      <Link href="/recommendations">おすすめの一覧へ戻る</Link>
    </>
  );
}
