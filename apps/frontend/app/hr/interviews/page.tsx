import { redirect } from "next/navigation";

export default function LegacyHrInterviewsPage() {
  redirect("/dashboard/candidates");
}
