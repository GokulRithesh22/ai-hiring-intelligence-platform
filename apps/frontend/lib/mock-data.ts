import type {
  ApplicationPortalData,
  ApplicationSubmissionResult,
  CandidateProfileData,
  DashboardCandidate,
  GeneratedJobDescription,
  HrDashboardData,
  JobIntakeQuestion,
  LandingContent,
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
  pipeline: [
    {
      title: "Resume matching",
      description:
        "AI compares the uploaded resume against the generated job description and scores skill, trajectory, and scope fit.",
      status: "Required",
      statusClass: "status-active"
    },
    {
      title: "Qualification questions",
      description:
        "Joining timeline, salary expectation, and relocation answers are checked against approved constraints before advancing.",
      status: "Required",
      statusClass: "status-active"
    },
    {
      title: "AI interview",
      description:
        "Qualified applicants receive 4-6 tailored AI interview questions derived from the resume and role requirements.",
      status: "Unlocked after screening",
      statusClass: "status-pending"
    }
  ]
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
