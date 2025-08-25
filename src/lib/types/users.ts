export interface UsersApiResponse {
  statusCode: number;
  data: Users[];
  message: any;
  meta: Meta;
}

export interface Users {
  id: number;
  fullName: string;
  profileImage?: string;
  email: string;
  workload: number;
  area?: Area;
  jobPosition: JobPosition;
  jobPositionId: number;
  type: Type;
  userTypeId: number;
  levelId: number;
  createdAt: string;
  lastLogin?: string;
  deleted: boolean;
  deletedAt: any;
  deletedBy: any;
  projectUsers: number;
}

export interface Area {
  id: number;
  name: string;
}

export interface JobPosition {
  id: number;
  jobPosition: string;
  salary: any;
}

export interface Type {
  id: number;
  name: string;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}
