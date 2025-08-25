"use server";

import { chatModel } from "@/ai/langchain";
import { CreateActivityArgsSchema, FindProjectArgsSchema } from "@/lib/api";
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

// Esquema mejorado que usa los esquemas específicos de argumentos
const ProcessVoiceCommandOutputSchema = z.object({
  tool: z
    .enum(["createActivity", "findProject"])
    .describe("The tool to be called."),
  args: z
    .union([CreateActivityArgsSchema, FindProjectArgsSchema])
    .describe("The arguments for the tool."),
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

IMPORTANT TYPING RULES:
- For 'createActivity': projectName, title, and userName are REQUIRED fields
- For 'createActivity': moduleName and phaseName are OPTIONAL fields (only include if mentioned in the command)
- For 'findProject': only projectName is required

The primary flow is to create a task. To do this, you need to extract information from the voice command:
- 'projectName' (REQUIRED): The name of the project
- 'title' (REQUIRED): The name/description of the task
- 'userName' (REQUIRED): The user name to assign the task to
- 'moduleName' (OPTIONAL): The module name, only if specifically mentioned
- 'phaseName' (OPTIONAL): The phase name, only if specifically mentioned

If module or phase are not mentioned in the voice command, DO NOT include them in the args object.
If no user is mentioned, you MUST ask for clarification or use a default user name like "Usuario".

If the command is to create a task, the tool should be 'createActivity'. The arguments must include 'projectName', 'title', and 'userName' as required, and optionally 'moduleName' and 'phaseName' only if mentioned.

If the command is to find something (like a project), the tool should be 'findProject' and the argument should be 'projectName'.

Always respond with a JSON object that contains the 'tool' and 'args' fields.

Examples for creating a task:

Minimal example (only project, task title, and user):
{{
  "tool": "createActivity",
  "args": {{
    "projectName": "Kronos",
    "title": "Revisar el login",
    "userName": "Usuario"
  }}
}}

Complete example (with module, phase, user, and estimation):
{{
  "tool": "createActivity",
  "args": {{
    "projectName": "Kronos",
    "moduleName": "Frontend",
    "phaseName": "Desarrollo",
    "userName": "Ana",
    "title": "Revisar el login",
    "estimatedHours": 2,
    "estimatedMinutes": 30
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
