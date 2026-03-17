
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
  
  const hardCodedItems: CommonItem[] = [
    // General Contracting
    { id: 'gc1', category: 'General Contracting', description: 'Site Preparation & Protection', unit: 'sq ft', defaultUnitPrice: 1.5, isHardCoded: true },
    { id: 'gc2', category: 'General Contracting', description: 'Debris Removal & Disposal', unit: 'load', defaultUnitPrice: 350, isHardCoded: true },
    { id: 'gc3', category: 'General Contracting', description: 'Project Management Fee', unit: 'flat', defaultUnitPrice: 500, isHardCoded: true },
    { id: 'gc4', category: 'General Contracting', description: 'Permit Coordination & Filing', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'gc5', category: 'General Contracting', description: 'Temporary Fencing (Rental)', unit: 'linear ft', defaultUnitPrice: 12, isHardCoded: true },
    { id: 'gc6', category: 'General Contracting', description: 'Final Site Cleanup & Polish', unit: 'sq ft', defaultUnitPrice: 0.85, isHardCoded: true },
    
    // Electrical
    { id: 'el1', category: 'Electrical', description: 'Outlet/Switch Installation', unit: 'ea', defaultUnitPrice: 125, isHardCoded: true },
    { id: 'el2', category: 'Electrical', description: 'Light Fixture Installation', unit: 'ea', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'el3', category: 'Electrical', description: 'Electrical Panel Upgrade', unit: 'ea', defaultUnitPrice: 2500, isHardCoded: true },
    { id: 'el4', category: 'Electrical', description: 'Recessed Lighting (6-Pack)', unit: 'set', defaultUnitPrice: 1200, isHardCoded: true },
    { id: 'el5', category: 'Electrical', description: 'GFCI Outlet Installation', unit: 'ea', defaultUnitPrice: 175, isHardCoded: true },
    { id: 'el6', category: 'Electrical', description: 'Whole House Surge Protector', unit: 'ea', defaultUnitPrice: 450, isHardCoded: true },
    { id: 'el7', category: 'Electrical', description: 'EV Charger Installation', unit: 'ea', defaultUnitPrice: 850, isHardCoded: true },
    
    // Plumbing
    { id: 'pl1', category: 'Plumbing', description: 'Leak Repair & Pipe Inspection', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'pl2', category: 'Plumbing', description: 'Faucet/Fixture Installation', unit: 'ea', defaultUnitPrice: 175, isHardCoded: true },
    { id: 'pl3', category: 'Plumbing', description: 'Toilet Replacement', unit: 'ea', defaultUnitPrice: 350, isHardCoded: true },
    { id: 'pl4', category: 'Plumbing', description: 'Water Heater Installation', unit: 'ea', defaultUnitPrice: 1800, isHardCoded: true },
    { id: 'pl5', category: 'Plumbing', description: 'Garbage Disposal Install', unit: 'ea', defaultUnitPrice: 225, isHardCoded: true },
    { id: 'pl6', category: 'Plumbing', description: 'Sump Pump Replacement', unit: 'ea', defaultUnitPrice: 550, isHardCoded: true },
    { id: 'pl7', category: 'Plumbing', description: 'Drain Cleaning (Main Line)', unit: 'ea', defaultUnitPrice: 450, isHardCoded: true },
    
    // HVAC
    { id: 'hv1', category: 'HVAC', description: 'AC System Tune-Up', unit: 'ea', defaultUnitPrice: 185, isHardCoded: true },
    { id: 'hv2', category: 'HVAC', description: 'Filter Replacement', unit: 'ea', defaultUnitPrice: 45, isHardCoded: true },
    { id: 'hv3', category: 'HVAC', description: 'Thermostat Installation', unit: 'ea', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'hv4', category: 'HVAC', description: 'Duct Cleaning Service', unit: 'ea', defaultUnitPrice: 650, isHardCoded: true },
    { id: 'hv5', category: 'HVAC', description: 'Furnace Inspection & Safety Check', unit: 'ea', defaultUnitPrice: 165, isHardCoded: true },
    { id: 'hv6', category: 'HVAC', description: 'Condenser Fan Motor Replace', unit: 'ea', defaultUnitPrice: 450, isHardCoded: true },
    
    // Landscaping
    { id: 'ls1', category: 'Landscaping', description: 'Lawn Mowing & Edging', unit: 'visit', defaultUnitPrice: 85, isHardCoded: true },
    { id: 'ls2', category: 'Landscaping', description: 'Mulch Installation', unit: 'cu yd', defaultUnitPrice: 120, isHardCoded: true },
    { id: 'ls3', category: 'Landscaping', description: 'Tree/Shrub Planting', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'ls4', category: 'Landscaping', description: 'Sod Installation', unit: 'sq ft', defaultUnitPrice: 2.25, isHardCoded: true },
    { id: 'ls5', category: 'Landscaping', description: 'Paver Patio Installation', unit: 'sq ft', defaultUnitPrice: 25, isHardCoded: true },
    { id: 'ls6', category: 'Landscaping', description: 'Sprinkler System Repair', unit: 'ea', defaultUnitPrice: 150, isHardCoded: true },
    
    // Painting - Interior
    { id: 'ip1', category: 'Painting - Interior Painting', description: 'Interior Wall Painting', unit: 'sq ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'ip2', category: 'Painting - Interior Painting', description: 'Ceiling Painting', unit: 'sq ft', defaultUnitPrice: 2.0, isHardCoded: true },
    { id: 'ip3', category: 'Painting - Interior Painting', description: 'Accent Wall Painting', unit: 'wall', defaultUnitPrice: 350, isHardCoded: true },
    { id: 'ip4', category: 'Painting - Interior Painting', description: 'Trim Painting', unit: 'linear ft', defaultUnitPrice: 1.5, isHardCoded: true },
    { id: 'ip5', category: 'Painting - Interior Painting', description: 'Baseboard Painting', unit: 'linear ft', defaultUnitPrice: 1.25, isHardCoded: true },
    { id: 'ip6', category: 'Painting - Interior Painting', description: 'Crown Molding Painting', unit: 'linear ft', defaultUnitPrice: 1.75, isHardCoded: true },
    { id: 'ip7', category: 'Painting - Interior Painting', description: 'Door Painting', unit: 'door', defaultUnitPrice: 125, isHardCoded: true },
    { id: 'ip8', category: 'Painting - Interior Painting', description: 'Door Frame Painting', unit: 'frame', defaultUnitPrice: 75, isHardCoded: true },
    { id: 'ip9', category: 'Painting - Interior Painting', description: 'Window Frame Painting', unit: 'window', defaultUnitPrice: 85, isHardCoded: true },
    { id: 'ip10', category: 'Painting - Interior Painting', description: 'Closet Painting', unit: 'closet', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'ip11', category: 'Painting - Interior Painting', description: 'Staircase / Railing Painting', unit: 'set', defaultUnitPrice: 450, isHardCoded: true },

    // Painting - Exterior
    { id: 'ep1', category: 'Painting - Exterior Painting', description: 'Exterior Wall Painting', unit: 'sq ft', defaultUnitPrice: 3.5, isHardCoded: true },
    { id: 'ep2', category: 'Painting - Exterior Painting', description: 'Stucco Painting', unit: 'sq ft', defaultUnitPrice: 3.75, isHardCoded: true },
    { id: 'ep3', category: 'Painting - Exterior Painting', description: 'Brick Painting', unit: 'sq ft', defaultUnitPrice: 4.25, isHardCoded: true },
    { id: 'ep4', category: 'Painting - Exterior Painting', description: 'Trim / Fascia Painting', unit: 'linear ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'ep5', category: 'Painting - Exterior Painting', description: 'Garage Door Painting', unit: 'door', defaultUnitPrice: 450, isHardCoded: true },
    { id: 'ep6', category: 'Painting - Exterior Painting', description: 'Front Door Painting', unit: 'door', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'ep7', category: 'Painting - Exterior Painting', description: 'Window Frame Painting (Ext)', unit: 'window', defaultUnitPrice: 95, isHardCoded: true },
    { id: 'ep8', category: 'Painting - Exterior Painting', description: 'Shutter Painting', unit: 'shutter', defaultUnitPrice: 85, isHardCoded: true },
    { id: 'ep9', category: 'Painting - Exterior Painting', description: 'Deck Painting', unit: 'sq ft', defaultUnitPrice: 4.5, isHardCoded: true },
    { id: 'ep10', category: 'Painting - Exterior Painting', description: 'Fence Painting', unit: 'linear ft', defaultUnitPrice: 5.5, isHardCoded: true },

    // Painting - Surface Prep
    { id: 'sp1', category: 'Painting - Surface Preparation', description: 'Pressure Washing', unit: 'sq ft', defaultUnitPrice: 0.35, isHardCoded: true },
    { id: 'sp2', category: 'Painting - Surface Preparation', description: 'Paint Scraping', unit: 'sq ft', defaultUnitPrice: 1.5, isHardCoded: true },
    { id: 'sp3', category: 'Painting - Surface Preparation', description: 'Sanding', unit: 'sq ft', defaultUnitPrice: 0.85, isHardCoded: true },
    { id: 'sp4', category: 'Painting - Surface Preparation', description: 'Caulking / Sealing', unit: 'linear ft', defaultUnitPrice: 0.85, isHardCoded: true },
    { id: 'sp5', category: 'Painting - Surface Preparation', description: 'Crack / Hole Patching', unit: 'patch', defaultUnitPrice: 75, isHardCoded: true },
    { id: 'sp6', category: 'Painting - Surface Preparation', description: 'Drywall Repair', unit: 'repair', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'sp7', category: 'Painting - Surface Preparation', description: 'Priming Surfaces', unit: 'sq ft', defaultUnitPrice: 0.5, isHardCoded: true },

    // Painting - Specialty
    { id: 'sps1', category: 'Painting - Specialty Painting Services', description: 'Cabinet Painting', unit: 'cabinet', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'sps2', category: 'Painting - Specialty Painting Services', description: 'Cabinet Refinishing', unit: 'cabinet', defaultUnitPrice: 350, isHardCoded: true },
    { id: 'sps3', category: 'Painting - Specialty Painting Services', description: 'Wood Staining', unit: 'sq ft', defaultUnitPrice: 4.5, isHardCoded: true },
    { id: 'sps4', category: 'Painting - Specialty Painting Services', description: 'Deck Staining', unit: 'sq ft', defaultUnitPrice: 5.5, isHardCoded: true },
    { id: 'sps5', category: 'Painting - Specialty Painting Services', description: 'Fence Staining', unit: 'sq ft', defaultUnitPrice: 5.0, isHardCoded: true },
    { id: 'sps6', category: 'Painting - Specialty Painting Services', description: 'Varnish / Polyurethane Finish', unit: 'sq ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'sps7', category: 'Painting - Specialty Painting Services', description: 'Epoxy Garage Floor Coating', unit: 'sq ft', defaultUnitPrice: 7.5, isHardCoded: true },
    { id: 'sps8', category: 'Painting - Specialty Painting Services', description: 'Waterproof Coating', unit: 'sq ft', defaultUnitPrice: 3.5, isHardCoded: true },

    // Painting - Additional
    { id: 'as1', category: 'Painting - Additional Services', description: 'Wallpaper Removal', unit: 'sq ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'as2', category: 'Painting - Additional Services', description: 'Popcorn Ceiling Removal', unit: 'sq ft', defaultUnitPrice: 3.5, isHardCoded: true },
    { id: 'as3', category: 'Painting - Additional Services', description: 'Texture Application', unit: 'sq ft', defaultUnitPrice: 1.5, isHardCoded: true },
    { id: 'as4', category: 'Painting - Additional Services', description: 'Touch-Up Painting', unit: 'hr', defaultUnitPrice: 85, isHardCoded: true },

    // Roofing
    { id: 'rf1', category: 'Roofing', description: 'Roof Inspection & Assessment', unit: 'ea', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'rf2', category: 'Roofing', description: 'Gutter Cleaning & Inspection', unit: 'linear ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'rf3', category: 'Roofing', description: 'Shingle Repair (Minor)', unit: 'patch', defaultUnitPrice: 450, isHardCoded: true },
    { id: 'rf4', category: 'Roofing', description: 'Full Roof Replacement (Arch)', unit: 'sq', defaultUnitPrice: 650, isHardCoded: true },
    { id: 'rf5', category: 'Roofing', description: 'Skylight Replacement', unit: 'ea', defaultUnitPrice: 1200, isHardCoded: true },
    
    // Carpentry
    { id: 'cp1', category: 'Carpentry', description: 'Custom Trim Installation', unit: 'linear ft', defaultUnitPrice: 8.5, isHardCoded: true },
    { id: 'cp2', category: 'Carpentry', description: 'Door Hanging & Hardware', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'cp3', category: 'Carpentry', description: 'Crown Molding Installation', unit: 'linear ft', defaultUnitPrice: 12, isHardCoded: true },
    { id: 'cp4', category: 'Carpentry', description: 'Cabinet Hardware Install', unit: 'ea', defaultUnitPrice: 25, isHardCoded: true },
    { id: 'cp5', category: 'Carpentry', description: 'Wainscoting Installation', unit: 'sq ft', defaultUnitPrice: 18, isHardCoded: true },
    
    // Cleaning
    { id: 'cl1', category: 'Cleaning', description: 'Deep House Cleaning', unit: 'hr', defaultUnitPrice: 65, isHardCoded: true },
    { id: 'cl2', category: 'Cleaning', description: 'Post-Construction Cleanup', unit: 'sq ft', defaultUnitPrice: 0.75, isHardCoded: true },
    { id: 'cl3', category: 'Cleaning', description: 'Window Cleaning (Ext)', unit: 'window', defaultUnitPrice: 15, isHardCoded: true },
    { id: 'cl4', category: 'Cleaning', description: 'Carpet Steam Cleaning', unit: 'room', defaultUnitPrice: 75, isHardCoded: true },
    
    // Other
    { id: 'ot1', category: 'Other', description: 'General Handyman Labor', unit: 'hr', defaultUnitPrice: 75, isHardCoded: true },
    { id: 'ot2', category: 'Other', description: 'Furniture Assembly', unit: 'hr', defaultUnitPrice: 65, isHardCoded: true }
  ];

  if (!stored) return hardCodedItems;
  
  const userItems: CommonItem[] = JSON.parse(stored);
  const itemMap = new Map();
  hardCodedItems.forEach(item => itemMap.set(item.id, item));
  userItems.forEach(item => itemMap.set(item.id, item));
  
  return Array.from(itemMap.values());
};

export const saveCommonItems = (items: CommonItem[]) => {
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(items));
};
