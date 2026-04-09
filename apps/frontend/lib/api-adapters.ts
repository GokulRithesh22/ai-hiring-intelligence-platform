import {
  applicationPortalData,
  candidateProfile,
  dashboardCandidates,
  defaultGeneratedJobDescription,
  hrDashboardData,
  jobIntakeQuestions,
  landingContent
} from "@/lib/mock-data";
import type {
  ApplicationSubmissionResult,
  ApplicationPortalData,
  CandidateApplicationPayload,
  CandidateProfileData,
  DashboardCandidate,
  DashboardFilters,
  GeneratedJobDescription,
  HrCandidateDetail,
  HrDashboardData,
  JobIntakePayload,
  JobIntakeQuestion,
  LandingContent,
  ManagerCandidateIntelligenceEntry,
  ManagerDashboardData,
  ManagerJdFeedbackAction,
  ManagerJobDescriptionVariant,
  ManagerJobDraftPayload,
  ManagerJobDraftResult,
  ManagerJobIntelligenceDetail,
  StartVoiceInterviewConversationInput,
  SubmitVoiceInterviewTurnInput,
  VoiceInterviewCategory,
  VoiceInterviewConfig,
  VoiceInterviewConversationState,
  VoiceInterviewEvaluation,
  VoiceInterviewTurn,
  VoiceResponseScoreBreakdown,
  VoiceTranscriptionResult
} from "@/lib/types";

