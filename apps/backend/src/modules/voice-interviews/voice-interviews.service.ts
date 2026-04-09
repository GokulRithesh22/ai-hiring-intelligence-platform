import { evaluateInterview } from "@ai-hiring/ai-services";

import { ApiError } from "../../lib/http";
import { env } from "../../config/env";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

async function readAudioBuffer(response: Response): Promise<Buffer> {
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export class VoiceInterviewsService {
  getConfig() {
    return {
      enabled: Boolean(env.ELEVENLABS_API_KEY),
      voiceId: env.ELEVENLABS_VOICE_ID ?? null,
      ttsModelId: env.ELEVENLABS_TTS_MODEL_ID,
      sttModelId: env.ELEVENLABS_STT_MODEL_ID
    };
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
        } as HeadersInit,
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
      } as HeadersInit,
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
