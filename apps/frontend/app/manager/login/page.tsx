import { ManagerLoginForm } from "@/components/manager/manager-login-form";
import { getManagerSession } from "@/lib/manager-auth";
import { redirect } from "next/navigation";

export default async function ManagerLoginPage() {
  if (await getManagerSession()) {
    redirect("/manager/dashboard");
  }

  return <ManagerLoginForm />;
}
