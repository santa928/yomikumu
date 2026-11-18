import { MeetingDetail } from "../../../library/guide";
import { meetingsFor } from "../../../library/meetings";

export default async function Meeting({ params, searchParams }) {
  const { id } = await params;
  const { edition = "spring" } = await searchParams;
  return <MeetingDetail record={meetingsFor(edition).find(item => item.id === id)} />;
}
