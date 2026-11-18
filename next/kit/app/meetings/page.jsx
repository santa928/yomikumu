import { MeetingList } from "../../library/guide";
import { meetingsFor } from "../../library/meetings";

export default async function Meetings({ searchParams }) {
  const { town = "", edition = "spring" } = await searchParams;
  return <MeetingList records={meetingsFor(edition)} town={town} edition={edition} />;
}
