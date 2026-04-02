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
    // --- PAINTING ---
    { id: 'h-p-1', category: 'Painting - Interior Painting', description: 'Wall Painting (2 coats)', unit: 'sq ft', defaultUnitPrice: 2.75, isHardCoded: true },
    { id: 'h-p-2', category: 'Painting - Interior Painting', description: 'Ceiling Painting', unit: 'sq ft', defaultUnitPrice: 2.25, isHardCoded: true },
    { id: 'h-p-3', category: 'Painting - Interior Painting', description: 'Trim & Molding Painting', unit: 'linear ft', defaultUnitPrice: 1.75, isHardCoded: true },
    { id: 'h-p-4', category: 'Painting - Interior Painting', description: 'Door & Frame Enamel', unit: 'ea', defaultUnitPrice: 95.00, isHardCoded: true },
    { id: 'h-p-5', category: 'Painting - Interior Painting', description: 'Accent Wall Premium', unit: 'flat', defaultUnitPrice: 150.00, isHardCoded: true },
    { id: 'h-p-6', category: 'Painting - Surface Preparation', description: 'Wall Patching & Sanding', unit: 'hr', defaultUnitPrice: 65.00, isHardCoded: true },
    { id: 'h-p-7', category: 'Painting - Surface Preparation', description: 'Wallpaper Removal', unit: 'sq ft', defaultUnitPrice: 1.50, isHardCoded: true },
    { id: 'h-p-8', category: 'Painting - Surface Preparation', description: 'Popcorn Ceiling Removal', unit: 'sq ft', defaultUnitPrice: 4.00, isHardCoded: true },
    { id: 'h-p-9', category: 'Painting - Exterior Painting', description: 'Siding Painting', unit: 'sq ft', defaultUnitPrice: 3.75, isHardCoded: true },
    { id: 'h-p-10', category: 'Painting - Exterior Painting', description: 'Stucco Coating', unit: 'sq ft', defaultUnitPrice: 4.25, isHardCoded: true },
    { id: 'h-p-11', category: 'Painting - Exterior Painting', description: 'Deck Staining', unit: 'sq ft', defaultUnitPrice: 4.50, isHardCoded: true },
    { id: 'h-p-12', category: 'Painting - Specialty Painting Services', description: 'Cabinet Refinishing', unit: 'lin ft', defaultUnitPrice: 125.00, isHardCoded: true },
    { id: 'h-p-13', category: 'Painting - Specialty Painting Services', description: 'Garage Floor Epoxy', unit: 'sq ft', defaultUnitPrice: 6.50, isHardCoded: true },

    // --- GENERAL CONTRACTING ---
    { id: 'h-gc-1', category: 'General Contracting - Project Management', description: 'Supervision & Coordination', unit: 'hr', defaultUnitPrice: 95.00, isHardCoded: true },
    { id: 'h-gc-2', category: 'General Contracting - Sitework', description: 'Debris Removal & Disposal', unit: 'load', defaultUnitPrice: 450.00, isHardCoded: true },
    { id: 'h-gc-3', category: 'General Contracting - Structural Construction', description: 'Wall Demolition (Non-Load)', unit: 'sq ft', defaultUnitPrice: 12.00, isHardCoded: true },
    { id: 'h-gc-4', category: 'General Contracting - Interior Construction', description: 'Drywall Hanging & Taping', unit: 'sq ft', defaultUnitPrice: 2.50, isHardCoded: true },

    // --- ELECTRICAL ---
    { id: 'h-e-1', category: 'Electrical - Wiring & Devices', description: 'Standard Outlet Replace', unit: 'ea', defaultUnitPrice: 45.00, isHardCoded: true },
    { id: 'h-e-2', category: 'Electrical - Wiring & Devices', description: 'GFCI Outlet Install', unit: 'ea', defaultUnitPrice: 85.00, isHardCoded: true },
    { id: 'h-e-3', category: 'Electrical - Lighting Systems', description: 'Recessed LED Pot Light', unit: 'ea', defaultUnitPrice: 145.00, isHardCoded: true },
    { id: 'h-e-4', category: 'Electrical - Lighting Systems', description: 'Ceiling Fan Install', unit: 'ea', defaultUnitPrice: 175.00, isHardCoded: true },
    { id: 'h-e-5', category: 'Electrical - Power Distribution', description: 'Dedicated 20A Circuit', unit: 'ea', defaultUnitPrice: 325.00, isHardCoded: true },
    { id: 'h-e-6', category: 'Electrical - Power Distribution', description: '200 Amp Panel Upgrade', unit: 'ea', defaultUnitPrice: 2800.00, isHardCoded: true },
    { id: 'h-e-7', category: 'Electrical - Low Voltage Systems', description: 'Cat6 Network Drop', unit: 'ea', defaultUnitPrice: 150.00, isHardCoded: true },

    // --- PLUMBING ---
    { id: 'h-pl-1', category: 'Plumbing - Fixtures & Appliances', description: 'Kitchen Faucet Install', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },
    { id: 'h-pl-2', category: 'Plumbing - Fixtures & Appliances', description: 'Toilet Replace (Std)', unit: 'ea', defaultUnitPrice: 275.00, isHardCoded: true },
    { id: 'h-pl-3', category: 'Plumbing - Fixtures & Appliances', description: 'Disposal Replacement', unit: 'ea', defaultUnitPrice: 225.00, isHardCoded: true },
    { id: 'h-pl-4', category: 'Plumbing - Water Heating', description: '50 Gal Gas Water Heater', unit: 'ea', defaultUnitPrice: 1650.00, isHardCoded: true },
    { id: 'h-pl-5', category: 'Plumbing - Water Supply Systems', description: 'Main Shut-off Replace', unit: 'ea', defaultUnitPrice: 350.00, isHardCoded: true },
    { id: 'h-pl-6', category: 'Plumbing - Maintenance & Repair', description: 'Drain Snaking Service', unit: 'hr', defaultUnitPrice: 150.00, isHardCoded: true },

    // --- HVAC (EXACTLY AS REQUESTED) ---
    { id: 'h-hv-1', category: 'HVAC - Heating Systems', description: 'Gas Furnace Installation', unit: 'ea', defaultUnitPrice: 4500.00, isHardCoded: true },
    { id: 'h-hv-2', category: 'HVAC - Heating Systems', description: 'Heat Pump System (Split)', unit: 'ea', defaultUnitPrice: 7500.00, isHardCoded: true },
    { id: 'h-hv-3', category: 'HVAC - Cooling Systems', description: 'AC Condenser Unit Install', unit: 'ea', defaultUnitPrice: 4200.00, isHardCoded: true },
    { id: 'h-hv-4', category: 'HVAC - Cooling Systems', description: 'Chiller Plant Service', unit: 'hr', defaultUnitPrice: 185.00, isHardCoded: true },
    { id: 'h-hv-5', category: 'HVAC - Air Distribution', description: 'Ductwork Fabrication / Install', unit: 'linear ft', defaultUnitPrice: 35.00, isHardCoded: true },
    { id: 'h-hv-6', category: 'HVAC - Air Distribution', description: 'VAV Box Installation', unit: 'ea', defaultUnitPrice: 950.00, isHardCoded: true },
    { id: 'h-hv-7', category: 'HVAC - Air Distribution', description: 'Ventilation Fan Install', unit: 'ea', defaultUnitPrice: 350.00, isHardCoded: true },
    { id: 'h-hv-8', category: 'HVAC - Controls', description: 'Smart Thermostat Install', unit: 'ea', defaultUnitPrice: 150.00, isHardCoded: true },
    { id: 'h-hv-9', category: 'HVAC - Controls', description: 'Zoning Control System', unit: 'zone', defaultUnitPrice: 850.00, isHardCoded: true },
    { id: 'h-hv-10', category: 'HVAC - Indoor Air Quality', description: 'HEPA Air Filtration System', unit: 'ea', defaultUnitPrice: 1200.00, isHardCoded: true },
    { id: 'h-hv-11', category: 'HVAC - Indoor Air Quality', description: 'Whole House Humidifier', unit: 'ea', defaultUnitPrice: 650.00, isHardCoded: true },
    { id: 'h-hv-12', category: 'HVAC - Maintenance & Service', description: 'Annual System Diagnostic', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },
    { id: 'h-hv-13', category: 'HVAC - Maintenance & Service', description: 'Refrigerant Recharging', unit: 'lb', defaultUnitPrice: 95.00, isHardCoded: true },

    // --- LANDSCAPING ---
    { id: 'h-l-1', category: 'Landscaping - Maintenance', description: 'Lawn Mowing & Edging', unit: 'sq ft', defaultUnitPrice: 0.15, isHardCoded: true },
    { id: 'h-l-2', category: 'Landscaping - Softscape', description: 'Mulch Spread (Delivery Incl)', unit: 'cu yd', defaultUnitPrice: 95.00, isHardCoded: true },
    { id: 'h-l-3', category: 'Landscaping - Hardscape', description: 'Paver Patio Install', unit: 'sq ft', defaultUnitPrice: 22.00, isHardCoded: true },
    { id: 'h-l-4', category: 'Landscaping - Irrigation', description: 'Sprinkler System Setup', unit: 'zone', defaultUnitPrice: 850.00, isHardCoded: true },

    // --- ROOFING ---
    { id: 'h-r-1', category: 'Roofing - Installation & Replacement', description: 'Asphalt Shingle Install', unit: 'sq', defaultUnitPrice: 475.00, isHardCoded: true },
    { id: 'h-r-2', category: 'Roofing - Repair & Maintenance', description: 'Leak Repair Service', unit: 'flat', defaultUnitPrice: 450.00, isHardCoded: true },
    { id: 'h-r-3', category: 'Roofing - Drainage', description: 'Gutter Cleaning Service', unit: 'lin ft', defaultUnitPrice: 1.75, isHardCoded: true },

    // --- CARPENTRY ---
    { id: 'h-c-1', category: 'Carpentry - Finish Carpentry', description: 'Baseboard / Trim Install', unit: 'lin ft', defaultUnitPrice: 4.50, isHardCoded: true },
    { id: 'h-c-2', category: 'Carpentry - Finish Carpentry', description: 'Crown Molding Install', unit: 'lin ft', defaultUnitPrice: 8.50, isHardCoded: true },
    { id: 'h-c-3', category: 'Carpentry - Doors & Windows', description: 'Interior Door Install', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },

    // --- CLEANING ---
    { id: 'h-cl-1', category: 'Cleaning - General Cleaning', description: 'Std Residential Clean', unit: 'sq ft', defaultUnitPrice: 0.20, isHardCoded: true },
    { id: 'h-cl-2', category: 'Cleaning - Deep Cleaning', description: 'Move-In / Out Deep Clean', unit: 'sq ft', defaultUnitPrice: 0.45, isHardCoded: true },
    { id: 'h-cl-3', category: 'Cleaning - Exterior Cleaning', description: 'Pressure Wash Driveway', unit: 'sq ft', defaultUnitPrice: 0.25, isHardCoded: true }
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
