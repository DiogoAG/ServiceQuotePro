
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
    { id: '3', name: 'John Smith', email: 'jsmith.construction@biz.com', phone: '555-9999', address: '789 Industrial Way, Metro City' }
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
    { id: 'i1', description: 'Labor - Master Technician', defaultUnitPrice: 95 },
    { id: 'i2', description: 'Labor - Assistant/Apprentice', defaultUnitPrice: 55 },
    { id: 'i3', description: 'Standard Service Call Fee', defaultUnitPrice: 125 },
    { id: 'i4', description: 'Emergency Call-Out Premium', defaultUnitPrice: 185 },
    { id: 'i5', description: 'Disposal & Environmental Fee', defaultUnitPrice: 45 },
    { id: 'i6', description: 'Basic Hardware/Fasteners Kit', defaultUnitPrice: 25 },
    { id: 'i7', description: 'Wall Prep & Patching', defaultUnitPrice: 85 },
    { id: 'i8', description: 'Safety Inspection Cert', defaultUnitPrice: 150 }
  ];
};

export const saveCommonItems = (items: CommonItem[]) => {
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(items));
};
