'use server';
/**
 * @fileOverview This file provides an AI-assisted tool to generate professional work scope descriptions.
 *
 * - generateScopeDescription - A function that generates a detailed work scope description based on brief input and line items.
 * - GenerateScopeDescriptionInput - The input type for the generateScopeDescription function.
 * - GenerateScopeDescriptionOutput - The return type for the generateScopeDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateScopeDescriptionInputSchema = z.object({
  briefInput: z
    .string()
    .optional()
    .describe(
      'A brief description or bullet points outlining the work to be done.'
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
  lineItems: z
    .array(z.string())
    .optional()
    .describe('A list of specific line items or tasks included in the quote.'),
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

Generate a detailed, professional work scope description based on the provided information. The language should be clear, formal, and suitable for a high-end client quote. 

Ensure the description covers:
1. The primary objective of the work.
2. Specific tasks involved (based on the brief input or line items).
3. Any standard professional preparations or cleanup steps expected for this type of service.

Details:
{{#if businessName}}- Business Name: {{{businessName}}}{{/if}}
{{#if serviceType}}- Service Category: {{{serviceType}}}{{/if}}

{{#if briefInput}}
Contractor's Brief Context:
{{{briefInput}}}
{{/if}}

{{#if lineItems}}
Service Items Included in Quote:
{{#each lineItems}}
- {{{this}}}
{{/each}}
{{/if}}

If both brief context and line items are provided, synthesize them into a single cohesive narrative. If only line items are provided, use them to infer the full professional scope of work.`,
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
