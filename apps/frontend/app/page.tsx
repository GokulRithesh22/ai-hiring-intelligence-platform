import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/candidate/login");
}

import { LandingPage } from "@/components/landing/landing-page";
import { getPublicJobs } from "@/lib/api-adapters";

export default async function HomePage() {
  const jobs = await getPublicJobs();

  return <LandingPage jobs={jobs} />;
}
