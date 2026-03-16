
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
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Quote = {
  id: string;
  clientId: string;
  date: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
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
  paintSpecs?: {
    surfaceType: string;
    areaSize: string;
    coats: number;
    paintFinish: string;
  };
};