const apiMode = process.env.NEXT_PUBLIC_API_MODE ?? "mock";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const fallbackApplicationSubmissionResult: ApplicationSubmissionResult = {
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
const mockVoiceConversations = new Map<
  string,
  {
    conversationId: string;
    interviewSessionId: string | null;
    questions: Array<{
      id: string;
      text: string;
      category: VoiceInterviewCategory;
      isFollowUp: boolean;
      linkedQuestionId?: string | null;
    }>;
    askedQuestionIds: string[];
    pendingQuestionId: string | null;
    turns: VoiceInterviewTurn[];
    answers: VoiceInterviewEvaluation["responseEvaluations"];
    completed: boolean;
  }
>();

const mockVoiceCategories: VoiceInterviewCategory[] = [
  "experience_validation",
  "skill_depth_validation",
  "problem_solving_scenario",
  "role_simulation",
  "behavioral_question"
];

const mockVoiceDefaultQuestions: Record<VoiceInterviewCategory, string> = {
  experience_validation:
    "Tell me about the experience that most prepared you for this role and the impact you created.",
  skill_depth_validation:
    "Which skill do you rely on most in this domain, and how do you apply it in practice?",
  problem_solving_scenario:
    "Describe a complex problem you solved and how you structured the path to a solution.",
  role_simulation:
    "If you joined next week, what would your first 30 days look like?",
  behavioral_question:
    "Tell me about a time you aligned people with competing priorities."
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `voice-${Math.random().toString(36).slice(2, 12)}`;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function buildMockVoiceQuestions(seedQuestions: string[]) {
  const questions = seedQuestions
    .filter((question) => question.trim().length > 0)
    .slice(0, 6)
    .map((question, index) => ({
      id: createClientId(),
      text: question.trim(),
      category: mockVoiceCategories[Math.min(index, mockVoiceCategories.length - 1)],
      isFollowUp: false
    }));

  for (const category of mockVoiceCategories) {
    if (questions.length >= 5) {
      break;
    }

    if (!questions.some((question) => question.category === category)) {
      questions.push({
        id: createClientId(),
        text: mockVoiceDefaultQuestions[category],
        category,
        isFollowUp: false
      });
    }
  }

  return questions;
}

function createVoiceTurn(
  role: VoiceInterviewTurn["role"],
  kind: VoiceInterviewTurn["kind"],
  text: string,
  category?: VoiceInterviewCategory | null,
  linkedQuestionId?: string | null,
  scores?: VoiceResponseScoreBreakdown | null
): VoiceInterviewTurn {
  return {
    id: createClientId(),
    role,
    kind,
    text,
    category: category ?? null,
    linkedQuestionId: linkedQuestionId ?? null,
    scores: scores ?? null,
    createdAt: new Date().toISOString()
  };
}

function scoreMockAnswer(question: string, answer: string): VoiceResponseScoreBreakdown {
  const lower = answer.toLowerCase();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const structureHits = ["first", "then", "because", "result", "outcome"].filter((token) =>
    lower.includes(token)
  ).length;
  const businessHits = ["revenue", "customer", "growth", "metric", "cost", "retention"].filter(
    (token) => lower.includes(token)
  ).length;
  const technicalHits = ["experiment", "analysis", "system", "process", "data", "automation"].filter(
    (token) => lower.includes(token)
  ).length;
  const overlap = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3 && lower.includes(token)).length;

  return {
    communicationClarity: Math.max(40, Math.min(100, Math.round(48 + wordCount / 3 + overlap * 2))),
    technicalDepth: Math.max(35, Math.min(100, Math.round(44 + technicalHits * 8 + overlap * 3))),
    problemSolvingStructure: Math.max(
      35,
      Math.min(100, Math.round(42 + structureHits * 11 + wordCount / 6))
    ),
    businessUnderstanding: Math.max(
      35,
      Math.min(100, Math.round(43 + businessHits * 10 + overlap * 2))
    )
  };
}

function buildMockVoiceEvaluation(
  answers: VoiceInterviewEvaluation["responseEvaluations"]
): VoiceInterviewEvaluation {
  const communicationClarity = average(
    answers.map((answer) => answer.scoreBreakdown.communicationClarity)
  );
  const technicalDepth = average(answers.map((answer) => answer.scoreBreakdown.technicalDepth));
  const problemSolvingStructure = average(
    answers.map((answer) => answer.scoreBreakdown.problemSolvingStructure)
  );
  const businessUnderstanding = average(
    answers.map((answer) => answer.scoreBreakdown.businessUnderstanding)
  );

  return {
    communicationClarity,
    technicalDepth,
    problemSolvingStructure,
    businessUnderstanding,
    communicationScore: communicationClarity,
    knowledgeScore: average([technicalDepth, businessUnderstanding]),
    confidenceScore: average([problemSolvingStructure, communicationClarity]),
    overallScore: average([
      communicationClarity,
      technicalDepth,
      problemSolvingStructure,
      businessUnderstanding
    ]),
    summary:
      "Mock conversational interview completed with a balanced view of clarity, depth, structure, and business understanding.",
    responseEvaluations: answers,
    claimVerificationFlags: [
      { claim: "Candidate referenced measurable impact", status: "VERIFY_REFERENCE" }
    ],
    suggestedManagerQuestions: [
      "Which part of this answer would you want the candidate to quantify more clearly?",
      "How would you validate the business impact they described?"
    ]
  };
}

function normalizeVoiceInterviewEvaluation(
  payload: {
    answers: Array<{ question: string; answer: string }>;
  },
  response: Partial<VoiceInterviewEvaluation>
): VoiceInterviewEvaluation {
  if (
    typeof response.communicationClarity === "number" &&
    typeof response.technicalDepth === "number" &&
    typeof response.problemSolvingStructure === "number" &&
    typeof response.businessUnderstanding === "number" &&
    Array.isArray(response.responseEvaluations)
  ) {
    return response as VoiceInterviewEvaluation;
  }

  const fallbackScoreBreakdown: VoiceResponseScoreBreakdown = {
    communicationClarity:
      typeof response.communicationScore === "number" ? response.communicationScore : 80,
    technicalDepth:
      typeof response.knowledgeScore === "number" ? response.knowledgeScore : 78,
    problemSolvingStructure:
      typeof response.confidenceScore === "number" ? response.confidenceScore : 76,
    businessUnderstanding:
      typeof response.knowledgeScore === "number" ? response.knowledgeScore : 78
  };

  return {
    communicationClarity: fallbackScoreBreakdown.communicationClarity,
    technicalDepth: fallbackScoreBreakdown.technicalDepth,
    problemSolvingStructure: fallbackScoreBreakdown.problemSolvingStructure,
    businessUnderstanding: fallbackScoreBreakdown.businessUnderstanding,
    communicationScore:
      typeof response.communicationScore === "number"
        ? response.communicationScore
        : fallbackScoreBreakdown.communicationClarity,
    knowledgeScore:
      typeof response.knowledgeScore === "number"
        ? response.knowledgeScore
        : average([
            fallbackScoreBreakdown.technicalDepth,
            fallbackScoreBreakdown.businessUnderstanding
          ]),
    confidenceScore:
      typeof response.confidenceScore === "number"
        ? response.confidenceScore
        : average([
            fallbackScoreBreakdown.problemSolvingStructure,
            fallbackScoreBreakdown.communicationClarity
          ]),
    overallScore:
      typeof response.overallScore === "number"
        ? response.overallScore
        : average(Object.values(fallbackScoreBreakdown)),
    summary:
      response.summary ??
      "Voice interview evaluation completed using legacy scoring and normalized into the conversational scorecard.",
    responseEvaluations: payload.answers.map((answer, index) => ({
      questionId: `normalized-${index + 1}`,
      question: answer.question,
      answer: answer.answer,
      category: mockVoiceCategories[Math.min(index, mockVoiceCategories.length - 1)],
      askedAsFollowUp: false,
      evaluationScore:
        typeof response.overallScore === "number"
          ? response.overallScore
          : average(Object.values(fallbackScoreBreakdown)),
      rationale: "Normalized from the legacy voice interview evaluation response.",
      scoreBreakdown: fallbackScoreBreakdown
    })),
    claimVerificationFlags: response.claimVerificationFlags ?? [],
    suggestedManagerQuestions: response.suggestedManagerQuestions ?? []
  };
}

async function startMockVoiceConversation(
  input: StartVoiceInterviewConversationInput
): Promise<VoiceInterviewConversationState> {
  const questions = buildMockVoiceQuestions(input.questions ?? []);
  const greeting =
    "Hi, thanks for joining. I'll guide you through a short conversational interview and ask follow-up questions when useful.";
  const firstQuestion = questions[0] ?? null;
  const conversationId = createClientId();
  const turns = [
    createVoiceTurn("assistant", "greeting", greeting),
    ...(firstQuestion
      ? [
          createVoiceTurn(
            "assistant",
            "question",
            firstQuestion.text,
            firstQuestion.category,
            firstQuestion.id
          )
        ]
      : [])
  ];

  mockVoiceConversations.set(conversationId, {
    conversationId,
    interviewSessionId: input.interviewSessionId ?? null,
    questions,
    askedQuestionIds: firstQuestion ? [firstQuestion.id] : [],
    pendingQuestionId: firstQuestion?.id ?? null,
    turns,
    answers: [],
    completed: false
  });

  return {
    conversationId,
    interviewSessionId: input.interviewSessionId ?? null,
    completed: false,
    status: "Prompt ready",
    currentPrompt: firstQuestion?.text ?? null,
    turns,
    latestTranscript: null,
    evaluation: null
  };
}

async function respondMockVoiceConversation(
  input: SubmitVoiceInterviewTurnInput
): Promise<VoiceInterviewConversationState> {
  const conversation = mockVoiceConversations.get(input.conversationId);
  if (!conversation) {
    throw new Error("Mock voice conversation not found");
  }

  const activeQuestion = conversation.questions.find(
    (question) => question.id === conversation.pendingQuestionId
  );
  if (!activeQuestion) {
    throw new Error("Mock voice conversation has no pending question");
  }

  const transcript =
    input.transcript?.trim() || "Mock transcript captured from candidate speech.";
  const scoreBreakdown = scoreMockAnswer(activeQuestion.text, transcript);
  const answerEvaluation: VoiceInterviewEvaluation["responseEvaluations"][number] = {
    questionId: activeQuestion.id,
    question: activeQuestion.text,
    answer: transcript,
    category: activeQuestion.category,
    askedAsFollowUp: activeQuestion.isFollowUp,
    evaluationScore: average([
      scoreBreakdown.communicationClarity,
      scoreBreakdown.technicalDepth,
      scoreBreakdown.problemSolvingStructure,
      scoreBreakdown.businessUnderstanding
    ]),
    rationale:
      "Mock scoring is based on answer specificity, structure markers, and business language.",
    scoreBreakdown
  };

  conversation.answers.push(answerEvaluation);
  conversation.turns.push(
    createVoiceTurn(
      "candidate",
      "response",
      transcript,
      activeQuestion.category,
      activeQuestion.id,
      scoreBreakdown
    )
  );

  let nextQuestion =
    conversation.questions.find(
      (question) => !conversation.askedQuestionIds.includes(question.id)
    ) ?? null;

  if (
    !activeQuestion.isFollowUp &&
    conversation.questions.length < 6 &&
    !conversation.questions.some((question) => question.linkedQuestionId === activeQuestion.id) &&
    (scoreBreakdown.technicalDepth < 58 ||
      scoreBreakdown.problemSolvingStructure < 58 ||
      scoreBreakdown.businessUnderstanding < 58)
  ) {
    nextQuestion = {
      id: createClientId(),
      text:
        "Can you make that more concrete by walking through your specific actions, decision points, and measurable outcome?",
      category: activeQuestion.category,
      isFollowUp: true,
      linkedQuestionId: activeQuestion.id
    };
    conversation.questions.push(nextQuestion);
  }

  if (!nextQuestion) {
    conversation.completed = true;
    conversation.pendingQuestionId = null;
    conversation.turns.push(
      createVoiceTurn(
        "assistant",
        "closing",
        "Thanks, that completes the interview. We'll summarize your responses for the hiring team."
      )
    );

    return {
      conversationId: conversation.conversationId,
      interviewSessionId: conversation.interviewSessionId,
      completed: true,
      status: "Interview completed",
      currentPrompt: null,
      turns: conversation.turns,
      latestTranscript: transcript,
      evaluation: buildMockVoiceEvaluation(conversation.answers)
    };
  }

  conversation.pendingQuestionId = nextQuestion.id;
  conversation.askedQuestionIds.push(nextQuestion.id);
  conversation.turns.push(
    createVoiceTurn(
      "assistant",
      nextQuestion.isFollowUp ? "follow_up" : "question",
      nextQuestion.text,
      nextQuestion.category,
      nextQuestion.id
    )
  );

  return {
    conversationId: conversation.conversationId,
    interviewSessionId: conversation.interviewSessionId,
    completed: false,
    status: nextQuestion.isFollowUp ? "Follow-up question ready" : "Next question ready",
    currentPrompt: nextQuestion.text,
    turns: conversation.turns,
    latestTranscript: transcript,
    evaluation: null
  };
}

const managerDashboardFallback: ManagerDashboardData = {
  metrics: [
    {
      label: "Active job descriptions",
      value: "3",
      context: "2 live pipelines and 1 draft ready for HR review"
    },
    {
      label: "Applicants in manager view",
      value: "54",
      context: "Across the current role portfolio"
    },
    {
      label: "Shortlisted candidates",
      value: "11",
      context: "Highest-signal profiles ready for deeper review"
    },
    {
      label: "Pending HR approval",
      value: "1",
      context: "Drafts waiting on final approval and posting"
    }
  ],
  jobs: [
    {
      id: "job-growth-marketing-manager",
      title: "Growth Marketing Manager",
      status: "PENDING_HR_APPROVAL",
      location: "Bengaluru hybrid",
      createdAt: "2026-04-08T09:00:00.000Z",
      updatedAt: "2026-04-09T08:30:00.000Z",
      descriptionPreview:
        "Own acquisition efficiency, lifecycle acceleration, and funnel visibility for the next stage of SaaS growth.",
      applicantsCount: 21,
      shortlistedCount: 4,
      pipelineDistribution: [
        { label: "Applied", count: 7, status: "APPLIED" },
        { label: "Screened out", count: 5, status: "SCREENING_FAILED" },
        { label: "Interview queued", count: 3, status: "INTERVIEW_PENDING" },
        { label: "Interview complete", count: 2, status: "INTERVIEW_COMPLETED" },
        { label: "Shortlisted", count: 4, status: "SHORTLISTED" }
      ]
    },
    {
      id: "job-lifecycle-marketing-lead",
      title: "Lifecycle Marketing Lead",
      status: "APPROVED",
      location: "Remote India",
      createdAt: "2026-04-05T10:15:00.000Z",
      updatedAt: "2026-04-09T07:10:00.000Z",
      descriptionPreview:
        "Build retention loops, lifecycle programs, and revenue-qualified nurture sequences tied to activation and expansion.",
      applicantsCount: 17,
      shortlistedCount: 3,
      pipelineDistribution: [
        { label: "Applied", count: 6, status: "APPLIED" },
        { label: "Qualification blocked", count: 4, status: "QUALIFICATION_FAILED" },
        { label: "Interview queued", count: 2, status: "INTERVIEW_PENDING" },
        { label: "Interview complete", count: 2, status: "INTERVIEW_COMPLETED" },
        { label: "Shortlisted", count: 3, status: "SHORTLISTED" }
      ]
    },
    {
      id: "job-demand-generation-director",
      title: "Demand Generation Director",
      status: "PUBLISHED",
      location: "Singapore or Bengaluru",
      createdAt: "2026-04-01T08:10:00.000Z",
      updatedAt: "2026-04-09T06:20:00.000Z",
      descriptionPreview:
        "Lead outcome-driven pipeline generation, planning, and cross-functional campaign orchestration for a regional GTM team.",
      applicantsCount: 16,
      shortlistedCount: 4,
      pipelineDistribution: [
        { label: "Applied", count: 4, status: "APPLIED" },
        { label: "Screened out", count: 3, status: "SCREENING_FAILED" },
        { label: "Interview queued", count: 2, status: "INTERVIEW_PENDING" },
        { label: "Interview complete", count: 3, status: "INTERVIEW_COMPLETED" },
        { label: "Shortlisted", count: 4, status: "SHORTLISTED" }
      ]
    }
  ]
};

const managerJobCandidatesFallback: Record<string, ManagerCandidateIntelligenceEntry[]> = {
  "job-growth-marketing-manager": [
    {
      applicationId: "app-001",
      candidateId: "cand-001",
      candidateName: "Aarav Mehta",
      currentCompany: "MetricsLoop",
      currentTitle: "Senior Growth Lead",
      status: "SHORTLISTED",
      resumeScore: 86,
      interviewScore: 82,
      insightSummary:
        "Strong experimentation depth, credible attribution thinking, and polished communication for stakeholder-facing growth leadership."
    },
    {
      applicationId: "app-002",
      candidateId: "cand-002",
      candidateName: "Naina Kapoor",
      currentCompany: "RevOps Cloud",
      currentTitle: "Growth Programs Manager",
      status: "INTERVIEW_COMPLETED",
      resumeScore: 91,
      interviewScore: 88,
      insightSummary:
        "High-signal operator with strong lifecycle and pipeline systems experience; next check should probe team-scaling range."
    },
    {
      applicationId: "app-003",
      candidateId: "cand-004",
      candidateName: "Mira Shah",
      currentCompany: "FirstOrbit",
      currentTitle: "Performance Marketing Manager",
      status: "INTERVIEW_PENDING",
      resumeScore: 79,
      interviewScore: null,
      insightSummary:
        "Resume alignment is solid and the profile fits the role thesis; AI interview will determine strategic depth and communication quality."
    }
  ],
  "job-lifecycle-marketing-lead": [
    {
      applicationId: "app-101",
      candidateId: "cand-005",
      candidateName: "Rhea Banerjee",
      currentCompany: "InboxGrid",
      currentTitle: "Lifecycle Lead",
      status: "SHORTLISTED",
      resumeScore: 89,
      interviewScore: 85,
      insightSummary:
        "Strong retention systems background with a clear view of activation, onboarding, and nurture program performance."
    }
  ],
  "job-demand-generation-director": [
    {
      applicationId: "app-201",
      candidateId: "cand-006",
      candidateName: "Karan Bhat",
      currentCompany: "Northstar SaaS",
      currentTitle: "Regional Demand Gen Head",
      status: "SHORTLISTED",
      resumeScore: 92,
      interviewScore: 84,
      insightSummary:
        "Experienced cross-functional GTM leader with evidence of regional pipeline ownership and disciplined planning rituals."
    }
  ]
};

async function requestOrFallback<T>(
  path: string,
  options: RequestInit | undefined,
  fallback: () => Promise<T>
) {
  if (apiMode !== "live" || !apiBaseUrl) {
    return fallback();
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch {
    return fallback();
  }
}

export async function getLandingContent(): Promise<LandingContent> {
  return requestOrFallback("/landing", undefined, async () => {
    await sleep(120);
    return landingContent;
  });
}

export async function getJobIntakeQuestions(): Promise<JobIntakeQuestion[]> {
  return requestOrFallback("/jobs/intake/questions", undefined, async () => {
    await sleep(120);
    return jobIntakeQuestions;
  });
}

function managerAnswerValue(
  answers: Record<string, string>,
  keys: string[],
  fallback: string
) {
  const entry = keys.find((key) => answers[key]?.trim());
  return entry ? answers[entry].trim() : fallback;
}

function toAnswerList(input: string, fallback: string[]) {
  const values = input
    .split(/\n|,|;|\|/g)
    .map((value) => value.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);

  return values.length ? values.slice(0, 6) : fallback;
}

function feedbackNarrative(feedback?: ManagerJdFeedbackAction) {
  switch (feedback) {
    case "TOO_GENERIC":
      return "Refined to add sharper scope, ownership, and more screenable specifics.";
    case "TOO_COMPLEX":
      return "Refined to simplify language and make the role easier for candidates to parse.";
    case "IMPROVE_RESPONSIBILITIES":
      return "Refined to clarify the day-to-day responsibilities and cross-functional ownership.";
    case "MAKE_MORE_OUTCOME_FOCUSED":
      return "Refined to emphasize measurable outcomes and business impact.";
    default:
      return "Draft generated from manager intake and ready for targeted feedback.";
  }
}

function applyFeedbackToResponsibilities(
  responsibilities: string[],
  feedback?: ManagerJdFeedbackAction
) {
  switch (feedback) {
    case "TOO_GENERIC":
      return responsibilities.map((item) => `${item} with explicit ownership and measurable expectations`);
    case "TOO_COMPLEX":
      return responsibilities.map((item) => item.replace(/^Translate /, "Lead "));
    case "IMPROVE_RESPONSIBILITIES":
      return responsibilities.map((item) => `${item} across planning, execution, and review cycles`);
    case "MAKE_MORE_OUTCOME_FOCUSED":
      return responsibilities.map((item) => `${item} tied to hiring outcomes, pipeline, or team goals`);
    default:
      return responsibilities;
  }
}

function buildManagerVariants(
  payload: ManagerJobDraftPayload,
  feedback?: ManagerJdFeedbackAction
): ManagerJobDescriptionVariant[] {
  const problem = managerAnswerValue(
    payload.answers,
    ["problem"],
    "Solve a high-priority business problem with clear ownership and measurable delivery."
  );
  const skills = toAnswerList(
    managerAnswerValue(
      payload.answers,
      ["skills"],
      "Analytical rigor, stakeholder communication, program ownership"
    ),
    ["Analytical rigor", "Stakeholder communication", "Program ownership"]
  );
  const responsibilitySeed = toAnswerList(
    managerAnswerValue(
      payload.answers,
      ["responsibilities", "problem"],
      "Define role priorities, drive execution, and align stakeholders"
    ),
    ["Define role priorities", "Drive execution", "Align stakeholders"]
  );
  const focusAreas = [
    "Business impact",
    "Execution depth",
    payload.mode === "structured" ? "Role clarity" : "Cross-functional alignment"
  ];
  const contextBits = [
    payload.experienceLevel ? `Experience: ${payload.experienceLevel}` : null,
    payload.salaryRange ? `Compensation: ${payload.salaryRange}` : null,
    payload.joiningTimeline ? `Join by: ${payload.joiningTimeline}` : null,
    payload.location ? `Location: ${payload.location}` : null,
    payload.relocation ? `Relocation: ${payload.relocation}` : null
  ]
    .filter(Boolean)
    .join(" | ");

  const variants = [
    {
      id: "balanced-brief",
      label: "Balanced Brief",
      tone: "Approval-ready",
      summary: "Balances clarity, scope, and hiring signal for a broad candidate pool."
    },
    {
      id: "execution-sprint",
      label: "Execution Sprint",
      tone: "Sharper and operator-heavy",
      summary: "Pushes harder on first-quarter execution, operating cadence, and delivery ownership."
    },
    {
      id: "outcome-scorecard",
      label: "Outcome Scorecard",
      tone: "Outcome-led",
      summary: "Frames the role around measurable outcomes and stronger screening alignment."
    }
  ] as const;

  return variants.map((variant, index) => {
    const responsibilityPrefix =
      index === 1 ? "Drive" : index === 2 ? "Translate" : "Own";
    const responsibilities = applyFeedbackToResponsibilities(
      responsibilitySeed.map((item) => `${responsibilityPrefix} ${item.toLowerCase()}`),
      feedback
    );

    return {
      id: variant.id,
      label: variant.label,
      tone: variant.tone,
      summary: `${variant.summary} ${feedbackNarrative(feedback)}`,
      responsibilities,
      focusAreas,
      feedbackApplied: feedback ? [feedback] : [],
      description: [
        payload.jobTitle,
        "",
        `${variant.label} for ${payload.jobTitle}.`,
        feedbackNarrative(feedback),
        "",
        "Role mission",
        problem,
        "",
        contextBits ? `Hiring context: ${contextBits}` : null,
        "",
        "Core responsibilities",
        ...responsibilities.map((item) => `- ${item}`),
        "",
        index === 2 ? "Success signals" : "Required capabilities",
        ...skills.map((item) => `- ${item}`),
        "",
        "Manager interview focus areas",
        ...focusAreas.map((item) => `- ${item}`)
      ]
        .filter(Boolean)
        .join("\n")
    };
  });
}

function mapManagerDraftPayloadToRequest(payload: ManagerJobDraftPayload) {
  const salaryText = payload.salaryRange?.trim() ?? "";
  const minMatch = salaryText.match(/(\d[\d,]*)/);
  const maxMatch = salaryText.match(/(?:-|to)\s*(\d[\d,]*)/i);

  return {
    mode: payload.mode === "conversational" ? "CONVERSATIONAL_AI" : "STRUCTURED_INPUT",
    title: payload.jobTitle,
    department: payload.department?.trim() || null,
    location: payload.location?.trim() || null,
    minExperienceYears:
      payload.experienceLevel?.match(/\d+/)?.[0] != null
        ? Number(payload.experienceLevel.match(/\d+/)?.[0])
        : null,
    salaryMin: minMatch ? Number(minMatch[1].replaceAll(",", "")) : null,
    salaryMax: maxMatch ? Number(maxMatch[1].replaceAll(",", "")) : null,
    currency: salaryText.match(/[A-Za-z]{3}/)?.[0]?.toUpperCase() ?? null,
    joiningTimeline: payload.joiningTimeline?.trim() || null,
    relocationRequired: /required|yes/i.test(payload.relocation ?? ""),
    intakeAnswers: Object.entries(payload.answers)
      .filter((entry) => entry[1].trim())
      .map(([key, answer]) => ({
        prompt: key,
        answer
      }))
  };
}

function mapManagerDashboardResponse(payload: {
  summary: {
    activeJobDescriptions: number;
    totalApplicants: number;
    shortlistedCandidates: number;
    pendingApproval: number;
  };
  jobs: Array<{
    id: string;
    title: string;
    status: string;
    location: string | null;
    createdAt: string;
    updatedAt: string;
    descriptionPreview: string;
    applicantsCount: number;
    shortlistedCount: number;
    pipelineDistribution: Array<{ label: string; count: number; status: string }>;
  }>;
}): ManagerDashboardData {
  return {
    metrics: [
      {
        label: "Active job descriptions",
        value: String(payload.summary.activeJobDescriptions),
        context: "Multiple pipelines managed from one dashboard"
      },
      {
        label: "Applicants in manager view",
        value: String(payload.summary.totalApplicants),
        context: "Current candidate volume across all owned roles"
      },
      {
        label: "Shortlisted candidates",
        value: String(payload.summary.shortlistedCandidates),
        context: "Candidates ready for manager-level review"
      },
      {
        label: "Pending HR approval",
        value: String(payload.summary.pendingApproval),
        context: "Drafts still waiting on HR action"
      }
    ],
    jobs: payload.jobs.map((job) => ({
      ...job,
      location: job.location ?? "Flexible / remote"
    }))
  };
}

export async function generateJobDescription(
  payload: JobIntakePayload
): Promise<GeneratedJobDescription> {
  return requestOrFallback(
    "/jobs/generate",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    async () => {
      await sleep(320);
      return {
        ...defaultGeneratedJobDescription,
        title: payload.jobTitle,
        mission: payload.answers.problem ?? defaultGeneratedJobDescription.mission,
        mustHaveSkills: (payload.answers.skills ?? "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
          .slice(0, 6),
        experienceLevel:
          payload.answers.experience ?? defaultGeneratedJobDescription.experienceLevel,
        salaryRange: payload.answers.salary ?? defaultGeneratedJobDescription.salaryRange,
        joiningTimeline:
          payload.answers.joining ?? defaultGeneratedJobDescription.joiningTimeline,
        relocation: payload.answers.relocation ?? defaultGeneratedJobDescription.relocation,
        hrSummary: `Role approved for ${payload.jobTitle}. ${payload.answers.problem ?? ""}`
      };
    }
  );
}

export async function getManagerDashboard(): Promise<ManagerDashboardData> {
  return requestOrFallback("/jobs/manager/dashboard", undefined, async () => {
    await sleep(140);
    return managerDashboardFallback;
  }).then((payload) => {
    if ("metrics" in payload) {
      return payload as ManagerDashboardData;
    }

    return mapManagerDashboardResponse(
      payload as {
        summary: {
          activeJobDescriptions: number;
          totalApplicants: number;
          shortlistedCandidates: number;
          pendingApproval: number;
        };
        jobs: Array<{
          id: string;
          title: string;
          status: string;
          location: string | null;
          createdAt: string;
          updatedAt: string;
          descriptionPreview: string;
          applicantsCount: number;
          shortlistedCount: number;
          pipelineDistribution: Array<{ label: string; count: number; status: string }>;
        }>;
      }
    );
  });
}

export async function getManagerJobIntelligence(
  jobId: string
): Promise<ManagerJobIntelligenceDetail> {
  return requestOrFallback(`/jobs/${jobId}/manager-intelligence`, undefined, async () => {
    await sleep(160);
    const job =
      managerDashboardFallback.jobs.find((item) => item.id === jobId) ??
      managerDashboardFallback.jobs[0];

    return {
      job,
      candidates:
        managerJobCandidatesFallback[job.id] ??
        managerJobCandidatesFallback["job-growth-marketing-manager"]
    };
  }).then((payload) => {
    if ("job" in payload && "candidates" in payload) {
      const detail = payload as ManagerJobIntelligenceDetail;
      return {
        ...detail,
        job: {
          ...detail.job,
          location: detail.job.location || "Flexible / remote"
        }
      };
    }

    return {
      job: managerDashboardFallback.jobs[0],
      candidates: managerJobCandidatesFallback["job-growth-marketing-manager"]
    };
  });
}

export async function createManagerJobDraft(
  payload: ManagerJobDraftPayload
): Promise<ManagerJobDraftResult> {
  const requestPayload = mapManagerDraftPayloadToRequest(payload);

  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/manager/jobs/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload),
        cache: "no-store"
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          job: { id: string; title: string };
          variants: ManagerJobDescriptionVariant[];
          selectedVariantId: string;
        };

        return {
          jobId: payload.job.id,
          jobTitle: payload.job.title,
          selectedVariantId: payload.selectedVariantId,
          variants: payload.variants
        };
      }
    } catch {
      // Fall through to the existing fallback behavior if the manager proxy is unavailable.
    }
  }

  return requestOrFallback(
    "/jobs/manager/drafts",
    {
      method: "POST",
      body: JSON.stringify(requestPayload)
    },
    async () => {
      await sleep(360);
      const variants = buildManagerVariants(payload);
      return {
        jobId: null,
        jobTitle: payload.jobTitle,
        selectedVariantId: variants[0]?.id ?? "balanced-brief",
        variants
      };
    }
  ).then((response) => {
    if ("variants" in response && "selectedVariantId" in response && "job" in response) {
      const payload = response as {
        job: { id: string; title: string };
        variants: ManagerJobDescriptionVariant[];
        selectedVariantId: string;
      };

      return {
        jobId: payload.job.id,
        jobTitle: payload.job.title,
        selectedVariantId: payload.selectedVariantId,
        variants: payload.variants
      };
    }

    return response as ManagerJobDraftResult;
  });
}

