import type {
  CandidateIntelligenceReportInput,
  CandidateIntelligenceReport,
  InterviewEvaluationInput,
  InterviewEvaluationResult,
  InterviewQuestionGenerationInput,
  InterviewQuestionSet,
  JobIntakeConversationResult,
  JobIntakeInput,
  GeneratedJobDescription,
  ManagerQuestionSuggestionInput,
  ManagerQuestionSuggestionResult,
  QualificationEvaluationInput,
  QualificationEvaluationResult,
  ResumeScreeningInput,
  ResumeScreeningResult
} from "../domain/contracts.js";
import { clampScore, listToSentence, normalizeWhitespace } from "../utils/prompt.js";

export function createMockJobIntakeConversationResult(input: JobIntakeInput): JobIntakeConversationResult {
  const missingInformation: string[] = [];

  if (!input.businessProblem) {
    missingInformation.push("businessProblem");
  }
  if (input.requiredSkills.length === 0) {
    missingInformation.push("requiredSkills");
  }
  if (!input.salaryRange?.maxAnnualBase) {
    missingInformation.push("salaryRange");
  }
  if (!input.joiningTimeline) {
    missingInformation.push("joiningTimeline");
  }
  if (!input.relocationDetails && input.relocationRequired) {
    missingInformation.push("relocationDetails");
  }

  const questionMap = {
    businessProblem: {
      field: "businessProblem",
      question: `What core business problem should the ${input.jobTitle} solve in the first 6-12 months?`,
      rationale: "This defines the role narrative and success outcomes."
    },
    requiredSkills: {
      field: "requiredSkills",
      question: `Which 3-5 capabilities are truly non-negotiable for the ${input.jobTitle}?`,
      rationale: "These skills drive screening and interview design."
    },
    salaryRange: {
      field: "salaryRange",
      question: "What approved compensation range should HR use for this opening?",
      rationale: "Qualification filtering needs a budget constraint."
    },
    joiningTimeline: {
      field: "joiningTimeline",
      question: "When does this person ideally need to join the team?",
      rationale: "Candidate timeline fit is a required qualification gate."
    },
    relocationDetails: {
      field: "relocationDetails",
      question: "If relocation is required, what location and flexibility should candidates know about?",
      rationale: "Candidates must be screened against relocation expectations."
    }
  };

  const nextQuestions = missingInformation
    .slice(0, 4)
    .map((field) => questionMap[field as keyof typeof questionMap]);

  return {
    intakeSummary: `Initial intake for ${input.jobTitle} is ${missingInformation.length === 0 ? "sufficient for drafting" : "missing a few decision-critical details"}.`,
    capturedRequirements: {
      businessProblem: input.businessProblem ?? "",
      responsibilities: input.responsibilities,
      requiredSkills: input.requiredSkills,
      preferredSkills: input.preferredSkills,
      experienceLevel: input.experienceLevel,
      salaryKnown: Boolean(input.salaryRange?.maxAnnualBase),
      joiningTimelineKnown: Boolean(input.joiningTimeline),
      relocationKnown: !input.relocationRequired || Boolean(input.relocationDetails)
    },
    missingInformation,
    nextQuestions,
    readyToDraft: missingInformation.length <= 1
  };
}

