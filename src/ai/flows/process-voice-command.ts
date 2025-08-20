'use server';

/**
 * @fileOverview A Genkit flow to process voice commands, transcribe them, and orchestrate API calls.
 *
 * - processVoiceCommand - A function that handles the voice command processing.
 * - ProcessVoiceCommandInput - The input type for the processVoiceCommand function.
 * - ProcessVoiceCommandOutput - The return type for the processVoiceCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { openAI } from '@genkit-ai/openai';


const ProcessVoiceCommandInputSchema = z.object({
  text: z.string().describe('The transcribed text from the voice command.'),
  token: z.string().describe('The API token for authentication.'),
});
export type ProcessVoiceCommandInput = z.infer<typeof ProcessVoiceCommandInputSchema>;

const ProcessVoiceCommandOutputSchema = z.object({
  tool: z.string().describe('The tool to be called.'),
  args: z.record(z.any()).describe('The arguments for the tool.'),
});
export type ProcessVoiceCommandOutput = z.infer<typeof ProcessVoiceCommandOutputSchema>;

export async function processVoiceCommand(input: ProcessVoiceCommandInput): Promise<ProcessVoiceCommandOutput> {
  return processVoiceCommandFlow(input);
}

const processVoiceCommandPrompt = ai.definePrompt({
  name: 'processVoiceCommandPrompt',
  input: {schema: ProcessVoiceCommandInputSchema},
  output: {schema: ProcessVoiceCommandOutputSchema},
  prompt: `You are an AI assistant that processes voice commands to manage tasks.

You will receive the transcribed text of a voice command, and you need to determine which tool to use and what arguments to pass to it.

The primary flow is to create a task. To do this, you need to extract the project name, module name, phase name, user name, and the title of the task from the voice command.

If the command is to create a task, the tool should be 'createActivity'. The arguments should include 'projectName', 'moduleName', 'phaseName', 'userName', and 'title'.

If the command is to find something (like a project), the tool should be 'findProject' and the argument should be 'projectName'.

Always respond with a JSON object that contains the 'tool' and 'args' fields.

Example for creating a task:
{
  "tool": "createActivity",
  "args": {
    "projectName": "Kronos",
    "moduleName": "Frontend",
    "phaseName": "Desarrollo",
    "userName": "Ana",
    "title": "Revisar el login"
  }
}

Example for finding a project:
{
    "tool": "findProject",
    "args": {
        "projectName": "TaskWise"
    }
}


Voice Command: {{{text}}}
API Token: {{{token}}} `,
  config: {
    model: openAI('gpt-4o')
  }
});

const processVoiceCommandFlow = ai.defineFlow(
  {
    name: 'processVoiceCommandFlow',
    inputSchema: ProcessVoiceCommandInputSchema,
    outputSchema: ProcessVoiceCommandOutputSchema,
  },
  async input => {
    const {output} = await processVoiceCommandPrompt(input);
    return output!;
  }
);
