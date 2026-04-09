import { redirect } from "next/navigation";

export default function LegacyHrJobsPage() {
  redirect("/dashboard/jobs");
}