export function createMockJobDescription(input: JobIntakeInput): GeneratedJobDescription {
  const responsibilities = input.responsibilities.length > 0
    ? input.responsibilities.slice(0, 6)
    : [
        `Own the end-to-end execution roadmap for the ${input.jobTitle} role.`,
        "Translate business goals into measurable operating plans.",
        "Partner with cross-functional stakeholders to remove delivery blockers.",
        "Use data to improve quality, efficiency, and decision making."
      ];

  const requiredSkills = input.requiredSkills.length > 0
    ? input.requiredSkills.slice(0, 8)
    : ["Stakeholder management", "Analytical thinking", "Execution planning"];

  const result: GeneratedJobDescription = {
    title: input.jobTitle,
    summary: `${input.jobTitle} responsible for ${normalizeWhitespace(input.businessProblem) || "solving a high-priority business problem with measurable impact"}.`,
    problemStatement: normalizeWhitespace(input.businessProblem) || "The team needs a dependable operator who can solve a clearly defined business problem and improve outcomes quickly.",
    responsibilities,
    requiredSkills,
    preferredSkills: input.preferredSkills.slice(0, 6),
    experienceLevel: input.experienceLevel,
    workModel: input.workModel,
    employmentType: input.employmentType,
    relocation: {
      required: input.relocationRequired,
      details: input.relocationDetails || (input.relocationRequired ? "Relocation details to be confirmed during HR review." : "No relocation required.")
    },
    screeningCriteria: [
      `Demonstrated experience with ${listToSentence(requiredSkills.slice(0, 3))}`,
      "Evidence of owning outcomes, not just tasks",
      "Role-relevant communication and stakeholder alignment"
    ],
    interviewFocusAreas: [
      "Depth in role-specific problem solving",
      "Cross-functional collaboration",
      "Ability to drive results under ambiguity"
    ],
    approvalNotes: [
      "Validate compensation band with HR before publishing.",
      "Confirm relocation and joining timeline on the application form."
    ]
  };

  if (input.location) {
    result.location = input.location;
  }
  if (input.salaryRange) {
    result.salaryRange = input.salaryRange;
  }
  if (input.joiningTimeline) {
    result.joiningTimeline = input.joiningTimeline;
  }

  return result;
}

export function createMockResumeScreeningResult(
  input: ResumeScreeningInput,
  resumePassThreshold: number
): ResumeScreeningResult {
  const resumeText = input.candidate.resumeText.toLowerCase();
  const requiredSkills = input.job.requiredSkills;
  const matchedSkills = requiredSkills.filter((skill) => resumeText.includes(skill.toLowerCase()));
  const missingSkills = requiredSkills.filter((skill) => !resumeText.includes(skill.toLowerCase()));
  const preferredMatches = input.job.preferredSkills.filter((skill) => resumeText.includes(skill.toLowerCase())).length;
  const baseScore = requiredSkills.length === 0
    ? 72
    : (matchedSkills.length / requiredSkills.length) * 78;
  const experienceBonus = input.candidate.yearsOfExperience ? Math.min(12, input.candidate.yearsOfExperience * 1.5) : 6;
  const preferredBonus = Math.min(10, preferredMatches * 3);
  const score = clampScore(baseScore + experienceBonus + preferredBonus);

  const strengths = [
    matchedSkills.length > 0
      ? `Resume shows evidence for ${listToSentence(matchedSkills.slice(0, 4))}.`
      : "Candidate provides some relevant background, but specific must-have skills are not explicit.",
    input.candidate.currentTitle
      ? `Current title suggests proximity to the target role: ${input.candidate.currentTitle}.`
      : "Career progression is present in the resume content."
  ];

  if (input.candidate.linkedInProfileText) {
    strengths.push("LinkedIn context provides extra signal beyond the resume.");
  }

  const gaps = missingSkills.slice(0, 4).map((skill) => `Limited direct evidence for ${skill}.`);
  const claimVerificationFlags = /\bled\b|\bowned\b|\bscaled\b/i.test(input.candidate.resumeText)
    ? [
        {
          claim: "Leadership and ownership claims",
          severity: "medium" as const,
          reason: "Resume contains broad impact verbs that should be validated with concrete examples."
        }
      ]
    : [];

  return {
    candidateSummary: `${input.candidate.fullName} appears to be a ${score >= resumePassThreshold ? "workable" : "partial"} match for ${input.job.title}.`,
    matchScore: score,
    proceed: score >= resumePassThreshold,
    recommendation: score >= resumePassThreshold ? "advance" : score >= resumePassThreshold - 10 ? "hold" : "reject",
    strengths: strengths.slice(0, 6),
    gaps,
    matchedSkills,
    missingSkills,
    resumeHighlights: [
      input.candidate.currentTitle ? `Recent role: ${input.candidate.currentTitle}` : "Recent role not explicitly provided.",
      input.candidate.yearsOfExperience != null ? `${input.candidate.yearsOfExperience} years of stated experience.` : "Years of experience were not explicitly provided."
    ],
    claimVerificationFlags
  };
}

