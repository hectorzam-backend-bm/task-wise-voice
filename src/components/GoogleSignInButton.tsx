"use client";

import { Button } from "@/components/ui/button";
import { loginApi } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { LogIn } from "lucide-react";

interface GoogleSignInButtonProps {
  onLoginSuccess: (token: string, user: any) => void;
  onLoginError: (error: string) => void;
  isLoading?: boolean;
}

export default function GoogleSignInButton({
  onLoginSuccess,
  onLoginError,
  isLoading = false
}: GoogleSignInButtonProps) {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const tokenId = await user.getIdToken();

      const loginResponse = await loginApi(tokenId);

      if (typeof window !== 'undefined') {
        localStorage.setItem("apiToken", loginResponse.data.tokens.accessToken);
      }


      onLoginSuccess(loginResponse.data.tokens.accessToken, {
        ...user,
        apiResponse: loginResponse
      });

    } catch (error: any) {
      console.error("Error durante el inicio de sesión:", error);

      let errorMessage = "Error desconocido durante el inicio de sesión";

      if (error?.code) {

        switch (error.code) {
          case 'auth/popup-closed-by-user':
            errorMessage = "Inicio de sesión cancelado por el usuario";
            break;
          case 'auth/popup-blocked':
            errorMessage = "Popup bloqueado. Permite popups para este sitio";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Error de conexión. Verifica tu internet";
            break;
          default:
            errorMessage = `Error de autenticación: ${error.message}`;
        }
      } else if (error?.response) {

        errorMessage = `Error del servidor: ${error.response?.data?.message || error.message}`;
      } else {
        errorMessage = error?.message || errorMessage;
      }

      onLoginError(errorMessage);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      size="lg"
    >
      {isLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Iniciando sesión...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Iniciar sesión con Google
        </>
      )}
    </Button>
  );
}
