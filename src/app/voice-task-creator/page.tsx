"use client"

import { AppLayout } from "@/components/layouts/app-layout"
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
import { useProjects } from "@/hooks/useProjects"
import { getAccessToken } from "@/lib/tokens"
import { Mic } from "lucide-react"
import { motion } from "motion/react"

export default function VoiceTaskCreator() {
  const { isPending: isLoadingProjects, isError: isErrorLoadingProjects, data: projects } = useProjects()

  const accessToken = getAccessToken()
  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col flex-1"
      >
        {/* Header with Project Selector */}
        <div className="p-4 md:p-6 border-b">
          <Select disabled={isLoadingProjects || isErrorLoadingProjects || !accessToken}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue
                placeholder={
                  !accessToken
                    ? "Inicia sesión para ver proyectos"
                    : isLoadingProjects
                      ? "Cargando proyectos..."
                      : isErrorLoadingProjects
                        ? "Error al cargar proyectos"
                        : "Selecciona un proyecto"
                }
              />
            </SelectTrigger>
            <SelectContent>
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
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold">
                Crea una tarea en RAD con tu voz
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Mantén presionado el botón para grabar.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6">
              {/* Botón central con animación interactiva */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17
                }}
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(131, 218, 164, 0.7)",
                      "0 0 0 10px rgba(131, 218, 164, 0)",
                      "0 0 0 20px rgba(131, 218, 164, 0)"
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full"
                />
                <Button
                  size="icon"
                  className="rounded-full w-40 h-40 md:w-48 md:h-48 shadow-lg transition-transform duration-200 ease-in-out bg-primary hover:bg-primary/90 relative z-10"
                  aria-label="Start recording"
                >
                  <Mic className="w-16 h-16" />
                </Button>
              </motion.div>

              <p className="text-muted-foreground">
                Suelta para finalizar la grabación.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </AppLayout>
  )
}