export function createMockInterviewQuestionSet(input: InterviewQuestionGenerationInput): InterviewQuestionSet {
  const anchors = input.focusAreas.length > 0
    ? input.focusAreas
    : [...input.job.requiredSkills.slice(0, 3), ...input.job.successOutcomes.slice(0, 2)];

  const fallbackAnchors = anchors.length > 0 ? anchors : ["problem solving", "stakeholder management", "execution quality"];
  const questions = Array.from({ length: input.questionCount }, (_, index) => {
    const anchor = fallbackAnchors[index % fallbackAnchors.length] ?? "problem solving";
    return {
      id: `q_${index + 1}`,
      question: `Tell me about a time you demonstrated ${anchor} in a way that maps closely to this role.`,
      competency: anchor,
      intent: `Validate real experience and depth in ${anchor}.`,
      scoringGuidance: "Look for specific actions, ownership, measurable outcomes, and clear reflection."
    };
  });

  return {
    intro: `Thanks ${input.candidate.fullName}. We will ask a few questions tailored to your background and the ${input.job.title} role.`,
    questions
  };
}

export function createMockInterviewEvaluationResult(input: InterviewEvaluationInput): InterviewEvaluationResult {
  const answerEvaluations = input.answers.map((answer) => {
    const wordCount = answer.answer.trim().split(/\s+/).filter(Boolean).length;
    const score = clampScore(40 + Math.min(50, wordCount * 1.5));
    return {
      questionId: answer.questionId,
      score,
      rationale: wordCount >= 45
        ? "Answer provides enough detail to evaluate reasoning and outcomes."
        : "Answer is brief and should be probed further for specifics."
    };
  });

  const average = answerEvaluations.length === 0
    ? 0
    : clampScore(answerEvaluations.reduce((sum, item) => sum + item.score, 0) / answerEvaluations.length);

  return {
    communicationScore: clampScore(average + 4),
    knowledgeScore: average,
    confidenceScore: clampScore(average - 2),
    overallScore: average,
    interviewSummary: `${input.candidate.fullName} showed ${average >= 75 ? "solid" : "mixed"} interview signal for ${input.job.title}.`,
    strengths: [
      "Responses contained relevant context tied to prior work.",
      "Candidate maintained a consistent narrative through the interview."
    ],
    concerns: average >= 75 ? [] : ["Several answers need deeper examples and more measurable outcomes."],
    recommendation: average >= 75 ? "advance" : average >= 60 ? "hold" : "reject",
    answerEvaluations
  };
}

export function createMockCandidateIntelligenceReport(
  input: CandidateIntelligenceReportInput
): CandidateIntelligenceReport {
  const interview = input.interviewEvaluation;

  return {
    overview: `${input.candidate.fullName} is being considered for ${input.job.title} with a resume score of ${input.resumeScreening.matchScore}${interview ? ` and interview score of ${interview.overallScore}` : ""}.`,
    resumeInsights: [
      ...input.resumeScreening.strengths.slice(0, 3),
      ...input.resumeScreening.gaps.slice(0, 2)
    ].slice(0, 6),
    linkedInInsights: input.candidate.linkedInProfileText
      ? ["LinkedIn profile supplied additional public experience context."]
      : [],
    interviewTranscriptSummary: interview
      ? [interview.interviewSummary, ...interview.strengths.slice(0, 2), ...interview.concerns.slice(0, 2)]
      : [],
    interviewScores: {
      communicationScore: interview?.communicationScore ?? null,
      knowledgeScore: interview?.knowledgeScore ?? null,
      confidenceScore: interview?.confidenceScore ?? null,
      overallScore: interview?.overallScore ?? null
    },
    claimVerification: input.resumeScreening.claimVerificationFlags,
    suggestedManagerQuestions: [
      "What was the most complex problem you personally owned end-to-end in your recent role?",
      "How would you approach the first 90 days in this position?",
      "Which achievement on your resume best proves you can succeed in this job?",
      "Where would you need the most support if you joined this team?"
    ],
    aiHiringRecommendation: {
      decision: input.resumeScreening.proceed && input.qualificationEvaluation.qualified
        ? interview?.recommendation ?? "advance"
        : "reject",
      rationale: input.qualificationEvaluation.qualified
        ? "Candidate has passed the structured screening gates with manageable risk."
        : "Candidate does not meet one or more hard qualification constraints.",
      nextSteps: input.qualificationEvaluation.qualified
        ? ["Proceed to manager review.", "Validate flagged claims in live interview."]
        : ["Keep candidate profile in the knowledge base for future roles."]
    },
    applicationHistorySummary: input.applicationHistory.map((entry) => {
      return `${entry.jobTitle} on ${entry.appliedAt}: ${entry.status}.`;
    })
  };
}

