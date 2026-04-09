import Link from "next/link";
import { LandingPage } from "@/components/landing/landing-page";
import { getLandingContent } from "@/lib/api-adapters";

export default async function HomePage() {
  const content = await getLandingContent();

  return (
    <LandingPage
      content={content}
      actions={
        <>
          <Link className="button button-primary" href="/manager/dashboard">
            Create Job With AI
          </Link>
          <Link className="button button-secondary" href="/hr/dashboard">
            Open HR Dashboard
          </Link>
        </>
      }
    />
  );
}
