import { redirect } from "next/navigation";

import { RecruiterLoginForm } from "@/components/recruiter/recruiter-login-form";
import { getRecruiterSession } from "@/lib/recruiter-auth";

export default async function RecruiterLoginPage() {
  if (await getRecruiterSession()) {
    redirect("/dashboard");
  }

  return <RecruiterLoginForm />;
}
