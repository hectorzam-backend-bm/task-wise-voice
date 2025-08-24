import axios from "axios";
import { Module, ModulesApiResponse } from "./types/modules";
import { Phase, PhaseApiResponse } from "./types/phases";
import { FindProjectsApiResponse, Project } from "./types/projects";
import { TaskApiResponse } from "./types/tasks";
import { Users, UsersApiResponse } from "./types/users";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
interface ApiArgs {
  [key: string]: any;
}

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

// Get module ID by name for a specific project
const getModuleIdByName = async (
  name: string,
  projectId: number,
  token: string
): Promise<number | null> => {
  try {
    console.log(`Searching for module ID for: ${name} in project ${projectId}`);
    const response = await axios.get<ModulesApiResponse>(
      `${API_BASE_URL}/projects/${projectId}/modules`,
      {
        headers: getHeaders(token),
      }
    );

    const module = response.data.data.find((m) =>
      m.name.toLowerCase().includes(name.toLowerCase())
    );

    return module ? module.id : null;
  } catch (error) {
    console.error("Error finding module:", error);
    return null;
  }
};

// Get phase ID by name for a specific project
const getPhaseIdByName = async (
  name: string,
  projectId: number,
  token: string
): Promise<number | null> => {
  try {
    console.log(`Searching for phase ID for: ${name} in project ${projectId}`);
    const response = await axios.get<PhaseApiResponse>(
      `${API_BASE_URL}/projects/${projectId}/phases`,
      {
        headers: getHeaders(token),
      }
    );

    const phase = response.data.data.find((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    return phase ? phase.id : null;
  } catch (error) {
    console.error("Error finding phase:", error);
    return null;
  }
};

// Get user ID by name for a specific project
const getUserIdByName = async (
  name: string,
  projectId: number,
  token: string
): Promise<number | null> => {
  try {
    console.log(`Searching for user ID for: ${name} in project ${projectId}`);
    const response = await axios.get<UsersApiResponse>(
      `${API_BASE_URL}/projects/${projectId}/users`,
      {
        headers: getHeaders(token),
      }
    );

    const user = response.data.data.find((u) =>
      u.fullName.toLowerCase().includes(name.toLowerCase())
    );

    return user ? user.id : null;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
};

export const callCreateActivityAPI = async (
  args: ApiArgs,
  token: string
): Promise<string> => {
  console.log("Calling Create Activity Flow with args:", args);
  try {
    const projectId = await getProjectIdByName(args.projectName, token);
    if (!projectId) return `❌ Proyecto "${args.projectName}" no encontrado.`;

    // Si no se especifica módulo, obtener el primero disponible
    let moduleId = null;
    if (args.moduleName) {
      moduleId = await getModuleIdByName(args.moduleName, projectId, token);
      if (!moduleId) {
        return `❌ Módulo "${args.moduleName}" no encontrado en el proyecto.`;
      }
    } else {
      // Obtener el primer módulo disponible
      const modules = await getProjectModules(projectId, token);
      if (modules.length > 0) {
        moduleId = modules[0].id;
        console.log(
          `Using first available module: ${modules[0].name} (ID: ${moduleId})`
        );
      } else {
        return `❌ No se encontraron módulos en el proyecto "${args.projectName}".`;
      }
    }

    // Si no se especifica fase, obtener la primera disponible
    let phaseId = null;
    if (args.phaseName) {
      phaseId = await getPhaseIdByName(args.phaseName, projectId, token);
      if (!phaseId) {
        return `❌ Fase "${args.phaseName}" no encontrada en el proyecto.`;
      }
    } else {
      // Obtener la primera fase disponible
      const phases = await getProjectPhases(projectId, token);
      if (phases.length > 0) {
        phaseId = phases[0].id;
        console.log(
          `Using first available phase: ${phases[0].name} (ID: ${phaseId})`
        );
      } else {
        return `❌ No se encontraron fases en el proyecto "${args.projectName}".`;
      }
    }

    // Si se especifica usuario, buscarlo; si no, obtener el primero disponible
    let responsibleId = null;
    if (args.userName) {
      responsibleId = await getUserIdByName(args.userName, projectId, token);
      if (!responsibleId) {
        return `❌ Usuario "${args.userName}" no encontrado en el proyecto.`;
      }
    } else {
      // Obtener el primer usuario disponible
      const users = await getProjectUsers(projectId, token);
      if (users.length > 0) {
        responsibleId = users[0].id;
        console.log(
          `Using first available user: ${users[0].fullName} (ID: ${responsibleId})`
        );
      } else {
        return `❌ No se encontraron usuarios en el proyecto "${args.projectName}".`;
      }
    }

    // Preparar fechas para el día actual
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
    };

    console.log("Sending to API:", requestBody);

    // Llamada real a la API
    const response = await axios.post<TaskApiResponse>(
      `${API_BASE_URL}/tasks`,
      requestBody,
      { headers: getHeaders(token) }
    );

    const createdTask = response.data.data;
    return `✅ ¡Tarea "${createdTask.name}" creada con éxito en el proyecto ${args.projectName}! (ID: ${createdTask.id})`;
  } catch (error) {
    console.error("Error creating activity:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;
      return `❌ Error al crear la tarea (${statusCode}): ${errorMessage}`;
    }
    return `❌ Error al crear la tarea: ${
      error instanceof Error ? error.message : "Error desconocido"
    }`;
  }
};

export const callFindProjectAPI = async (
  args: ApiArgs,
  token: string
): Promise<string> => {
  console.log("Calling Find Project API with args:", args);
  try {
    const response = await axios.get<FindProjectsApiResponse>(
      `${API_BASE_URL}/projects/`,
      {
        headers: getHeaders(token),
      }
    );

    const project = response.data.data.find((p) =>
      p.name.toLowerCase().includes(args.projectName.toLowerCase())
    );

    if (!project) {
      return `🤔 No se encontró el proyecto con el nombre "${args.projectName}".`;
    }

    return `✅ Proyecto encontrado: ${project.name} (ID: ${project.id}, Estado: ${project.status}, Cliente: ${project.client.name}).`;
  } catch (error) {
    console.error("Error finding project:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      return `❌ Error al buscar el proyecto: ${errorMessage}`;
    }
    return `❌ Error al buscar el proyecto: ${
      error instanceof Error ? error.message : "Error desconocido"
    }`;
  }
};

// Additional API functions for getting complete lists
export const getAllProjects = async (token: string): Promise<Project[]> => {
  try {
    const response = await axios.get<FindProjectsApiResponse>(
      `${API_BASE_URL}/projects/`,
      {
        headers: getHeaders(token),
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
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

export const getProjectUsers = async (
  projectId: number,
  token: string
): Promise<Users[]> => {
  try {
    const response = await axios.get<UsersApiResponse>(
      `${API_BASE_URL}/projects/${projectId}/users`,
      {
        headers: getHeaders(token),
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
