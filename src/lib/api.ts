import axios from "axios";
import { z } from "zod";
import { Module, ModulesApiResponse } from "./types/modules";
import { Phase, PhaseApiResponse } from "./types/phases";
import { FindProjectsApiResponse } from "./types/projects";
import { CreateTaskPayload, TaskApiResponse } from "./types/tasks";
import { UsersApiResponse } from "./types/users";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Zod schemas para validación de argumentos
export const CreateActivityArgsSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  title: z.string().min(1, "Task title is required"),
  userName: z.string().min(1, "User name is required"),
  moduleName: z.string().optional(),
  phaseName: z.string().optional(),
  estimatedHours: z.string().optional(),
  estimatedMinutes: z.string().optional(),
});

export const FindProjectArgsSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
});

// Union type para todos los argumentos posibles
export const ApiArgsSchema = z.union([
  CreateActivityArgsSchema,
  FindProjectArgsSchema,
]);

// TypeScript types derivados de los schemas
export type CreateActivityArgs = z.infer<typeof CreateActivityArgsSchema>;
export type FindProjectArgs = z.infer<typeof FindProjectArgsSchema>;
export type ApiArgs = z.infer<typeof ApiArgsSchema>;

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// Get project ID by name using real API
const getProjectIdByName = async (
  name: string,
  token: string
): Promise<number | null> => {
  try {
    console.log(`Searching for project ID for: ${name}`);
    const response = await axios.get<FindProjectsApiResponse>(
      `${API_BASE_URL}/projects/`,
      {
        headers: getHeaders(token),
      }
    );

    const project = response.data.data.find((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    return project ? project.id : null;
  } catch (error) {
    console.error("Error finding project:", error);
    return null;
  }
};

const getModuleIdByName = async (
  name: string | undefined,
  projectId: number,
  token: string
): Promise<number | null> => {
  try {
    console.log(`Searching for module ID for: ${name} in project ${projectId}`);
    const response = await axios.get<ModulesApiResponse>(
      `${API_BASE_URL}/projects/project/${projectId}/module`,
      {
        headers: getHeaders(token),
      }
    );
    const modules = response.data.data;
    console.log(`Found modules: ${modules.map((m) => m.name).join(", ")}`);
    if (!name) {
      return modules[0]?.id ?? null;
    }
    const module = modules.find((m) =>
      m.name.toLowerCase().includes(name.toLowerCase())
    );
    return module?.id ?? modules[0]?.id ?? null;
  } catch (error) {
    console.error("Error finding module:", error);
    return null;
  }
};

const getPhaseIdByName = async (
  name: string | undefined,
  projectId: number,
  token: string
): Promise<number | null> => {
  try {
    console.log(`Searching for phase ID for: ${name} in project ${projectId}`);
    const response = await axios.get<PhaseApiResponse>(
      `${API_BASE_URL}/projects/project/${projectId}/phase`,
      {
        headers: getHeaders(token),
      }
    );
    const phases = response.data.data;

    if (!name) {
      return phases[0]?.id ?? null;
    }

    const phase = phases.find((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    return phase ? phase.id : phases[0]?.id ?? null;
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
    console.log(`Searching for user ID for: ${name} in project ${projectId}`);
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

export type ProgressCallback = (message: string, isError?: boolean) => void;

export const callCreateActivityAPI = async (
  args: CreateActivityArgs,
  token: string,
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log("Calling Create Activity Flow with args:", args);

  // Mostrar campos identificados
  onProgress?.(`📋 Campos identificados:
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

  try {
    onProgress?.(`🔍 Buscando proyecto "${args.projectName}"...`);
    const projectId = await getProjectIdByName(args.projectName, token);
    if (!projectId) {
      const errorMsg = `❌ Proyecto "${args.projectName}" no encontrado.`;
      onProgress?.(errorMsg, true);
      return errorMsg;
    }
    onProgress?.(
      `✅ Proyecto encontrado: ${args.projectName} (ID: ${projectId})`
    );

    // Si no se especifica módulo, obtener el primero disponible
    onProgress?.(
      `🔍 ${
        args.moduleName
          ? `Buscando módulo "${args.moduleName}"`
          : "Obteniendo primer módulo disponible"
      }...`
    );
    const moduleId = await getModuleIdByName(args.moduleName, projectId, token);
    if (!moduleId) {
      const errorMsg = args.moduleName
        ? `❌ Módulo "${args.moduleName}" no encontrado en el proyecto.`
        : `❌ No se encontraron módulos en el proyecto.`;
      onProgress?.(errorMsg, true);
      return errorMsg;
    }

    // Obtener información del módulo para mostrar al usuario
    const modules = await getProjectModules(projectId, token);
    const selectedModule = modules.find((m) => m.id === moduleId);
    onProgress?.(
      `✅ Módulo seleccionado: ${
        selectedModule?.name || "Desconocido"
      } (ID: ${moduleId})`
    );

    // Si no se especifica fase, obtener la primera disponible
    onProgress?.(
      `🔍 ${
        args.phaseName
          ? `Buscando fase "${args.phaseName}"`
          : "Obteniendo primera fase disponible"
      }...`
    );
    const phaseId = await getPhaseIdByName(args.phaseName, projectId, token);
    if (!phaseId) {
      const errorMsg = args.phaseName
        ? `❌ Fase "${args.phaseName}" no encontrada en el proyecto.`
        : `❌ No se encontraron fases en el proyecto.`;
      onProgress?.(errorMsg, true);
      return errorMsg;
    }

    // Obtener información de la fase para mostrar al usuario
    const phases = await getProjectPhases(projectId, token);
    const selectedPhase = phases.find((p) => p.id === phaseId);
    onProgress?.(
      `✅ Fase seleccionada: ${
        selectedPhase?.name || "Desconocida"
      } (ID: ${phaseId})`
    );

    // Si se especifica usuario, buscarlo; si no, obtener el primero disponible
    onProgress?.(`🔍 Buscando usuario "${args.userName}"...`);
    const responsibleId = await getUserIdByName(
      args.userName,
      projectId,
      token
    );

    if (!responsibleId) {
      const errorMsg = `❌ Usuario "${args.userName}" no encontrado en el proyecto.`;
      onProgress?.(errorMsg, true);
      return errorMsg;
    }
    onProgress?.(`✅ Usuario encontrado (ID: ${responsibleId})`);

    // Preparar fechas para el día actual
    onProgress?.(`📅 Preparando información de la tarea...`);
    const today = new Date();
    const plannedDate = today.toISOString();

    const requestBody = {
      projectId: projectId,
      statusId: 1, // Valor estático
      isIncidence: false, // Valor estático
      isDelayed: false, // Valor estático
      name: args.title,
      typeId: 5, // Valor estático
      phaseId: phaseId,
      moduleId: moduleId,
      plannedStartDate: plannedDate,
      plannedEndDate: plannedDate,
      priorityId: 1, // Valor estático
      estimatedHours: args.estimatedHours || "2", // Default 2 horas
      estimatedMinutes: args.estimatedMinutes || "0", // Default 0 minutos
      responsibleId: responsibleId,
    } satisfies CreateTaskPayload;

    console.log("Sending to API:", requestBody);
    onProgress?.(`🚀 Creando tarea en el sistema...`);

    // Llamada real a la API
    const response = await axios.post<TaskApiResponse>(
      `${API_BASE_URL}/activities/activity`,
      requestBody,
      { headers: getHeaders(token) }
    );

    const createdTask = response.data.data;
    const successMessage = `✅ ¡Tarea "${createdTask.name}" creada con éxito en el proyecto ${args.projectName}! (ID: ${createdTask.id})`;
    onProgress?.(successMessage);
    return successMessage;
  } catch (error) {
    console.error("Error creating activity:", error);
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
    onProgress?.(errorMessage, true);
    return errorMessage;
  }
};

export const callFindProjectAPI = async (
  args: FindProjectArgs,
  token: string,
  onProgress?: ProgressCallback
): Promise<string> => {
  console.log("Calling Find Project API with args:", args);

  onProgress?.(`📋 Buscando proyecto: ${args.projectName}`);

  try {
    onProgress?.(`🔍 Consultando lista de proyectos...`);
    const response = await axios.get<FindProjectsApiResponse>(
      `${API_BASE_URL}/projects/`,
      {
        headers: getHeaders(token),
      }
    );

    onProgress?.(
      `📊 Analizando ${response.data.data.length} proyectos disponibles...`
    );
    const project = response.data.data.find((p) =>
      p.name.toLowerCase().includes(args.projectName.toLowerCase())
    );

    if (!project) {
      const errorMsg = `🤔 No se encontró el proyecto con el nombre "${args.projectName}".`;
      onProgress?.(errorMsg, true);
      return errorMsg;
    }

    const successMessage = `✅ Proyecto encontrado: ${project.name} (ID: ${project.id}, Estado: ${project.status}, Cliente: ${project.client.name}).`;
    onProgress?.(successMessage);
    return successMessage;
  } catch (error) {
    console.error("Error finding project:", error);
    let errorMessage = "";
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message;
      errorMessage = `❌ Error al buscar el proyecto: ${errorMsg}`;
    } else {
      errorMessage = `❌ Error al buscar el proyecto: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`;
    }
    onProgress?.(errorMessage, true);
    return errorMessage;
  }
};

export const getProjectModules = async (
  projectId: number,
  token: string
): Promise<Module[]> => {
  try {
    const response = await axios.get<ModulesApiResponse>(
      `${API_BASE_URL}/projects/${projectId}/modules`,
      {
        headers: getHeaders(token),
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching modules:", error);
    return [];
  }
};

export const getProjectPhases = async (
  projectId: number,
  token: string
): Promise<Phase[]> => {
  try {
    const response = await axios.get<PhaseApiResponse>(
      `${API_BASE_URL}/projects/${projectId}/phases`,
      {
        headers: getHeaders(token),
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching phases:", error);
    return [];
  }
};
