"use client";

import { processVoiceCommand } from '@/ai/process-voice-command';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useToast } from '@/hooks/use-toast';
import { callCreateActivityAPI } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2, LogOut, Mic, User } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GoogleSignInButton from './GoogleSignInButton';

const initialStatusMessages = [
  "Inicia sesión para comenzar.",
];

export function TaskAssistant() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [progressValue, setProgressValue] = useState(0);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const { toast } = useToast();

  // Funciones de autenticación
  const handleLoginSuccess = useCallback((accessToken: string, userData: any) => {
    setToken(accessToken);
    setUser(userData);
    setIsAuthLoading(false);
    setStatusMessage("Di un comando para empezar.");
    toast({
      title: "¡Bienvenido!",
      description: `Sesión iniciada como ${userData.displayName || userData.email}`,
    });
  }, [toast]);

  const handleLoginError = useCallback((error: string) => {
    setIsAuthLoading(false);
    toast({
      title: "Error de Autenticación",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  const handleLogout = useCallback(() => {
    setToken("");
    setUser(null);
    setStatusMessage("Inicia sesión para comenzar.");
    if (typeof window !== 'undefined') {
      localStorage.removeItem("apiToken");
    }
    toast({
      title: "Sesión Cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  }, [toast]);

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

    // Evitar procesamiento duplicado con ref para prevenir race conditions
    if (isProcessing || processingRef.current) {
      console.log("Ya se está procesando un comando, ignorando...");
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setIsLoading(true);
    setStatusMessage("Procesando comando con IA...");
    setProgressMessages([]);
    setProgressValue(0);
    setHasProcessed(true);

    // Callback para mostrar progreso en tiempo real
    const onProgress = (message: string, isError = false) => {
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
    };

    try {
      onProgress("🤖 Analizando comando con IA...");

      // Usar directamente la función de procesamiento de voz
      const structuredResponse = await processVoiceCommand({ text });

      onProgress(`🎯 Comando procesado. Creando actividad: "${structuredResponse.args.title}"`);

      // Usar directamente la función de creación de actividad
      const resultMessage = await callCreateActivityAPI(structuredResponse.args, token, onProgress);

      setStatusMessage(resultMessage);
      setProgressValue(100);
      toast({
        title: "Procesamiento Completo",
        description: resultMessage.length > 100 ? "Tarea procesada exitosamente" : resultMessage,
      });
    } catch (error) {
      console.error("Error processing voice command:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
      setStatusMessage(`❌ Error: ${errorMessage}`);
      setProgressMessages(prev => [...prev, `❌ Error: ${errorMessage}`]);
      setProgressValue(0);
      toast({
        title: "Error en el Procesamiento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [token, toast]);

  const { transcript, isListening, startListening, stopListening, error: speechError, recognitionSupported } = useSpeechRecognition({
    onSpeechEnd: (finalTranscript) => {
      if (finalTranscript && !hasProcessed && !isProcessing && !processingRef.current) {
        handleProcessVoiceCommand(finalTranscript);
      }
    }
  });

  useEffect(() => {
    // Verificar si hay un token guardado en localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("apiToken");
      if (storedToken) {
        setToken(storedToken);
        setStatusMessage("Di un comando para empezar.");
        // Aquí podrías hacer una llamada para obtener info del usuario si tienes un endpoint
        toast({
          title: "Sesión Restaurada",
          description: "Tu sesión anterior ha sido restaurada.",
        });
      } else {
        const randomStatus = initialStatusMessages[Math.floor(Math.random() * initialStatusMessages.length)];
        setStatusMessage(randomStatus);
      }
    } else {
      const randomStatus = initialStatusMessages[Math.floor(Math.random() * initialStatusMessages.length)];
      setStatusMessage(randomStatus);
    }
  }, [toast]);

  useEffect(() => {
    if (speechError) {
      let errorMessage = "";
      let errorTitle = "";

      switch (speechError) {
        case 'network':
          errorMessage = "Error de conexión a internet. Verifica tu conexión y vuelve a intentar.";
          errorTitle = "Error de Red";
          break;
        case 'not-allowed':
          errorMessage = "Permisos de micrófono denegados. Permite el acceso al micrófono en tu navegador.";
          errorTitle = "Permisos Denegados";
          break;
        case 'no-speech':
          errorMessage = "No se detectó ningún audio. Asegúrate de hablar cerca del micrófono.";
          errorTitle = "No se Detectó Voz";
          break;
        case 'audio-capture':
          errorMessage = "Error al capturar audio. Verifica que tu micrófono esté funcionando.";
          errorTitle = "Error de Captura de Audio";
          break;
        case 'service-not-allowed':
          errorMessage = "Servicio de reconocimiento de voz no permitido. Verifica la configuración del navegador.";
          errorTitle = "Servicio No Permitido";
          break;
        case 'language-not-supported':
          errorMessage = "Idioma no soportado. Cambia la configuración de idioma.";
          errorTitle = "Idioma No Soportado";
          break;
        default:
          errorMessage = `Error desconocido: ${speechError}. Intenta recargar la página.`;
          errorTitle = "Error de Reconocimiento de Voz";
      }

      setStatusMessage(`❌ ${errorTitle}: ${errorMessage}`);
      console.error('Speech recognition error details:', {
        error: speechError,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server-side',
        isHttps: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false
      });

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [speechError, toast]);

  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
      // No procesar aquí, dejar que onSpeechEnd se encargue del procesamiento automático
    } else {
      // Verificar permisos de micrófono antes de iniciar
      try {
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Estado de permisos del micrófono:', permissionStatus.state);

          if (permissionStatus.state === 'denied') {
            toast({
              title: "Permisos Denegados",
              description: "El acceso al micrófono está bloqueado. Permite el acceso en la configuración del navegador.",
              variant: "destructive",
            });
            return;
          }
        }

        // Verificar protocolo HTTPS
        if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          toast({
            title: "Protocolo No Seguro",
            description: "El reconocimiento de voz requiere HTTPS. Asegúrate de estar en una conexión segura.",
            variant: "destructive",
          });
          return;
        }

        setHasProcessed(false);
        setIsProcessing(false);
        processingRef.current = false;
        startListening();
        setStatusMessage("Escuchando...");

      } catch (error) {
        console.error('Error al verificar permisos:', error);
        // Continuar sin verificación de permisos si la API no está disponible
        setHasProcessed(false);
        setIsProcessing(false);
        processingRef.current = false;
        startListening();
        setStatusMessage("Escuchando...");
      }
    }
  };

  const MemoizedLoader = useMemo(() => <Loader2 className="mr-2 h-4 w-4 animate-spin" />, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-background text-foreground">
      {/* Header con logo */}
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 w-20 h-20 relative">
          <Image
            src="/logo.png"
            alt="RADictar Logo"
            fill
            className="object-contain rounded-full shadow-lg dark:shadow-white/10"
            priority
          />
        </div>
        <h1 className="text-heading-1 text-primary">RADictar</h1>
        <p className="text-body text-subtext-color mt-2">Tu asistente de tareas por voz</p>
      </div>

      {/* Layout responsivo: 2 columnas en desktop, 1 columna en móvil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] max-h-[900px]">

        {/* Columna izquierda: Controles */}
        <div className="space-y-4 lg:space-y-6 order-1">
          {/* Autenticación */}
          <Card className="bg-card h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl text-foreground">
                <User className="w-5 h-5 text-primary" />
                {user ? "Perfil" : "Autenticación"}
              </CardTitle>
              <CardDescription className="text-sm text-subtext-color">
                {user ? "Gestiona tu sesión" : "Inicia sesión para continuar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!user ? (
                <GoogleSignInButton
                  onLoginSuccess={handleLoginSuccess}
                  onLoginError={handleLoginError}
                  isLoading={isAuthLoading}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.displayName || "Usuario"}
                      </p>
                      <p className="text-xs text-subtext-color truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </div>
              )}
              {token && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  ✅ Autenticación exitosa
                </p>
              )}
            </CardContent>
          </Card>

          {/* Control de Voz - Solo mostrar si está autenticado */}
          {token && (
            <Card className="bg-card h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg lg:text-xl text-foreground">
                  Control de Voz
                </CardTitle>
                <CardDescription className="text-sm text-subtext-color">
                  <span className="hidden sm:inline">Presiona para hablar. Formato: 'Crear tarea [nombre] en proyecto [proyecto] para [usuario]'</span>
                  <span className="sm:hidden">Presiona para hablar y crear tareas</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {/* Botón de micrófono */}
                <Button
                  size="lg"
                  className={cn(
                    "w-16 h-16 lg:w-20 lg:h-20 rounded-full transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2",
                    isListening
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse text-destructive-foreground focus:ring-destructive/30"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary/30",
                  )}
                  onClick={handleMicClick}
                  disabled={isLoading || !recognitionSupported}
                  aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
                >
                  <Mic className="w-6 h-6 lg:w-8 lg:h-8" />
                </Button>

                {/* Estado actual */}
                <div className="text-center w-full">
                  <p className="text-sm text-subtext-color mb-2 min-h-[20px]">
                    {isLoading
                      ? '⏳ Procesando...'
                      : isListening
                        ? '🎤 Escuchando...'
                        : statusMessage
                    }
                  </p>

                  {/* Barra de progreso compacta */}
                  {isLoading && (
                    <div className="w-full mb-3">
                      <Progress value={progressValue} className="w-full h-2 mb-1" />
                      <p className="text-xs text-subtext-color">{progressValue}% completado</p>
                    </div>
                  )}
                </div>

                {/* Transcripción */}
                <Textarea
                  readOnly
                  value={transcript || "La transcripción aparecerá aquí..."}
                  className="w-full p-3 rounded-md bg-muted/50 text-foreground border border-border placeholder:text-subtext-color text-sm resize-none"
                  rows={3}
                  placeholder="La transcripción de voz aparecerá aquí..."
                />

                {/* Diagnósticos de error de voz */}
                {speechError && (
                  <div className="w-full space-y-2">
                    <div className="p-2 bg-destructive/10 rounded border border-destructive/20 text-center">
                      <p className="text-sm text-destructive mb-2">⚠️ Error de voz detectado</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const diagnosticInfo = {
                            error: speechError,
                            timestamp: new Date().toISOString(),
                            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server-side',
                            isHttps: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
                            speechRecognitionAvailable: typeof window !== 'undefined' ? typeof window.SpeechRecognition !== 'undefined' : false,
                            webkitSpeechRecognitionAvailable: typeof window !== 'undefined' ? typeof window.webkitSpeechRecognition !== 'undefined' : false,
                            permissions: typeof window !== 'undefined' && navigator.permissions ? 'API disponible' : 'API no disponible'
                          };
                          console.log('Información de diagnóstico completa:', diagnosticInfo);
                          if (typeof window !== 'undefined') {
                            navigator.clipboard?.writeText(JSON.stringify(diagnosticInfo, null, 2));
                          }
                          toast({
                            title: "Información copiada",
                            description: "Los datos de diagnóstico se copiaron al portapapeles.",
                          });
                        }}
                        className="text-xs w-full"
                      >
                        📋 Copiar diagnóstico
                      </Button>
                    </div>
                  </div>
                )}

                {/* Información de compatibilidad */}
                {!recognitionSupported && (
                  <div className="w-full text-center space-y-2 p-3 bg-destructive/10 rounded border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ Reconocimiento de voz no disponible
                    </p>
                    <details className="text-xs text-subtext-color">
                      <summary className="cursor-pointer hover:text-foreground transition-colors">Ver detalles técnicos</summary>
                      <div className="mt-2 p-2 bg-card rounded border text-left space-y-1">
                        <p><strong>Navegador:</strong> {typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'N/A'}</p>
                        <p><strong>HTTPS:</strong> {typeof window !== 'undefined' ? (window.location.protocol === 'https:' ? 'Sí' : 'No') : 'N/A'}</p>
                        <p><strong>Speech API:</strong> {typeof window !== 'undefined' ? (typeof window.SpeechRecognition !== 'undefined' || typeof window.webkitSpeechRecognition !== 'undefined' ? 'Disponible' : 'No disponible') : 'N/A'}</p>
                      </div>
                    </details>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna derecha: Log del procedimiento */}
        <div className="space-y-4 order-2 lg:order-2">
          <Card className="bg-card h-full flex flex-col min-h-[400px] lg:min-h-[500px]">
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg lg:text-xl text-foreground">
                    📋 Log del Procedimiento
                  </CardTitle>
                  <CardDescription className="text-sm text-subtext-color">
                    <span className="hidden sm:inline">Seguimiento en tiempo real del procesamiento</span>
                    <span className="sm:hidden">Progreso en tiempo real</span>
                  </CardDescription>
                </div>
                {progressMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProgressMessages([]);
                      setProgressValue(0);
                      setStatusMessage(token ? "Di un comando para empezar." : "Inicia sesión para comenzar.");
                    }}
                    className="text-xs h-8 px-3 flex-shrink-0"
                  >
                    🗑️ <span className="ml-1 hidden sm:inline">Limpiar</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
              {progressMessages.length > 0 ? (
                <div className="space-y-2 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                  {progressMessages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "text-sm p-3 rounded-lg text-left transition-all duration-200 animate-in slide-in-from-top-2",
                        message.includes("❌")
                          ? "log-message-error"
                          : message.includes("✅")
                            ? "log-message-success"
                            : message.includes("📋")
                              ? "log-message-info"
                              : "log-message-default"
                      )}
                    >
                      <div className="font-medium break-words">{message}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date().toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-subtext-color">
                  <div className="max-w-xs">
                    <div className="text-4xl mb-4">{token ? "🎤" : "🔐"}</div>
                    <p className="text-lg font-medium">
                      {token ? "¡Listo para empezar!" : "Autenticación requerida"}
                    </p>
                    <p className="text-sm mt-2 opacity-80">
                      {token ? (
                        <>
                          <span className="hidden sm:inline">Presiona el micrófono para comenzar</span>
                          <span className="sm:hidden">Presiona el micrófono</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Inicia sesión con Google para usar el asistente</span>
                          <span className="sm:hidden">Inicia sesión para continuar</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
