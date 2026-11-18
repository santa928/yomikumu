import Reading from "./Reading";
export default async function Page({ searchParams }) {
  const { run } = await searchParams;
  return <main><h1>受付が一時的に失敗したとき</h1><Reading run={run || "desk"} /></main>;
}
