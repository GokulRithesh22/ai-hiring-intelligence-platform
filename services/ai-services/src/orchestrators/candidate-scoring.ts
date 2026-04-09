import {
  candidateScoringInputSchema,
  candidateScoringResultSchema,
  type CandidateScoreComponent,
  type CandidateScoringInput,
  type CandidateScoringResult,
  type ScoreEvidenceItem
} from "../domain/contracts.js";
import {
  buildCandidateScoringMethodologyText,
  candidateScoringWeights
} from "../prompts/candidate-scoring.js";
import { clampScore, normalizeWhitespace } from "../utils/prompt.js";

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, Math.round(value * 1000) / 1000));
}

function average(values: number[]): number {
  const valid = values.filter((value) => Number.isFinite(value));
  if (valid.length === 0) {
    return 0;
  }

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function unique(items: Array<string | undefined | null>): string[] {
  return [...new Set(items.map((item) => normalizeWhitespace(item ?? "")).filter(Boolean))];
}

function ratio(part: number, total: number): number {
  if (total <= 0) {
    return 1;
  }

  return Math.max(0, Math.min(1, part / total));
}

function quantifiedEvidenceCount(text: string): number {
  const matches = text.match(/(?:\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b|\$\s?\d+(?:,\d{3})*|\b\d+\s?(?:million|k|percent|days|weeks|months|years)\b)/gi);
  return matches?.length ?? 0;
}

function keywordHits(text: string, keywords: string[]): number {
  const lowered = text.toLowerCase();
  return keywords.filter((keyword) => lowered.includes(keyword.toLowerCase())).length;
}

function buildEvidence(source: ScoreEvidenceItem["source"], signal: string, excerpt: string): ScoreEvidenceItem {
  return {
    source,
    signal,
    excerpt: normalizeWhitespace(excerpt).slice(0, 220)
  };
}

function extractAnswerEvidence(text: string): string[] {
  const normalized = normalizeWhitespace(text);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((snippet) => snippet.slice(0, 180));
}

function buildComponent(score: number, rationale: string, evidence: ScoreEvidenceItem[]): CandidateScoreComponent {
  return {
    score: clampScore(score),
    rationale,
    evidence: evidence.slice(0, 4)
  };
}

export function scoreCandidate(input: CandidateScoringInput): CandidateScoringResult {
  const validated = candidateScoringInputSchema.parse(input);
  const methodology = buildCandidateScoringMethodologyText();

  const resume = validated.structuredResumeAnalysis;
  const job = validated.structuredJobAnalysis;
  const screening = validated.screening;
  const interview = validated.interview;

  const resumeSkills = unique([...resume.skills, ...resume.toolsUsed]);
  const jobSkills = unique([...job.requiredSkills, ...job.toolsRequired]);
  const matchedSkills = jobSkills.filter((skill) =>
    resumeSkills.some((resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase())
  );
  const preferredCoverage = ratio(
    job.preferredSkills.filter((skill) =>
      resumeSkills.some((resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase())
    ).length,
    Math.max(job.preferredSkills.length, 1)
  );
  const experienceAlignment =
    job.requiredExperience > 0
      ? clampScore(100 - Math.max(0, job.requiredExperience - resume.experienceYears) * 12)
      : 70;
  const quantifiedResumeText = unique([
    ...resume.achievements,
    validated.resumeText ?? ""
  ]).join(" ");
  const quantifiedAchievementScore = clampScore(
    45 + Math.min(45, quantifiedEvidenceCount(quantifiedResumeText) * 12)
  );
  const crossFunctionalHits = keywordHits(
    [...resume.roles, ...resume.achievements].join(" "),
    ["cross-functional", "stakeholder", "partnered", "collaborated", "product", "sales", "engineering", "operations"]
  );
  const leadershipHits = keywordHits(
    [...resume.roles, ...resume.achievements, validated.resumeText ?? ""].join(" "),
    ["led", "managed", "mentored", "owned", "launched", "built", "hired", "coached", "promoted"]
  );
  const adaptabilityHits = keywordHits(
    [...resume.roles, ...resume.achievements, validated.resumeText ?? ""].join(" "),
    ["adapted", "pivoted", "learned", "new", "greenfield", "scaled", "expanded", "transitioned"]
  );

  const interviewAnswerAverage = interview
    ? average(interview.answerEvaluations.map((item) => item.score))
    : 0;
  const interviewEvidence = interview
    ? interview.questionAnswerPairs.flatMap((pair) =>
        extractAnswerEvidence(pair.answer).map((excerpt) =>
          buildEvidence("INTERVIEW", "Interview transcript", excerpt)
        )
      )
    : [];

  const roleCapability = buildComponent(
    screening.finalScore * 0.45 +
      screening.skillsMatch * 0.2 +
      screening.experienceMatch * 0.15 +
      experienceAlignment * 0.05 +
      (interview?.knowledgeScore ?? screening.domainMatch) * 0.15,
    interview
      ? "Role capability combines semantic resume alignment with interview validation of skill depth and experience fit."
      : "Role capability is based primarily on semantic resume screening and structured experience alignment because interview validation is not yet available.",
    [
      buildEvidence(
        "SCREENING",
        "Semantic resume-vs-job match",
        `Screening score ${screening.finalScore}, skills ${screening.skillsMatch}, experience ${screening.experienceMatch}.`
      ),
      ...matchedSkills.slice(0, 2).map((skill) =>
        buildEvidence("RESUME", "Matched role skill", skill)
      ),
      ...(interview
        ? [
            buildEvidence(
              "INTERVIEW",
              "Interview knowledge validation",
              `Knowledge ${interview.knowledgeScore}, answer average ${clampScore(interviewAnswerAverage)}.`
            )
          ]
        : [])
    ]
  );

  const thinkingBehaviorBase = interview
    ? interview.communicationScore * 0.4 +
      interview.confidenceScore * 0.2 +
      interviewAnswerAverage * 0.25 +
      Math.min(100, 40 + interviewEvidence.length * 10) * 0.15
    : 48 + screening.domainMatch * 0.12;
  const thinkingBehavior = buildComponent(
    thinkingBehaviorBase,
    interview
      ? "Thinking and behavior are inferred from transcript clarity, structured reasoning, and confidence under questioning."
      : "Thinking and behavior remains provisional until an interview transcript is available.",
    interview
      ? [
          buildEvidence(
            "INTERVIEW",
            "Communication and reasoning signal",
            `Communication ${interview.communicationScore}, confidence ${interview.confidenceScore}.`
          ),
          ...interviewEvidence.slice(0, 3)
        ]
      : [
          buildEvidence(
            "SYSTEM",
            "Pending interview evidence",
            "Behavioral and reasoning signal will strengthen after interview completion."
          )
        ]
  );

  const impact = buildComponent(
    screening.achievementsMatch * 0.5 +
      quantifiedAchievementScore * 0.35 +
      (interview?.knowledgeScore ?? screening.finalScore) * 0.15,
    "Impact emphasizes quantified resume outcomes, achievement density, and whether the candidate can explain the business result behind their work.",
    [
      buildEvidence(
        "SCREENING",
        "Achievement match from screening",
        `Achievements match ${screening.achievementsMatch}.`
      ),
      ...resume.achievements.slice(0, 2).map((achievement) =>
        buildEvidence("RESUME", "Resume achievement", achievement)
      ),
      ...(interview
        ? [
            buildEvidence(
              "INTERVIEW",
              "Interview impact validation",
              `Interview knowledge score ${interview.knowledgeScore}.`
            )
          ]
        : [])
    ]
  );

  const breadthScore = clampScore(
    45 +
      Math.min(25, resume.roles.length * 6) +
      Math.min(15, resume.industries.length * 7) +
      Math.min(15, crossFunctionalHits * 6)
  );
  const transferability = buildComponent(
    breadthScore * 0.35 +
      screening.domainMatch * 0.25 +
      clampScore(preferredCoverage * 100) * 0.15 +
      Math.min(100, 45 + crossFunctionalHits * 10) * 0.25,
    "Transferability reflects cross-functional range, industry breadth, and the candidate's ability to carry adjacent experience into this role.",
    [
      buildEvidence(
        "RESUME",
        "Breadth of roles and industries",
        `Roles ${resume.roles.length}, industries ${resume.industries.length}, cross-functional hits ${crossFunctionalHits}.`
      ),
      ...resume.roles.slice(0, 2).map((role) =>
        buildEvidence("RESUME", "Transferable role experience", role)
      ),
      buildEvidence(
        "SCREENING",
        "Domain transfer signal",
        `Domain match ${screening.domainMatch}.`
      )
    ]
  );

  const progressionScore = clampScore(
    40 +
      Math.min(20, resume.roles.length * 8) +
      Math.min(20, leadershipHits * 6) +
      Math.min(20, adaptabilityHits * 6)
  );
  const potential = buildComponent(
    progressionScore * 0.45 +
      Math.min(100, 45 + adaptabilityHits * 10) * 0.2 +
      Math.min(100, 45 + leadershipHits * 9) * 0.2 +
      (interview?.confidenceScore ?? 55) * 0.15,
    "Potential is driven by progression, leadership indicators, and evidence that the candidate adapts and scales beyond current scope.",
    [
      buildEvidence(
        "RESUME",
        "Progression and leadership indicators",
        `Roles ${resume.roles.length}, leadership hits ${leadershipHits}, adaptability hits ${adaptabilityHits}.`
      ),
      ...resume.roles.slice(0, 2).map((role) =>
        buildEvidence("RESUME", "Career progression signal", role)
      ),
      ...(interview
        ? [
            buildEvidence(
              "INTERVIEW",
              "Confidence under interview conditions",
              `Confidence ${interview.confidenceScore}.`
            )
          ]
        : [])
    ]
  );

  const finalScore = clampScore(
    roleCapability.score * candidateScoringWeights.roleCapability +
      thinkingBehavior.score * candidateScoringWeights.thinkingBehavior +
      impact.score * candidateScoringWeights.impact +
      transferability.score * candidateScoringWeights.transferability +
      potential.score * candidateScoringWeights.potential
  );

  const coreSignals = [
    screening.finalScore,
    roleCapability.score,
    impact.score,
    interview?.overallScore ?? screening.finalScore
  ];
  const mean = average(coreSignals);
  const variance =
    coreSignals.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(coreSignals.length, 1);
  const consistency = Math.max(0, 1 - Math.sqrt(variance) / 40);
  const coverage = average([
    1,
    interview ? 1 : 0.45,
    quantifiedAchievementScore > 60 ? 1 : 0.7,
    matchedSkills.length > 0 || jobSkills.length === 0 ? 1 : 0.65
  ]);
  const signalStrength = average([finalScore / 100, screening.finalScore / 100, (interview?.overallScore ?? finalScore) / 100]);
  const confidenceScore = clampConfidence(coverage * 0.4 + consistency * 0.35 + signalStrength * 0.25);
  const confidenceInterpretation =
    confidenceScore >= 0.8
      ? "High confidence: resume and interview signals are strong and consistent."
      : confidenceScore >= 0.6
        ? "Moderate confidence: evidence is directionally useful but still has some uncertainty."
        : "Low confidence: the score is based on partial or inconsistent evidence and should be treated as provisional.";

  const recommendation =
    finalScore >= 80 && confidenceScore >= 0.65
      ? "advance"
      : finalScore >= 68
        ? "hold"
        : "reject";

  const strongestComponent = ([
    ["role capability", roleCapability.score],
    ["thinking and behavior", thinkingBehavior.score],
    ["impact", impact.score],
    ["transferability", transferability.score],
    ["potential", potential.score]
  ] as Array<[string, number]>).sort((left, right) => right[1] - left[1])[0];

  const weakestComponent = ([
    ["role capability", roleCapability.score],
    ["thinking and behavior", thinkingBehavior.score],
    ["impact", impact.score],
    ["transferability", transferability.score],
    ["potential", potential.score]
  ] as Array<[string, number]>).sort((left, right) => left[1] - right[1])[0];

  const evidenceSummary = unique([
    ...roleCapability.evidence.map((item) => item.excerpt),
    ...thinkingBehavior.evidence.map((item) => item.excerpt),
    ...impact.evidence.map((item) => item.excerpt),
    ...transferability.evidence.map((item) => item.excerpt),
    ...potential.evidence.map((item) => item.excerpt),
    ...screening.strengths
  ]).slice(0, 8);

  return candidateScoringResultSchema.parse({
    roleCapability,
    thinkingBehavior,
    impact,
    transferability,
    potential,
    finalScore,
    confidenceScore,
    confidenceInterpretation,
    summary: `${validated.jobTitle} score ${finalScore}. Strongest signal: ${strongestComponent?.[0] ?? "overall alignment"} (${strongestComponent?.[1] ?? finalScore}). Lowest signal: ${weakestComponent?.[0] ?? "none"} (${weakestComponent?.[1] ?? finalScore}). ${methodology}`,
    recommendation,
    evidenceSummary
  });
}
