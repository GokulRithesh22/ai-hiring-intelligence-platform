import type {
  ApplicationPortalData,
  ApplicationSubmissionResult,
  CandidateProfileData,
  DashboardCandidate,
  GeneratedJobDescription,
  HrDashboardData,
  HrCandidateListItem,
  JobIntakeQuestion,
  LandingContent,
  PublicJobCard,
} from "@/lib/types";

export const landingContent: LandingContent = {
  metrics: [
    { label: "Time to shortlist", value: "-42%" },
    { label: "Candidate data retained", value: "100%" },
    { label: "AI interviews completed", value: "2.1k" }
  ],
  showcase: [
    {
      title: "AI Screening Engine",
      subtitle: "Resume matching + qualification checks",
      body: "Score resumes against job constraints, stop low-fit applicants automatically, and carry the strongest profiles into structured interview loops.",
      status: "Scoring live",
      statusClass: "status-progress"
    },
    {
      title: "Permanent Candidate Memory",
      subtitle: "Cross-role intelligence report",
      body: "Managers see resume insights, LinkedIn context, interview transcripts, claim verification flags, and prior application history in one persistent profile.",
      status: "Knowledge base synced",
      statusClass: "status-approved"
    },
    {
      title: "Manager Interview Prep",
      subtitle: "AI-suggested follow-up questions",
      body: "Every candidate report ends with targeted prompts that help hiring managers validate claims, probe tradeoffs, and improve panel quality.",
      status: "Questions ready",
      statusClass: "status-active"
    }
  ],
  features: [
    {
      eyebrow: "Manager intake",
      title: "AI-generated job descriptions from a single title",
      description:
        "Start with the role name and let AI collect mission, skill, compensation, and timeline constraints through a guided intake conversation."
    },
    {
      eyebrow: "HR operations",
      title: "Pipeline visibility with structured filtering",
      description:
        "Track total applicants, AI interview completion, shortlisted candidates, and active roles while filtering on hiring-critical constraints."
    },
    {
      eyebrow: "Candidate intelligence",
      title: "Evidence-backed hiring recommendations",
      description:
        "Blend resume analysis, LinkedIn inference, AI interview scoring, and verification flags into one recommendation surface for decision-makers."
    }
  ],
  workflow: [
    {
      title: "Generate job request",
      description:
        "Managers enter the title and answer AI intake questions that produce a structured job description and hiring summary."
    },
    {
      title: "Approve and post",
      description:
        "HR reviews the draft, edits if needed, and pushes the role to distribution channels with the platform application link."
    },
    {
      title: "Screen candidates",
      description:
        "Applicants upload resumes and LinkedIn URLs, then the platform runs resume scoring and qualification filtering."
    },
    {
      title: "Interview and decide",
      description:
        "AI interviews qualified candidates, stores every answer, and updates the permanent candidate intelligence record."
    }
  ],
  productViews: [
    {
      eyebrow: "Managers",
      title: "Create jobs with an AI intake studio",
      description:
        "Conversation-driven role definition that turns rough inputs into HR-ready briefs, interview focus areas, and compensation context."
    },
    {
      eyebrow: "HR teams",
      title: "Drive approvals, screening, and shortlist decisions",
      description:
        "Analytics, pipeline tables, and quick filtering keep the operation fast without losing the structure needed for auditability."
    },
    {
      eyebrow: "Candidates",
      title: "Apply through a clear, guided portal",
      description:
        "Resume upload, LinkedIn capture, qualification questions, and AI interview readiness happen in one premium application journey."
    },
    {
      eyebrow: "Interviewers",
      title: "Review complete intelligence before live interviews",
      description:
        "Resume insights, claim verification, AI transcript evidence, and suggested follow-up questions make interviews sharper."
    }
  ]
};

