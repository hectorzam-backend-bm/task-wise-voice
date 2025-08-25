export interface FindProjectsApiResponse {
  statusCode: number;
  data: Project[];
  message: any;
}

export interface Project {
  id: number;
  uuid: string;
  logo?: string;
  logoUrl?: string;
  logoExpiresAt?: string;
  name: string;
  clientId: number;
  projectTypeId: number;
  planedStartDate: string;
  planedEndDate: string;
  realStartDate?: string;
  realEndDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  finalPrice: number;
  totalCost?: number;
  progressPercentage?: number;
  allowedDaysForPayment: number;
  allowedDaysForPaymentCritical: number;
  status: string;
  pausedReason?: string;
  hasAssignedStaff: boolean;
  isInternal: boolean;
  isInvestment: boolean;
  driveFolder?: string;
  accountManagerId?: number;
  projectManagerId?: number;
  isMonthlyIncome: boolean;
  isMonthlyQuote: boolean;
  ganttPassword?: string;
  grossMarginReal?: number;
  grossMarginPlanned?: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  client: Client;
}

export interface Client {
  id: number;
  name: string;
  area?: string;
  areaName?: string;
  status: string;
  fileId?: number;
  createdByUserId?: number;
  clientSince?: string;
  updatedAt: string;
  createdAt: string;
}
