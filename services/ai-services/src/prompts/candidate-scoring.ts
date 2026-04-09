export const candidateScoringWeights = {
  roleCapability: 0.3,
  thinkingBehavior: 0.25,
  impact: 0.2,
  transferability: 0.15,
  potential: 0.1
} as const;

export function buildCandidateScoringMethodologyText(): string {
  return [
    "Scoring rubric:",
    "30% role capability, 25% thinking and behavior, 20% impact, 15% transferability, 10% potential.",
    "Confidence is based on signal coverage, consistency, and evidence strength across resume and interview data."
  ].join(" ");
}
