"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { AuthUser } from "@/lib/google-auth/interfaces/google-auth.interface"
import { fetchProjects } from "@/services/rad.service"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Mic } from "lucide-react"

export default function VoiceTaskCreator() {
  const queryClient = useQueryClient()
  const { data: user } = useQuery<AuthUser | null>({
    queryKey: ["auth", "user"],
    queryFn: () => queryClient.getQueryData<AuthUser>(["auth", "user"]) || null,
    enabled: false,
  })

  const token = queryClient.getQueryData<string>(["radToken"])

  const { isPending: isLoadingProjects, isError: isErrorLoadingProjects, data: projects, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjects(token!),
  })




  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 sm:p-6">
        <div className="container mx-auto flex justify-between items-center">
          {/* Select de proyectos */}
          <Select disabled={isLoadingProjects || isErrorLoadingProjects} >
            <SelectTrigger className="w-72 sm:w-96">
              <SelectValue placeholder="Selecciona un proyecto" />
            </SelectTrigger>
            <SelectContent clas>
              <SelectGroup>
                <SelectLabel>Proyectos</SelectLabel>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.name}>
                    {project.client.name} - {project.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Usuario */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuApLDZOHjJZpOhitQs7NQVB8xp_W-ofqLQgiO12mwyBvUjgeupi8QYm6V0XmOr37aV8BBPUk1wWydJZOEuVz4HRXsasYGdB9fgtJBUSM8MdcGG8PknCXVY5MaUoLmXTHnoqyX69q-xMimt-eLBa8H8O4fi1Toe7w7eM651GOviqL9H9xfZThIJbhd3Pj63eHaP4-TOftyju23qCgYKvmxUlVf6L5ajFr6AzptbZP-Mvu0wsvipXpLqp-zJmmiOcJJWTwg0N7Pap9A" />
              <AvatarFallback>CP</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">
              {user?.displayName || "Usuario"}
            </span>
          </div>
        </div>
      </header >

      {/* Contenido principal */}
      < div className="flex flex-col items-center justify-center flex-1 px-4 pt-20 text-center" >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800">
              Crea una tarea en RAD con tu voz
            </CardTitle>
            <CardDescription className="text-lg text-slate-600">
              Mantén presionado el botón para grabar.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-6">
            {/* Botón central */}
            <div className="relative">
              <Button
                size="icon"
                className="rounded-full w-40 h-40 md:w-48 md:h-48 shadow-lg transition-transform duration-200 ease-in-out bg-primary hover:scale-105 active:scale-95"
                aria-label="Start recording"
              >
                <Mic className="w-16 h-16" />
              </Button>

              {/* Ping animado */}
              <div className="absolute inset-0 rounded-full border-4 border-primary opacity-0 animate-ping-slow"></div>
            </div>

            <p className="text-slate-500">Suelta para finalizar la grabación.</p>
          </CardContent>
        </Card>
      </div >

      {/* Animación global */}
      < style jsx global > {`
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style >
    </div >
  )
}
