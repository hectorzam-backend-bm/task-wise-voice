import { ChatOpenAI } from "@langchain/openai";

// Configuración tradicional de LangChain para casos específicos
export const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
  maxTokens: 300,
  timeout: 8000,
});