export const publicJobCards: PublicJobCard[] = [
  {
    id: "associate-center-manager",
    slug: "associate-center-manager",
    title: "Associate Center Manager",
    location: "Whitefield, Bengaluru",
    experienceLevel: "2-4 years",
    summary:
      "Own day-to-day center operations, member experience, staff coordination, and on-ground performance for a high-energy fitness location."
  },
  {
    id: "sales-executive-cult-fit",
    slug: "sales-executive-cult-fit",
    title: "Sales Executive - Cult Fit",
    location: "Bengaluru",
    experienceLevel: "1-3 years",
    summary:
      "Drive membership growth through consultative selling, lead follow-up, and conversion-focused conversations across the fitness funnel."
  },
  {
    id: "personal-trainer-gym-fitness",
    slug: "personal-trainer-gym-fitness",
    title: "Personal Trainer - Gym / Fitness",
    location: "Bengaluru",
    experienceLevel: "2-5 years",
    summary:
      "Coach members through safe, motivating, goal-based fitness programs while building consistent training relationships and measurable progress."
  },
  {
    id: "swimming-coach",
    slug: "swimming-coach",
    title: "Swimming Coach",
    location: "Bengaluru",
    experienceLevel: "2-5 years",
    summary:
      "Lead structured swim sessions, improve member technique and confidence, and maintain a safe, high-quality coaching environment."
  },
  {
    id: "cult-fit-recruiter",
    slug: "cult-fit-recruiter",
    title: "Cult Fit Recruiter",
    location: "Bengaluru",
    experienceLevel: "3+ years",
    summary:
      "Partner with hiring teams to source, screen, and close talent across operations and corporate functions while maintaining a strong candidate experience."
  }
];

export const jobIntakeQuestions: JobIntakeQuestion[] = [
  {
    id: "problem",
    label: "What problem will this role solve?",
    prompt: "What is the primary business problem this role needs to solve in the next 12 months?",
    placeholder: "Own acquisition efficiency and build a more predictable growth engine across paid, lifecycle, and analytics."
  },
  {
    id: "skills",
    label: "What skills are required?",
    prompt: "Which skills or domains are mandatory for success in this role?",
    placeholder: "Performance marketing, experimentation, attribution, lifecycle automation, SQL, executive communication."
  },
  {
    id: "experience",
    label: "What experience level is needed?",
    prompt: "What level of experience and ownership should the hire demonstrate?",
    placeholder: "6-8 years in B2B SaaS growth, with experience leading cross-channel programs and mentoring one or two ICs."
  },
  {
    id: "salary",
    label: "What salary range is approved?",
    prompt: "What salary range has already been approved for this hire?",
    placeholder: "₹26L to ₹34L fixed plus performance bonus."
  },
  {
    id: "joining",
    label: "When should the candidate join?",
    prompt: "What is the ideal joining window for this candidate?",
    placeholder: "Within 45 days so the role can support Q3 pipeline targets."
  },
  {
    id: "relocation",
    label: "Is relocation required?",
    prompt: "Does the role require relocation or office presence for onboarding and long-term success?",
    placeholder: "Hybrid in Bengaluru. Relocation is preferred but not mandatory if the candidate can travel twice a month."
  }
];

export const dashboardCandidates: DashboardCandidate[] = [
  {
    id: "cand-001",
    name: "Aarav Mehta",
    resumeScore: 86,
    interviewScore: 82,
    joiningTimeline: "30 days",
    salaryExpectation: "₹28L",
    relocation: "Open",
    status: "Shortlisted"
  },
  {
    id: "cand-002",
    name: "Naina Kapoor",
    resumeScore: 91,
    interviewScore: 88,
    joiningTimeline: "45 days",
    salaryExpectation: "₹31L",
    relocation: "Not needed",
    status: "Interviewing"
  },
  {
    id: "cand-003",
    name: "Rohan Iyer",
    resumeScore: 68,
    interviewScore: 0,
    joiningTimeline: "60 days",
    salaryExpectation: "₹24L",
    relocation: "Declined",
    status: "Screened out"
  },
  {
    id: "cand-004",
    name: "Mira Shah",
    resumeScore: 79,
    interviewScore: 74,
    joiningTimeline: "30 days",
    salaryExpectation: "₹29L",
    relocation: "Open",
    status: "Pending HR review"
  }
];

export const hrDashboardData: HrDashboardData = {
  stats: [
    { label: "Total Applicants", value: "428", change: "+18% this month" },
    { label: "AI Interviews Completed", value: "126", change: "+22 this week" },
    { label: "Candidates Shortlisted", value: "32", change: "8 awaiting manager review" },
    { label: "Active Job Roles", value: "11", change: "3 pending HR approval" }
  ],
  candidates: dashboardCandidates
};

