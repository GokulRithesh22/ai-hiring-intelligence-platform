import { query } from "@ai-hiring/database";
import type {
  CompleteInterviewSessionInput,
  InterviewQuestionAnswer,
  InterviewSession,
  VoiceInterviewTranscriptDocument
} from "@ai-hiring/shared-types";

import { toNumber } from "../../lib/validation";

interface SessionRow {
  id: string;
  application_id: string;
  status: InterviewSession["status"];
  started_at: Date | null;
  completed_at: Date | null;
  communication_score: string | null;
  knowledge_score: string | null;
  confidence_score: string | null;
  overall_score?: string | null;
  summary: string | null;
  transcript: string | null;
  created_at: Date;
  updated_at: Date;
}

interface ItemRow {
  id: string;
  session_id: string;
  question: string;
  answer: string;
  evaluation_score: string;
  created_at: Date;
}

function parseStructuredTranscript(
  transcript: string | null
): VoiceInterviewTranscriptDocument | null {
  if (!transcript) {
    return null;
  }

  try {
    const parsed = JSON.parse(transcript) as Partial<VoiceInterviewTranscriptDocument>;

    if (
      parsed &&
      parsed.format === "voice_interview_v1" &&
      Array.isArray(parsed.items) &&
      Array.isArray(parsed.turns) &&
      typeof parsed.transcriptText === "string"
    ) {
      return parsed as VoiceInterviewTranscriptDocument;
    }
  } catch {
    return null;
  }

  return null;
}

function serializeTranscript(input: CompleteInterviewSessionInput): string {
  const hasVoiceMetadata =
    Boolean(input.voiceTranscript?.length) ||
    input.items.some(
      (item) =>
        item.category ||
        item.askedAsFollowUp ||
        item.rationale ||
        item.scoreBreakdown
    );

  if (!hasVoiceMetadata) {
    return input.transcript;
  }

  const document: VoiceInterviewTranscriptDocument = {
    format: "voice_interview_v1",
    transcriptText: input.transcript,
    turns: input.voiceTranscript ?? [],
    items: input.items.map((item) => ({
      question: item.question,
      answer: item.answer,
      evaluationScore: item.evaluationScore,
      category: item.category ?? null,
      askedAsFollowUp: item.askedAsFollowUp ?? false,
      rationale: item.rationale ?? null,
      scoreBreakdown: item.scoreBreakdown ?? null
    }))
  };

  return JSON.stringify(document);
}

function mapItem(
  row: ItemRow,
  metadata?: VoiceInterviewTranscriptDocument["items"][number]
): InterviewQuestionAnswer {
  return {
    id: row.id,
    sessionId: row.session_id,
    question: row.question,
    answer: row.answer,
    evaluationScore: Number(row.evaluation_score),
    category: metadata?.category ?? null,
    askedAsFollowUp: metadata?.askedAsFollowUp ?? false,
    rationale: metadata?.rationale ?? null,
    scoreBreakdown: metadata?.scoreBreakdown ?? null,
    createdAt: row.created_at.toISOString()
  };
}

function mapSession(row: SessionRow, items?: InterviewQuestionAnswer[]): InterviewSession {
  const structuredTranscript = parseStructuredTranscript(row.transcript);

  return {
    id: row.id,
    applicationId: row.application_id,
    status: row.status,
    startedAt: row.started_at?.toISOString() ?? null,
    completedAt: row.completed_at?.toISOString() ?? null,
    communicationScore: toNumber(row.communication_score),
    knowledgeScore: toNumber(row.knowledge_score),
    confidenceScore: toNumber(row.confidence_score),
    overallScore: toNumber(row.overall_score),
    summary: row.summary,
    transcript: structuredTranscript?.transcriptText ?? row.transcript,
    structuredTranscript,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    items
  };
}

export class InterviewSessionsRepository {
  async create(applicationId: string, questions: string[]) {
    const sessionResult = await query<SessionRow>(
      `
        INSERT INTO interview_sessions (application_id, status, started_at)
        VALUES ($1, 'IN_PROGRESS', NOW())
        ON CONFLICT (application_id)
        DO UPDATE SET status = 'IN_PROGRESS', started_at = NOW(), updated_at = NOW()
        RETURNING *
      `,
      [applicationId]
    );

    const session = sessionResult.rows[0];
    await query("DELETE FROM interview_items WHERE session_id = $1", [session.id]);

    for (const question of questions) {
      await query(
        `
          INSERT INTO interview_items (session_id, question, answer, evaluation_score)
          VALUES ($1, $2, '', 0)
        `,
        [session.id, question]
      );
    }

    return this.findById(session.id);
  }

  async findById(sessionId: string): Promise<InterviewSession | null> {
    const sessionResult = await query<SessionRow>(
      "SELECT * FROM interview_sessions WHERE id = $1 LIMIT 1",
      [sessionId]
    );

    const session = sessionResult.rows[0];
    if (!session) {
      return null;
    }

    const itemsResult = await query<ItemRow>(
      "SELECT * FROM interview_items WHERE session_id = $1 ORDER BY created_at ASC",
      [sessionId]
    );

    const structuredTranscript = parseStructuredTranscript(session.transcript);

    return mapSession(
      session,
      itemsResult.rows.map((row, index) => mapItem(row, structuredTranscript?.items[index]))
    );
  }

  async findByApplicationId(applicationId: string): Promise<InterviewSession | null> {
    const sessionResult = await query<SessionRow>(
      "SELECT * FROM interview_sessions WHERE application_id = $1 LIMIT 1",
      [applicationId]
    );

    const session = sessionResult.rows[0];
    if (!session) {
      return null;
    }

    return this.findById(session.id);
  }

  async complete(sessionId: string, input: CompleteInterviewSessionInput) {
    const transcriptPayload = serializeTranscript(input);
    const result = await query<SessionRow>(
      `
        UPDATE interview_sessions
        SET status = 'COMPLETED',
            completed_at = NOW(),
            communication_score = $2,
            knowledge_score = $3,
            confidence_score = $4,
            overall_score = $5,
            summary = $6,
            transcript = $7,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        sessionId,
        input.communicationScore,
        input.knowledgeScore,
        input.confidenceScore,
        Math.round((input.communicationScore + input.knowledgeScore + input.confidenceScore) / 3),
        input.summary,
        transcriptPayload
      ]
    );

    await query("DELETE FROM interview_items WHERE session_id = $1", [sessionId]);
    for (const item of input.items) {
      await query(
        `
          INSERT INTO interview_items (session_id, question, answer, evaluation_score)
          VALUES ($1, $2, $3, $4)
        `,
        [sessionId, item.question, item.answer, item.evaluationScore]
      );
    }

    return this.findById(result.rows[0].id);
  }
}

export const interviewSessionsRepository = new InterviewSessionsRepository();
