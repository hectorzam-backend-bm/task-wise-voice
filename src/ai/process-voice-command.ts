"use server";

import { chatModel } from "@/ai/langchain";
import { CreateActivityArgsSchema } from "@/lib/schemas";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

const ProcessVoiceCommandInputSchema = z.object({
  text: z.string().describe("The transcribed text from the voice command."),
});
export type ProcessVoiceCommandInput = z.infer<
  typeof ProcessVoiceCommandInputSchema
>;

const ProcessVoiceCommandOutputSchema = z.object({
  tool: z.enum(["createActivity"]).describe("The tool to be called."),
  args: CreateActivityArgsSchema.describe("The arguments for the tool."),
});
export type ProcessVoiceCommandOutput = z.infer<
  typeof ProcessVoiceCommandOutputSchema
>;

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

export async function processVoiceCommand(
  input: ProcessVoiceCommandInput
): Promise<ProcessVoiceCommandOutput> {
  return chain.invoke({
    text: input.text,
    format_instructions: formatInstructions,
  });
}
