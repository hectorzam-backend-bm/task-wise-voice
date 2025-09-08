import axios from "axios";
import qs from "qs";
import { z } from "zod";
import { CreateActivityArgsSchema } from "./schemas";
import { LoginApiResponse } from "./types/login";
import { Module, ModulesApiResponse } from "./types/modules";
import { Phase, PhaseApiResponse } from "./types/phases";
import { FindProjectsApiResponse, Project } from "./types/projects";
import { CreateTaskPayload, TaskApiResponse } from "./types/tasks";
import { UsersApiResponse } from "./types/users";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type CreateActivityArgs = z.infer<typeof CreateActivityArgsSchema>;
export type ProgressCallback = (message: string, isError?: boolean) => void;

const getHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

const findProjectByName = async (
  name: string,
  token: string
): Promise<Project | null> => {
  try {
    ///projects?filters[name]=latino
    const query = qs.stringify({
      "filters[name]": name,
    });
    const response = await axios.get<FindProjectsApiResponse>(
      `${API_BASE_URL}/projects?${query}`,
      {
        headers: getHeaders(token),
      }
    );

    if (response.data.data.length === 1) {
      return response.data.data[0];
    }

    const project = response.data.data.find((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    return project ?? null;
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

export const createActivity = async (
  args: CreateActivityArgs,
  token: string,
  onProgress?: ProgressCallback
): Promise<string> => {
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
    const project = await findProjectByName(args.projectName, token);
    if (!project) {
      const errorMsg = `❌ Proyecto "${args.projectName}" no encontrado.`;
      onProgress?.(errorMsg, true);
      return errorMsg;
    }
    onProgress?.(`✅ Proyecto encontrado: ${project.name} (ID: ${project.id})`);

    onProgress?.(
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
      onProgress?.(errorMsg, true);
      return errorMsg;
    }

    onProgress?.(`✅ Módulo seleccionado: ${module.name} (ID: ${module.id})`);

    onProgress?.(
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
      onProgress?.(errorMsg, true);
      return errorMsg;
    }

    onProgress?.(`✅ Fase seleccionada: ${phase.name} (ID: ${phase.id})`);

    onProgress?.(`🔍 Buscando usuario "${args.userName}"...`);
    const responsibleId = await getUserIdByName(
      args.userName,
      project.id,
      token
    );

    if (!responsibleId) {
      const errorMsg = `❌ Usuario "${args.userName}" no encontrado en el proyecto.`;
      onProgress?.(errorMsg, true);
      return errorMsg;
    }
    onProgress?.(`✅ Usuario encontrado (ID: ${responsibleId})`);

    onProgress?.(`📅 Preparando información de la tarea...`);
    const today = new Date();
    const plannedDate = today.toISOString();

    const requestBody = {
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
    } satisfies CreateTaskPayload;

    onProgress?.(`🚀 Creando tarea en el sistema...`);

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

export const loginApi = async (tokenId: string): Promise<LoginApiResponse> => {
  try {
    const response = await axios.post<LoginApiResponse>(
      `${API_BASE_URL}/auth/login`,
      { tokenId },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error en loginApi:", error);
    throw error;
  }
};
