"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  evaluateVoiceInterview,
  getVoiceInterviewConfig,
  synthesizeVoicePrompt,
  transcribeVoiceAnswer
} from "@/lib/api-adapters";
import type { VoiceInterviewConfig, VoiceInterviewEvaluation } from "@/lib/types";

type VoiceInterviewPanelProps = {
  questions: string[];
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const value = reader.result;
      if (typeof value !== "string") {
        reject(new Error("Failed to read audio blob"));
        return;
      }

      resolve(value.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read audio blob"));
    reader.readAsDataURL(blob);
  });
}

export function VoiceInterviewPanel({ questions }: VoiceInterviewPanelProps) {
  const [config, setConfig] = useState<VoiceInterviewConfig | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [transcripts, setTranscripts] = useState<Record<number, string>>({});
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [evaluation, setEvaluation] = useState<VoiceInterviewEvaluation | null>(null);
  const [isPending, startTransition] = useTransition();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    void getVoiceInterviewConfig().then(setConfig);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const completedAnswers = useMemo(
    () =>
      questions
        .map((question, index) => ({
          question,
          answer: transcripts[index]
        }))
        .filter((item) => item.answer),
    [questions, transcripts]
  );

  const playPrompt = async () => {
    const text = questions[activeIndex];
    if (!text) {
      return;
    }

    const audioBlob = await synthesizeVoicePrompt(text);
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      void audio.play();
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const startRecording = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = mediaStream;
    chunksRef.current = [];

    const recorder = new MediaRecorder(mediaStream);
    recorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      void (async () => {
        setStatus("Transcribing answer...");
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const audioBase64 = await blobToBase64(blob);
        const result = await transcribeVoiceAnswer({
          audioBase64,
          mimeType,
          fileName: `answer-${activeIndex + 1}.webm`
        });

        setTranscripts((current) => ({
          ...current,
          [activeIndex]: result.text
        }));
        setStatus("Transcript captured");
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      })();
    };

    recorder.start();
    setRecording(true);
    setStatus("Recording...");
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const runEvaluation = () => {
    startTransition(async () => {
      const result = await evaluateVoiceInterview({
        answers: completedAnswers
      });
      setEvaluation(result);
    });
  };

  return (
    <section className="form-section card stack-lg">
      <div className="panel-heading">
        <div>
          <span className="subtle-label">Voice interview</span>
          <h2>Record spoken answers question by question</h2>
          <p className="supporting-copy">
            ElevenLabs handles speech transcription and voice playback. Interview scoring still
            runs through your AI service layer.
          </p>
        </div>
        <span className={`status-pill ${config?.enabled ? "status-approved" : "status-pending"}`}>
          {config?.enabled ? "ElevenLabs enabled" : "Fallback mode"}
        </span>
      </div>

      <div className="summary-grid">
        <article>
          <span className="subtle-label">Question</span>
          <strong>{activeIndex + 1} / {questions.length}</strong>
          <span className="muted">{status}</span>
        </article>
        <article>
          <span className="subtle-label">Completed</span>
          <strong>{completedAnswers.length}</strong>
          <span className="muted">answers transcribed</span>
        </article>
      </div>

      <div className="question-item">
        <strong>{questions[activeIndex]}</strong>
        <p className="muted">
          Use voice playback for the prompt, then record your answer and review the transcript.
        </p>
      </div>

      <div className="shell-actions">
        <button className="button button-secondary" type="button" onClick={playPrompt}>
          Play question
        </button>
        {!recording ? (
          <button className="button button-primary" type="button" onClick={startRecording}>
            Start recording
          </button>
        ) : (
          <button className="button button-primary" type="button" onClick={stopRecording}>
            Stop recording
          </button>
        )}
        <button
          className="button button-secondary"
          type="button"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
        >
          Previous
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={activeIndex >= questions.length - 1}
          onClick={() => setActiveIndex((current) => Math.min(questions.length - 1, current + 1))}
        >
          Next
        </button>
      </div>

      <label className="field">
        <span>Transcript</span>
        <textarea
          rows={5}
          value={transcripts[activeIndex] ?? ""}
          onChange={(event) =>
            setTranscripts((current) => ({
              ...current,
              [activeIndex]: event.target.value
            }))
          }
          placeholder="Recorded answer transcript will appear here."
        />
      </label>

      <div className="shell-actions">
        <button
          className="button button-primary"
          type="button"
          disabled={completedAnswers.length === 0 || isPending}
          onClick={runEvaluation}
        >
          {isPending ? "Evaluating..." : "Evaluate voice interview"}
        </button>
      </div>

      {!evaluation ? null : (
        <div className="summary-grid">
          <article>
            <span className="subtle-label">Communication</span>
            <strong>{evaluation.communicationScore}</strong>
          </article>
          <article>
            <span className="subtle-label">Knowledge</span>
            <strong>{evaluation.knowledgeScore}</strong>
          </article>
          <article>
            <span className="subtle-label">Confidence</span>
            <strong>{evaluation.confidenceScore}</strong>
          </article>
          <article>
            <span className="subtle-label">Overall</span>
            <strong>{evaluation.overallScore}</strong>
            <span className="muted">{evaluation.summary}</span>
          </article>
        </div>
      )}
    </section>
  );
}
