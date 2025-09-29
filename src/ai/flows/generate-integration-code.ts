'use server';

/**
 * @fileOverview Generates integration code for the payment platform.
 *
 * - generateIntegrationCode - A function that generates code snippets and explanations for integrating the payment API.
 * - GenerateIntegrationCodeInput - The input type for the generateIntegrationCode function.
 * - GenerateIntegrationCodeOutput - The return type for the generateIntegrationCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIntegrationCodeInputSchema = z.object({
  platform: z.string().describe('The target platform or language (e.g., JavaScript, Python, React).'),
  description: z.string().describe('A description of what the user wants to achieve with the integration.'),
});
export type GenerateIntegrationCodeInput = z.infer<typeof GenerateIntegrationCodeInputSchema>;

const GenerateIntegrationCodeOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated code snippet for the integration.'),
  explanation: z.string().describe('An explanation of how to use the code and any necessary setup.'),
});
export type GenerateIntegrationCodeOutput = z.infer<typeof GenerateIntegrationCodeOutputSchema>;

export async function generateIntegrationCode(input: GenerateIntegrationCodeInput): Promise<GenerateIntegrationCodeOutput> {
  return generateIntegrationCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIntegrationCodePrompt',
  input: {schema: GenerateIntegrationCodeInputSchema},
  output: {schema: GenerateIntegrationCodeOutputSchema},
  prompt: `You are an expert AI assistant that generates integration code for a payment platform.

Here are the available API endpoints:

**1. Identity Verification**
- **Endpoint:** \`https://lucopay.onrender.com/identity/msisdn\`
- **Method:** \`POST\`
- **Headers:**
  - \`Content-Type: application/json\`
  - \`accept: application/json\`
- **Body:** \`{ "msisdn": "+256708215305" }\` (Phone number must be in international format with a '+').
- **Success Response (200):** \`{ "identityname": "...", "message": "...", "success": true }\`

**2. Request Payment**
- **Endpoint:** \`https://lucopay.onrender.com/api/v1/request_payment\`
- **Method:** \`POST\`
- **Headers:**
  - \`Content-Type: application/json\`
  - \`accept: application/json\`
- **Body:** \`{ "amount": "100", "number": "256708215305", "refer": "YOUR_UNIQUE_REFERENCE" }\` (Phone number without '+').
- **Success Response (200):** \`{ "success": true, "message": "Payment initiated" }\` which returns a reference that you will use to query the status of the transaction.

**3. Check Payment Status**
- **Endpoint:** \`https://lucopay.onrender.com/api/v1/payment_webhook\`
- **Method:** \`POST\`
- **Headers:**
  - \`Content-Type: application/json\`
  - \`accept: application/json\`
- **Body:** \`{ "reference": "YOUR_UNIQUE_REFERENCE" }\`
- **Success Response (200):** A JSON object with transaction details, including a \`status\` field ('succeeded', 'failed', 'pending').

Based on the user's request, generate a code snippet for the specified platform and provide a clear explanation.

**User Request:**
- **Platform:** {{{platform}}}
- **Description:** {{{description}}}

Generate a complete, self-contained, and easy-to-understand code example. Explain any required libraries or setup steps.
`,
});

const generateIntegrationCodeFlow = ai.defineFlow(
  {
    name: 'generateIntegrationCodeFlow',
    inputSchema: GenerateIntegrationCodeInputSchema,
    outputSchema: GenerateIntegrationCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
