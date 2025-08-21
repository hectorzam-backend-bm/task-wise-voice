import { config } from "dotenv";
config();

// Importar las funciones de LangChain
import "@/ai/flows/process-voice-command.ts";

console.log("LangChain AI functions loaded successfully");
