import { chatModel } from "@/ai/langchain";
import { CreateActivityArgsSchema } from "@/lib/schemas";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ProcessVoiceCommandInputSchema = z.object({
  text: z.string().describe("The transcribed text from the voice command."),
});

const ProcessVoiceCommandOutputSchema = z.object({
  tool: z.enum(["createActivity"]).describe("The tool to be called."),
  args: CreateActivityArgsSchema.describe("The arguments for the tool."),
});

const parser = StructuredOutputParser.fromZodSchema(
  ProcessVoiceCommandOutputSchema
);
const formatInstructions = parser.getFormatInstructions();

const promptTemplate =
  PromptTemplate.fromTemplate(`You are an AI assistant that processes voice commands to create tasks.

You will receive the transcribed text of a voice command, and you need to extract the information to create a task.

RULES:
- projectName, title, and userName are REQUIRED
- moduleName and phaseName are OPTIONAL (only if explicitly mentioned)
- If no user is mentioned, use "Usuario"

The tool is always "createActivity". Respond ONLY with valid JSON.

Example:
{{"tool": "createActivity","args": {{"projectName":"Kronos","title":"Revisar login","userName":"Usuario"}}}}

Voice Command: {text}

{format_instructions}`);

const chain = RunnableSequence.from([promptTemplate, chatModel, parser]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar la entrada
    const validatedInput = ProcessVoiceCommandInputSchema.parse(body);

    // Procesar el comando de voz con IA
    const result = await chain.invoke({
      text: validatedInput.text,
      format_instructions: formatInstructions,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing voice command:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
