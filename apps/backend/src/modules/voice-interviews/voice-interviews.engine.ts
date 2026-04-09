import { randomUUID } from "node:crypto";

import type {
  CompleteInterviewSessionInput,
  VoiceInterviewCategory,
  VoiceResponseScoreBreakdown,
  VoiceTranscriptTurn
} from "@ai-hiring/shared-types";

type ConversationQuestion = {
  id: string;
  text: string;
  category: VoiceInterviewCategory;
  isFollowUp: boolean;
  linkedQuestionId?: string | null;
};

type AnswerEvaluation = {
  questionId: string;
  question: string;
  answer: string;
  category: VoiceInterviewCategory;
  askedAsFollowUp: boolean;
  evaluationScore: number;
  rationale: string;
  scoreBreakdown: VoiceResponseScoreBreakdown;
};

export type VoiceConversationState = {
  conversationId: string;
  interviewSessionId: string | null;
  applicationId: string | null;
  questions: ConversationQuestion[];
  askedQuestionIds: string[];
  pendingQuestionId: string | null;
  completed: boolean;
  turns: VoiceTranscriptTurn[];
  answers: AnswerEvaluation[];
};

export type VoiceConversationResponse = {
  conversationId: string;
  interviewSessionId: string | null;
  completed: boolean;
  status: string;
  currentPrompt: string | null;
  turns: VoiceTranscriptTurn[];
  latestTranscript: string | null;
  evaluation: VoiceConversationEvaluation | null;
};

export type VoiceConversationEvaluation = {
  communicationClarity: number;
  technicalDepth: number;
  problemSolvingStructure: number;
  businessUnderstanding: number;
  overallScore: number;
  communicationScore: number;
  knowledgeScore: number;
  confidenceScore: number;
  summary: string;
  responseEvaluations: AnswerEvaluation[];
};

const orderedCategories: VoiceInterviewCategory[] = [
  "experience_validation",
  "skill_depth_validation",
  "problem_solving_scenario",
  "role_simulation",
  "behavioral_question"
];

const defaultQuestions: Record<VoiceInterviewCategory, string> = {
  experience_validation:
    "To get started, tell me about the experience that best prepared you for this role and the impact you created.",
  skill_depth_validation:
    "Walk me through the skill or capability you rely on most in this domain and how you apply it in practice.",
  problem_solving_scenario:
    "Describe a complex problem you solved recently. How did you frame it, decide on a path, and measure the result?",
  role_simulation:
    "Imagine you joined this team next week. What would you do in your first 30 days to create momentum?",
  behavioral_question:
    "Tell me about a time you had to align people with competing priorities. What did you do and what happened?"
};

const followUpPrompts: Record<
  VoiceInterviewCategory,
  {
    lowDepth: string;
    lowStructure: string;
    lowBusiness: string;
  }
