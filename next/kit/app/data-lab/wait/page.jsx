import ReadState from "./ReadState";
export default async function Waiting({searchParams}) {
  const {run} = await searchParams;
  return <section><h1>届くまでの本の札</h1><ReadState run={run || "desk"} /></section>;
}
