import Image from "next/image";

export default function Photo() {
  return (
    <>
      <h1>港の版画</h1>
      <Image src="/harbor.png" width={144} height={96} alt="" />
    </>
  );
}
