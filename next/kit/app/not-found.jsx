import Link from "next/link";

export default function MissingBook() {
  return <><h1>本が見つかりません</h1><Link href="/">一覧から選び直す</Link></>;
}
