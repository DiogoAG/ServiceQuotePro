
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
};

export type QuoteItem = {
  id: string;
  description: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type CommonItem = {
  id: string;
  description: string;
  category: string;
  unit?: string;
  defaultUnitPrice: number;
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
