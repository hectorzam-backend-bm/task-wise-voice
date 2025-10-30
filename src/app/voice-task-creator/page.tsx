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
import { AnimatePresence, motion } from "motion/react"

export default function VoiceTaskCreator() {
  const { isPending: isLoadingProjects, isError: isErrorLoadingProjects, data: projects } = useProjects()

  const accessToken = getAccessToken()
  return (
    <AppLayout>
      <div className="flex flex-col flex-1">
        {/* Header with Project Selector */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6 border-b"
        >
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
                <AnimatePresence>
                  {projects?.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <SelectItem value={project.name}>
                        {project.client.name} - {project.name}
                      </SelectItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SelectGroup>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Contenido principal */}
        <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <CardTitle className="text-3xl md:text-4xl font-bold">
                    Crea una tarea en RAD con tu voz
                  </CardTitle>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <CardDescription className="text-lg text-muted-foreground">
                    Mantén presionado el botón para grabar.
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="flex flex-col items-center gap-6">
                {/* Botón central */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.5,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-muted-foreground"
                >
                  Suelta para finalizar la grabación.
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
