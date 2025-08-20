"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Loader2, KeyRound, Save } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { processVoiceCommand } from '@/ai/flows/process-voice-command';
import * as api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const initialStatusMessages = [
  "Puedes decir: 'Crea una tarea para revisar el login en el proyecto Kronos'.",
  "Intenta con: 'Busca el proyecto TaskWise'.",
  "Di un comando para empezar.",
  "¿En qué puedo ayudarte hoy?",
];

export function TaskAssistant() {
  const [token, setToken] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [hasProcessed, setHasProcessed] = useState(false);
  
  const { toast } = useToast();

  const handleProcessVoiceCommand = useCallback(async (text: string) => {
    if (!token) {
      setStatusMessage("Error: Por favor, guarda tu token de API primero.");
      toast({
        title: "Token Requerido",
        description: "El token de autenticación es necesario para procesar comandos.",
        variant: "destructive",
      });
      return;
    }
    if (!text) {
      setStatusMessage("No se detectó ningún comando de voz.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Procesando comando con IA...");
    setHasProcessed(true);

    try {
      const structuredResponse = await processVoiceCommand({ text, token });

      setStatusMessage(`Acción reconocida: ${structuredResponse.tool}. Ejecutando...`);

      let resultMessage = "";
      switch (structuredResponse.tool) {
        case 'createActivity':
          resultMessage = await api.callCreateActivityAPI(structuredResponse.args, token);
          break;
        case 'findProject':
          resultMessage = await api.callFindProjectAPI(structuredResponse.args, token);
          break;
        default:
          resultMessage = "Error: La IA no pudo determinar una acción válida.";
          toast({
            title: "Acción no válida",
            description: `El comando no pudo ser mapeado a una acción conocida.`,
            variant: "destructive",
          });
      }
      setStatusMessage(resultMessage);
      toast({
        title: "Procesamiento Completo",
        description: resultMessage,
      });
    } catch (error) {
      console.error("Error processing voice command:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
      setStatusMessage(`❌ Error: ${errorMessage}`);
      toast({
        title: "Error en el Procesamiento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  const { transcript, isListening, startListening, stopListening, error: speechError, recognitionSupported } = useSpeechRecognition({
    onSpeechEnd: (finalTranscript) => {
        if (finalTranscript && !hasProcessed) {
            handleProcessVoiceCommand(finalTranscript);
        }
    }
  });

  useEffect(() => {
    const randomStatus = initialStatusMessages[Math.floor(Math.random() * initialStatusMessages.length)];
    setStatusMessage(randomStatus);
    const storedToken = localStorage.getItem("apiToken");
    if (storedToken) {
      setToken(storedToken);
      setInputToken(storedToken);
      toast({
        title: "Token cargado",
        description: "Tu token de API se ha cargado desde el almacenamiento local.",
      });
    }
  }, [toast]);
  
  useEffect(() => {
    if (speechError) {
      setStatusMessage(`Error de voz: ${speechError}`);
       toast({
        title: "Error de Reconocimiento de Voz",
        description: speechError,
        variant: "destructive",
      });
    }
  }, [speechError, toast]);

  const handleSaveToken = () => {
    localStorage.setItem("apiToken", inputToken);
    setToken(inputToken);
    setStatusMessage("Token guardado de forma segura.");
    toast({
      title: "Token Guardado",
      description: "Tu token de autenticación ha sido guardado.",
    });
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        handleProcessVoiceCommand(transcript);
      }
    } else {
      setHasProcessed(false);
      startListening();
      setStatusMessage("Escuchando...");
    }
  };

  const MemoizedLoader = useMemo(() => <Loader2 className="mr-2 h-4 w-4 animate-spin" />, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline text-primary">TaskWise Voice</h1>
        <p className="text-muted-foreground mt-2">Tu asistente de tareas por voz. Configura tu token y habla para empezar.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-6 h-6" /> Configuración de Autenticación
          </CardTitle>
          <CardDescription>
            Guarda tu token de API de forma segura. Se almacenará en tu navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Input
            type="password"
            placeholder="Introduce tu token de API"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSaveToken}>
            <Save className="w-4 h-4 mr-2" /> Guardar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crear Nueva Tarea</CardTitle>
          <CardDescription>
            Presiona el micrófono y dí tu comando. Por ejemplo: "Crea una tarea para hacer el reporte mensual en el proyecto Interno".
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Button
            size="lg"
            className={cn(
              "w-24 h-24 rounded-full transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105",
              isListening ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-primary hover:bg-primary/90",
            )}
            onClick={handleMicClick}
            disabled={isLoading || !recognitionSupported}
            aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
          >
            <Mic className="w-10 h-10" />
          </Button>

          <div className="w-full space-y-2 text-center">
             <p className="text-sm font-medium text-muted-foreground h-5">
              {isLoading ? 'Procesando...' : statusMessage}
            </p>
             <Textarea
              readOnly
              value={transcript || "El comando de voz transcrito aparecerá aquí."}
              className="text-center bg-muted/50 border-dashed"
              rows={3}
            />
          </div>
          {!recognitionSupported && <p className="text-red-500 text-sm">El reconocimiento de voz no es compatible con este navegador.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
