export interface ModulesApiResponse {
  statusCode: number;
  data: Module[];
  message: any;
}

export interface Module {
  id: number;
  name: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}
