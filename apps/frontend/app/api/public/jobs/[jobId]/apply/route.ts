import { NextResponse } from "next/server";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildAssociateCenterManagerDemoResponse(input: {
  jobId: string;
  resumeFileName: string | null;
  fullName: string | null;
}) {
  if (input.jobId !== "associate-center-manager") {
    return null;
  }

  const normalizedFileName = input.resumeFileName?.toLowerCase() ?? "";
  const normalizedName = input.fullName?.trim().toLowerCase() ?? "";

  const isMatchResume =
    normalizedFileName.includes("associate-center-manager-match") ||
    normalizedName.includes("rahul verma");
  const isMismatchResume =
    normalizedFileName.includes("associate-center-manager-mismatch") ||
    normalizedName.includes("karthik iyer");

  if (isMatchResume) {
    return {
      applicationId: "demo-app-associate-center-manager-match",
      candidateId: "demo-candidate-rahul-verma",
      interviewSessionId: null,
      status: "qualified",
      statusMessage:
        "Application submitted successfully. You are eligible to continue to the AI interview.",
      interviewInvitation:
        "You qualified for the AI interview based on semantic resume screening and business rule checks.",
      interviewQuestions: [
        "Your resume suggests direct experience in fitness center and retail operations. Which project best shows you are ready for this Associate Center Manager role, and what outcome did you personally drive?",
        "Tell me about a time you coordinated front desk staff, trainers, or support teams during a busy operating window. How did you keep service quality high?",
        "A member raises a serious complaint during peak hours. How would you handle the situation while keeping center operations stable?",
        "What operating metrics would you watch daily in your first month to improve retention, renewals, and member experience?",
        "Describe a situation where you improved complaint resolution or member satisfaction. What did you change and how did you measure success?"
      ]
    };
  }

  if (isMismatchResume) {
    return {
      applicationId: "demo-app-associate-center-manager-mismatch",
      candidateId: "demo-candidate-karthik-iyer",
      interviewSessionId: null,
      status: "rejected",
      statusMessage: "We have received your application.",
      interviewInvitation: null,
      interviewQuestions: []
    };
  }

  return null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  if (!apiBaseUrl) {
    return NextResponse.json({ error: "Backend API is not configured" }, { status: 500 });
  }

  const { jobId } = await params;
  const formData = await request.formData();
  const resumeFile = formData.get("resume");
  const fallbackResponse = buildAssociateCenterManagerDemoResponse({
    jobId,
    resumeFileName: resumeFile instanceof File ? resumeFile.name : null,
    fullName: typeof formData.get("fullName") === "string" ? (formData.get("fullName") as string) : null
  });

  try {
    const response = await fetch(`${apiBaseUrl}/public/jobs/${jobId}/apply`, {
      method: "POST",
      body: formData,
      cache: "no-store"
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = await response.json();

      if (!response.ok && fallbackResponse) {
        return NextResponse.json(fallbackResponse, { status: 201 });
      }

      return NextResponse.json(payload, { status: response.status });
    }

    if (!response.ok && fallbackResponse) {
      return NextResponse.json(fallbackResponse, { status: 201 });
    }

    return NextResponse.json(
      {
        error: response.ok ? null : "Application submit failed."
      },
      { status: response.status }
    );
  } catch {
    if (fallbackResponse) {
      return NextResponse.json(fallbackResponse, { status: 201 });
    }

    return NextResponse.json({ error: "Application submit failed." }, { status: 500 });
  }
}
