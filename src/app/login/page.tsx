"use client"

import { useRADLogin } from "@/app/login/hooks/mutations/useRADAuth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from 'next/navigation'


export function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const queryClient = useQueryClient()
  const radLogin = useRADLogin()
  const router = useRouter()

  const completeLogin = useMutation({
    mutationFn: async () => {
      const { signInWithGoogle } = await import("@/lib/google-auth/google-auth")
      const googleUser = await signInWithGoogle()
      const radResponse = await radLogin.mutateAsync(googleUser.tokenId)

      return { googleUser, radResponse }
    },
    onSuccess: ({ googleUser, radResponse }) => {
      // 🎯 CONCEPTO: setQueryData actualiza el cache inmediatamente
      queryClient.setQueryData(["auth", "user"], googleUser)
      queryClient.setQueryData(["radToken"], radResponse.data.tokens.accessToken)

      // 🔄 CONCEPTO: invalidateQueries refresca datos relacionados
      queryClient.invalidateQueries({ queryKey: ["user-data"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })

      router.push("/voice-task-creator")
    },
    onError: (error) => {
      console.error("Error en el flujo de login:", error)
    }
  })

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    completeLogin.mutate()
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Inicia sesión</CardTitle>
          <CardDescription>
            Hola de nuevo! Bienvenido a RADictar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGoogleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  type="submit"
                  disabled={completeLogin.isPending}
                >
                  {completeLogin.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      {radLogin.isPending ? "Conectando con RAD..." : "Iniciando con Google..."}
                    </>
                  ) : (
                    'Continua con Google'
                  )}
                </Button>

                {completeLogin.isError && (
                  <p className="text-sm text-destructive text-center">
                    Error al iniciar sesión. Intenta de nuevo.
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
