import { redirect } from "next/navigation";

export default function LegacyManagerCandidatesPage() {
  redirect("/dashboard/candidates");
}
