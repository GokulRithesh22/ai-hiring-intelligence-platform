import { evaluateInterview } from "@ai-hiring/ai-services";

import { ApiError } from "../../lib/http";
import { env } from "../../config/env";
import { applicationsService } from "../applications/applications.service";
import { interviewSessionsService } from "../interview-sessions/interview-sessions.service";
import { interviewSessionsRepository } from "../interview-sessions/interview-sessions.repository";
import {
  buildCompletionInput,
  recordCandidateResponse,
  startConversation,
  type VoiceConversationResponse,
  type VoiceConversationState
} from "./voice-interviews.engine";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

async function readAudioBuffer(response: Response): Promise<Buffer> {
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export class VoiceInterviewsService {
  private readonly conversations = new Map<string, VoiceConversationState>();

  getConfig() {
    return {
      enabled: Boolean(env.ELEVENLABS_API_KEY),
      voiceId: env.ELEVENLABS_VOICE_ID ?? null,
      ttsModelId: env.ELEVENLABS_TTS_MODEL_ID,
      sttModelId: env.ELEVENLABS_STT_MODEL_ID
    };
  }

  async beginConversation(input: {
    questions?: string[];
    interviewSessionId?: string | null;
    applicationId?: string | null;
  }): Promise<VoiceConversationResponse> {
    let interviewSessionId = input.interviewSessionId ?? null;
    let seedQuestions = (input.questions ?? []).filter((question) => question.trim().length > 0);

    if (interviewSessionId) {
      const interviewSession = await interviewSessionsService.getSession(interviewSessionId);
      seedQuestions =
        interviewSession.items?.map((item) => item.question).filter((question) => question.length > 0) ??
        seedQuestions;
    } else if (input.applicationId) {
      const existingInterviewSession = await interviewSessionsRepository.findByApplicationId(
        input.applicationId
      );

      const interviewSession =
        existingInterviewSession?.items?.length
          ? existingInterviewSession
          : await applicationsService.startInterview(input.applicationId);

      interviewSessionId = interviewSession?.id ?? null;
      seedQuestions =
        interviewSession?.items
          ?.map((item) => item.question)
          .filter((question) => question.length > 0) ?? seedQuestions;
    }

    const { state, response } = startConversation({
      interviewSessionId,
      applicationId: input.applicationId ?? null,
      seedQuestions
    });

    this.conversations.set(state.conversationId, state);
    return response;
  }

  private ensureEnabled() {
    if (!env.ELEVENLABS_API_KEY) {
      throw new ApiError(503, "ElevenLabs is not configured");
    }
  }

  async synthesize(text: string, voiceId?: string | null) {
    this.ensureEnabled();

    const targetVoiceId = voiceId ?? env.ELEVENLABS_VOICE_ID;
    if (!targetVoiceId) {
      throw new ApiError(400, "No ElevenLabs voice configured");
    }

    const response = await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${targetVoiceId}?output_format=${encodeURIComponent(
        env.ELEVENLABS_OUTPUT_FORMAT
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": env.ELEVENLABS_API_KEY as string
        } as Record<string, string>,
        body: JSON.stringify({
          text,
          model_id: env.ELEVENLABS_TTS_MODEL_ID
        })
      }
    );

    if (!response.ok) {
      throw new ApiError(502, "ElevenLabs text-to-speech failed");
    }

    return {
      contentType: response.headers.get("content-type") ?? "audio/mpeg",
      buffer: await readAudioBuffer(response)
    };
  }

  async transcribe(input: {
    audioBase64: string;
    mimeType: string;
    fileName?: string;
  }) {
    this.ensureEnabled();

    const audioBuffer = Buffer.from(input.audioBase64, "base64");
    const formData = new FormData();
    const file = new File(
      [audioBuffer],
      input.fileName ?? `answer.${input.mimeType.includes("webm") ? "webm" : "wav"}`,
      { type: input.mimeType }
    );

    formData.append("file", file);
    formData.append("model_id", env.ELEVENLABS_STT_MODEL_ID);

    const response = await fetch(`${ELEVENLABS_BASE_URL}/speech-to-text`, {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY as string
      } as Record<string, string>,
      body: formData
    });

    if (!response.ok) {
      throw new ApiError(502, "ElevenLabs speech-to-text failed");
    }

    const payload = (await response.json()) as {
      text?: string;
      language_code?: string;
    };

    return {
      text: payload.text ?? "",
      languageCode: payload.language_code ?? null
    };
  }

  async respondToConversation(input: {
    conversationId: string;
    transcript?: string;
    audioBase64?: string;
    mimeType?: string;
    fileName?: string;
  }) {
    const state = this.conversations.get(input.conversationId);
    if (!state) {
      throw new ApiError(404, "Voice interview conversation not found");
    }

    let transcript = input.transcript?.trim() ?? "";
    if (!transcript) {
      if (!input.audioBase64 || !input.mimeType) {
        throw new ApiError(400, "Either transcript or audio input is required");
      }

      const transcription = await this.transcribe({
        audioBase64: input.audioBase64,
        mimeType: input.mimeType,
        fileName: input.fileName
      });
      transcript = transcription.text.trim();
    }

    if (!transcript) {
      throw new ApiError(400, "Transcript could not be generated from the candidate response");
    }

    const response = recordCandidateResponse(state, transcript);

    if (response.completed && state.interviewSessionId) {
      await interviewSessionsService.completeSession(
        state.interviewSessionId,
        buildCompletionInput(state)
      );

      this.conversations.delete(input.conversationId);
    }

    return response;
  }

  async evaluate(payload: {
    answers: Array<{ question: string; answer: string }>;
  }) {
    const evaluation = await evaluateInterview({
      questions: payload.answers
    });

    return evaluation;
  }
}

export const voiceInterviewsService = new VoiceInterviewsService();
