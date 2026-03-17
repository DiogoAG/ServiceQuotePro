
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
    // Electrical
    { id: 'e1', category: 'Electrical', description: 'Labor - Master Electrician', defaultUnitPrice: 95 },
    { id: 'e2', category: 'Electrical', description: 'Circuit Breaker Replacement (Standard)', defaultUnitPrice: 45 },
    { id: 'e3', category: 'Electrical', description: 'Electrical Panel Upgrade (200 Amp)', defaultUnitPrice: 2200 },
    { id: 'e4', category: 'Electrical', description: 'GFCI Outlet Installation', defaultUnitPrice: 85 },
    { id: 'e5', category: 'Electrical', description: 'Lighting Fixture Installation (Basic)', defaultUnitPrice: 125 },
    
    // Plumbing
    { id: 'p1', category: 'Plumbing', description: 'Labor - Master Plumber', defaultUnitPrice: 95 },
    { id: 'p2', category: 'Plumbing', description: 'Drain Clearing - Main Line', defaultUnitPrice: 195 },
    { id: 'p3', category: 'Plumbing', description: 'Water Heater Replacement (50 Gal)', defaultUnitPrice: 1450 },
    { id: 'p4', category: 'Plumbing', description: 'Faucet Repair/Installation', defaultUnitPrice: 150 },
    { id: 'p5', category: 'Plumbing', description: 'Toilet Replacement (Standard)', defaultUnitPrice: 350 },
    
    // HVAC
    { id: 'h1', category: 'HVAC', description: 'Labor - HVAC Technician', defaultUnitPrice: 85 },
    { id: 'h2', category: 'HVAC', description: 'A/C Seasonal Tune-Up', defaultUnitPrice: 149 },
    { id: 'h3', category: 'HVAC', description: 'Furnace Inspection & Service', defaultUnitPrice: 125 },
    { id: 'h4', category: 'HVAC', description: 'Smart Thermostat Installation', defaultUnitPrice: 185 },
    { id: 'h5', category: 'HVAC', description: 'Refrigerant Recharge (per lb)', defaultUnitPrice: 95 },
    
    // Painting
    { id: 'pt1', category: 'Painting', description: 'Labor - Professional Painter', defaultUnitPrice: 55 },
    { id: 'pt2', category: 'Painting', description: 'Premium Paint (Gallon)', defaultUnitPrice: 65 },
    { id: 'pt3', category: 'Painting', description: 'Surface Prep & Drywall Patching', defaultUnitPrice: 120 },
    { id: 'pt4', category: 'Painting', description: 'Trim & Baseboard Painting (per room)', defaultUnitPrice: 150 },
    { id: 'pt5', category: 'Painting', description: 'Ceiling Painting (Standard Room)', defaultUnitPrice: 100 },
    
    // General
    { id: 'g1', category: 'General', description: 'Service Call Fee / Diagnostic', defaultUnitPrice: 95 },
    { id: 'g2', category: 'General', description: 'Emergency / After-Hours Fee', defaultUnitPrice: 185 },
    { id: 'g3', category: 'General', description: 'Disposal & Material Handling', defaultUnitPrice: 45 },
    { id: 'g4', category: 'General', description: 'Labor - Apprentice/Helper', defaultUnitPrice: 45 },
    { id: 'g5', category: 'General', description: 'Equipment Rental (Daily)', defaultUnitPrice: 150 }
  ];
};

export const saveCommonItems = (items: CommonItem[]) => {
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(items));
};
