'use server';
/**
 * @fileOverview This file provides an AI-assisted tool to generate professional work scope descriptions.
 *
 * - generateScopeDescription - A function that generates a detailed work scope description based on brief input.
 * - GenerateScopeDescriptionInput - The input type for the generateScopeDescription function.
 * - GenerateScopeDescriptionOutput - The return type for the generateScopeDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateScopeDescriptionInputSchema = z.object({
  briefInput: z
    .string()
    .describe(
      'A brief description or bullet points outlining the work to be done, the client\'s needs, or the project goals.'
    ),
  serviceType: z
    .string()
    .optional()
    .describe(
      'The type of service being provided (e.g., "painting", "landscaping", "HVAC repair").'
    ),
  businessName: z
    .string()
    .optional()
    .describe('The name of the contractor\'s business.'),
});
export type GenerateScopeDescriptionInput = z.infer<
  typeof GenerateScopeDescriptionInputSchema
>;

const GenerateScopeDescriptionOutputSchema = z.object({
  generatedDescription: z
    .string()
    .describe('A professional and clear work scope description.'),
});
export type GenerateScopeDescriptionOutput = z.infer<
  typeof GenerateScopeDescriptionOutputSchema
>;

export async function generateScopeDescription(
  input: GenerateScopeDescriptionInput
): Promise<GenerateScopeDescriptionOutput> {
  return generateScopeDescriptionFlow(input);
}

const generateScopeDescriptionPrompt = ai.definePrompt({
  name: 'generateScopeDescriptionPrompt',
  input: { schema: GenerateScopeDescriptionInputSchema },
  output: { schema: GenerateScopeDescriptionOutputSchema },
  prompt: `You are an AI assistant tasked with generating professional and clear work scope descriptions for service contractors.

Generate a detailed work scope description based on the following brief input from the contractor. Ensure the language is professional, covers all aspects mentioned, and is suitable for a client quote.

Consider the following details to enhance the description:
{{#if serviceType}}- Service Type: {{{serviceType}}}{{/if}}
{{#if businessName}}- Business Name: {{{businessName}}}{{/if}}

Contractor's Brief Input:
{{{briefInput}}}`,
});

const generateScopeDescriptionFlow = ai.defineFlow(
  {
    name: 'generateScopeDescriptionFlow',
    inputSchema: GenerateScopeDescriptionInputSchema,
    outputSchema: GenerateScopeDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await generateScopeDescriptionPrompt(input);
    return output!;
  }
);
