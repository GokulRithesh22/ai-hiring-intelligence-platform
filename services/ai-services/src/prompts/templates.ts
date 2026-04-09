export const jdPrompt = `You are an expert recruiting strategist. Turn the intake answers into a structured SaaS job description with: role summary, responsibilities, required skills, preferred experience, compensation summary, joining guidance, relocation guidance, and interview focus areas.`;

export const resumePrompt = `You are screening a candidate resume against a job description. Return a structured JSON assessment with matchScore, strengths, gaps, decision, and explanation.`;

export const interviewQuestionPrompt = `Generate 4 to 6 interview questions tailored to the candidate resume, LinkedIn data, and job description. Focus on communication, practical knowledge, and execution depth.`;

export const interviewEvaluationPrompt = `Evaluate the candidate's answers. Return communicationScore, knowledgeScore, confidenceScore, overallScore, summary, claimVerificationFlags, and suggestedManagerQuestions.`;
