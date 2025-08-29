import { useCallback, useState } from "react";

export interface StreamingVoiceCommandResult {
  isLoading: boolean;
  result: any | null;
  error: string | null;
  chunks: string[];
}

export interface UseStreamingVoiceCommandOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

export function useStreamingVoiceCommand(
  options: UseStreamingVoiceCommandOptions = {}
) {
  const [state, setState] = useState<StreamingVoiceCommandResult>({
    isLoading: false,
    result: null,
    error: null,
    chunks: [],
  });

  const processCommand = useCallback(
    async (text: string) => {
      setState({
        isLoading: true,
        result: null,
        error: null,
        chunks: [],
      });

      try {
        const response = await fetch("/api/voice-command-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "chunk") {
                  setState((prev) => ({
                    ...prev,
                    chunks: [...prev.chunks, data.content],
                  }));
                  options.onChunk?.(data.content);
                } else if (data.type === "complete") {
                  setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    result: data.result,
                  }));
                  options.onComplete?.(data.result);
                  return data.result;
                } else if (data.type === "error") {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.warn("Failed to parse streaming data:", parseError);
              }
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        options.onError?.(errorMessage);
        throw error;
      }
    },
    [options]
  );

  return {
    ...state,
    processCommand,
  };
}
