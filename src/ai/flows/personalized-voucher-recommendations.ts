// src/ai/flows/personalized-voucher-recommendations.ts
'use server';

/**
 * @fileOverview Provides personalized voucher recommendations based on user purchase history.
 *
 * - getPersonalizedVoucherRecommendations - A function that takes a user's purchase history and returns personalized voucher recommendations.
 * - PersonalizedVoucherRecommendationsInput - The input type for the getPersonalizedVoucherRecommendations function.
 * - PersonalizedVoucherRecommendationsOutput - The return type for the getPersonalizedVoucherRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedVoucherRecommendationsInputSchema = z.object({
  purchaseHistory: z
    .string()
    .describe('The user purchase history, as a string.'),
  voucherCategories: z.array(z.string()).optional().describe('The available voucher categories'),
});
export type PersonalizedVoucherRecommendationsInput =
  z.infer<typeof PersonalizedVoucherRecommendationsInputSchema>;

const PersonalizedVoucherRecommendationsOutputSchema = z.object({
  recommendedVouchers: z
    .array(z.string())
    .describe('Voucher ids recommended for the user.'),
});
export type PersonalizedVoucherRecommendationsOutput =
  z.infer<typeof PersonalizedVoucherRecommendationsOutputSchema>;

export async function getPersonalizedVoucherRecommendations(
  input: PersonalizedVoucherRecommendationsInput
): Promise<PersonalizedVoucherRecommendationsOutput> {
  return personalizedVoucherRecommendationsFlow(input);
}

const personalizedVoucherRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedVoucherRecommendationsPrompt',
  input: {schema: PersonalizedVoucherRecommendationsInputSchema},
  output: {schema: PersonalizedVoucherRecommendationsOutputSchema},
  prompt: `You are an expert marketing assistant that provides recommendations to users about vouchers.

  Based on the user's purchase history, determine which vouchers from the available categories would be most relevant to the user.

  Purchase History: {{{purchaseHistory}}}
  Voucher Categories: {{voucherCategories}}

  Return a list of recommended vouchers for the user.  Do not explain your reasoning.
  `,
});

const personalizedVoucherRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedVoucherRecommendationsFlow',
    inputSchema: PersonalizedVoucherRecommendationsInputSchema,
    outputSchema: PersonalizedVoucherRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedVoucherRecommendationsPrompt(input);
    return output!;
  }
);
