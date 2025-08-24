export interface PhaseApiResponse {
  statusCode: number
  data: Phase[]
  message: any
}

export interface Phase {
  id: number
  name: string
  porcentage: number
  projectId: number
  createdAt: string
  updatedAt: string
}
