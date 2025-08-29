import { z } from "zod";

export const CreateActivityArgsSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  title: z.string().min(1, "Task title is required"),
  userName: z.string().min(1, "User name is required"),
  moduleName: z.string().optional(),
  phaseName: z.string().optional(),
  estimatedHours: z.string().optional(),
  estimatedMinutes: z.string().optional(),
});

export type CreateActivityArgs = z.infer<typeof CreateActivityArgsSchema>;
