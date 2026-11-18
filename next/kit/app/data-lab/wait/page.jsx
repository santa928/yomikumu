import ReadState from "./ReadState";
export default async function Waiting({searchParams}) {
  const {run} = await searchParams;
  return <main><h1>届くまでの本の札</h1><ReadState run={run || "desk"} /></main>;
}