export const applicationPortalData: ApplicationPortalData = {
  job: {
    id: "growth-marketing-manager",
    title: "Growth Marketing Manager",
    summary:
      "Own experimentation across paid acquisition, lifecycle automation, and attribution systems to improve efficient revenue growth for a SaaS business.",
    experienceLevel: "6-8 years",
    salaryRange: "₹26L - ₹34L",
    joiningTimeline: "45 days",
    relocation: "Preferred for Bengaluru hybrid",
    location: "Bengaluru hybrid"
  },
  pipeline: []
};

export const screeningResult: ApplicationSubmissionResult = {
  applicationId: "app-mock-001",
  candidateId: "cand-mock-001",
  status: "qualified",
  statusMessage:
    "Application submitted successfully. You are eligible to continue to the AI interview.",
  interviewInvitation:
    "You qualified for the AI interview based on semantic resume screening and business rule checks.",
  interviewQuestions: [
    "How have you improved paid media efficiency while protecting pipeline quality in a SaaS environment?",
    "Walk through an experiment you designed that materially changed conversion rates or CAC.",
    "How do you align marketing, product, and revenue teams around attribution decisions?",
    "What dashboards or analyses do you rely on to identify growth bottlenecks early?"
  ]
};

export const candidateProfile: CandidateProfileData = {
  id: "cand-001",
  name: "Aarav Mehta",
  currentRole: "Senior Growth Lead at MetricsLoop",
  location: "Bengaluru, India",
  overview:
    "Performance-minded growth operator with deep SaaS acquisition and lifecycle experience. AI assessment flags strong analytical depth, polished communication, and credible experimentation leadership.",
  resumeScore: "86 / 100",
  resumeSynopsis:
    "Resume shows progression from growth analyst to lead, with ownership of paid, CRM, and analytics workflows.",
  interviewScore: "82 / 100",
  interviewSummary:
    "Strong clarity on channel economics and experimentation design, with a few areas to probe on team scaling and forecasting rigor.",
  applicationHistory: [
    {
      jobTitle: "Growth Marketing Manager",
      date: "Apr 09, 2026",
      status: "Shortlisted",
      statusClass: "status-shortlisted",
      notes: "Passed resume scoring, qualification filters, and AI interview thresholds."
    },
    {
      jobTitle: "Lifecycle Marketing Lead",
      date: "Jan 14, 2026",
      status: "Archived",
      statusClass: "status-review",
      notes: "Stored in knowledge base after hiring freeze; interview evidence preserved."
    }
  ],
  resumeInsights:
    "Highlights ownership of paid search, paid social, lifecycle segmentation, and attribution reporting. Tenure pattern is healthy, with increasing scope and team leadership over the last three roles.",
  linkedInInsights:
    "LinkedIn activity suggests recent focus on retention loops, experimentation culture, and collaborative work with product analytics teams.",
  interviewTranscript: [
    {
      question: "What growth problem are you best equipped to solve in the first 90 days?",
      answer:
        "I would start by mapping channel efficiency, handoff friction, and lifecycle gaps, then prioritize the two highest-confidence experiments that can reduce CAC or improve activation quickly.",
      score: "8.4 / 10"
    },
    {
      question: "Describe a time you challenged an attribution assumption.",
      answer:
        "At MetricsLoop, we found a large branded bias in last-click reporting, rebuilt our reporting model with weighted touchpoints, and reallocated budget toward high-intent non-brand and lifecycle nurture plays.",
      score: "8.7 / 10"
    },
    {
      question: "How do you partner with finance when growth targets tighten?",
      answer:
        "I align on efficiency guardrails first, then model scenarios around CAC payback and activation lift so tradeoffs are visible before channel budgets shift.",
      score: "7.8 / 10"
    },
    {
      question: "What is your approach to coaching a junior marketer through experimentation?",
      answer:
        "I use a shared hypothesis framework, make the success metric explicit, and review results together so the team learns why the outcome happened, not just whether the test won.",
      score: "8.1 / 10"
    }
  ],
  claimVerification:
    "Most claims are consistent across resume and LinkedIn. Revenue influence numbers should be validated with manager reference checks because attribution methodology is not fully specified.",
  suggestedQuestions: [
    "How do you decide when a CAC increase is acceptable for long-term expansion efficiency?",
    "What tradeoffs would you make between paid growth and lifecycle investment in the first quarter?",
    "Which team rituals have helped you scale experimentation quality across functions?"
  ],
  scoreEngine: {
    finalScore: "84 / 100",
    confidence: "82% (High confidence)",
    roleCapability: "86",
    thinkingBehavior: "82",
    impact: "80",
    transferability: "79",
    potential: "85",
    evidence: [
      "Reduced CAC by 28% through channel mix and lifecycle optimization.",
      "Interview answers showed structured experimentation and executive-friendly communication.",
      "Career progression indicates increasing ownership across growth and analytics."
    ]
  },
  scoreBreakdown: {
    communication: "84",
    knowledge: "86",
    confidence: "77",
    overall: "Strong proceed"
  },
  recommendation: {
    label: "Recommended",
    title: "Move forward to manager panel",
    summary:
      "AI signals indicate strong role alignment and credible operating depth. The next interview should validate forecasting maturity, referenceable business impact, and readiness for broader team leadership.",
    statusClass: "status-approved",
    highlights: [
      "High overlap with approved skill profile for performance, lifecycle, and analytics.",
      "Interview responses show clear experimentation thinking and executive-friendly communication.",
      "Best follow-up areas: planning cadence, forecasting discipline, and evidence behind reported revenue impact."
    ]
  }
};

