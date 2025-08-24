"use server";

/**
 * @fileOverview A LangChain flow to process voice commands, transcribe them, and orchestrate API calls.
 *
 * - processVoiceCommand - A function that handles the voice command processing.
 * - ProcessVoiceCommandInput - The input type for the processVoiceCommand function.
 * - ProcessVoiceCommandOutput - The return type for the processVoiceCommand function.
 */

import { chatModel } from "@/ai/langchain";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

const ProcessVoiceCommandInputSchema = z.object({
  text: z.string().describe("The transcribed text from the voice command."),
  token: z.string().describe("The API token for authentication."),
});
export type ProcessVoiceCommandInput = z.infer<
  typeof ProcessVoiceCommandInputSchema
>;

const ProcessVoiceCommandOutputSchema = z.object({
  tool: z.string().describe("The tool to be called."),
  args: z.record(z.any()).describe("The arguments for the tool."),
});
export type ProcessVoiceCommandOutput = z.infer<
  typeof ProcessVoiceCommandOutputSchema
>;

export async function processVoiceCommand(
  input: ProcessVoiceCommandInput
): Promise<ProcessVoiceCommandOutput> {
  // Crear el parser de salida estructurada
  const parser = StructuredOutputParser.fromZodSchema(
    ProcessVoiceCommandOutputSchema
  );

  // Crear el template del prompt
  const promptTemplate =
    PromptTemplate.fromTemplate(`You are an AI assistant that processes voice commands to manage tasks.

You will receive the transcribed text of a voice command, and you need to determine which tool to use and what arguments to pass to it.

The primary flow is to create a task. To do this, you need to extract information from the voice command:
- 'projectName' (required): The name of the project
- 'title' (required): The name/description of the task
- 'moduleName' (optional): The module name, if specified
- 'phaseName' (optional): The phase name, if specified  
- 'userName' (optional): The user name to assign the task to, if specified

If module, phase, or user are not mentioned in the voice command, simply omit them from the args. The system will automatically use the first available option.

If the command is to create a task, the tool should be 'createActivity'. The arguments should include 'projectName' and 'title' as required, and optionally 'moduleName', 'phaseName', and 'userName' if mentioned.

If the command is to find something (like a project), the tool should be 'findProject' and the argument should be 'projectName'.

Always respond with a JSON object that contains the 'tool' and 'args' fields.

Examples for creating a task:

Minimal example (only project and task title):
{{
  "tool": "createActivity",
  "args": {{
    "projectName": "Kronos",
    "title": "Revisar el login"
  }}
}}

Complete example (with module, phase, and user):
{{
  "tool": "createActivity",
  "args": {{
    "projectName": "Kronos",
    "moduleName": "Frontend",
    "phaseName": "Desarrollo",
    "userName": "Ana",
    "title": "Revisar el login"
  }}
}}

Example for finding a project:
{{
    "tool": "findProject",
    "args": {{
        "projectName": "TaskWise"
    }}
}}

Voice Command: {text}
API Token: {token}

{format_instructions}`);

  // Crear la cadena de procesamiento
  const chain = promptTemplate.pipe(chatModel).pipe(parser);

  // Ejecutar la cadena con las instrucciones de formato
  const formatInstructions = parser.getFormatInstructions();

  const result = await chain.invoke({
    text: input.text,
    token: input.token,
    format_instructions: formatInstructions,
  });

  return result;
}
