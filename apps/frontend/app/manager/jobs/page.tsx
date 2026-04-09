import { redirect } from "next/navigation";

export default function LegacyManagerJobsPage() {
  redirect("/dashboard/jobs");
}
