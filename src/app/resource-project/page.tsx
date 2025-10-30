"use client"

import { AppLayout } from "@/components/layouts/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Search, Trash2, Upload, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"

interface UploadedFile {
  id: string
  name: string
  size: string
  progress?: number
}

interface TeamRole {
  id: string
  name: string
  count?: number
  color: "primary" | "green" | "sky" | "orange"
}

const colorClasses = {
  primary: "bg-primary/20 text-primary dark:bg-primary/30",
  green: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
}

const hoverColorClasses = {
  primary: "hover:bg-primary/30 dark:hover:bg-primary/40",
  green: "hover:bg-green-200/80 dark:hover:bg-green-800/60",
  sky: "hover:bg-sky-200/80 dark:hover:bg-sky-800/60",
  orange: "hover:bg-orange-200/80 dark:hover:bg-orange-800/60",
}

export default function ResourceProject() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: "1", name: "Project_Specs_v2.docx", size: "1.2 MB" },
    { id: "2", name: "API_Usecases.pdf", size: "2.4 MB", progress: 45 },
  ])

  const [teamRoles, setTeamRoles] = useState<TeamRole[]>([
    { id: "1", name: "Desarrollador Backend", count: 2, color: "primary" },
    { id: "2", name: "Diseñador UX", color: "green" },
    { id: "3", name: "Python", color: "sky" },
    { id: "4", name: "React", count: 1, color: "orange" },
  ])

  const [roleInput, setRoleInput] = useState("")

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id))
  }

  const removeRole = (id: string) => {
    setTeamRoles(teamRoles.filter((role) => role.id !== id))
  }

  const addRole = () => {
    if (roleInput.trim()) {
      const colors: Array<"primary" | "green" | "sky" | "orange"> = ["primary", "green", "sky", "orange"]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      setTeamRoles([
        ...teamRoles,
        { id: Date.now().toString(), name: roleInput.trim(), color: randomColor },
      ])
      setRoleInput("")
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-4"
        >
          <h1 className="text-4xl font-black tracking-tight">Iniciar Nuevo Proyecto</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Document Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-border">
              <CardHeader>
                <CardTitle className="text-[22px]">1. Carga los Documentos del Proyecto</CardTitle>
                <CardDescription className="text-base">
                  Sube especificaciones, casos de uso, o cualquier documento relevante. Nuestra IA los
                  analizará para entender los requisitos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <motion.div
                  whileHover={{ scale: 1.005 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border px-6 py-12 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <div className="flex max-w-[480px] flex-col items-center gap-1.5">
                    <p className="text-base font-bold text-center">
                      Arrastra tus archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-muted-foreground text-center">
                      Soporta PDF, DOCX, TXT.
                    </p>
                  </div>
                  <Button variant="secondary" size="default" className="mt-2">
                    Seleccionar archivos
                  </Button>
                </motion.div>

                {/* Uploaded Files List */}
                <div className="flex flex-col gap-2">
                  <AnimatePresence>
                    {uploadedFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border"
                      >
                        <FileText className="text-primary w-5 h-5 flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          {file.progress !== undefined ? (
                            <div className="w-full bg-secondary rounded-full h-1 mt-1.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${file.progress}%` }}
                                transition={{ duration: 0.5 }}
                                className="bg-primary h-1 rounded-full"
                              />
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">{file.size}</p>
                          )}
                        </div>
                        {file.progress !== undefined ? (
                          <p className="text-sm font-medium text-muted-foreground flex-shrink-0">{file.progress}%</p>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: Team Definition */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-border flex flex-col">
              <CardHeader>
                <CardTitle className="text-[22px]">2. Define los Perfiles del Equipo</CardTitle>
                <CardDescription className="text-base">
                  Especifica los roles y habilidades clave que necesitas. Puedes indicar la cantidad
                  requerida para cada perfil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow flex flex-col">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    className="pl-10 h-12"
                    placeholder="Añadir rol o habilidad (e.g., 'Diseñador UX', 'Python')"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addRole()}
                  />
                </div>

                {/* Roles Tags */}
                <div className="flex flex-wrap gap-2 p-2 min-h-[160px] flex-grow content-start">
                  <AnimatePresence>
                    {teamRoles.map((role) => (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-1.5 ${colorClasses[role.color]} py-1 pl-2.5 pr-0.5 rounded-full h-7`}
                      >
                        <span className="font-medium text-xs leading-none">{role.name}</span>
                        {role.count && (
                          <div className="flex items-center justify-center bg-background rounded-full px-1.5 py-0.5 min-w-[20px] h-5">
                            <span className="font-bold text-xs leading-none">{role.count}</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-5 w-5 p-0 rounded-full ${hoverColorClasses[role.color]} transition-colors ml-0.5`}
                          onClick={() => removeRole(role.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex flex-col items-stretch sm:items-center gap-3 pt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full sm:min-w-[240px] h-12 text-base font-bold">
                      Analizar y Crear Proyecto
                    </Button>
                  </motion.div>
                  <Button
                    className="w-full sm:min-w-[240px] h-12 text-base font-bold"
                    variant="secondary"
                    disabled
                  >
                    Generar Equipo (Inactivo)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