> = {
  experience_validation: {
    lowDepth:
      "Can you make that more concrete by sharing the exact scope you owned, the decisions you made, and what changed because of your work?",
    lowStructure:
      "Walk me through that experience step by step so I can understand your role, actions, and result.",
    lowBusiness:
      "What business outcome did that work influence, and how did you know it mattered?"
  },
  skill_depth_validation: {
    lowDepth:
      "Go one level deeper on the methods, tools, or frameworks you used so I can understand your actual depth here.",
    lowStructure:
      "Can you break that down into how you approach the work from diagnosis through execution?",
    lowBusiness:
      "How does that skill translate into measurable value for the team or the business?"
  },
  problem_solving_scenario: {
    lowDepth:
      "What were the hardest technical or analytical tradeoffs inside that problem, and how did you resolve them?",
    lowStructure:
      "Please structure that answer as situation, diagnosis, options considered, action taken, and measurable outcome.",
    lowBusiness:
      "Which business metric or user outcome improved because of that solution?"
  },
  role_simulation: {
    lowDepth:
      "What specific workstreams, tools, or decisions would you prioritize first, and why those over other options?",
    lowStructure:
      "Can you organize your answer into first week, first month, and how you would measure progress?",
    lowBusiness:
      "What signals would tell you the business is getting value from that plan?"
  },
  behavioral_question: {
    lowDepth:
      "What exactly did you say or do to move that situation forward, and how did others respond?",
    lowStructure:
      "Please walk me through the context, the tension, your action, and the final outcome.",
    lowBusiness:
      "What team or business outcome improved because you handled it that way?"
  }
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function createTurn(
  role: VoiceTranscriptTurn["role"],
  kind: VoiceTranscriptTurn["kind"],
  text: string,
  category?: VoiceInterviewCategory | null,
  linkedQuestionId?: string | null,
  scores?: VoiceResponseScoreBreakdown | null
): VoiceTranscriptTurn {
  return {
    id: randomUUID(),
    role,
    kind,
    text,
    category: category ?? null,
    linkedQuestionId: linkedQuestionId ?? null,
    scores: scores ?? null,
    createdAt: new Date().toISOString()
  };
}

function inferCategory(seedIndex: number): VoiceInterviewCategory {
  return orderedCategories[Math.min(seedIndex, orderedCategories.length - 1)];
}

export function buildConversationQuestions(seedQuestions: string[]) {
  const questions: ConversationQuestion[] = [];
  const usedCategories = new Set<VoiceInterviewCategory>();

  seedQuestions
    .filter((question) => question.trim().length > 0)
    .slice(0, 6)
    .forEach((question, index) => {
      const category = inferCategory(index);
      usedCategories.add(category);
      questions.push({
        id: randomUUID(),
        text: question.trim(),
        category,
        isFollowUp: false
      });
    });

  for (const category of orderedCategories) {
    if (questions.length >= 5) {
      break;
    }

    if (!usedCategories.has(category)) {
      questions.push({
        id: randomUUID(),
        text: defaultQuestions[category],
        category,
        isFollowUp: false
      });
      usedCategories.add(category);
    }
  }

  if (questions.length === 0) {
    for (const category of orderedCategories) {
      questions.push({
        id: randomUUID(),
        text: defaultQuestions[category],
        category,
        isFollowUp: false
      });
    }
  }

  return questions.slice(0, 6);
}

export function startConversation(input: {
  interviewSessionId?: string | null;
  applicationId?: string | null;
  seedQuestions: string[];
}): {
  state: VoiceConversationState;
  response: VoiceConversationResponse;
} {
  const questions = buildConversationQuestions(input.seedQuestions);
  const firstQuestion = questions[0] ?? null;

  const turns: VoiceTranscriptTurn[] = firstQuestion
    ? [
        createTurn("assistant", "question", firstQuestion.text, firstQuestion.category, firstQuestion.id)
      ]
    : [];

  const state: VoiceConversationState = {
    conversationId: randomUUID(),
    interviewSessionId: input.interviewSessionId ?? null,
    applicationId: input.applicationId ?? null,
    questions,
    askedQuestionIds: firstQuestion ? [firstQuestion.id] : [],
    pendingQuestionId: firstQuestion?.id ?? null,
    completed: false,
    turns,
    answers: []
  };

  return {
    state,
    response: {
      conversationId: state.conversationId,
      interviewSessionId: state.interviewSessionId,
      completed: false,
      status: "Prompt ready",
      currentPrompt: firstQuestion?.text ?? null,
      turns,
      latestTranscript: null,
      evaluation: null
    }
  };
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function keywordOverlap(question: string, answer: string) {
  const questionTokens = new Set(tokenize(question));
  const answerTokens = tokenize(answer);

  if (questionTokens.size === 0 || answerTokens.length === 0) {
    return 0;
  }

  const overlap = answerTokens.filter((token) => questionTokens.has(token)).length;
  return overlap / Math.max(1, Math.min(questionTokens.size, answerTokens.length));
}

function evaluateAnswer(question: ConversationQuestion, answer: string): AnswerEvaluation {
  const normalized = answer.trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = normalized.toLowerCase();
  const sentenceCount = normalized
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;

  const structureMarkers = [
    "first",
    "second",
    "then",
    "next",
    "finally",
    "because",
    "therefore",
    "so that",
    "result",
    "outcome"
  ].filter((token) => lower.includes(token)).length;
  const businessMarkers = [
    "revenue",
    "customer",
    "pipeline",
    "margin",
    "conversion",
    "metric",
    "efficiency",
    "growth",
    "retention",
    "cost"
  ].filter((token) => lower.includes(token)).length;
  const technicalMarkers = [
    "analysis",
    "experiment",
    "model",
    "system",
    "process",
    "framework",
    "sql",
    "api",
    "data",
    "automation"
  ].filter((token) => lower.includes(token)).length;
  const numericMarkers = (normalized.match(/\d+/g) ?? []).length;
  const fillerMarkers = ["basically", "kind of", "sort of", "maybe", "i guess"].filter((token) =>
    lower.includes(token)
  ).length;
  const overlap = keywordOverlap(question.text, normalized);

  const communicationClarity = clamp(
    48 +
      Math.min(22, wordCount / 3) +
      Math.min(12, sentenceCount * 3) +
      overlap * 14 -
      fillerMarkers * 4
  );

  const technicalDepth = clamp(
    42 +
      technicalMarkers * 8 +
      numericMarkers * 3 +
      overlap * 18 +
      Math.min(14, wordCount / 8)
  );

  const problemSolvingStructure = clamp(
    40 + structureMarkers * 10 + Math.min(16, sentenceCount * 2) + numericMarkers * 2
  );

  const businessUnderstanding = clamp(
    40 + businessMarkers * 9 + overlap * 14 + numericMarkers * 2
  );

  const evaluationScore = average([
    communicationClarity,
    technicalDepth,
    problemSolvingStructure,
    businessUnderstanding
  ]);

  const weaknessSummary: string[] = [];
  if (technicalDepth < 60) {
    weaknessSummary.push("more concrete depth would strengthen the evidence");
  }
  if (problemSolvingStructure < 60) {
    weaknessSummary.push("the answer could be structured more clearly");
  }
  if (businessUnderstanding < 60) {
    weaknessSummary.push("the business outcome was not fully connected");
  }

  return {
    questionId: question.id,
    question: question.text,
    answer: normalized,
    category: question.category,
    askedAsFollowUp: question.isFollowUp,
    evaluationScore,
    rationale:
      weaknessSummary.length === 0
        ? "Clear answer with enough specificity and a visible link to business impact."
        : `Solid baseline signal, but ${weaknessSummary.join("; ")}.`,
    scoreBreakdown: {
      communicationClarity,
      technicalDepth,
      problemSolvingStructure,
      businessUnderstanding
    }
  };
}

function buildFollowUpQuestion(question: ConversationQuestion, evaluation: AnswerEvaluation) {
  const prompts = followUpPrompts[question.category];

  let text = prompts.lowDepth;
  if (evaluation.scoreBreakdown.problemSolvingStructure <= evaluation.scoreBreakdown.technicalDepth) {
    text = prompts.lowStructure;
  }
  if (
    evaluation.scoreBreakdown.businessUnderstanding <
    Math.min(
      evaluation.scoreBreakdown.problemSolvingStructure,
      evaluation.scoreBreakdown.technicalDepth
    )
  ) {
    text = prompts.lowBusiness;
  }

  return {
    id: randomUUID(),
    text,
    category: question.category,
    isFollowUp: true,
    linkedQuestionId: question.id
  } satisfies ConversationQuestion;
}

function shouldAskFollowUp(state: VoiceConversationState, evaluation: AnswerEvaluation) {
  const alreadyAskedForCurrentQuestion = state.questions.some(
    (question) =>
      question.isFollowUp && question.linkedQuestionId === evaluation.questionId
  );
  const followUpBudget = state.questions.filter((question) => question.isFollowUp).length;

  if (alreadyAskedForCurrentQuestion || followUpBudget >= 1 || state.questions.length >= 6) {
    return false;
  }

  return (
    evaluation.scoreBreakdown.technicalDepth < 58 ||
    evaluation.scoreBreakdown.problemSolvingStructure < 58 ||
    evaluation.scoreBreakdown.businessUnderstanding < 58 ||
    evaluation.answer.split(/\s+/).filter(Boolean).length < 35
  );
}

function nextUnaskedQuestion(state: VoiceConversationState) {
  return (
    state.questions.find((question) => !state.askedQuestionIds.includes(question.id)) ?? null
  );
}

export function summarizeEvaluation(answers: AnswerEvaluation[]): VoiceConversationEvaluation {
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
  const overallScore = average([
    communicationClarity,
    technicalDepth,
    problemSolvingStructure,
    businessUnderstanding
  ]);

  return {
    communicationClarity,
    technicalDepth,
    problemSolvingStructure,
    businessUnderstanding,
    overallScore,
    communicationScore: communicationClarity,
    knowledgeScore: average([technicalDepth, businessUnderstanding]),
    confidenceScore: average([problemSolvingStructure, communicationClarity]),
    summary:
      overallScore >= 80
        ? "The candidate communicated clearly, demonstrated credible depth, and linked their thinking to business outcomes with strong structure."
        : overallScore >= 65
          ? "The interview shows workable signal with some gaps in depth or structure that a hiring manager should probe in a live round."
          : "The conversation surfaced limited evidence across depth, structure, and business understanding. Additional validation would be needed before advancing.",
    responseEvaluations: answers
  };
}

export function buildTranscriptText(turns: VoiceTranscriptTurn[]) {
  return turns.map((turn) => `${turn.role.toUpperCase()}: ${turn.text}`).join("\n\n");
}

export function buildCompletionInput(
  state: VoiceConversationState
): CompleteInterviewSessionInput {
  const evaluation = summarizeEvaluation(state.answers);

  return {
    communicationScore: evaluation.communicationScore,
    knowledgeScore: evaluation.knowledgeScore,
    confidenceScore: evaluation.confidenceScore,
    summary: evaluation.summary,
    transcript: buildTranscriptText(state.turns),
    voiceTranscript: state.turns,
    items: state.answers.map((answer) => ({
      question: answer.question,
      answer: answer.answer,
      evaluationScore: answer.evaluationScore,
      category: answer.category,
      askedAsFollowUp: answer.askedAsFollowUp,
      rationale: answer.rationale,
      scoreBreakdown: answer.scoreBreakdown
    }))
  };
}

export function recordCandidateResponse(
  state: VoiceConversationState,
  transcript: string
): VoiceConversationResponse {
  const pendingQuestion = state.questions.find(
    (question) => question.id === state.pendingQuestionId
  );

  if (!pendingQuestion) {
    throw new Error("No pending interview question found for this conversation.");
  }

  const evaluation = evaluateAnswer(pendingQuestion, transcript);
  state.answers.push(evaluation);
  state.turns.push(
    createTurn(
      "candidate",
      "response",
      evaluation.answer,
      pendingQuestion.category,
      pendingQuestion.id,
      evaluation.scoreBreakdown
    )
  );

  let nextQuestion: ConversationQuestion | null = null;
  if (shouldAskFollowUp(state, evaluation)) {
    nextQuestion = buildFollowUpQuestion(pendingQuestion, evaluation);
    state.questions.push(nextQuestion);
  } else {
    nextQuestion = nextUnaskedQuestion(state);
  }

  if (!nextQuestion) {
    state.completed = true;
    state.pendingQuestionId = null;
    const closing =
      "Thanks, that completes the interview. We'll compile your responses and share the evaluation with the hiring team.";
    state.turns.push(createTurn("assistant", "closing", closing));

    return {
      conversationId: state.conversationId,
      interviewSessionId: state.interviewSessionId,
      completed: true,
      status: "Interview completed",
      currentPrompt: null,
      turns: state.turns,
      latestTranscript: evaluation.answer,
      evaluation: summarizeEvaluation(state.answers)
    };
  }

  state.pendingQuestionId = nextQuestion.id;
  state.askedQuestionIds.push(nextQuestion.id);
  state.turns.push(
    createTurn(
      "assistant",
      nextQuestion.isFollowUp ? "follow_up" : "question",
      nextQuestion.text,
      nextQuestion.category,
      nextQuestion.id
    )
  );

  return {
    conversationId: state.conversationId,
    interviewSessionId: state.interviewSessionId,
    completed: false,
    status: nextQuestion.isFollowUp ? "Follow-up question ready" : "Next question ready",
    currentPrompt: nextQuestion.text,
    turns: state.turns,
    latestTranscript: evaluation.answer,
    evaluation: null
  };
}
