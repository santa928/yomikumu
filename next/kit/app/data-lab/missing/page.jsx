import Reading from "./Reading";
export default async function Page({ searchParams }) {
  const { run } = await searchParams;
  return <main><h1>探している本がないとき</h1><Reading run={run || "desk"} /></main>;
}