export const recruiterCandidateListDemo: HrCandidateListItem[] = [
  {
    id: "demo-candidate-rahul-verma",
    name: "Rahul Verma",
    email: "rahul.verma.demo@gmail.com",
    currentCompany: "FitZone Wellness",
    latestJobTitle: "Associate Center Manager",
    latestApplicationStatus: "SHORTLISTED",
    resumeScore: 88,
    interviewScore: 84,
    candidateScore: 86,
    candidateScoreConfidenceLabel: "HIGH",
    appliedAt: "2026-04-09T07:45:00.000Z"
  },
  {
    id: "demo-candidate-priya-nair",
    name: "Priya Nair",
    email: "priya.nair.demo@gmail.com",
    currentCompany: "Pulse Active",
    latestJobTitle: "Center Operations Lead",
    latestApplicationStatus: "INTERVIEW_COMPLETED",
    resumeScore: 85,
    interviewScore: 81,
    candidateScore: 82,
    candidateScoreConfidenceLabel: "HIGH",
    appliedAt: "2026-04-08T11:20:00.000Z"
  },
  {
    id: "demo-candidate-manoj-shetty",
    name: "Manoj Shetty",
    email: "manoj.shetty.demo@gmail.com",
    currentCompany: "PowerFit Club",
    latestJobTitle: "Center Manager",
    latestApplicationStatus: "INTERVIEW_COMPLETED",
    resumeScore: 83,
    interviewScore: 79,
    candidateScore: 80,
    candidateScoreConfidenceLabel: "MEDIUM",
    appliedAt: "2026-04-08T09:10:00.000Z"
  },
  {
    id: "demo-candidate-neha-arora",
    name: "Neha Arora",
    email: "neha.arora.demo@gmail.com",
    currentCompany: "Urban Fitness Studio",
    latestJobTitle: "Member Experience Manager",
    latestApplicationStatus: "SHORTLISTED",
    resumeScore: 90,
    interviewScore: 86,
    candidateScore: 88,
    candidateScoreConfidenceLabel: "HIGH",
    appliedAt: "2026-04-07T14:30:00.000Z"
  },
  {
    id: "demo-candidate-vivek-rao",
    name: "Vivek Rao",
    email: "vivek.rao.demo@gmail.com",
    currentCompany: "Cult Fit",
    latestJobTitle: "Assistant Center Manager",
    latestApplicationStatus: "INTERVIEW_PENDING",
    resumeScore: 78,
    interviewScore: null,
    candidateScore: 74,
    candidateScoreConfidenceLabel: "MEDIUM",
    appliedAt: "2026-04-07T08:15:00.000Z"
  },
  {
    id: "demo-candidate-sneha-kulkarni",
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni.demo@gmail.com",
    currentCompany: "Anytime Fitness",
    latestJobTitle: "Front Desk Supervisor",
    latestApplicationStatus: "SCREENING",
    resumeScore: 76,
    interviewScore: null,
    candidateScore: 71,
    candidateScoreConfidenceLabel: "MEDIUM",
    appliedAt: "2026-04-06T16:50:00.000Z"
  },
  {
    id: "demo-candidate-farah-khan",
    name: "Farah Khan",
    email: "farah.khan.demo@gmail.com",
    currentCompany: "Fit Republic",
    latestJobTitle: "Operations Coordinator",
    latestApplicationStatus: "APPLIED",
    resumeScore: 73,
    interviewScore: null,
    candidateScore: null,
    candidateScoreConfidenceLabel: null,
    appliedAt: "2026-04-06T09:40:00.000Z"
  },
  {
    id: "demo-candidate-aditi-sen",
    name: "Aditi Sen",
    email: "aditi.sen.demo@gmail.com",
    currentCompany: "MoveWell Clubs",
    latestJobTitle: "Member Success Lead",
    latestApplicationStatus: "REJECTED",
    resumeScore: 69,
    interviewScore: 64,
    candidateScore: 63,
    candidateScoreConfidenceLabel: "MEDIUM",
    appliedAt: "2026-04-05T12:05:00.000Z"
  },
  {
    id: "demo-candidate-karthik-iyer",
    name: "Karthik Iyer",
    email: "karthik.iyer.demo@gmail.com",
    currentCompany: "CloudNova Technologies",
    latestJobTitle: "Senior Frontend Engineer",
    latestApplicationStatus: "SCREENING_FAILED",
    resumeScore: 42,
    interviewScore: null,
    candidateScore: null,
    candidateScoreConfidenceLabel: null,
    appliedAt: "2026-04-05T08:45:00.000Z"
  },
  {
    id: "demo-candidate-deepak-joshi",
    name: "Deepak Joshi",
    email: "deepak.joshi.demo@gmail.com",
    currentCompany: "FitBay",
    latestJobTitle: "Operations Executive",
    latestApplicationStatus: "APPLIED",
    resumeScore: 67,
    interviewScore: null,
    candidateScore: null,
    candidateScoreConfidenceLabel: null,
    appliedAt: "2026-04-04T17:25:00.000Z"
  }
];

