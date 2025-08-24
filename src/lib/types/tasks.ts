export interface TaskApiResponse {
  statusCode: number;
  data: Task;
  message: any;
}

export interface Task {
  id: number;
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
  createdAt: string;
  updatedAt: string;
}
