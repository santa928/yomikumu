import Retry from "./Retry";
export default async function RetryPage({searchParams}) {
  const {run} = await searchParams;
  return <main><h1>通信をやり直す</h1><Retry run={run || "desk"}/></main>;
}
