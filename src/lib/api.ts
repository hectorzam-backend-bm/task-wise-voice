import axios from 'axios';

const API_BASE_URL = 'https://miapi.com'; // Placeholder API URL

interface ApiArgs {
  [key: string]: any;
}

const getHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Mock function to simulate finding an ID for a given name
const getProjectIdByName = async (name: string, token: string): Promise<number> => {
  console.log(`Searching for project ID for: ${name}`);
  if (name.toLowerCase() === 'kronos') return 101;
  if (name.toLowerCase() === 'taskwise') return 102;
  await new Promise(resolve => setTimeout(resolve, 300));
  return 999; // Default for "not found"
};

const getModuleIdByName = async (name: string, projectId: number, token: string): Promise<number> => {
    console.log(`Searching for module ID for: ${name} in project ${projectId}`);
    if (name.toLowerCase() === 'frontend') return 201;
    await new Promise(resolve => setTimeout(resolve, 300));
    return 888;
};

const getPhaseIdByName = async (name: string, projectId: number, token: string): Promise<number> => {
    console.log(`Searching for phase ID for: ${name} in project ${projectId}`);
    if (name.toLowerCase() === 'desarrollo') return 301;
    await new Promise(resolve => setTimeout(resolve, 300));
    return 777;
};

const getUserIdByName = async (name: string, token: string): Promise<number> => {
    console.log(`Searching for user ID for: ${name}`);
    if (name.toLowerCase() === 'ana') return 401;
    await new Promise(resolve => setTimeout(resolve, 300));
    return 666;
};


export const callCreateActivityAPI = async (args: ApiArgs, token: string): Promise<string> => {
  console.log('Calling Create Activity Flow with args:', args);
  try {
    const projectId = await getProjectIdByName(args.projectName, token);
    if (projectId === 999) return `❌ Proyecto "${args.projectName}" no encontrado.`;

    const moduleId = await getModuleIdByName(args.moduleName, projectId, token);
    if (moduleId === 888) return `❌ Módulo "${args.moduleName}" no encontrado en el proyecto.`;

    const phaseId = await getPhaseIdByName(args.phaseName, projectId, token);
     if (phaseId === 777) return `❌ Fase "${args.phaseName}" no encontrada en el proyecto.`;

    const userId = await getUserIdByName(args.userName, token);
    if (userId === 666) return `❌ Usuario "${args.userName}" no encontrado.`;
    
    const requestBody = {
      title: args.title,
      projectId: projectId,
      moduleId: moduleId,
      phaseId: phaseId,
      userId: userId,
    };

    console.log('Sending to API:', requestBody);
    // const response = await axios.post(`${API_BASE_URL}/tasks`, requestBody, { headers: getHeaders(token) });
    
    // MOCK API CALL
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockResponse = { data: { id: Date.now(), ...requestBody } };
    
    return `✅ ¡Tarea "${mockResponse.data.title}" creada con éxito en el proyecto ${args.projectName}!`;
  } catch (error) {
    console.error('Error creating activity:', error);
    if (axios.isAxiosError(error)) {
        return `❌ Error al crear la tarea: ${error.response?.data.message || error.message}`;
    }
    return `❌ Error al crear la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`;
  }
};

export const callFindProjectAPI = async (args: ApiArgs, token: string): Promise<string> => {
    console.log('Calling Find Project API with args:', args);
    try {
        // const response = await axios.get(`${API_BASE_URL}/projects`, { params: { name: args.projectName }, headers: getHeaders(token) });
        
        // MOCK API CALL
        await new Promise(resolve => setTimeout(resolve, 800));
        const projectId = await getProjectIdByName(args.projectName, token);
        if (projectId === 999) { // Simulate "not found"
            return `🤔 No se encontró el proyecto con el nombre "${args.projectName}".`;
        }
        const mockResponse = { data: [{ id: projectId, name: args.projectName, status: "Activo"}] };

        return `✅ Proyecto encontrado: ${mockResponse.data[0].name} (ID: ${mockResponse.data[0].id}, Estado: ${mockResponse.data[0].status}).`;

    } catch (error) {
        console.error('Error finding project:', error);
        if (axios.isAxiosError(error)) {
            return `❌ Error al buscar el proyecto: ${error.response?.data.message || error.message}`;
        }
        return `❌ Error al buscar el proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    }
};
