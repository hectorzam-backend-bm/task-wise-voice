import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

export const maxDuration = 60;

// Schema para la salida del procesamiento
const ProcessVoiceCommandOutputSchema = z.object({
  tool: z.enum(["createActivity"]).describe("The tool to be called."),
  args: z
    .object({
      projectName: z.string().min(1, "Project name is required"),
      title: z.string().min(1, "Task title is required"),
      userName: z.string().min(1, "User name is required"),
      moduleName: z.string().optional(),
      phaseName: z.string().optional(),
      estimatedHours: z.string().optional(),
      estimatedMinutes: z.string().optional(),
    })
    .describe("The arguments for the tool."),
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Crear el modelo de LangChain con streaming habilitado
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0,
      maxTokens: 300,
      timeout: 8000,
      streaming: true,
    });

    const parser = StructuredOutputParser.fromZodSchema(
      ProcessVoiceCommandOutputSchema
    );
    const formatInstructions = parser.getFormatInstructions();

    const prompt = `You are an AI assistant that processes voice commands to create tasks.

You will receive the transcribed text of a voice command, and you need to extract the information to create a task.

RULES:
- projectName, title, and userName are REQUIRED
- moduleName and phaseName are OPTIONAL (only if explicitly mentioned)
- If no user is mentioned, use "Usuario"

The tool is always "createActivity". Respond ONLY with valid JSON.

Example:
{"tool": "createActivity","args": {"projectName":"Kronos","title":"Revisar login","userName":"Usuario"}}

Voice Command: ${text}

${formatInstructions}

Respond with valid JSON only:`;

    // Usar el streaming de LangChain directamente
    const stream = await model.stream(prompt);

    // Convertir el stream de LangChain a un Response stream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = "";

          for await (const chunk of stream) {
            const content = chunk.content;
            fullContent += content;

            // Enviar cada chunk al cliente
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "chunk",
                  content: content,
                })}\n\n`
              )
            );
          }

          // Al final, intentar parsear el contenido completo
          try {
            const parsedResponse = JSON.parse(fullContent);
            const validatedResponse =
              ProcessVoiceCommandOutputSchema.parse(parsedResponse);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "complete",
                  result: validatedResponse,
                })}\n\n`
              )
            );
          } catch (parseError) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: "Failed to parse AI response",
                  content: fullContent,
                })}\n\n`
              )
            );
          }

          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in voice command streaming:", error);
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