function buildDemoCandidateProfile(
  candidate: HrCandidateListItem,
  overrides: Partial<CandidateProfileData> = {}
): CandidateProfileData {
  const appliedDate = candidate.appliedAt
    ? new Date(candidate.appliedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Apr 09, 2026";
  const resumeScore = candidate.resumeScore ?? 0;
  const interviewScore = candidate.interviewScore ?? 0;
  const finalScore = candidate.candidateScore ?? Math.round((resumeScore + interviewScore) / 2);
  const recommendationLabel =
    candidate.latestApplicationStatus === "SHORTLISTED"
      ? "Recommended"
      : candidate.latestApplicationStatus === "REJECTED" ||
          candidate.latestApplicationStatus === "SCREENING_FAILED"
        ? "Application received"
        : "In review";

  return {
    ...candidateProfile,
    id: candidate.id,
    name: candidate.name,
    currentRole: candidate.latestJobTitle ?? candidate.currentCompany ?? "Candidate profile",
    location: "Bengaluru, India",
    overview: `${candidate.name} is currently in ${candidate.latestApplicationStatus?.toLowerCase().replace(/_/g, " ") ?? "pipeline review"} for the Associate Center Manager demo role.`,
    resumeScore: candidate.resumeScore != null ? `${candidate.resumeScore} / 100` : "Pending",
    resumeSynopsis:
      candidate.resumeScore != null
        ? `Resume fit indicates ${candidate.resumeScore >= 80 ? "strong" : candidate.resumeScore >= 70 ? "workable" : "weak"} alignment with center operations, member experience, and people coordination.`
        : "Resume screening is still pending.",
    interviewScore: candidate.interviewScore != null ? `${candidate.interviewScore} / 100` : "Pending",
    interviewSummary:
      candidate.interviewScore != null
        ? "Interview evidence is available with role, action, and outcome coverage."
        : "AI interview has not been completed yet.",
    applicationHistory: [
      {
        jobTitle: "Associate Center Manager",
        date: appliedDate,
        status: candidate.latestApplicationStatus ?? "APPLIED",
        statusClass:
          candidate.latestApplicationStatus === "SHORTLISTED"
            ? "status-shortlisted"
            : candidate.latestApplicationStatus === "REJECTED" ||
                candidate.latestApplicationStatus === "SCREENING_FAILED"
              ? "status-review"
              : "status-progress",
        notes:
          candidate.candidateScore != null
            ? `Resume ${candidate.resumeScore ?? "NA"}, final AI score ${candidate.candidateScore}.`
            : "Candidate is still moving through the pipeline."
      }
    ],
    resumeInsights:
      candidate.latestApplicationStatus === "SCREENING_FAILED"
        ? "Resume shows low domain fit for center operations and on-ground member handling."
        : "Resume shows relevant evidence around center operations, staffing rhythm, service quality, and member issue handling.",
    linkedInInsights: `LinkedIn profile on file for ${candidate.name}.`,
    interviewTranscript:
      candidate.interviewScore != null
        ? [
            {
              question: "Tell me about a time you handled a center issue during a busy operating window.",
              answer:
                "I reset floor ownership, took the member escalation directly, and restored service flow before the next peak block.",
              score: `${Math.max(7.2, interviewScore / 10).toFixed(1)} / 10`
            },
            {
              question: "How do you track retention and member satisfaction week to week?",
              answer:
                "I review renewal risk, complaint patterns, trainer feedback, and unresolved service tickets together, then coach the front desk on the top friction points.",
              score: `${Math.max(7.0, interviewScore / 10 - 0.2).toFixed(1)} / 10`
            }
          ]
        : [],
    claimVerification:
      candidate.latestApplicationStatus === "SCREENING_FAILED"
        ? "No further claim verification needed because the application did not progress."
        : "Core claims are directionally consistent across resume and interview responses.",
    suggestedQuestions:
      candidate.interviewScore != null
        ? [
            "What exact metric did the candidate use to measure member satisfaction improvement?",
            "How does the candidate prioritize retention versus issue resolution on peak days?",
            "What proof can they share for operating discipline across trainers and front desk?"
          ]
        : [
            "Probe for ownership of floor operations and service recovery.",
            "Validate handling of renewals, complaints, and staff coordination.",
            "Check readiness for Whitefield center operating tempo."
          ],
    scoreEngine: {
      finalScore: candidate.candidateScore != null ? `${candidate.candidateScore} / 100` : "Pending",
      confidence:
        candidate.candidateScoreConfidenceLabel != null
          ? `${candidate.candidateScoreConfidenceLabel === "HIGH" ? "84" : "71"}% (${candidate.candidateScoreConfidenceLabel})`
          : "Pending",
      roleCapability: candidate.resumeScore != null ? String(candidate.resumeScore) : "Pending",
      thinkingBehavior: candidate.interviewScore != null ? String(candidate.interviewScore) : "Pending",
      impact: candidate.candidateScore != null ? String(Math.max(58, candidate.candidateScore - 4)) : "Pending",
      transferability: candidate.candidateScore != null ? String(Math.max(55, candidate.candidateScore - 6)) : "Pending",
      potential: candidate.candidateScore != null ? String(Math.max(57, candidate.candidateScore - 2)) : "Pending",
      evidence:
        candidate.latestApplicationStatus === "SCREENING_FAILED"
          ? ["Domain mismatch against fitness center operations.", "Resume did not show member-handling or floor ownership signals."]
          : [
              "Resume includes center operations or member-experience ownership.",
              "Pipeline status reflects meaningful progression through screening and interview stages.",
              candidate.interviewScore != null
                ? "Interview transcript shows structured answers around service quality and issue handling."
                : "Awaiting interview evidence for deeper decision support."
            ]
    },
    scoreBreakdown: {
      communication: candidate.interviewScore != null ? String(candidate.interviewScore) : "Pending",
      knowledge: candidate.resumeScore != null ? String(candidate.resumeScore) : "Pending",
      confidence: candidate.candidateScoreConfidenceLabel ?? "Pending",
      overall: candidate.candidateScore != null ? String(finalScore) : "Pending"
    },
    recommendation: {
      label: recommendationLabel,
      title:
        candidate.latestApplicationStatus === "SHORTLISTED"
          ? "Move to recruiter close round"
          : candidate.latestApplicationStatus === "SCREENING_FAILED" ||
              candidate.latestApplicationStatus === "REJECTED"
            ? "Do not advance"
            : "Continue assessment",
      summary:
        candidate.latestApplicationStatus === "SHORTLISTED"
          ? `${candidate.name} is one of the stronger demo profiles with enough evidence to explain resume fit, interview quality, and shortlist rationale.`
          : candidate.latestApplicationStatus === "SCREENING_FAILED" ||
              candidate.latestApplicationStatus === "REJECTED"
            ? `${candidate.name} is useful in the demo as a contrast case showing why lower-fit applicants do not move forward.`
            : `${candidate.name} helps explain the mid-pipeline state between application, screening, interview, and shortlist.`,
      statusClass:
        candidate.latestApplicationStatus === "SHORTLISTED"
          ? "status-approved"
          : candidate.latestApplicationStatus === "SCREENING_FAILED" ||
              candidate.latestApplicationStatus === "REJECTED"
            ? "status-review"
            : "status-progress",
      highlights: [
        `Current stage: ${candidate.latestApplicationStatus?.replace(/_/g, " ") ?? "APPLIED"}.`,
        `Current company: ${candidate.currentCompany ?? "Not captured"}.`,
        candidate.candidateScore != null
          ? `Final AI score available: ${candidate.candidateScore}.`
          : "Final AI score not yet available."
      ]
    },
    ...overrides
  };
}

export const recruiterCandidateProfileDemo: Record<string, CandidateProfileData> = {
  "demo-candidate-rahul-verma": buildDemoCandidateProfile(recruiterCandidateListDemo[0], {
    overview:
      "Strong operations profile with direct center-management evidence, solid interview completion, and a shortlist-ready decision trail.",
    location: "Whitefield, Bengaluru"
  }),
  "demo-candidate-priya-nair": buildDemoCandidateProfile(recruiterCandidateListDemo[1], {
    overview:
      "Balanced operations candidate with member-experience depth and clean interview evidence that makes her easy to explain in the demo."
  }),
  "demo-candidate-manoj-shetty": buildDemoCandidateProfile(recruiterCandidateListDemo[2], {
    overview:
      "Experienced center operator who completed the AI interview and is waiting on final recruiter alignment."
  }),
  "demo-candidate-neha-arora": buildDemoCandidateProfile(recruiterCandidateListDemo[3], {
    overview:
      "High-signal candidate with strong shortlist status, strong fit on service recovery, and credible team-coordination evidence."
  }),
  "demo-candidate-vivek-rao": buildDemoCandidateProfile(recruiterCandidateListDemo[4]),
  "demo-candidate-sneha-kulkarni": buildDemoCandidateProfile(recruiterCandidateListDemo[5]),
  "demo-candidate-farah-khan": buildDemoCandidateProfile(recruiterCandidateListDemo[6]),
  "demo-candidate-aditi-sen": buildDemoCandidateProfile(recruiterCandidateListDemo[7]),
  "demo-candidate-karthik-iyer": buildDemoCandidateProfile(recruiterCandidateListDemo[8], {
    location: "Chennai, India"
  }),
  "demo-candidate-deepak-joshi": buildDemoCandidateProfile(recruiterCandidateListDemo[9])
};

export const defaultGeneratedJobDescription: GeneratedJobDescription = {
  title: "Growth Marketing Manager",
  team: "Growth and Revenue",
  mission:
    "Build a more efficient and predictable growth engine by improving paid acquisition performance, lifecycle automation, and funnel visibility.",
  responsibilities: [
    "Own cross-channel growth strategy across paid, lifecycle, and web conversion initiatives",
    "Design and analyze experiments that improve CAC efficiency and qualified pipeline generation",
    "Partner with product, sales, and analytics on attribution, reporting, and funnel optimization"
  ],
  mustHaveSkills: [
    "Performance marketing",
    "Lifecycle automation",
    "Attribution and experimentation",
    "SQL or analytics fluency",
    "Stakeholder communication"
  ],
  experienceLevel: "6-8 years",
  salaryRange: "₹26L - ₹34L fixed",
  joiningTimeline: "Join within 45 days",
  relocation: "Preferred for Bengaluru hybrid",
  locationMode: "Hybrid",
  hiringPriority: "High priority for upcoming quarter",
  managerInterviewPrompts: [
    "Probe how they balance efficient growth with volume targets",
    "Ask for a detailed experiment that changed CAC or activation rate",
    "Validate attribution rigor and cross-functional influence"
  ],
  hrSummary:
    "AI intake captured business impact, required skills, approved range, and timeline. Role is ready for HR review and channel distribution."
};
