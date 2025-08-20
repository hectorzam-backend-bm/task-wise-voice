import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { openAI } from '@genkit-ai/openai';
import 'dotenv/config';

const openAIKey = process.env.OPENAI_API_KEY;
if (!openAIKey) {
  throw new Error("La variable de entorno OPENAI_API_KEY no está definida. Revisa tu archivo .env");
}

export const ai = genkit({
  plugins: [
    googleAI(),
    openAI({ apiKey: openAIKey }),
  ],
  logSinks: [ 'dev' ],
  enableTracingAndMetrics: true,
});
