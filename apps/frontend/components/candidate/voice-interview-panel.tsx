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
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const spokenTurnIdsRef = useRef<Set<string>>(new Set());
  const autoRecordedTurnIdsRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const monitorFrameRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const speechDetectedRef = useRef(false);
  const silenceStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    void getVoiceInterviewConfig().then(setConfig);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      cleanupRecordingMonitoring();
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
        const played = await playPrompt(turn.text, config);
        setAudioAvailable(played);
        setPlaybackFailed(!played);
        if (!played) {
          setStatus("Question ready. Audio playback was blocked, so use Replay prompt if needed.");
        }
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

  useEffect(() => {
    const latestQuestionTurn = [...(conversation?.turns ?? [])]
      .reverse()
      .find((turn) => turn.role === "assistant" && turn.kind === "question");

    if (!conversation || conversation.completed || isSpeaking || recording || !latestQuestionTurn) {
      return;
    }

    if (autoRecordedTurnIdsRef.current.has(latestQuestionTurn.id)) {
      return;
    }

    autoRecordedTurnIdsRef.current.add(latestQuestionTurn.id);
    const timeout = window.setTimeout(() => {
      void startRecording();
    }, 450);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [conversation, isSpeaking, recording]);

  const startInterview = () => {
    setError(null);
    setStatus("Starting conversational interview...");

    startTransition(async () => {
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.mediaDevices &&
          typeof MediaRecorder !== "undefined"
        ) {
          const permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          permissionStream.getTracks().forEach((track) => track.stop());
        }

        const nextConversation = await startVoiceInterviewConversation({
          questions,
          interviewSessionId,
          applicationId
        });
        spokenTurnIdsRef.current = new Set();
        autoRecordedTurnIdsRef.current = new Set();
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

      cleanupRecordingMonitoring();
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;
      chunksRef.current = [];
      speechDetectedRef.current = false;
      silenceStartedAtRef.current = null;

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
            if (blob.size === 0) {
              setStatus("No answer was detected. Please try responding again.");
              return;
            }
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
            cleanupRecordingMonitoring();
            setRecording(false);
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            recorderRef.current = null;
          }
        })();
      };

      recorder.start();
      beginSilenceMonitoring(mediaStream, recorder);
      setRecording(true);
      setStatus("Listening... answer naturally and pause when you are done.");
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

  const replayPrompt = () => {
    const prompt = conversation?.currentPrompt;

    if (!prompt) {
      return;
    }

    setError(null);
    startTransition(async () => {
      setIsSpeaking(true);
      setStatus("Playing the current question...");
      const played = await playPrompt(prompt, config);
      setIsSpeaking(false);
      setAudioAvailable(played);
      setPlaybackFailed(!played);
      setStatus(
        played
          ? "Question replayed. You can answer now."
          : "Question ready. Audio playback was blocked, but you can still read and answer."
      );
    });
  };

  const cleanupRecordingMonitoring = () => {
    if (typeof window !== "undefined" && monitorFrameRef.current != null) {
      window.cancelAnimationFrame(monitorFrameRef.current);
      monitorFrameRef.current = null;
    }

    if (typeof window !== "undefined" && stopTimeoutRef.current != null) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    analyserRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
  };

  const beginSilenceMonitoring = (stream: MediaStream, recorder: MediaRecorder) => {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      stopTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }, 15000);
      return;
    }

    const audioContext = new AudioContextCtor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    stopTimeoutRef.current = window.setTimeout(() => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }, 30000);

    const sampleBuffer = new Uint8Array(analyser.fftSize);
    const silenceThreshold = 0.02;
    const silenceDurationMs = 1500;

    const monitor = () => {
      if (recorder.state === "inactive" || !analyserRef.current) {
        return;
      }

      analyserRef.current.getByteTimeDomainData(sampleBuffer);
      let sumSquares = 0;
      for (const sample of sampleBuffer) {
        const normalized = (sample - 128) / 128;
        sumSquares += normalized * normalized;
      }

      const rms = Math.sqrt(sumSquares / sampleBuffer.length);
      const now = performance.now();

      if (rms > silenceThreshold) {
        speechDetectedRef.current = true;
        silenceStartedAtRef.current = null;
      } else if (speechDetectedRef.current) {
        if (silenceStartedAtRef.current == null) {
          silenceStartedAtRef.current = now;
        } else if (now - silenceStartedAtRef.current >= silenceDurationMs) {
          recorder.stop();
          return;
        }
      }

      monitorFrameRef.current = window.requestAnimationFrame(monitor);
    };

    monitorFrameRef.current = window.requestAnimationFrame(monitor);
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
            {conversation?.currentPrompt
              ? recording
                ? "Mic is open and listening for your answer"
                : "The AI prompt is active and the call flow continues automatically"
              : "Start the loop to begin"}
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
                  {turn.role === "assistant" ? "Interviewer" : "Candidate"}
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
            {playbackFailed && conversation.currentPrompt ? (
              <button
                className="button button-secondary"
                type="button"
                onClick={replayPrompt}
                disabled={isPending || recording || isSpeaking}
              >
                Replay prompt
              </button>
            ) : null}
            {conversation.completed ? (
              <button className="button button-primary" type="button" onClick={startInterview}>
                Restart interview
              </button>
            ) : (
              <button className="button button-secondary" type="button" onClick={stopRecording}>
                End answer now
              </button>
            )}
            <span className="muted">
              {playbackFailed
                ? "The interview runs automatically. Replay prompt is only shown when browser audio playback is blocked."
                : "Once the interview starts, the AI speaks, listens, and advances automatically like a phone conversation."}
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
    const played = await new Promise<boolean>((resolve) => {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve(true);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };
      void audio.play().catch(() => {
        URL.revokeObjectURL(url);
        resolve(false);
      });
    });
    return played;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    await new Promise<boolean>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
    return true;
  }

  if (!config?.enabled) {
    await Promise.resolve();
  }

  return false;
}
