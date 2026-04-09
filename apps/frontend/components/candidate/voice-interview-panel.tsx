"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  getVoiceInterviewConfig,
  startVoiceInterviewConversation,
  submitVoiceInterviewTurn,
  synthesizeVoicePrompt
} from "@/lib/api-adapters";
import type {
  VoiceInterviewConfig,
  VoiceInterviewConversationState
} from "@/lib/types";

type VoiceInterviewPanelProps = {
  questions: string[];
  interviewSessionId?: string | null;
  applicationId?: string | null;
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

function responseCount(conversation: VoiceInterviewConversationState | null) {
  return conversation?.turns.filter((turn) => turn.role === "candidate").length ?? 0;
}

export function VoiceInterviewPanel({
  questions,
  interviewSessionId,
  applicationId
}: VoiceInterviewPanelProps) {
  const [config, setConfig] = useState<VoiceInterviewConfig | null>(null);
  const [conversation, setConversation] = useState<VoiceInterviewConversationState | null>(null);
  const [status, setStatus] = useState("Ready to begin the conversational interview.");
  const [recording, setRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const spokenTurnIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    void getVoiceInterviewConfig().then(setConfig);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const turnsToSpeak = (conversation?.turns ?? []).filter(
      (turn) => turn.role === "assistant" && !spokenTurnIdsRef.current.has(turn.id)
    );

    if (turnsToSpeak.length === 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsSpeaking(true);

      for (const turn of turnsToSpeak) {
        if (cancelled) {
          return;
        }

        spokenTurnIdsRef.current.add(turn.id);
        setStatus(
          turn.kind === "closing" ? "AI is wrapping up the interview..." : "AI is asking the next question..."
        );
        await playPrompt(turn.text, config);
      }

      if (!cancelled) {
        setIsSpeaking(false);
        setStatus((current) =>
          current.startsWith("AI is") ? conversation?.status ?? current : current
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config, conversation]);

  const startInterview = () => {
    setError(null);
    setStatus("Starting conversational interview...");

    startTransition(async () => {
      try {
        const nextConversation = await startVoiceInterviewConversation({
          questions,
          interviewSessionId,
          applicationId
        });
        spokenTurnIdsRef.current = new Set();
        setConversation(nextConversation);
        setStatus(nextConversation.status);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to start the voice interview."
        );
        setStatus("Unable to start the interview.");
      }
    });
  };

  const startRecording = async () => {
    setError(null);

    if (!conversation || conversation.completed) {
      return;
    }

    if (isSpeaking) {
      setStatus("Please wait for the AI prompt to finish before answering.");
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof MediaRecorder === "undefined"
    ) {
      setStatus("Recording is not supported in this browser.");
      return;
    }

    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

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
          try {
            setStatus("Transcribing and analyzing your answer...");
            const mimeType = recorder.mimeType || "audio/webm";
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const audioBase64 = await blobToBase64(blob);
            const nextConversation = await submitVoiceInterviewTurn({
              conversationId: conversation.conversationId,
              audioBase64,
              mimeType,
              fileName: `voice-answer-${Date.now()}.webm`
            });

            setConversation(nextConversation);
            setStatus(nextConversation.status);
          } catch (caughtError) {
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Failed to process the recorded answer."
            );
            setStatus("We couldn't process that answer. Please try again.");
          } finally {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            recorderRef.current = null;
          }
        })();
      };

      recorder.start();
      setRecording(true);
      setStatus("Listening...");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Microphone access was not granted."
      );
      setStatus("Microphone access is required to continue.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <section className="form-section card stack-lg">
      <div className="panel-heading">
        <div>
          <span className="subtle-label">Conversational voice interview</span>
          <h2>Natural AI-led interview loop</h2>
          <p className="supporting-copy">
            The AI introduces the interview, asks the next question automatically, and adds
            follow-ups when your answer needs more specificity or structure.
          </p>
        </div>
        <span className={`status-pill ${config?.enabled ? "status-approved" : "status-pending"}`}>
          {config?.enabled ? "ElevenLabs live" : "Mock or browser fallback"}
        </span>
      </div>

      <div className="summary-grid">
        <article>
          <span className="subtle-label">Interview state</span>
          <strong>{conversation?.completed ? "Completed" : conversation ? "In progress" : "Not started"}</strong>
          <span className="muted">{status}</span>
        </article>
        <article>
          <span className="subtle-label">Responses captured</span>
          <strong>{responseCount(conversation)}</strong>
          <span className="muted">spoken answers stored in the transcript</span>
        </article>
        <article>
          <span className="subtle-label">Current mode</span>
          <strong>{recording ? "Recording" : isSpeaking ? "AI speaking" : "Awaiting candidate"}</strong>
          <span className="muted">
            {conversation?.currentPrompt ? "AI prompt already delivered" : "Start the loop to begin"}
          </span>
        </article>
        <article>
          <span className="subtle-label">Pipeline compatibility</span>
          <strong>{conversation?.interviewSessionId ? "Persisting to session" : "Standalone voice flow"}</strong>
          <span className="muted">Legacy interview scoring remains available</span>
        </article>
      </div>

      {error ? <div className="status-pill status-stop">{error}</div> : null}

      {!conversation ? (
        <div className="stack">
          <div className="question-item">
            <strong>Ready for a live interview flow</strong>
            <p className="muted">
              The AI will greet the candidate, run a 4-6 question conversation, and store
              transcript evidence plus per-answer scoring.
            </p>
          </div>
          <div className="shell-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={startInterview}
              disabled={isPending}
            >
              {isPending ? "Preparing interview..." : "Start voice interview"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-feed">
            {conversation.turns.map((turn) => (
              <div
                className={`chat-bubble ${
                  turn.role === "assistant" ? "chat-bubble-ai" : "chat-bubble-user"
                }`}
                key={turn.id}
              >
                <strong style={{ display: "block", marginBottom: 8 }}>
                  {turn.role === "assistant" ? "AI interviewer" : "Candidate"}
                </strong>
                <div>{turn.text}</div>
                {turn.scores ? (
                  <div className="muted" style={{ marginTop: 8 }}>
                    Clarity {turn.scores.communicationClarity} | Depth {turn.scores.technicalDepth} |
                    Structure {turn.scores.problemSolvingStructure} | Business{" "}
                    {turn.scores.businessUnderstanding}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="shell-actions">
            {conversation.completed ? (
              <button className="button button-primary" type="button" onClick={startInterview}>
                Restart interview
              </button>
            ) : !recording ? (
              <button
                className="button button-primary"
                type="button"
                onClick={startRecording}
                disabled={isSpeaking}
              >
                {isSpeaking ? "Waiting for AI..." : "Start speaking"}
              </button>
            ) : (
              <button className="button button-primary" type="button" onClick={stopRecording}>
                Finish answer
              </button>
            )}
            <span className="muted">
              There is no manual next-question flow here. The AI advances and follows up
              automatically based on your last answer.
            </span>
          </div>

          {!conversation.evaluation ? null : (
            <div className="stack-lg">
              <div className="score-grid">
                <article className="score-card">
                  <strong>{conversation.evaluation.communicationClarity}</strong>
                  <span className="muted">Communication clarity</span>
                </article>
                <article className="score-card">
                  <strong>{conversation.evaluation.technicalDepth}</strong>
                  <span className="muted">Technical depth</span>
                </article>
                <article className="score-card">
                  <strong>{conversation.evaluation.problemSolvingStructure}</strong>
                  <span className="muted">Problem-solving structure</span>
                </article>
                <article className="score-card">
                  <strong>{conversation.evaluation.businessUnderstanding}</strong>
                  <span className="muted">Business understanding</span>
                </article>
              </div>

              <article className="question-item">
                <strong>Interview summary</strong>
                <p className="muted">{conversation.evaluation.summary}</p>
              </article>

              <div className="question-list">
                {conversation.evaluation.responseEvaluations.map((entry) => (
                  <article className="question-item" key={entry.questionId}>
                    <strong>{entry.question}</strong>
                    <p className="muted">{entry.rationale}</p>
                    <p className="muted">
                      Overall {entry.evaluationScore} | Clarity{" "}
                      {entry.scoreBreakdown.communicationClarity} | Depth{" "}
                      {entry.scoreBreakdown.technicalDepth} | Structure{" "}
                      {entry.scoreBreakdown.problemSolvingStructure} | Business{" "}
                      {entry.scoreBreakdown.businessUnderstanding}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

async function playPrompt(text: string, config: VoiceInterviewConfig | null) {
  const audioBlob = await synthesizeVoicePrompt(text);
  if (audioBlob) {
    await new Promise<void>((resolve) => {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      void audio.play().catch(() => resolve());
    });
    return;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
    return;
  }

  if (!config?.enabled) {
    await Promise.resolve();
  }
}
