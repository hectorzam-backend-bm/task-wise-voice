"use client";

import { processVoiceCommand } from '@/ai/flows/process-voice-command';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';
import { cn } from '@/lib/utils';
import { KeyRound, Loader2, Mic, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';

const initialStatusMessages = [
  "Di un comando para empezar.",
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
    <div className="w-full max-w-2xl mx-auto space-y-6 bg-background text-foreground">
      <div className="text-center">
        <img
          src="logo.png"
          alt="RADictar Logo"
          className="mx-auto mb-4 w-24 h-24 object-contain rounded-full shadow-lg dark:shadow-white/10"
        />
        <h1 className="text-heading-1 text-primary">RADictar</h1>
        <p className="text-body text-subtext-color mt-2">Tu asistente de tareas por voz. Configura tu token y habla para empezar.</p>
      </div>

      <Card className='bg-card'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-heading-2 text-foreground">
            <KeyRound className="w-6 h-6 text-primary" /> Configuración de Autenticación
          </CardTitle>
          <CardDescription className="text-body text-subtext-color">
            Guarda tu token de API de forma segura. Se almacenará en tu navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Input
            type="password"
            placeholder="Introduce tu token de API"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            className="grow bg-input border-border text-foreground"
          />
          <Button onClick={handleSaveToken} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" /> Guardar
          </Button>
        </CardContent>
      </Card>

      <Card className='bg-card'>
        <CardHeader>
          <CardTitle className="text-heading-2 text-foreground">Crear Nueva Tarea</CardTitle>
          <CardDescription className="text-body text-subtext-color">
            Presiona el micrófono y dí tu comando. Intenta con: 'Crea una tarea en el Proyecto Alpha, [nombre de la tarea] en el modulo [nombre del modulo] de la fase [nombre de la fase] y asignala a [nombre del usuario]'.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <Button
            size="lg"
            className={cn(
              "w-24 h-24 rounded-full transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105",
              isListening
                ? "bg-destructive hover:bg-destructive/90 animate-pulse text-destructive-foreground"
                : "bg-primary hover:bg-primary/90 text-primary-foreground",
            )}
            onClick={handleMicClick}
            disabled={isLoading || !recognitionSupported}
            aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
          >
            <Mic className="w-10 h-10" />
          </Button>

          <div className="w-full space-y-2 text-center">
            <p className="text-caption text-subtext-color h-5">
              {isLoading ? 'Procesando...' : statusMessage}
            </p>
            <Textarea
              readOnly
              value={transcript || "El comando de voz transcrito aparecerá aquí."}
              className="w-full p-4 rounded-md bg-card text-foreground border border-border placeholder:text-subtext-color"
              rows={3}
            />
          </div>
          {!recognitionSupported && (
            <p className="text-caption text-destructive">
              El reconocimiento de voz no es compatible con este navegador.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
