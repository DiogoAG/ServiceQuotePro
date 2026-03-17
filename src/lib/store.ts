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
      name: 'Interior Living Room Paint',
      serviceCategory: 'Painting',
      items: [
        { description: 'Interior Wall Painting', unit: 'sq ft', quantity: 450, unitPrice: 2.5, total: 1125 },
        { description: 'Ceiling Painting', unit: 'sq ft', quantity: 200, unitPrice: 2.0, total: 400 },
        { description: 'Baseboard Painting', unit: 'linear ft', quantity: 60, unitPrice: 1.5, total: 90 }
      ],
      scopeDescription: 'Full preparation and painting of living room walls and ceiling. Includes minor patching and baseboard painting.'
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
    // Interior Painting
    { id: 'ip1', category: 'Interior Painting', description: 'Interior Wall Painting', unit: 'sq ft', defaultUnitPrice: 2.5 },
    { id: 'ip2', category: 'Interior Painting', description: 'Ceiling Painting', unit: 'sq ft', defaultUnitPrice: 2.0 },
    { id: 'ip3', category: 'Interior Painting', description: 'Accent Wall Painting', unit: 'wall', defaultUnitPrice: 350 },
    { id: 'ip4', category: 'Interior Painting', description: 'Trim Painting', unit: 'linear ft', defaultUnitPrice: 1.5 },
    { id: 'ip5', category: 'Interior Painting', description: 'Baseboard Painting', unit: 'linear ft', defaultUnitPrice: 1.5 },
    { id: 'ip6', category: 'Interior Painting', description: 'Crown Molding Painting', unit: 'linear ft', defaultUnitPrice: 1.75 },
    { id: 'ip7', category: 'Interior Painting', description: 'Door Painting', unit: 'door', defaultUnitPrice: 125 },
    { id: 'ip8', category: 'Interior Painting', description: 'Door Frame Painting', unit: 'frame', defaultUnitPrice: 50 },
    { id: 'ip9', category: 'Interior Painting', description: 'Window Frame Painting', unit: 'window', defaultUnitPrice: 75 },
    { id: 'ip10', category: 'Interior Painting', description: 'Closet Painting', unit: 'closet', defaultUnitPrice: 150 },
    { id: 'ip11', category: 'Interior Painting', description: 'Staircase / Railing Painting', unit: 'set', defaultUnitPrice: 1500 },

    // Exterior Painting
    { id: 'ep1', category: 'Exterior Painting', description: 'Exterior Wall Painting', unit: 'sq ft', defaultUnitPrice: 3.0 },
    { id: 'ep2', category: 'Exterior Painting', description: 'Stucco Painting', unit: 'sq ft', defaultUnitPrice: 3.5 },
    { id: 'ep3', category: 'Exterior Painting', description: 'Brick Painting', unit: 'sq ft', defaultUnitPrice: 3.5 },
    { id: 'ep4', category: 'Exterior Painting', description: 'Trim / Fascia Painting', unit: 'linear ft', defaultUnitPrice: 2.0 },
    { id: 'ep5', category: 'Exterior Painting', description: 'Garage Door Painting', unit: 'door', defaultUnitPrice: 400 },
    { id: 'ep6', category: 'Exterior Painting', description: 'Front Door Painting', unit: 'door', defaultUnitPrice: 250 },
    { id: 'ep7', category: 'Exterior Painting', description: 'Window Frame Painting (Exterior)', unit: 'window', defaultUnitPrice: 95 },
    { id: 'ep8', category: 'Exterior Painting', description: 'Shutter Painting', unit: 'shutter', defaultUnitPrice: 45 },
    { id: 'ep9', category: 'Exterior Painting', description: 'Deck Painting', unit: 'sq ft', defaultUnitPrice: 2.5 },
    { id: 'ep10', category: 'Exterior Painting', description: 'Fence Painting', unit: 'linear ft', defaultUnitPrice: 2.0 },

    // Surface Preparation
    { id: 'sp1', category: 'Surface Preparation', description: 'Pressure Washing', unit: 'sq ft', defaultUnitPrice: 0.25 },
    { id: 'sp2', category: 'Surface Preparation', description: 'Paint Scraping', unit: 'sq ft', defaultUnitPrice: 1.5 },
    { id: 'sp3', category: 'Surface Preparation', description: 'Sanding', unit: 'sq ft', defaultUnitPrice: 1.0 },
    { id: 'sp4', category: 'Surface Preparation', description: 'Caulking / Sealing', unit: 'linear ft', defaultUnitPrice: 0.75 },
    { id: 'sp5', category: 'Surface Preparation', description: 'Crack / Hole Patching', unit: 'patch', defaultUnitPrice: 25 },
    { id: 'sp6', category: 'Surface Preparation', description: 'Drywall Repair', unit: 'repair', defaultUnitPrice: 150 },
    { id: 'sp7', category: 'Surface Preparation', description: 'Priming Surfaces', unit: 'sq ft', defaultUnitPrice: 1.0 },

    // Specialty Painting Services
    { id: 'sps1', category: 'Specialty Painting Services', description: 'Cabinet Painting', unit: 'cabinet', defaultUnitPrice: 150 },
    { id: 'sps2', category: 'Specialty Painting Services', description: 'Cabinet Refinishing', unit: 'cabinet', defaultUnitPrice: 250 },
    { id: 'sps3', category: 'Specialty Painting Services', description: 'Wood Staining', unit: 'sq ft', defaultUnitPrice: 2.5 },
    { id: 'sps4', category: 'Specialty Painting Services', description: 'Deck Staining', unit: 'sq ft', defaultUnitPrice: 2.5 },
    { id: 'sps5', category: 'Specialty Painting Services', description: 'Fence Staining', unit: 'sq ft', defaultUnitPrice: 2.5 },
    { id: 'sps6', category: 'Specialty Painting Services', description: 'Varnish / Polyurethane Finish', unit: 'sq ft', defaultUnitPrice: 1.5 },
    { id: 'sps7', category: 'Specialty Painting Services', description: 'Texture Application', unit: 'sq ft', defaultUnitPrice: 1.5 },
    { id: 'sps8', category: 'Specialty Painting Services', description: 'Epoxy Garage Floor Coating', unit: 'sq ft', defaultUnitPrice: 6.0 },
    { id: 'sps9', category: 'Specialty Painting Services', description: 'Waterproof Coating', unit: 'sq ft', defaultUnitPrice: 3.5 },

    // Additional Services
    { id: 'as1', category: 'Additional Services', description: 'Wallpaper Removal', unit: 'sq ft', defaultUnitPrice: 2.0 },
    { id: 'as2', category: 'Additional Services', description: 'Popcorn Ceiling Removal', unit: 'sq ft', defaultUnitPrice: 4.0 },
    { id: 'as3', category: 'Additional Services', description: 'Touch-Up Painting', unit: 'hr', defaultUnitPrice: 75 },
    { id: 'as4', category: 'Additional Services', description: 'Disposal & Material Handling', defaultUnitPrice: 45 },

    // General
    { id: 'g1', category: 'General', description: 'Service Call Fee / Diagnostic', defaultUnitPrice: 95 }
  ];
};

export const saveCommonItems = (items: CommonItem[]) => {
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(items));
};
