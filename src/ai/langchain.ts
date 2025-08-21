import { ChatOpenAI } from "@langchain/openai";

// Configuración del modelo OpenAI para LangChain
export const chatModel = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});
