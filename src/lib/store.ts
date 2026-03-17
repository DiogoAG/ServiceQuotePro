
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
      name: 'Standard Electrical Inspection',
      serviceCategory: 'Electrical',
      items: [
        { description: 'Panel Inspection & Testing', quantity: 1, unitPrice: 150, total: 150 },
        { description: 'Circuit Breaker Evaluation', quantity: 1, unitPrice: 75, total: 75 },
        { description: 'Grounding System Check', quantity: 1, unitPrice: 50, total: 50 }
      ],
      scopeDescription: 'Comprehensive safety inspection of the main electrical panel, grounding system, and branch circuits to ensure compliance with local codes.'
    },
    {
      id: 't2',
      name: 'Residential Plumbing Repair',
      serviceCategory: 'Plumbing',
      items: [
        { description: 'Faucet/Fixture Repair Kit', quantity: 1, unitPrice: 45, total: 45 },
        { description: 'Drain Clearing Service (Main Line)', quantity: 1, unitPrice: 180, total: 180 },
        { description: 'Pipe Section Replacement', quantity: 1, unitPrice: 95, total: 95 }
      ],
      scopeDescription: 'Diagnosis and repair of residential plumbing fixtures, drainage clearing, and minor pipe restoration to prevent leaks.'
    },
    {
      id: 't3',
      name: 'HVAC Seasonal Maintenance',
      serviceCategory: 'HVAC',
      items: [
        { description: 'Filter Replacement (High MERV)', quantity: 1, unitPrice: 35, total: 35 },
        { description: 'Refrigerant Level Check', quantity: 1, unitPrice: 85, total: 85 },
        { description: 'Condenser Coil Cleaning', quantity: 1, unitPrice: 120, total: 120 }
      ],
      scopeDescription: 'Standard 21-point HVAC system inspection including coil cleaning, filter replacement, and performance testing for peak efficiency.'
    },
    {
      id: 't4',
      name: 'Interior Painting - Single Room',
      serviceCategory: 'Painting',
      items: [
        { description: 'Premium Low-VOC Paint (Gallons)', quantity: 2, unitPrice: 65, total: 130 },
        { description: 'Surface Prep & Sanding', quantity: 1, unitPrice: 100, total: 100 },
        { description: 'Trim & Ceiling Detail', quantity: 1, unitPrice: 150, total: 150 }
      ],
      scopeDescription: 'Full interior painting of a standard 12x12 room including ceiling, trim, and wall surfaces with professional preparation.'
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
    // General
    { id: 'g1', category: 'General', description: 'Service Call Fee / Diagnostic', defaultUnitPrice: 95 },
    { id: 'g2', category: 'General', description: 'Emergency / After-Hours Fee', defaultUnitPrice: 185 },
    { id: 'g3', category: 'General', description: 'Disposal & Material Handling', defaultUnitPrice: 45 },
    { id: 'g4', category: 'General', description: 'Labor - Apprentice/Helper', defaultUnitPrice: 45 },
    { id: 'g5', category: 'General', description: 'Equipment Rental (Daily)', defaultUnitPrice: 150 },
    { id: 'g6', category: 'General', description: 'Travel Surcharge (Out of area)', defaultUnitPrice: 50 },

    // Electrical
    { id: 'e1', category: 'Electrical', description: 'Labor - Master Electrician', defaultUnitPrice: 115 },
    { id: 'e2', category: 'Electrical', description: 'Circuit Breaker Replacement (Standard)', defaultUnitPrice: 45 },
    { id: 'e3', category: 'Electrical', description: 'Electrical Panel Upgrade (200 Amp)', defaultUnitPrice: 2400 },
    { id: 'e4', category: 'Electrical', description: 'GFCI Outlet Installation', defaultUnitPrice: 95 },
    { id: 'e5', category: 'Electrical', description: 'Lighting Fixture Installation (Basic)', defaultUnitPrice: 125 },
    { id: 'e6', category: 'Electrical', description: 'Ceiling Fan Installation', defaultUnitPrice: 175 },
    { id: 'e7', category: 'Electrical', description: 'EV Charger Circuit (NEMA 14-50)', defaultUnitPrice: 450 },
    { id: 'e8', category: 'Electrical', description: 'Recessed Lighting (per fixture)', defaultUnitPrice: 110 },
    
    // Plumbing
    { id: 'p1', category: 'Plumbing', description: 'Labor - Master Plumber', defaultUnitPrice: 125 },
    { id: 'p2', category: 'Plumbing', description: 'Drain Clearing - Main Line', defaultUnitPrice: 225 },
    { id: 'p3', category: 'Plumbing', description: 'Water Heater Replacement (50 Gal)', defaultUnitPrice: 1650 },
    { id: 'p4', category: 'Plumbing', description: 'Faucet Repair/Installation', defaultUnitPrice: 185 },
    { id: 'p5', category: 'Plumbing', description: 'Toilet Replacement (Standard)', defaultUnitPrice: 395 },
    { id: 'p6', category: 'Plumbing', description: 'Garbage Disposal Installation', defaultUnitPrice: 225 },
    { id: 'p7', category: 'Plumbing', description: 'Sump Pump Replacement', defaultUnitPrice: 450 },
    { id: 'p8', category: 'Plumbing', description: 'Whole House Water Filter', defaultUnitPrice: 850 },
    
    // HVAC
    { id: 'h1', category: 'HVAC', description: 'Labor - HVAC Technician', defaultUnitPrice: 110 },
    { id: 'h2', category: 'HVAC', description: 'A/C Seasonal Tune-Up', defaultUnitPrice: 159 },
    { id: 'h3', category: 'HVAC', description: 'Furnace Inspection & Service', defaultUnitPrice: 145 },
    { id: 'h4', category: 'HVAC', description: 'Smart Thermostat Installation', defaultUnitPrice: 195 },
    { id: 'h5', category: 'HVAC', description: 'Refrigerant Recharge (per lb)', defaultUnitPrice: 115 },
    { id: 'h6', category: 'HVAC', description: 'Condenser Motor Replacement', defaultUnitPrice: 450 },
    { id: 'h7', category: 'HVAC', description: 'Duct Cleaning (per vent)', defaultUnitPrice: 35 },
    { id: 'h8', category: 'HVAC', description: 'Capacitor Replacement', defaultUnitPrice: 185 },
    
    // Painting
    { id: 'pt1', category: 'Painting', description: 'Labor - Professional Painter', defaultUnitPrice: 65 },
    { id: 'pt2', category: 'Painting', description: 'Premium Paint (Gallon)', defaultUnitPrice: 68 },
    { id: 'pt3', category: 'Painting', description: 'Surface Prep & Drywall Patching', defaultUnitPrice: 145 },
    { id: 'pt4', category: 'Painting', description: 'Trim & Baseboard Painting (per room)', defaultUnitPrice: 175 },
    { id: 'pt5', category: 'Painting', description: 'Ceiling Painting (Standard Room)', defaultUnitPrice: 125 },
    { id: 'pt6', category: 'Painting', description: 'Cabinet Refinishing (per door)', defaultUnitPrice: 85 },
    { id: 'pt7', category: 'Painting', description: 'Wallpaper Removal (per hour)', defaultUnitPrice: 75 },
    { id: 'pt8', category: 'Painting', description: 'Exterior Siding Stain (per sq ft)', defaultUnitPrice: 4.5 },

    // Landscaping
    { id: 'l1', category: 'Landscaping', description: 'Lawn Maintenance (Mow/Edge)', defaultUnitPrice: 65 },
    { id: 'l2', category: 'Landscaping', description: 'Mulch Installation (per yard)', defaultUnitPrice: 85 },
    { id: 'l3', category: 'Landscaping', description: 'Irrigation System Repair (per hour)', defaultUnitPrice: 95 },
    { id: 'l4', category: 'Landscaping', description: 'Tree Trimming (Small/Medium)', defaultUnitPrice: 250 },
    { id: 'l5', category: 'Landscaping', description: 'Fertilizer Application', defaultUnitPrice: 45 },
    
    // Roofing
    { id: 'r1', category: 'Roofing', description: 'Roof Inspection & Certification', defaultUnitPrice: 250 },
    { id: 'r2', category: 'Roofing', description: 'Shingle Repair (Minor)', defaultUnitPrice: 350 },
    { id: 'r3', category: 'Roofing', description: 'Gutter Cleaning (Standard)', defaultUnitPrice: 145 },
    { id: 'r4', category: 'Roofing', description: 'Flashing Repair', defaultUnitPrice: 185 },
    
    // Carpentry
    { id: 'c1', category: 'Carpentry', description: 'Custom Shelving Installation', defaultUnitPrice: 450 },
    { id: 'c2', category: 'Carpentry', description: 'Door Hanging & Hardware', defaultUnitPrice: 195 },
    { id: 'c3', category: 'Carpentry', description: 'Deck Board Replacement (per board)', defaultUnitPrice: 45 },
    { id: 'c4', category: 'Carpentry', description: 'Crown Molding (per linear ft)', defaultUnitPrice: 12 },
    
    // Cleaning
    { id: 'cl1', category: 'Cleaning', description: 'Deep House Cleaning (Standard)', defaultUnitPrice: 250 },
    { id: 'cl2', category: 'Cleaning', description: 'Move-In/Move-Out Cleaning', defaultUnitPrice: 450 },
    { id: 'cl3', category: 'Cleaning', description: 'Window Cleaning (per window)', defaultUnitPrice: 15 },
    { id: 'cl4', category: 'Cleaning', description: 'Carpet Steam Cleaning (per room)', defaultUnitPrice: 65 }
  ];
};

export const saveCommonItems = (items: CommonItem[]) => {
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(items));
};
