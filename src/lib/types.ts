
export const SERVICE_CATEGORIES = [
  "General Contracting",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Landscaping",
  "Painting",
  "Roofing",
  "Carpentry",
  "Cleaning",
  "Other"
];

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type BusinessProfile = {
  businessName: string;
  licenseNumber: string;
  logoUrl?: string;
  defaultTaxRate: number;
  defaultLaborRate: number;
  offeredServices: string[];
};

export type QuoteItem = {
  id: string;
  description: string;
  unit?: string;
  quantity: number;
  length?: number | string;
  width?: number | string;
  unitPrice: number;
  total: number;
  isHardCoded?: boolean;
};

export type CommonItem = {
  id: string;
  description: string;
  category: string;
  unit?: string;
  defaultUnitPrice: number;
  isHardCoded?: boolean;
};

export type QuoteTemplate = {
  id: string;
  name: string;
  serviceCategory: string;
  items: Omit<QuoteItem, 'id'>[];
  scopeDescription: string;
};

export type Quote = {
  id: string;
  clientId: string;
  date: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  serviceCategory: string;
  items: QuoteItem[];
  scopeDescription: string;
  laborHours: number;
  laborRate: number;
  materialCosts: number;
  taxRate: number;
  taxTotal: number;
  subtotal: number;
  grandTotal: number;
  notes: string;
};
