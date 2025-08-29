import { CreateActivityArgsSchema } from "@/lib/schemas";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Importar los tipos necesarios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Schemas para validación

const RequestSchema = z.object({
  args: CreateActivityArgsSchema,
  token: z.string().min(1, "Token is required"),
});

// Tipos para las respuestas de la API
interface Project {
  id: number;
  name: string;
}

interface Module {
  id: number;
  name: string;
}

interface Phase {
  id: number;
  name: string;
}

interface User {
  id: number;
  fullName: string;
}

interface FindProjectsApiResponse {
  data: Project[];
}

interface ModulesApiResponse {
  data: Module[];
}

interface PhaseApiResponse {
  data: Phase[];
}

interface UsersApiResponse {
  data: User[];
}

interface TaskApiResponse {
  data: {
    id: number;
    name: string;
  };
}

interface CreateTaskPayload {
  projectId: number;
  statusId: number;
  isIncidence: boolean;
  isDelayed: boolean;
  name: string;
  typeId: number;
  phaseId: number;
  moduleId: number;
  plannedStartDate: string;
  plannedEndDate: string;
  priorityId: number;
  estimatedHours: string;
  estimatedMinutes: string;
  responsibleId: number;
}

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const getProjectIdByName = async (
  name: string,
  token: string
): Promise<Project | null> => {
  try {
    const response = await axios.get<FindProjectsApiResponse>(
      `${API_BASE_URL}/projects/`,
      {
        headers: getHeaders(token),
      }
    );

    const project = response.data.data.find((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    if (!project) {
      return null;
    }

    return project;
  } catch (error) {
    console.error("Error finding project:", error);
    return null;
  }
};

const getModuleIdByName = async (
  name: string | undefined,
  projectId: number,
  token: string
): Promise<Module | null> => {
  try {
    const response = await axios.get<ModulesApiResponse>(
      `${API_BASE_URL}/projects/project/${projectId}/module`,
      {
        headers: getHeaders(token),
      }
    );
    const modules = response.data.data;

    if (!name) {
      return modules[0] ?? null;
    }
    const module = modules.find((m) =>
      m.name.toLowerCase().includes(name.toLowerCase())
    );
    return module ?? modules[0] ?? null;
  } catch (error) {
    console.error("Error finding module:", error);
    return null;
  }
};

const getPhaseIdByName = async (
  name: string | undefined,
  projectId: number,
  token: string
): Promise<Phase | null> => {
  try {
    const response = await axios.get<PhaseApiResponse>(
      `${API_BASE_URL}/projects/project/${projectId}/phase`,
      {
        headers: getHeaders(token),
      }
    );
    const phases = response.data.data;

    if (!name) {
      return phases[0] ?? null;
    }

    const phase = phases.find((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    return phase ?? phases[0] ?? null;
  } catch (error) {
    console.error("Error finding phase:", error);
    return null;
  }
};

const getUserIdByName = async (
  name: string,
  projectId: number,
  token: string
): Promise<number | null> => {
  try {
    const url = `${API_BASE_URL}/admin/users/find?pagination[page]=1&pagination[pageSize]=15&filters[projectIds][]=${projectId}`;
    const response = await axios.get<UsersApiResponse>(url, {
      headers: getHeaders(token),
    });
    const users = response.data.data;
    const user = users.find((u) =>
      u.fullName.toLowerCase().includes(name.toLowerCase())
    );
    return user?.id ?? users[0]?.id ?? null;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar la entrada
    const validatedInput = RequestSchema.parse(body);
    const { args, token } = validatedInput;

    // Array para almacenar los mensajes de progreso
    const progressMessages: { message: string; isError?: boolean }[] = [];

    const addProgress = (message: string, isError = false) => {
      progressMessages.push({ message, isError });
    };

    addProgress(`📋 Campos identificados:
• Proyecto: ${args.projectName}
• Tarea: ${args.title}
• Usuario: ${args.userName}${
      args.moduleName
        ? `\n• Módulo: ${args.moduleName}`
        : "\n• Módulo: (se usará el primero disponible)"
    }${
      args.phaseName
        ? `\n• Fase: ${args.phaseName}`
        : "\n• Fase: (se usará la primera disponible)"
    }`);

    // Buscar proyecto
    addProgress(`🔍 Buscando proyecto "${args.projectName}"...`);
    const project = await getProjectIdByName(args.projectName, token);
    if (!project) {
      const errorMsg = `❌ Proyecto "${args.projectName}" no encontrado.`;
      addProgress(errorMsg, true);
      return NextResponse.json(
        { error: errorMsg, progressMessages },
        { status: 404 }
      );
    }
    addProgress(`✅ Proyecto encontrado: ${args.projectName} (ID: ${project})`);

    // Buscar módulo
    addProgress(
      `🔍 ${
        args.moduleName
          ? `Buscando módulo "${args.moduleName}"`
          : "Obteniendo primer módulo disponible"
      }...`
    );
    const module = await getModuleIdByName(args.moduleName, project.id, token);
    if (!module) {
      const errorMsg = args.moduleName
        ? `❌ Módulo "${args.moduleName}" no encontrado en el proyecto.`
        : `❌ No se encontraron módulos en el proyecto.`;
      addProgress(errorMsg, true);
      return NextResponse.json(
        { error: errorMsg, progressMessages },
        { status: 404 }
      );
    }
    addProgress(`✅ Módulo seleccionado: ${module.name} (ID: ${module.id})`);

    // Buscar fase
    addProgress(
      `🔍 ${
        args.phaseName
          ? `Buscando fase "${args.phaseName}"`
          : "Obteniendo primera fase disponible"
      }...`
    );
    const phase = await getPhaseIdByName(args.phaseName, project.id, token);
    if (!phase) {
      const errorMsg = args.phaseName
        ? `❌ Fase "${args.phaseName}" no encontrada en el proyecto.`
        : `❌ No se encontraron fases en el proyecto.`;
      addProgress(errorMsg, true);
      return NextResponse.json(
        { error: errorMsg, progressMessages },
        { status: 404 }
      );
    }
    addProgress(`✅ Fase seleccionada: ${phase.name} (ID: ${phase.id})`);

    // Buscar usuario
    addProgress(`🔍 Buscando usuario "${args.userName}"...`);
    const responsibleId = await getUserIdByName(
      args.userName,
      project.id,
      token
    );
    if (!responsibleId) {
      const errorMsg = `❌ Usuario "${args.userName}" no encontrado en el proyecto.`;
      addProgress(errorMsg, true);
      return NextResponse.json(
        { error: errorMsg, progressMessages },
        { status: 404 }
      );
    }
    addProgress(`✅ Usuario encontrado (ID: ${responsibleId})`);

    // Preparar la tarea
    addProgress(`📅 Preparando información de la tarea...`);
    const today = new Date();
    const plannedDate = today.toISOString();

    const requestBody: CreateTaskPayload = {
      projectId: project.id,
      statusId: 1, // Valor estático
      isIncidence: false, // Valor estático
      isDelayed: false, // Valor estático
      name: args.title,
      typeId: 5, // Valor estático
      phaseId: phase.id,
      moduleId: module.id,
      plannedStartDate: plannedDate,
      plannedEndDate: plannedDate,
      priorityId: 1, // Valor estático
      estimatedHours: args.estimatedHours || "2", // Default 2 horas
      estimatedMinutes: args.estimatedMinutes || "0", // Default 0 minutos
      responsibleId: responsibleId,
    };

    addProgress(`🚀 Creando tarea en el sistema...`);

    // Crear la tarea
    const response = await axios.post<TaskApiResponse>(
      `${API_BASE_URL}/activities/activity`,
      requestBody,
      { headers: getHeaders(token) }
    );

    const createdTask = response.data.data;
    const successMessage = `✅ ¡Tarea "${createdTask.name}" creada con éxito en el proyecto ${args.projectName}! (ID: ${createdTask.id})`;
    addProgress(successMessage);

    return NextResponse.json({
      success: true,
      message: successMessage,
      progressMessages,
      task: createdTask,
    });
  } catch (error) {
    console.error("Error creating activity:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    let errorMessage = "";
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;
      errorMessage = `❌ Error al crear la tarea (${statusCode}): ${errorMsg}`;
    } else {
      errorMessage = `❌ Error al crear la tarea: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
