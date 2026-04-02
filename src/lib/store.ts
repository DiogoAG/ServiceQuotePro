
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
    },
    {
      id: 't-gc-1',
      name: 'Kitchen Remodel - Basic',
      serviceCategory: 'General Contracting',
      isHardCoded: true,
      items: [
        { description: 'Stock Cabinet Installation', unit: 'set', quantity: 1, unitPrice: 8500, total: 8500 },
        { description: 'Quartz Countertop (Group A)', unit: 'sq ft', quantity: 45, unitPrice: 95, total: 4275 },
        { description: 'Backsplash Tile Labor', unit: 'sq ft', quantity: 30, unitPrice: 25, total: 750 }
      ],
      scopeDescription: 'Moderate kitchen renovation including new stock cabinetry, quartz countertops, and decorative tile backsplash.'
    },
    {
      id: 't-land-1',
      name: 'Paver Patio & Planting Bed',
      serviceCategory: 'Landscaping',
      isHardCoded: true,
      items: [
        { description: 'Interlocking Paver Patio', unit: 'sq ft', quantity: 300, unitPrice: 28, total: 8400 },
        { description: 'Decorative Planting Bed (w/ Mulch)', unit: 'sq ft', quantity: 100, unitPrice: 8, total: 800 },
        { description: 'Specimen Tree (15 Gal)', unit: 'ea', quantity: 2, unitPrice: 250, total: 500 }
      ],
      scopeDescription: 'Installation of a new 300 sq ft paver patio with adjacent planting beds and screening trees.'
    },
    {
      id: 't-roof-1',
      name: 'Residential Re-Roof (Shingle)',
      serviceCategory: 'Roofing',
      isHardCoded: true,
      items: [
        { description: 'Architectural Shingle Roof', unit: 'sq', quantity: 22, unitPrice: 650, total: 14300 },
        { description: 'Tear-off & Disposal Fee', unit: 'sq', quantity: 22, unitPrice: 150, total: 3300 },
        { description: 'Ice & Water Shield Barrier', unit: 'sq', quantity: 5, unitPrice: 125, total: 625 }
      ],
      scopeDescription: 'Complete roof replacement including tear-off of one layer of old shingles and installation of new architectural lifetime shingles.'
    },
    {
      id: 't-carp-1',
      name: 'Custom Living Room Built-ins',
      serviceCategory: 'Carpentry',
      isHardCoded: true,
      items: [
        { description: 'Custom Lower Cabinet Bases', unit: 'linear ft', quantity: 12, unitPrice: 350, total: 4200 },
        { description: 'Open Shelving Units (Upper)', unit: 'linear ft', quantity: 12, unitPrice: 250, total: 3000 },
        { description: 'Finish Trim & Molding', unit: 'flat', quantity: 1, unitPrice: 850, total: 850 }
      ],
      scopeDescription: 'Design and construction of custom fireside built-in cabinets and floating shelves. Material: Paint-grade MDF/Maple.'
    },
    {
      id: 't-clean-1',
      name: 'Post-Construction Deep Clean',
      serviceCategory: 'Cleaning',
      isHardCoded: true,
      items: [
        { description: 'Post-Renovation Detailed Clean', unit: 'sq ft', quantity: 2500, unitPrice: 0.85, total: 2125 },
        { description: 'Exterior Window Cleaning (1st Fl)', unit: 'window', quantity: 12, unitPrice: 15, total: 180 },
        { description: 'Floor Buff & Polish', unit: 'sq ft', quantity: 800, unitPrice: 1.25, total: 1000 }
      ],
      scopeDescription: 'Comprehensive deep cleaning after construction. Includes dust removal from all surfaces, inside cabinets, and window tracks.'
    },
    {
      id: 't-other-1',
      name: 'General Handyman Repair',
      serviceCategory: 'Other',
      isHardCoded: true,
      items: [
        { description: 'Handyman Labor (Minor Repairs)', unit: 'hr', quantity: 4, unitPrice: 75, total: 300 },
        { description: 'Small Parts & Fasteners Allowance', unit: 'flat', quantity: 1, unitPrice: 50, total: 50 }
      ],
      scopeDescription: 'Miscellaneous small repairs and maintenance tasks around the property. Includes labor for up to 4 hours and basic consumables.'
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
    // ... items (keeping the structure for consistency)
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
