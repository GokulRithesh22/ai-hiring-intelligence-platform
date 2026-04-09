import { redirect } from "next/navigation";

export default function LegacyManagerJobCreatePage() {
  redirect("/dashboard/jobs/create");
}
