import { OPENAI_API_KEY } from "@/config/env";
import { ChatOpenAI } from "@langchain/openai";

export const chatModel = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
});
