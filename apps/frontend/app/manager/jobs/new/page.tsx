import { redirect } from "next/navigation";

export default function LegacyManagerNewJobPage() {
  redirect("/dashboard/jobs/create");
}
