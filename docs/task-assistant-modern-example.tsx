// Ejemplo de cómo actualizar TaskAssistant.tsx para usar la nueva implementación

import { useVoiceProcessing } from '@/hooks/use-voice-processing';

// ... otros imports

export function TaskAssistant() {
  // ... estado existente

  // Reemplazar el handleProcessVoiceCommand existente con este:
  const { processVoiceCommand: processVoice, isStreaming } = useVoiceProcessing(token, {
    useStreaming: true, // Habilitar streaming
    onProgress: (message, isError) => {
      setProgressMessages(prev => [...prev, message]);
      setStatusMessage(message);

      // Actualizar barra de progreso basado en el tipo de mensaje
      if (message.includes("🤖 Analizando comando")) {
        setProgressValue(10);
      } else if (message.includes("📋 Campos identificados")) {
        setProgressValue(20);
      } else if (message.includes("🔍 Buscando proyecto")) {
        setProgressValue(30);
      } else if (message.includes("✅ Proyecto encontrado")) {
        setProgressValue(40);
      } else if (message.includes("🔍") && message.includes("módulo")) {
        setProgressValue(50);
      } else if (message.includes("✅") && message.includes("Módulo seleccionado")) {
        setProgressValue(60);
      } else if (message.includes("🔍") && message.includes("fase")) {
        setProgressValue(65);
      } else if (message.includes("✅") && message.includes("Fase seleccionada")) {
        setProgressValue(70);
      } else if (message.includes("🔍 Buscando usuario")) {
        setProgressValue(80);
      } else if (message.includes("✅ Usuario")) {
        setProgressValue(85);
      } else if (message.includes("📅 Preparando")) {
        setProgressValue(90);
      } else if (message.includes("🚀 Creando tarea")) {
        setProgressValue(95);
      } else if (message.includes("✅ ¡Tarea") && message.includes("creada con éxito")) {
        setProgressValue(100);
      }

      if (isError) {
        toast({
          title: "Error en el Proceso",
          description: message,
          variant: "destructive",
        });
      }
    }
  });

  const handleProcessVoiceCommand = useCallback(async (text: string) => {
    if (!token) {
      setStatusMessage("Error: Por favor, inicia sesión primero.");
      toast({
        title: "Autenticación Requerida",
        description: "Debes iniciar sesión para procesar comandos de voz.",
        variant: "destructive",
      });
      return;
    }

    if (!text) {
      setStatusMessage("No se detectó ningún comando de voz.");
      return;
    }

    // Evitar procesamiento duplicado
    if (isProcessing || processingRef.current) {
      console.log("Ya se está procesando un comando, ignorando...");
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setIsLoading(true);
    setProgressMessages([]);
    setProgressValue(0);
    setHasProcessed(true);

    try {
      // Usar el nuevo hook unificado
      const resultMessage = await processVoice(text);

      setStatusMessage(resultMessage);
      setProgressValue(100);

    } catch (error) {
      console.error("Error processing voice command:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
      setStatusMessage(`❌ Error: ${errorMessage}`);
      setProgressMessages(prev => [...prev, `❌ Error: ${errorMessage}`]);
      setProgressValue(0);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [token, toast, processVoice, isProcessing]);

  // ... resto del componente sin cambios
}
