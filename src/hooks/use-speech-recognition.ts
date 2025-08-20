"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  onSpeechEnd?: (finalTranscript: string) => void;
}

interface SpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  recognitionSupported: boolean;
}

let recognition: SpeechRecognition | null = null;
if (typeof window !== 'undefined') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'es-ES';
    recognition.interimResults = true;
  }
}

export const useSpeechRecognition = (options: SpeechRecognitionOptions = {}): SpeechRecognitionResult => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(recognition);
  const { onSpeechEnd } = options;

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
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
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
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
                setTranscript(currentTranscript => {
                    onSpeechEnd(currentTranscript.trim());
                    return currentTranscript;
                });
            }, 100);
        }
    };
    
    let currentTranscript = '';
    const transcriptUnsub = (() => {
      setTranscript(t => {
        currentTranscript = t;
        return t;
      });
      return () => {};
    })();


    currentRecognition.addEventListener('result', handleResult);
    currentRecognition.addEventListener('error', handleError);
    currentRecognition.addEventListener('end', handleEnd);

    return () => {
      currentRecognition.removeEventListener('result', handleResult);
      currentRecognition.removeEventListener('error', handleError);
      currentRecognition.removeEventListener('end', handleEnd);
      transcriptUnsub();
      if(isListening) {
        stopListening();
      }
    };
  }, [isListening, stopListening, onSpeechEnd]);

  return { transcript, isListening, startListening, stopListening, error, recognitionSupported: !!recognitionRef.current };
};
