import { processVoiceCommand as processVoiceCommandAI } from "@/ai/process-voice-command";
import { useStreamingVoiceCommand } from "@/hooks/use-streaming-voice-command";
import { useToast } from "@/hooks/use-toast";
import { createActivity } from "@/lib/api";

export interface VoiceProcessingOptions {
  useStreaming?: boolean;
  onProgress?: (message: string, isError?: boolean) => void;
}

export function useVoiceProcessing(
  token: string,
  options: VoiceProcessingOptions = {}
) {
  const { toast } = useToast();


  const streamingVoiceCommand = useStreamingVoiceCommand({
    onChunk: (chunk) => {
      options.onProgress?.(`🤖 Procesando: ${chunk}...`);
    },
    onComplete: (result) => {
      options.onProgress?.(`✅ Análisis completado: ${result.args.title}`);
    },
    onError: (error) => {
      options.onProgress?.(`❌ Error en streaming: ${error}`, true);
    },
  });

  const processVoiceCommand = async (text: string): Promise<string> => {
    if (!token) {
      const error = "Por favor, inicia sesión primero.";
      options.onProgress?.(error, true);
      throw new Error(error);
    }

    if (!text) {
      const error = "No se detectó ningún comando de voz.";
      options.onProgress?.(error, true);
      throw new Error(error);
    }

    try {
      options.onProgress?.("🤖 Analizando comando con IA...");

      let structuredResponse;

      if (options.useStreaming) {
  
        try {
          structuredResponse = await streamingVoiceCommand.processCommand(text);
          if (!structuredResponse) {
            throw new Error("No response from streaming API");
          }
        } catch (streamError) {
          console.log(
            "Streaming falló, usando método tradicional:",
            streamError
          );
          options.onProgress?.("🔄 Usando método alternativo...");

    
          structuredResponse = await processVoiceCommandAI({ text });
        }
      } else {
       
        structuredResponse = await processVoiceCommandAI({ text });
      }

      options.onProgress?.(
        `🎯 Creando actividad: "${structuredResponse.args.title}"`
      );


      const resultMessage = await createActivity(
        structuredResponse.args,
        token,
        options.onProgress
      );

      toast({
        title: "Procesamiento Completo",
        description: "Tarea procesada exitosamente",
      });

      return resultMessage;
    } catch (error) {
      console.error("Error processing voice command:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      options.onProgress?.(errorMessage, true);

      toast({
        title: "Error en el Procesamiento",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  };

  return {
    processVoiceCommand,
    isStreaming: streamingVoiceCommand.isLoading,
    streamingChunks: streamingVoiceCommand.chunks,
    streamingError: streamingVoiceCommand.error,
  };
}
