import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export const maxDuration = 60;

// Schema para la entrada del comando de voz
const ProcessVoiceCommandInputSchema = z.object({
  text: z.string().describe("The transcribed text from the voice command."),
});

// Schema para los argumentos de creación de actividad
const CreateActivityArgsSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  title: z.string().min(1, "Task title is required"),
  userName: z.string().min(1, "User name is required"),
  moduleName: z.string().optional(),
  phaseName: z.string().optional(),
  estimatedHours: z.string().optional(),
  estimatedMinutes: z.string().optional(),
});

// Schema para la salida del procesamiento
const ProcessVoiceCommandOutputSchema = z.object({
  tool: z.enum(["createActivity"]).describe("The tool to be called."),
  args: CreateActivityArgsSchema.describe("The arguments for the tool."),
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Validar la entrada
    const input = ProcessVoiceCommandInputSchema.parse({ text });

    // Crear el modelo de LangChain adaptado para AI SDK
    const openaiModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0,
      maxTokens: 300,
      timeout: 8000,
    });

    const prompt = `You are an AI assistant that processes voice commands to create tasks.

You will receive the transcribed text of a voice command, and you need to extract the information to create a task.

RULES:
- projectName, title, and userName are REQUIRED
- moduleName and phaseName are OPTIONAL (only if explicitly mentioned)
- If no user is mentioned, use "Usuario"

The tool is always "createActivity". Respond ONLY with valid JSON.

Example:
{"tool": "createActivity","args": {"projectName":"Kronos","title":"Revisar login","userName":"Usuario"}}

Voice Command: ${input.text}

Respond with valid JSON only:`;

    // Usar directamente la llamada al modelo
    const response = await openaiModel.invoke(prompt);

    try {
      // Parsear la respuesta JSON
      const parsedResponse = JSON.parse(response.content as string);

      // Validar con el schema
      const validatedResponse =
        ProcessVoiceCommandOutputSchema.parse(parsedResponse);

      return new Response(JSON.stringify(validatedResponse), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Error parsing LangChain response:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid response format from AI model",
          details:
            parseError instanceof Error ? parseError.message : "Parse error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing voice command:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing voice command",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
