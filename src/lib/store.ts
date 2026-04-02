
import { Client, Quote, QuoteItem, BusinessProfile, QuoteTemplate, CommonItem } from './types';

const CLIENTS_KEY = 'service_quote_pro_clients';
const QUOTES_KEY = 'service_quote_pro_quotes';
const PROFILE_KEY = 'service_quote_pro_profile';
const TEMPLATES_KEY = 'service_quote_pro_templates';
const COMMON_ITEMS_KEY = 'service_quote_pro_common_items';
const DRAFT_QUOTE_KEY = 'service_quote_pro_draft_quote';

export const getClients = (): Client[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CLIENTS_KEY);
  return stored ? JSON.parse(stored) : [
    { id: '1', name: 'John Smith', email: 'john.smith@gmail.com', phone: '555-0101', address: '123 Oak St, Springfield' },
    { id: '2', name: 'Sarah Miller', email: 's.miller88@outlook.com', phone: '555-0102', address: '456 Maple Ave, Riverside' },
    { id: '3', name: 'David Wilson', email: 'dwilson@biz.com', phone: '555-9999', address: '789 Industrial Way, Metro City' }
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
  const defaultProfile: BusinessProfile = {
    businessName: 'ProContractor Services',
    licenseNumber: 'LIC-123456',
    address: '123 Business Way, Suite 100',
    phone: '555-0100',
    logoUrl: 'https://picsum.photos/seed/logo/200/200',
    defaultTaxRate: 8.5,
    defaultLaborRate: 75,
    offeredServices: [],
    quoteTerms: 'Valid for 30 days. Payment is due upon completion unless otherwise specified. A 50% deposit may be required for projects exceeding $2,000.'
  };

  if (typeof window === 'undefined') return defaultProfile;
  const stored = localStorage.getItem(PROFILE_KEY);
  if (!stored) return defaultProfile;
  
  const parsed = JSON.parse(stored);
  return {
    ...defaultProfile,
    ...parsed,
    offeredServices: parsed.offeredServices || []
  };
};

export const saveBusinessProfile = (profile: BusinessProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getTemplates = (): QuoteTemplate[] => {
  if (typeof window === 'undefined') return [];
  
  const hardCodedTemplates: QuoteTemplate[] = [
    {
      id: 't-paint-1',
      name: 'Standard Living Room Refresh',
      serviceCategory: 'Painting',
      isHardCoded: true,
      items: [
        { description: 'Interior Wall Painting (2 coats)', unit: 'sq ft', quantity: 450, unitPrice: 2.5, total: 1125 },
        { description: 'Ceiling Painting', unit: 'sq ft', quantity: 200, unitPrice: 2.0, total: 400 },
        { description: 'Baseboard & Trim Painting', unit: 'linear ft', quantity: 60, unitPrice: 1.5, total: 90 },
        { description: 'Minor Wall Patching & Prep', unit: 'hr', quantity: 2, unitPrice: 85, total: 170 }
      ],
      scopeDescription: 'Full preparation and painting of living room walls and ceiling. Includes minor patching, furniture covering, and cleanup.'
    },
    {
      id: 't-elec-1',
      name: 'Main Service Panel Upgrade (200A)',
      serviceCategory: 'Electrical',
      isHardCoded: true,
      items: [
        { description: '200 Amp Main Breaker Panel', unit: 'ea', quantity: 1, unitPrice: 1200, total: 1200 },
        { description: 'Circuit Breaker Set (Standard)', unit: 'ea', quantity: 20, unitPrice: 25, total: 500 },
        { description: 'Permit & Inspection Fee', unit: 'flat', quantity: 1, unitPrice: 350, total: 350 }
      ],
      scopeDescription: 'Upgrade existing electrical service to 200A. Includes removal of old panel, installation of new 200A panel, grounding, and labeled breakers.'
    },
    {
      id: 't-plum-1',
      name: 'Master Bath Fixture Update',
      serviceCategory: 'Plumbing',
      isHardCoded: true,
      items: [
        { description: 'Dual Sink Faucet Installation', unit: 'ea', quantity: 2, unitPrice: 225, total: 450 },
        { description: 'High-Efficiency Toilet Install', unit: 'ea', quantity: 1, unitPrice: 350, total: 350 },
        { description: 'Shower Head & Valve Kit', unit: 'ea', quantity: 1, unitPrice: 450, total: 450 }
      ],
      scopeDescription: 'Removal and replacement of existing master bathroom faucets, toilet, and shower trim. Includes testing for leaks.'
    },
    {
      id: 't-hvac-1',
      name: 'Central AC System Replacement',
      serviceCategory: 'HVAC',
      isHardCoded: true,
      items: [
        { description: '15 SEER Condenser Unit', unit: 'ea', quantity: 1, unitPrice: 4200, total: 4200 },
        { description: 'Matching Evaporator Coil', unit: 'ea', quantity: 1, unitPrice: 1200, total: 1200 },
        { description: 'Lineset & Accessories', unit: 'flat', quantity: 1, unitPrice: 450, total: 450 }
      ],
      scopeDescription: 'Complete removal of old AC unit and installation of new high-efficiency 15 SEER system. Includes new lineset and refrigerant.'
    }
  ];

  const stored = localStorage.getItem(TEMPLATES_KEY);
  if (!stored) return hardCodedTemplates;
  
  const userTemplates: QuoteTemplate[] = JSON.parse(stored);
  const hardCodedIds = new Set(hardCodedTemplates.map(t => t.id));
  const userAdded = userTemplates.filter(t => !hardCodedIds.has(t.id));
  
  return [...hardCodedTemplates, ...userAdded];
};

export const saveTemplates = (templates: QuoteTemplate[]) => {
  const userOnly = templates.filter(t => !t.isHardCoded);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(userOnly));
};