export async function refineManagerJobDescription(input: {
  jobId: string | null;
  jobTitle: string;
  mode: ManagerJobDraftPayload["mode"];
  answers: ManagerJobDraftPayload["answers"];
  selectedVariantId: string;
  feedback: ManagerJdFeedbackAction;
  variants: ManagerJobDescriptionVariant[];
  department?: string;
  location?: string;
  experienceLevel?: string;
  salaryRange?: string;
  joiningTimeline?: string;
  relocation?: string;
}): Promise<ManagerJobDraftResult> {
  if (typeof window !== "undefined" && input.jobId) {
    try {
      const response = await fetch(`/api/manager/jobs/${input.jobId}/refine-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          selectedVariantId: input.selectedVariantId,
          feedback: input.feedback
        }),
        cache: "no-store"
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          job: { id: string; title: string };
          variants: ManagerJobDescriptionVariant[];
          selectedVariantId: string;
        };

        return {
          jobId: payload.job.id,
          jobTitle: payload.job.title,
          selectedVariantId: payload.selectedVariantId,
          variants: payload.variants
        };
      }
    } catch {
      // Fall through to the existing fallback behavior if the manager proxy is unavailable.
    }
  }

  if (input.jobId) {
    return requestOrFallback(
      `/jobs/${input.jobId}/manager/refine-description`,
      {
        method: "POST",
        body: JSON.stringify({
          selectedVariantId: input.selectedVariantId,
          feedback: input.feedback
        })
      },
      async () => {
        await sleep(260);
        return {
          jobId: input.jobId,
          jobTitle: input.jobTitle,
          selectedVariantId: input.selectedVariantId,
          variants: buildManagerVariants(
            {
              mode: input.mode,
              jobTitle: input.jobTitle,
              department: input.department,
              location: input.location,
              experienceLevel: input.experienceLevel,
              salaryRange: input.salaryRange,
              joiningTimeline: input.joiningTimeline,
              relocation: input.relocation,
              answers: input.answers
            },
            input.feedback
          )
        };
      }
    ).then((response) => {
      if ("variants" in response && "selectedVariantId" in response && "job" in response) {
        const payload = response as {
          job: { id: string; title: string };
          variants: ManagerJobDescriptionVariant[];
          selectedVariantId: string;
        };

        return {
          jobId: payload.job.id,
          jobTitle: payload.job.title,
          selectedVariantId: payload.selectedVariantId,
          variants: payload.variants
        };
      }

      return response as ManagerJobDraftResult;
    });
  }

  await sleep(220);

  return {
    jobId: null,
    jobTitle: input.jobTitle,
    selectedVariantId: input.selectedVariantId,
    variants: buildManagerVariants(
      {
        mode: input.mode,
        jobTitle: input.jobTitle,
        department: input.department,
        location: input.location,
        experienceLevel: input.experienceLevel,
        salaryRange: input.salaryRange,
        joiningTimeline: input.joiningTimeline,
        relocation: input.relocation,
        answers: input.answers
      },
      input.feedback
    )
  };
}

function normalizeCurrency(value: string) {
  const numeric = Number.parseInt(value.replace(/[^\d]/g, ""), 10);

  return Number.isNaN(numeric) ? Number.POSITIVE_INFINITY : numeric;
}

function filterCandidates(filters: DashboardFilters): DashboardCandidate[] {
  return dashboardCandidates.filter((candidate) => {
    if (
      filters.resumeScoreMin &&
      candidate.resumeScore < Number.parseInt(filters.resumeScoreMin, 10)
    ) {
      return false;
    }

    if (
      filters.interviewScoreMin &&
      candidate.interviewScore < Number.parseInt(filters.interviewScoreMin, 10)
    ) {
      return false;
    }

    if (filters.joiningTimeline && candidate.joiningTimeline !== filters.joiningTimeline) {
      return false;
    }

    if (
      filters.salaryMax &&
      normalizeCurrency(candidate.salaryExpectation) > normalizeCurrency(filters.salaryMax)
    ) {
      return false;
    }

    if (filters.relocation && candidate.relocation !== filters.relocation) {
      return false;
    }

    if (filters.status && candidate.status !== filters.status) {
      return false;
    }

    return true;
  });
}

export async function getHrDashboard(
  filters: DashboardFilters = {}
): Promise<HrDashboardData> {
  const queryFilters = Object.fromEntries(
    Object.entries(filters).filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
  const query = new URLSearchParams(queryFilters).toString();

  return requestOrFallback(`/hr/dashboard?${query}`, undefined, async () => {
    await sleep(160);
    return {
      ...hrDashboardData,
      candidates: filterCandidates(filters)
    };
  });
}

export async function getApplicationPortal(jobId: string): Promise<ApplicationPortalData> {
  return requestOrFallback<ApplicationPortalData | Record<string, unknown>>(
    `/public/jobs/${jobId}`,
    undefined,
    async () => {
      await sleep(140);
      return {
        ...applicationPortalData,
        job: {
          ...applicationPortalData.job,
          id: jobId
        }
      };
    }
  ).then((payload): ApplicationPortalData => {
    if ("job" in payload && "pipeline" in payload) {
      return payload as ApplicationPortalData;
    }

    const job = payload as {
      id: string;
      title: string;
      location: string | null;
      generatedDescription?: string;
      approvedDescription?: string | null;
      minExperienceYears?: number | null;
      salaryMin?: number | null;
      salaryMax?: number | null;
      currency?: string | null;
      joiningTimeline?: string | null;
      relocationRequired?: boolean;
    };

    return {
      job: {
        id: job.id,
        title: job.title,
        summary: job.approvedDescription ?? job.generatedDescription ?? applicationPortalData.job.summary,
        experienceLevel: job.minExperienceYears ? `${job.minExperienceYears}+ years` : applicationPortalData.job.experienceLevel,
        salaryRange:
          job.salaryMin != null || job.salaryMax != null
            ? `${job.currency ?? "INR"} ${job.salaryMin ?? 0} - ${job.salaryMax ?? "Open"}`
            : applicationPortalData.job.salaryRange,
        joiningTimeline: job.joiningTimeline ?? applicationPortalData.job.joiningTimeline,
        relocation: job.relocationRequired ? "Required or negotiable" : "Flexible",
        location: job.location ?? "Remote / flexible"
      },
      pipeline: applicationPortalData.pipeline
    };
  });
}

export async function submitCandidateApplication(
  payload: CandidateApplicationPayload
): Promise<ApplicationSubmissionResult> {
  if (apiMode !== "live" || !apiBaseUrl) {
    await sleep(360);
    const fallbackResult: ApplicationSubmissionResult = {
      applicationId: fallbackApplicationSubmissionResult.applicationId,
      candidateId: fallbackApplicationSubmissionResult.candidateId,
      status: fallbackApplicationSubmissionResult.status,
      statusMessage: fallbackApplicationSubmissionResult.statusMessage,
      interviewInvitation: fallbackApplicationSubmissionResult.interviewInvitation,
      interviewQuestions: payload.resumeFile
        ? fallbackApplicationSubmissionResult.interviewQuestions
        : []
    };
    return fallbackResult;
  }

  try {
    const formData = new FormData();
    formData.append("fullName", payload.fullName);
    formData.append("email", payload.email);
    if (payload.phone) {
      formData.append("phone", payload.phone.trim());
    }
    if (payload.linkedInUrl?.trim()) {
      formData.append("linkedinUrl", payload.linkedInUrl.trim());
    }
    formData.append("expectedCtc", payload.expectedCtc.trim());
    formData.append("earliestJoiningDate", payload.earliestJoiningDate);
    formData.append("relocation", payload.relocation.trim());
    if (payload.resumeFile) {
      formData.append("resume", payload.resumeFile);
    }

    const response = await fetch(`${apiBaseUrl}/public/jobs/${payload.jobId}/apply`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return (await response.json()) as ApplicationSubmissionResult;
  } catch {
    const fallbackResult: ApplicationSubmissionResult = {
      applicationId: fallbackApplicationSubmissionResult.applicationId,
      candidateId: fallbackApplicationSubmissionResult.candidateId,
      status: fallbackApplicationSubmissionResult.status,
      statusMessage: fallbackApplicationSubmissionResult.statusMessage,
      interviewInvitation: fallbackApplicationSubmissionResult.interviewInvitation,
      interviewQuestions: payload.resumeFile
        ? fallbackApplicationSubmissionResult.interviewQuestions
        : []
    };
    return fallbackResult;
  }
}

export async function getCandidateProfile(
  candidateId: string
): Promise<CandidateProfileData> {
  return requestOrFallback(`/candidates/${candidateId}`, undefined, async () => {
    await sleep(180);
    return {
      ...candidateProfile,
      id: candidateId
    };
  });
}

export async function getVoiceInterviewConfig(): Promise<VoiceInterviewConfig> {
  return requestOrFallback("/voice/interview/config", undefined, async () => {
    await sleep(80);
    return {
      enabled: false,
      voiceId: null,
      ttsModelId: "mock",
      sttModelId: "mock"
    };
  });
}

export async function startVoiceInterviewConversation(
  input: StartVoiceInterviewConversationInput
): Promise<VoiceInterviewConversationState> {
  if (apiMode !== "live" || !apiBaseUrl) {
    await sleep(120);
    return startMockVoiceConversation(input);
  }

  return requestOrFallback(
    "/voice/interview/sessions/start",
    {
      method: "POST",
      body: JSON.stringify(input)
    },
    async () => startMockVoiceConversation(input)
  );
}

export async function synthesizeVoicePrompt(text: string): Promise<Blob | null> {
  if (apiMode !== "live" || !apiBaseUrl) {
    return null;
  }

  const response = await fetch(`${apiBaseUrl}/voice/interview/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    return null;
  }

  return response.blob();
}

export async function submitVoiceInterviewTurn(
  input: SubmitVoiceInterviewTurnInput
): Promise<VoiceInterviewConversationState> {
  if (apiMode !== "live" || !apiBaseUrl) {
    await sleep(240);
    return respondMockVoiceConversation(input);
  }

  return requestOrFallback(
    `/voice/interview/sessions/${input.conversationId}/respond`,
    {
      method: "POST",
      body: JSON.stringify({
        transcript: input.transcript,
        audioBase64: input.audioBase64,
        mimeType: input.mimeType,
        fileName: input.fileName
      })
    },
    async () => respondMockVoiceConversation(input)
  );
}

export async function transcribeVoiceAnswer(input: {
  audioBase64: string;
  mimeType: string;
  fileName?: string;
}): Promise<VoiceTranscriptionResult> {
  return requestOrFallback(
    "/voice/interview/transcribe",
    {
      method: "POST",
      body: JSON.stringify(input)
    },
    async () => {
      await sleep(300);
      return {
        text: "Mock transcript captured from recorded answer.",
        languageCode: "en"
      };
    }
  );
}

export async function evaluateVoiceInterview(payload: {
  answers: Array<{ question: string; answer: string }>;
}): Promise<VoiceInterviewEvaluation> {
  return requestOrFallback(
    "/voice/interview/evaluate",
    {
      method: "POST",
      body: JSON.stringify(payload)
    },
    async () => {
      await sleep(300);
      return {
        communicationClarity: 82,
        technicalDepth: 79,
        problemSolvingStructure: 77,
        businessUnderstanding: 80,
        communicationScore: 82,
        knowledgeScore: 80,
        confidenceScore: 78,
        overallScore: 80,
        summary: "Clear answers with solid baseline role understanding and decent confidence.",
        responseEvaluations: payload.answers.map((answer, index) => ({
          questionId: `mock-${index + 1}`,
          question: answer.question,
          answer: answer.answer,
          category: mockVoiceCategories[Math.min(index, mockVoiceCategories.length - 1)],
          askedAsFollowUp: false,
          evaluationScore: 80,
          rationale: "Mock evaluation generated without backend orchestration.",
          scoreBreakdown: {
            communicationClarity: 82,
            technicalDepth: 79,
            problemSolvingStructure: 77,
            businessUnderstanding: 80
          }
        })),
        claimVerificationFlags: [
          { claim: "Built a repeatable pipeline engine", status: "VERIFY_REFERENCE" }
        ],
        suggestedManagerQuestions: [
          "How would you prioritize channel investments in the first 90 days?",
          "Which metrics would tell you the growth model is breaking early?"
        ]
      };
    }
  ).then((response) => normalizeVoiceInterviewEvaluation(payload, response));
}

function mapHrCandidateDetailToCandidateProfile(profile: HrCandidateDetail): CandidateProfileData {
  const latestApplication = profile.applications[0] ?? null;
  const latestInterview = profile.interviews[0] ?? null;
  const latestScreening = profile.screeningResults[0] ?? null;
  const candidateScore = profile.insight?.candidateScore ?? null;
  const resumeAnalysis = profile.insight?.resumeAnalysis ?? latestScreening?.resumeAnalysis ?? {};
  const interviewTranscript = latestInterview?.items ?? [];
  const recommendationSummary =
    profile.insight?.hiringRecommendation ??
    latestScreening?.reasoningSummary ??
    "Internal candidate intelligence is available for further review.";

  return {
    id: profile.candidate.id,
    name: profile.candidate.fullName,
    currentRole: profile.candidate.currentCompany ?? "Role not yet captured",
    location: profile.candidate.currentLocation ?? "Location unavailable",
    overview:
      latestScreening?.reasoningSummary ??
      "Semantic screening and interview evidence are available for internal review.",
    resumeScore: latestScreening ? `${latestScreening.finalScore} / 100` : "Pending",
    resumeSynopsis: latestScreening
      ? `Semantic alignment ${latestScreening.semanticSimilarity} with strengths in ${latestScreening.strengths.slice(0, 2).join(", ") || "resume fit"}.`
      : "Resume screening has not been finalized yet.",
    interviewScore: latestInterview?.overallScore ? `${latestInterview.overallScore} / 100` : "Pending",
    interviewSummary:
      latestInterview?.summary ??
      "Interview evidence will appear after the AI interview is completed.",
    applicationHistory: profile.applications.map((application) => ({
      jobTitle: application.jobTitle,
      date: new Date(application.appliedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      status: application.status,
      statusClass:
        application.status === "SHORTLISTED"
          ? "status-shortlisted"
          : application.status === "REJECTED" || application.status === "SCREENING_FAILED"
            ? "status-review"
            : "status-progress",
      notes:
        application.resumeScore != null
          ? `Resume score ${application.resumeScore}${application.interviewScore != null ? `, interview score ${application.interviewScore}` : ""}.`
          : "Application stored in the hiring pipeline."
    })),
    resumeInsights: JSON.stringify(resumeAnalysis, null, 2),
    linkedInInsights: profile.candidate.linkedinUrl
      ? `LinkedIn URL captured: ${profile.candidate.linkedinUrl}`
      : "No LinkedIn profile supplied.",
    interviewTranscript: interviewTranscript.map((item) => ({
      question: item.question,
      answer: item.answer,
      score: `${item.evaluationScore} / 100`
    })),
    claimVerification:
      profile.insight?.claimVerificationFlags.length
        ? profile.insight.claimVerificationFlags
            .map((flag) => JSON.stringify(flag))
            .join(" | ")
        : "No claim verification flags recorded.",
    suggestedQuestions:
      profile.insight?.suggestedManagerQuestions.length
        ? profile.insight.suggestedManagerQuestions
        : latestScreening?.weaknesses.map((item) => `Probe further on ${item}.`) ?? [],
    scoreEngine: {
      finalScore:
        candidateScore?.finalScore != null ? `${candidateScore.finalScore} / 100` : "Pending",
      confidence:
        candidateScore?.confidenceScore != null
          ? `${Math.round(candidateScore.confidenceScore * 100)}% (${candidateScore.confidenceLabel})`
          : "Pending",
      roleCapability:
        candidateScore?.roleCapability != null ? String(candidateScore.roleCapability) : "Pending",
      thinkingBehavior:
        candidateScore?.thinkingBehavior != null
          ? String(candidateScore.thinkingBehavior)
          : "Pending",
      impact: candidateScore?.impact != null ? String(candidateScore.impact) : "Pending",
      transferability:
        candidateScore?.transferability != null
          ? String(candidateScore.transferability)
          : "Pending",
      potential: candidateScore?.potential != null ? String(candidateScore.potential) : "Pending",
      evidence: candidateScore?.evidenceSummary ?? []
    },
    scoreBreakdown: {
      communication:
        latestInterview?.communicationScore != null
          ? String(latestInterview.communicationScore)
          : "Pending",
      knowledge:
        latestInterview?.knowledgeScore != null ? String(latestInterview.knowledgeScore) : "Pending",
      confidence:
        latestInterview?.confidenceScore != null
          ? String(latestInterview.confidenceScore)
          : "Pending",
      overall:
        latestInterview?.overallScore != null ? String(latestInterview.overallScore) : "Pending"
    },
    recommendation: {
      label: latestApplication?.status ?? "Internal review",
      title: latestScreening?.finalScore && latestScreening.finalScore >= 70 ? "Proceed" : "Review manually",
      summary: candidateScore?.summary ?? recommendationSummary,
      statusClass:
        candidateScore?.recommendation === "advance" ||
        (candidateScore == null && latestScreening?.finalScore && latestScreening.finalScore >= 70)
          ? "status-approved"
          : "status-progress",
      highlights:
        candidateScore?.evidenceSummary?.length
          ? candidateScore.evidenceSummary
          : latestScreening?.strengths.length
          ? latestScreening.strengths
          : ["Semantic screening data is available for internal review."]
    }
  };
}
