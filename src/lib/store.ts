
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
    { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', phone: '555-0102', address: '456 Maple Ave, Riverside' },
    { id: '3', name: 'John Smith', email: 'jsmith.construction@example.com', phone: '555-9999', address: '789 Industrial Way' }
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
      name: 'Standard Electrical Inspection',
      serviceCategory: 'Electrical',
      items: [
        { description: 'Panel Inspection & Testing', quantity: 1, unitPrice: 150, total: 150 },
        { description: 'Circuit Breaker Evaluation', quantity: 1, unitPrice: 75, total: 75 }
      ],
      scopeDescription: 'Comprehensive safety inspection of the main electrical panel, grounding system, and branch circuits.'
    },
    {
      id: 't2',
      name: 'Residential Plumbing Repair',
      serviceCategory: 'Plumbing',
      items: [
        { description: 'Faucet/Fixture Repair Kit', quantity: 1, unitPrice: 45, total: 45 },
        { description: 'Drain Clearing Service', quantity: 1, unitPrice: 120, total: 120 }
      ],
      scopeDescription: 'Diagnosis and repair of standard residential plumbing fixtures and drainage issues.'
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
    { id: 'i1', description: 'Labor - Master Electrician', defaultUnitPrice: 95 },
    { id: 'i2', description: 'Labor - Journeyman Plumber', defaultUnitPrice: 85 },
    { id: 'i3', description: 'Standard Service Call Fee', defaultUnitPrice: 125 },
    { id: 'i4', description: 'Emergency After-Hours Rate', defaultUnitPrice: 185 },
    { id: 'i5', description: 'GFI Outlet Replacement', defaultUnitPrice: 65 },
    { id: 'i6', description: 'LED Recessed Lighting (Unit)', defaultUnitPrice: 110 }
  ];
};

export const saveCommonItems = (items: CommonItem[]) => {
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(items));
};