export const getCommonItems = (): CommonItem[] => {
  if (typeof window === 'undefined') return [];
  
  const hardCodedItems: CommonItem[] = [
    { id: 'h-1', category: 'Painting - Interior', description: 'Paint Walls (2 coats)', unit: 'sq ft', defaultUnitPrice: 2.50, isHardCoded: true },
    { id: 'h-2', category: 'Painting - Interior', description: 'Paint Ceiling', unit: 'sq ft', defaultUnitPrice: 1.75, isHardCoded: true },
    { id: 'h-3', category: 'Painting - Prep', description: 'Wall Sanding & Prep', unit: 'hr', defaultUnitPrice: 65.00, isHardCoded: true },
    { id: 'h-4', category: 'Electrical - Devices', description: 'Standard Outlet Replace', unit: 'ea', defaultUnitPrice: 45.00, isHardCoded: true },
    { id: 'h-5', category: 'Plumbing - Fixtures', description: 'Kitchen Faucet Install', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },
  ];

  const stored = localStorage.getItem(COMMON_ITEMS_KEY);
  if (!stored) return hardCodedItems;
  
  const storedItems: CommonItem[] = JSON.parse(stored);
  const hardCodedIds = new Set(hardCodedItems.map(i => i.id));
  const userAddedItems = storedItems.filter(i => !hardCodedIds.has(i.id));
  
  const finalHardcoded = hardCodedItems.map(hc => {
    const match = storedItems.find(s => s.id === hc.id);
    if (match) {
      return { ...hc, defaultUnitPrice: match.defaultUnitPrice, unit: match.unit };
    }
    return hc;
  });

  return [...finalHardcoded, ...userAddedItems];
};

export const saveCommonItems = (items: CommonItem[]) => {
  const userOnly = items.filter(i => !i.isHardCoded);
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(userOnly));
};

export type QuoteDraft = {
  clientId: string;
  serviceCategory: string;
  items: QuoteItem[];
  laborHours: number;
  laborRate: number;
  materialCosts: number;
  taxRate: number;
  notes: string;
  scopeDescription: string;
};

export const getDraftQuote = (): QuoteDraft | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(DRAFT_QUOTE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveDraftQuote = (draft: QuoteDraft) => {
  localStorage.setItem(DRAFT_QUOTE_KEY, JSON.stringify(draft));
};

export const clearDraftQuote = () => {
  localStorage.removeItem(DRAFT_QUOTE_KEY);
};
