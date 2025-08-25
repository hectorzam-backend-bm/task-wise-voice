"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Declaraciones de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  addEventListener(
    type: "result",
    listener: (event: SpeechRecognitionEvent) => void
  ): void;
  addEventListener(
    type: "error",
    listener: (event: SpeechRecognitionErrorEvent) => void
  ): void;
  addEventListener(type: "end", listener: () => void): void;
  removeEventListener(
    type: "result",
    listener: (event: SpeechRecognitionEvent) => void
  ): void;
  removeEventListener(
    type: "error",
    listener: (event: SpeechRecognitionErrorEvent) => void
  ): void;
  removeEventListener(type: "end", listener: () => void): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface SpeechRecognitionOptions {
  onSpeechEnd?: (finalTranscript: string) => void;
}

interface UseSpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  recognitionSupported: boolean;
}

let recognition: SpeechRecognition | null = null;
if (typeof window !== "undefined") {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "es-ES";
    recognition.interimResults = true;
  }
}

export const useSpeechRecognition = (
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionResult => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(recognition);
  const { onSpeechEnd } = options;

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("");
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  useEffect(() => {
    const currentRecognition = recognitionRef.current;
    if (!currentRecognition) {
      setError("El reconocimiento de voz no es compatible con este navegador.");
      return;
    }

    const handleResult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript((prev) => prev + finalTranscript);
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
    };

    const handleEnd = () => {
      setIsListening(false);
      if (onSpeechEnd) {
        // Need a slight delay to ensure transcript state is updated
        setTimeout(() => {
          setTranscript((currentTranscript) => {
            onSpeechEnd(currentTranscript.trim());
            return currentTranscript;
          });
        }, 100);
      }
    };

    let currentTranscript = "";
    const transcriptUnsub = (() => {
      setTranscript((t) => {
        currentTranscript = t;
        return t;
      });
      return () => {};
    })();

    currentRecognition.addEventListener("result", handleResult);
    currentRecognition.addEventListener("error", handleError);
    currentRecognition.addEventListener("end", handleEnd);

    return () => {
      currentRecognition.removeEventListener("result", handleResult);
      currentRecognition.removeEventListener("error", handleError);
      currentRecognition.removeEventListener("end", handleEnd);
      transcriptUnsub();
      if (isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening, onSpeechEnd]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    error,
    recognitionSupported: !!recognitionRef.current,
  };
};
