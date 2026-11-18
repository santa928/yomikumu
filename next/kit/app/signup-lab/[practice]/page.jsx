import { notFound } from "next/navigation";
import Practice from "../Practice";
export const dynamic = "force-dynamic";
export default async function SignupPractice({ params }) {
  const { practice } = await params;
  if (!["fields", "validation", "retention", "action", "pending"].includes(practice)) notFound();
  return <Practice practice={practice}/>;
}
