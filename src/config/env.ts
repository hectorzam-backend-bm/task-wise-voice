import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  LANGSMITH_TRACING: z.string().default("false"),
  LANGSMITH_ENDPOINT: z.string().default("https://api.smith.langchain.com"),
  LANGSMITH_API_KEY: z.string().default("<your-api-key>"),
  LANGSMITH_PROJECT: z.string().default("<your-project-id>"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
});

const { success, error, data } = EnvSchema.safeParse(process.env);

if (!success) {
  console.error("❌ Invalid environment variables:", error.format());
  process.exit(1);
}

export const {
  LANGSMITH_TRACING,
  LANGSMITH_ENDPOINT,
  LANGSMITH_API_KEY,
  LANGSMITH_PROJECT,
  OPENAI_API_KEY,
} = data;
