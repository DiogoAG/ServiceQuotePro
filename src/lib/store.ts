
import { Client, Quote, BusinessProfile, QuoteTemplate, CommonItem } from './types';

const CLIENTS_KEY = 'service_quote_pro_clients';
const QUOTES_KEY = 'service_quote_pro_quotes';
const PROFILE_KEY = 'service_quote_pro_profile';
const TEMPLATES_KEY = 'service_quote_pro_templates';
const COMMON_ITEMS_KEY = 'service_quote_pro_common_items';

export const getClients = (): Client[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CLIENTS_KEY);
  return stored ? JSON.parse(stored) : [
    { id: '1', name: 'John Smith', email: 'john@example.com', phone: '555-0101', address: '123 Oak St, Springfield' },
    { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', phone: '555-0102', address: '456 Maple Ave, Riverside' }
  ];
};

export const saveClients = (clients: Client[]) => {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
};

export const getQuotes = (): Quote[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(QUOTES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveQuotes = (quotes: Quote[]) => {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
};

export const getBusinessProfile = (): BusinessProfile => {
  if (typeof window === 'undefined') return { businessName: 'ProContractor Services', licenseNumber: 'LIC-123456', defaultTaxRate: 8.5, defaultLaborRate: 75 };
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : {
    businessName: 'ProContractor Services',
    licenseNumber: 'LIC-123456',
    defaultTaxRate: 8.5,
    defaultLaborRate: 75
  };
};

export const saveBusinessProfile = (profile: BusinessProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getTemplates = (): QuoteTemplate[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : [
    {
      id: 't1',
      name: 'Standard Service Call',
      serviceCategory: 'General Contracting',
      items: [{ description: 'Basic Diagnostic / Service Fee', quantity: 1, unitPrice: 150, total: 150 }],
      scopeDescription: 'Arrival on site, diagnostic assessment, and minor adjustments as needed.'
    }
  ];
};

export const saveTemplates = (templates: QuoteTemplate[]) => {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const getCommonItems = (): CommonItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(COMMON_ITEMS_KEY);
  return stored ? JSON.parse(stored) : [
    { id: 'i1', description: 'Labor - Standard Rate', defaultUnitPrice: 75 },
    { id: 'i2', description: 'Service Call Fee', defaultUnitPrice: 125 },
    { id: 'i3', description: 'Standard Parts & Materials', defaultUnitPrice: 0 },
    { id: 'i4', description: 'Emergency Service Surcharge', defaultUnitPrice: 150 }
  ];
};

export const saveCommonItems = (items: CommonItem[]) => {
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(items));
};