export function createMockManagerQuestionSuggestions(
  input: ManagerQuestionSuggestionInput
): ManagerQuestionSuggestionResult {
  const weakAreas = [
    ...input.resumeScreening.gaps,
    ...(input.interviewEvaluation?.concerns ?? [])
  ];

  const suggestions = Array.from({ length: input.requestedCount }, (_, index) => {
    const weakArea = weakAreas[index % Math.max(weakAreas.length, 1)] || "role-specific depth";
    return {
      question: `Can you walk me through a concrete example that addresses this area: ${weakArea.replace(/^Limited direct evidence for /, "")}?`,
      targetSignal: "Evidence depth",
      reason: "Helps the hiring manager validate whether a current gap is real or just under-documented."
    };
  });

  return { suggestions };
}

export function summarizeQualificationOutcome(result: QualificationEvaluationResult): string {
  if (result.qualified) {
    return "Candidate satisfies the hard qualification checks.";
  }

  return `Candidate does not satisfy hard qualification checks: ${listToSentence(result.blockingReasons)}.`;
}

export function createQualificationSummary(input: QualificationEvaluationInput): QualificationEvaluationResult {
  const matchedConstraints: string[] = [];
  const mismatchConstraints: string[] = [];
  const blockingReasons: string[] = [];

  if (input.job.joiningDeadlineDays != null && input.answers.joiningTimelineDays != null) {
    if (input.answers.joiningTimelineDays <= input.job.joiningDeadlineDays) {
      matchedConstraints.push("Joining timeline is within the approved hiring window.");
    } else {
      mismatchConstraints.push("Joining timeline exceeds the approved hiring window.");
      blockingReasons.push("joining timeline");
    }
  } else {
    matchedConstraints.push("Joining timeline was not strict enough to block automatically.");
  }

  if (input.job.salaryRange?.maxAnnualBase != null && input.answers.expectedAnnualSalary != null) {
    if (input.answers.expectedAnnualSalary <= input.job.salaryRange.maxAnnualBase) {
      matchedConstraints.push("Salary expectation is within the approved range.");
    } else {
      mismatchConstraints.push("Salary expectation exceeds the approved range.");
      blockingReasons.push("salary expectation");
    }
  } else {
    matchedConstraints.push("Salary range check requires manual review or additional data.");
  }

  if (!input.job.relocationRequired || input.answers.relocationWillingness !== "no") {
    matchedConstraints.push("Relocation preference does not block progression.");
  } else {
    mismatchConstraints.push("Role requires relocation and the candidate is unwilling to relocate.");
    blockingReasons.push("relocation");
  }

  const qualified = blockingReasons.length === 0;

  return {
    qualified,
    matchedConstraints,
    mismatchConstraints,
    blockingReasons,
    summary: qualified
      ? "Candidate passes the hard qualification filters."
      : `Candidate is blocked by ${listToSentence(blockingReasons)}.`
  };
}
