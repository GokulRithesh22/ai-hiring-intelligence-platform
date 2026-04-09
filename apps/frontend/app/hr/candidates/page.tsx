import { redirect } from "next/navigation";

export default function LegacyHrCandidatesPage() {
  redirect("/dashboard/candidates");
}
