"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRADLogin } from "@/hooks/queries/useRADAuth"
import { AuthUser } from "@/lib/google-auth/interfaces/google-auth.interface"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const queryClient = useQueryClient()
  const radLogin = useRADLogin()

  // 🔍 CONCEPTO: useQuery para leer datos del cache
  // Observa los datos del usuario en el cache reactivamente
  const { data: user } = useQuery<AuthUser | null>({
    queryKey: ["auth", "user"],
    queryFn: () => queryClient.getQueryData<AuthUser>(["auth", "user"]) || null,
    enabled: false, // No hace peticiones, solo lee el cache
  })

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

      console.log(`¡Bienvenido ${googleUser.displayName || googleUser.email}!`)
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
      {/* 🎉 CONCEPTO: Mostrar datos del usuario después del login */}
      {user && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-sm font-medium text-green-800">
                  ¡Bienvenido, {user.displayName || user.email}! 🎉
                </p>
                <p className="text-xs text-green-600">
                  Has iniciado sesión exitosamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <p className="text-sm text-red-600 text-center">
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
