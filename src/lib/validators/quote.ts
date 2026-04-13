
import { z } from 'zod';
import { SERVICE_CATEGORIES } from '../types';

/**
 * Zod Schema for Quote Validation
 * Ensures data integrity before saving to Firestore.
 */

export const QuoteItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  unit: z.string().optional(),
  quantity: z.number().min(0, "Quantity must be positive"),
  length: z.union([z.number(), z.string()]).optional(),
  width: z.union([z.number(), z.string()]).optional(),
  unitPrice: z.number().min(0, "Price must be positive"),
  total: z.number()
});

export const QuoteSchema = z.object({
  id: z.string(),
  clientId: z.string().min(1, "A client must be selected"),
  contractorId: z.string().optional(),
  clientSnapshot: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional()
  }).optional(),
  date: z.string(),
  status: z.enum(['draft', 'sent', 'approved', 'rejected']),
  serviceCategory: z.enum(SERVICE_CATEGORIES as [string, ...string[]]),
  items: z.array(QuoteItemSchema),
  scopeDescription: z.string().optional(),
  laborHours: z.number().min(0, "Labor hours must be positive"),
  laborRate: z.number().min(0, "Labor rate must be positive"),
  materialCosts: z.number().min(0, "Material costs must be positive"),
  taxRate: z.number().min(0, "Tax rate must be positive"),
  taxTotal: z.number(),
  subtotal: z.number(),
  grandTotal: z.number(),
  notes: z.string().optional()
}).refine((data) => {
  // Ensure the quote isn't completely empty
  const hasItems = data.items.length > 0;
  const hasLabor = data.laborHours > 0;
  const hasMaterials = data.materialCosts > 0;
  return hasItems || hasLabor || hasMaterials;
}, {
  message: "Quote must contain at least one line item, labor hours, or material costs.",
  path: ["items"]
});

export type ValidatedQuote = z.infer<typeof QuoteSchema>;
