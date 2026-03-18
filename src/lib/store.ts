
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
    defaultTaxRate: 8.5,
    defaultLaborRate: 75,
    offeredServices: []
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
  const stored = localStorage.getItem(TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : [
    {
      id: 't-paint-1',
      name: 'Standard Living Room Refresh',
      serviceCategory: 'Painting',
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
      items: [
        { description: 'Handyman Labor (Minor Repairs)', unit: 'hr', quantity: 4, unitPrice: 75, total: 300 },
        { description: 'Small Parts & Fasteners Allowance', unit: 'flat', quantity: 1, unitPrice: 50, total: 50 }
      ],
      scopeDescription: 'Miscellaneous small repairs and maintenance tasks around the property. Includes labor for up to 4 hours and basic consumables.'
    }
  ];
};

export const saveTemplates = (templates: QuoteTemplate[]) => {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const getCommonItems = (): CommonItem[] => {
  if (typeof window === 'undefined') return [];
  
  const hardCodedItems: CommonItem[] = [
    // --- GENERAL CONTRACTING ---
    { id: 'gc_pm_1', category: 'General Contracting - Project Management', description: 'Project Management & Oversight', unit: 'flat', defaultUnitPrice: 1500, isHardCoded: true },
    { id: 'gc_pm_2', category: 'General Contracting - Project Management', description: 'Subcontractor Coordination', unit: 'flat', defaultUnitPrice: 750, isHardCoded: true },
    { id: 'gc_pm_3', category: 'General Contracting - Project Management', description: 'Quality Control Inspection', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    
    { id: 'gc_sw_1', category: 'General Contracting - Sitework', description: 'Site Preparation & Protection', unit: 'sq ft', defaultUnitPrice: 1.25, isHardCoded: true },
    { id: 'gc_sw_2', category: 'General Contracting - Sitework', description: 'Excavation Service', unit: 'hr', defaultUnitPrice: 175, isHardCoded: true },
    { id: 'gc_sw_3', category: 'General Contracting - Sitework', description: 'Demolition (Light)', unit: 'hr', defaultUnitPrice: 95, isHardCoded: true },
    
    { id: 'gc_sc_1', category: 'General Contracting - Structural Construction', description: 'Foundation / Footings', unit: 'cu yd', defaultUnitPrice: 450, isHardCoded: true },
    { id: 'gc_sc_2', category: 'General Contracting - Structural Construction', description: 'Structural Framing', unit: 'sq ft', defaultUnitPrice: 12, isHardCoded: true },
    { id: 'gc_sc_3', category: 'General Contracting - Structural Construction', description: 'Load-Bearing Wall Mod', unit: 'ea', defaultUnitPrice: 2500, isHardCoded: true },
    
    { id: 'gc_be_1', category: 'General Contracting - Building Envelope', description: 'Exterior Sheathing', unit: 'sq ft', defaultUnitPrice: 3.5, isHardCoded: true },
    { id: 'gc_be_2', category: 'General Contracting - Building Envelope', description: 'Insulation Installation', unit: 'sq ft', defaultUnitPrice: 1.85, isHardCoded: true },
    { id: 'gc_be_3', category: 'General Contracting - Building Envelope', description: 'Waterproofing Membrane', unit: 'sq ft', defaultUnitPrice: 4.25, isHardCoded: true },
    
    { id: 'gc_ic_1', category: 'General Contracting - Interior Construction', description: 'Drywall Hanging & Taping', unit: 'sq ft', defaultUnitPrice: 3.25, isHardCoded: true },
    { id: 'gc_ic_2', category: 'General Contracting - Interior Construction', description: 'Flooring Installation', unit: 'sq ft', defaultUnitPrice: 5.5, isHardCoded: true },
    { id: 'gc_ic_3', category: 'General Contracting - Interior Construction', description: 'Millwork / Finish Carpentry', unit: 'hr', defaultUnitPrice: 85, isHardCoded: true },
    
    { id: 'gc_re_1', category: 'General Contracting - Renovation & Expansion', description: 'Kitchen Remodel Base', unit: 'flat', defaultUnitPrice: 15000, isHardCoded: true },
    { id: 'gc_re_2', category: 'General Contracting - Renovation & Expansion', description: 'Bathroom Remodel Base', unit: 'flat', defaultUnitPrice: 8500, isHardCoded: true },
    { id: 'gc_re_3', category: 'General Contracting - Renovation & Expansion', description: 'Tenant Improvement Allowance', unit: 'sq ft', defaultUnitPrice: 45, isHardCoded: true },

    // --- ELECTRICAL ---
    { id: 'el_pd_1', category: 'Electrical - Power Distribution', description: 'Main Service Panel Install', unit: 'ea', defaultUnitPrice: 2800, isHardCoded: true },
    { id: 'el_pd_2', category: 'Electrical - Power Distribution', description: 'Subpanel Installation', unit: 'ea', defaultUnitPrice: 850, isHardCoded: true },
    { id: 'el_pd_3', category: 'Electrical - Power Distribution', description: 'Transformer Mounting', unit: 'ea', defaultUnitPrice: 1200, isHardCoded: true },
    
    { id: 'el_wd_1', category: 'Electrical - Wiring & Devices', description: 'Rough-In Wiring (per outlet)', unit: 'ea', defaultUnitPrice: 110, isHardCoded: true },
    { id: 'el_wd_2', category: 'Electrical - Wiring & Devices', description: 'Finish Device (Outlet/Switch)', unit: 'ea', defaultUnitPrice: 45, isHardCoded: true },
    { id: 'el_wd_3', category: 'Electrical - Wiring & Devices', description: 'Whole House Rewire', unit: 'sq ft', defaultUnitPrice: 8.5, isHardCoded: true },
    
    { id: 'el_ls_1', category: 'Electrical - Lighting Systems', description: 'Interior Recessed Light', unit: 'ea', defaultUnitPrice: 165, isHardCoded: true },
    { id: 'el_ls_2', category: 'Electrical - Lighting Systems', description: 'Exterior Flood Lighting', unit: 'ea', defaultUnitPrice: 225, isHardCoded: true },
    { id: 'el_ls_3', category: 'Electrical - Lighting Systems', description: 'Emergency Lighting Unit', unit: 'ea', defaultUnitPrice: 185, isHardCoded: true },
    
    { id: 'el_lv_1', category: 'Electrical - Low Voltage Systems', description: 'Data/Cat6 Cabling Drop', unit: 'ea', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'el_lv_2', category: 'Electrical - Low Voltage Systems', description: 'Security Camera Install', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'el_lv_3', category: 'Electrical - Low Voltage Systems', description: 'Fire Alarm Device Install', unit: 'ea', defaultUnitPrice: 195, isHardCoded: true },
    
    { id: 'el_ss_1', category: 'Electrical - Specialized Systems', description: 'Backup Generator Transfer Switch', unit: 'ea', defaultUnitPrice: 1250, isHardCoded: true },
    { id: 'el_ss_2', category: 'Electrical - Specialized Systems', description: 'EV Charging Station Level 2', unit: 'ea', defaultUnitPrice: 950, isHardCoded: true },
    { id: 'el_ss_3', category: 'Electrical - Specialized Systems', description: 'Solar PV Module Install', unit: 'ea', defaultUnitPrice: 450, isHardCoded: true },
    
    { id: 'el_ca_1', category: 'Electrical - Controls & Automation', description: 'Smart Home Hub / Controller', unit: 'ea', defaultUnitPrice: 350, isHardCoded: true },
    { id: 'el_ca_2', category: 'Electrical - Controls & Automation', description: 'Automated Lighting Zone', unit: 'zone', defaultUnitPrice: 550, isHardCoded: true },
    
    { id: 'el_mt_1', category: 'Electrical - Maintenance & Testing', description: 'Electrical Troubleshooting', unit: 'hr', defaultUnitPrice: 125, isHardCoded: true },
    { id: 'el_mt_2', category: 'Electrical - Maintenance & Testing', description: 'Full System Safety Inspection', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },

    // --- PLUMBING ---
    { id: 'pl_ws_1', category: 'Plumbing - Water Supply Systems', description: 'Main Water Line Installation', unit: 'linear ft', defaultUnitPrice: 45, isHardCoded: true },
    { id: 'pl_ws_2', category: 'Plumbing - Water Supply Systems', description: 'Whole House Repipe', unit: 'flat', defaultUnitPrice: 6500, isHardCoded: true },
    
    { id: 'pl_ds_1', category: 'Plumbing - Drainage Systems', description: 'DWV Stack Installation', unit: 'ea', defaultUnitPrice: 1200, isHardCoded: true },
    { id: 'pl_ds_2', category: 'Plumbing - Drainage Systems', description: 'Sewer Line Trenching', unit: 'linear ft', defaultUnitPrice: 65, isHardCoded: true },
    { id: 'pl_ds_3', category: 'Plumbing - Drainage Systems', description: 'Storm Drainage Basin', unit: 'ea', defaultUnitPrice: 850, isHardCoded: true },
    
    { id: 'pl_fa_1', category: 'Plumbing - Fixtures & Appliances', description: 'Toilet Install (New)', unit: 'ea', defaultUnitPrice: 350, isHardCoded: true },
    { id: 'pl_fa_2', category: 'Plumbing - Fixtures & Appliances', description: 'Faucet / Sink Install', unit: 'ea', defaultUnitPrice: 225, isHardCoded: true },
    { id: 'pl_fa_3', category: 'Plumbing - Fixtures & Appliances', description: 'Shower Valve Replacement', unit: 'ea', defaultUnitPrice: 450, isHardCoded: true },
    
    { id: 'pl_wh_1', category: 'Plumbing - Water Heating', description: 'Standard Tank Water Heater', unit: 'ea', defaultUnitPrice: 1600, isHardCoded: true },
    { id: 'pl_wh_2', category: 'Plumbing - Water Heating', description: 'Tankless Water Heater', unit: 'ea', defaultUnitPrice: 3200, isHardCoded: true },
    { id: 'pl_wh_3', category: 'Plumbing - Water Heating', description: 'Boiler System Install', unit: 'ea', defaultUnitPrice: 8500, isHardCoded: true },
    
    { id: 'pl_gs_1', category: 'Plumbing - Gas Systems', description: 'Gas Piping Installation', unit: 'linear ft', defaultUnitPrice: 25, isHardCoded: true },
    { id: 'pl_gs_2', category: 'Plumbing - Gas Systems', description: 'Gas Range / Appliance Hookup', unit: 'ea', defaultUnitPrice: 175, isHardCoded: true },
    
    { id: 'pl_spec_1', category: 'Plumbing - Specialty Systems', description: 'Backflow Preventer Device', unit: 'ea', defaultUnitPrice: 650, isHardCoded: true },
    { id: 'pl_spec_2', category: 'Plumbing - Specialty Systems', description: 'Water Filtration System', unit: 'ea', defaultUnitPrice: 1200, isHardCoded: true },
    { id: 'pl_spec_3', category: 'Plumbing - Specialty Systems', description: 'Sump Pump Installation', unit: 'ea', defaultUnitPrice: 550, isHardCoded: true },
    
    { id: 'pl_mr_1', category: 'Plumbing - Maintenance & Repair', description: 'Leak Detection & Repair', unit: 'hr', defaultUnitPrice: 135, isHardCoded: true },
    { id: 'pl_mr_2', category: 'Plumbing - Maintenance & Repair', description: 'Drain Cleaning (Auger)', unit: 'ea', defaultUnitPrice: 225, isHardCoded: true },

    // --- HVAC ---
    { id: 'hv_hs_1', category: 'HVAC - Heating Systems', description: 'Gas Furnace Installation', unit: 'ea', defaultUnitPrice: 4500, isHardCoded: true },
    { id: 'hv_hs_2', category: 'HVAC - Heating Systems', description: 'Heat Pump System (Split)', unit: 'ea', defaultUnitPrice: 7500, isHardCoded: true },
    
    { id: 'hv_cs_1', category: 'HVAC - Cooling Systems', description: 'AC Condenser Unit Install', unit: 'ea', defaultUnitPrice: 4200, isHardCoded: true },
    { id: 'hv_cs_2', category: 'HVAC - Cooling Systems', description: 'Chiller Plant Service', unit: 'hr', defaultUnitPrice: 185, isHardCoded: true },
    
    { id: 'hv_ad_1', category: 'HVAC - Air Distribution', description: 'Ductwork Fabrication / Install', unit: 'linear ft', defaultUnitPrice: 35, isHardCoded: true },
    { id: 'hv_ad_2', category: 'HVAC - Air Distribution', description: 'VAV Box Installation', unit: 'ea', defaultUnitPrice: 950, isHardCoded: true },
    { id: 'hv_ad_3', category: 'HVAC - Air Distribution', description: 'Ventilation Fan Install', unit: 'ea', defaultUnitPrice: 350, isHardCoded: true },
    
    { id: 'hv_ct_1', category: 'HVAC - Controls', description: 'Smart Thermostat Install', unit: 'ea', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'hv_ct_2', category: 'HVAC - Controls', description: 'Zoning Control System', unit: 'zone', defaultUnitPrice: 850, isHardCoded: true },
    
    { id: 'hv_ia_1', category: 'HVAC - Indoor Air Quality', description: 'HEPA Air Filtration System', unit: 'ea', defaultUnitPrice: 1200, isHardCoded: true },
    { id: 'hv_ia_2', category: 'HVAC - Indoor Air Quality', description: 'Whole House Humidifier', unit: 'ea', defaultUnitPrice: 650, isHardCoded: true },
    
    { id: 'hv_ms_1', category: 'HVAC - Maintenance & Service', description: 'Annual System Diagnostic', unit: 'ea', defaultUnitPrice: 185, isHardCoded: true },
    { id: 'hv_ms_2', category: 'HVAC - Maintenance & Service', description: 'Refrigerant Recharging', unit: 'lb', defaultUnitPrice: 95, isHardCoded: true },

    // --- LANDSCAPING ---
    { id: 'ls_sd_1', category: 'Landscaping - Site Development', description: 'Final Grading & Soil Prep', unit: 'sq ft', defaultUnitPrice: 1.5, isHardCoded: true },
    { id: 'ls_sd_2', category: 'Landscaping - Site Development', description: 'French Drain Installation', unit: 'linear ft', defaultUnitPrice: 25, isHardCoded: true },
    
    { id: 'ls_ss_1', category: 'Landscaping - Softscape', description: 'Premium Sod Installation', unit: 'sq ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'ls_ss_2', category: 'Landscaping - Softscape', description: 'Tree Planting (Up to 15gal)', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'ls_ss_3', category: 'Landscaping - Softscape', description: 'Shrub / Perennial Planting', unit: 'ea', defaultUnitPrice: 45, isHardCoded: true },
    
    { id: 'ls_hs_1', category: 'Landscaping - Hardscape', description: 'Paver Patio Construction', unit: 'sq ft', defaultUnitPrice: 28, isHardCoded: true },
    { id: 'ls_hs_2', category: 'Landscaping - Hardscape', description: 'Stone Retaining Wall', unit: 'sq ft', defaultUnitPrice: 55, isHardCoded: true },
    { id: 'ls_hs_3', category: 'Landscaping - Hardscape', description: 'Flagstone Walkway', unit: 'sq ft', defaultUnitPrice: 32, isHardCoded: true },
    
    { id: 'ls_ir_1', category: 'Landscaping - Irrigation', description: 'Sprinkler System Zone (New)', unit: 'zone', defaultUnitPrice: 850, isHardCoded: true },
    { id: 'ls_ir_2', category: 'Landscaping - Irrigation', description: 'Drip Irrigation Line', unit: 'linear ft', defaultUnitPrice: 4.5, isHardCoded: true },
    
    { id: 'ls_of_1', category: 'Landscaping - Outdoor Features', description: 'Landscape Lighting (per fixture)', unit: 'ea', defaultUnitPrice: 185, isHardCoded: true },
    { id: 'ls_of_2', category: 'Landscaping - Outdoor Features', description: 'Custom Fire Pit (Gas)', unit: 'ea', defaultUnitPrice: 2500, isHardCoded: true },
    
    { id: 'ls_mn_1', category: 'Landscaping - Maintenance', description: 'Lawn Maintenance Visit', unit: 'visit', defaultUnitPrice: 75, isHardCoded: true },
    { id: 'ls_mn_2', category: 'Landscaping - Maintenance', description: 'Seasonal Pruning & Cleanup', unit: 'hr', defaultUnitPrice: 65, isHardCoded: true },

    // --- ROOFING ---
    { id: 'rf_rs_1', category: 'Roofing - Roof Systems', description: 'Asphalt Shingle Roof (New)', unit: 'sq', defaultUnitPrice: 650, isHardCoded: true },
    { id: 'rf_rs_2', category: 'Roofing - Roof Systems', description: 'Standing Seam Metal Roof', unit: 'sq', defaultUnitPrice: 1200, isHardCoded: true },
    { id: 'rf_rs_3', category: 'Roofing - Roof Systems', description: 'Flat Membrane (TPO) Roof', unit: 'sq', defaultUnitPrice: 850, isHardCoded: true },
    
    { id: 'rf_cp_1', category: 'Roofing - Components', description: 'Flashing Replacement', unit: 'linear ft', defaultUnitPrice: 12, isHardCoded: true },
    { id: 'rf_cp_2', category: 'Roofing - Components', description: 'Ridge Vent Installation', unit: 'linear ft', defaultUnitPrice: 18, isHardCoded: true },
    
    { id: 'rf_dr_1', category: 'Roofing - Drainage', description: 'Seamless Gutter Install', unit: 'linear ft', defaultUnitPrice: 14, isHardCoded: true },
    { id: 'rf_dr_2', category: 'Roofing - Drainage', description: 'Downspout Extension', unit: 'ea', defaultUnitPrice: 45, isHardCoded: true },
    
    { id: 'rf_ir_1', category: 'Roofing - Installation & Replacement', description: 'Full Roof Tear-Off Fee', unit: 'sq', defaultUnitPrice: 150, isHardCoded: true },
    
    { id: 'rf_rm_1', category: 'Roofing - Repair & Maintenance', description: 'Roof Leak Repair (Minor)', unit: 'ea', defaultUnitPrice: 450, isHardCoded: true },
    { id: 'rf_rm_2', category: 'Roofing - Repair & Maintenance', description: 'Storm Damage Assessment', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    
    { id: 'rf_is_1', category: 'Roofing - Inspection', description: 'Professional Roof Inspection', unit: 'ea', defaultUnitPrice: 175, isHardCoded: true },

    // --- CARPENTRY ---
    { id: 'cp_rc_1', category: 'Carpentry - Rough Carpentry', description: 'Wall Framing (Standard)', unit: 'linear ft', defaultUnitPrice: 35, isHardCoded: true },
    { id: 'cp_rc_2', category: 'Carpentry - Rough Carpentry', description: 'Floor Joist Installation', unit: 'sq ft', defaultUnitPrice: 6.5, isHardCoded: true },
    
    { id: 'cp_fc_1', category: 'Carpentry - Finish Carpentry', description: 'Crown Molding Install', unit: 'linear ft', defaultUnitPrice: 12, isHardCoded: true },
    { id: 'cp_fc_2', category: 'Carpentry - Finish Carpentry', description: 'Baseboard / Trim Install', unit: 'linear ft', defaultUnitPrice: 4.5, isHardCoded: true },
    
    { id: 'cp_dw_1', category: 'Carpentry - Doors & Windows', description: 'Interior Door Install', unit: 'ea', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'cp_dw_2', category: 'Carpentry - Doors & Windows', description: 'Window Installation (Standard)', unit: 'ea', defaultUnitPrice: 350, isHardCoded: true },
    
    { id: 'cp_cm_1', category: 'Carpentry - Cabinets & Millwork', description: 'Kitchen Cabinet Install', unit: 'cabinet', defaultUnitPrice: 225, isHardCoded: true },
    { id: 'cp_cm_2', category: 'Carpentry - Cabinets & Millwork', description: 'Custom Built-In Unit', unit: 'flat', defaultUnitPrice: 2500, isHardCoded: true },
    
    { id: 'cp_fl_1', category: 'Carpentry - Flooring', description: 'Hardwood Floor Installation', unit: 'sq ft', defaultUnitPrice: 8.5, isHardCoded: true },
    
    { id: 'cp_ec_1', category: 'Carpentry - Exterior Carpentry', description: 'Composite Decking Install', unit: 'sq ft', defaultUnitPrice: 45, isHardCoded: true },
    { id: 'cp_ec_2', category: 'Carpentry - Exterior Carpentry', description: 'Pergola Construction', unit: 'flat', defaultUnitPrice: 3500, isHardCoded: true },
    
    { id: 'cp_rp_1', category: 'Carpentry - Repair', description: 'Siding / Trim Wood Repair', unit: 'hr', defaultUnitPrice: 85, isHardCoded: true },

    // --- CLEANING ---
    { id: 'cl_gc_1', category: 'Cleaning - General Cleaning', description: 'Standard Residential Cleaning', unit: 'hr', defaultUnitPrice: 55, isHardCoded: true },
    { id: 'cl_gc_2', category: 'Cleaning - General Cleaning', description: 'Commercial Janitorial Visit', unit: 'visit', defaultUnitPrice: 150, isHardCoded: true },
    
    { id: 'cl_dc_1', category: 'Cleaning - Deep Cleaning', description: 'Move-In / Move-Out Deep Clean', unit: 'sq ft', defaultUnitPrice: 0.45, isHardCoded: true },
    { id: 'cl_dc_2', category: 'Cleaning - Deep Cleaning', description: 'Post-Construction Cleanup', unit: 'sq ft', defaultUnitPrice: 0.85, isHardCoded: true },
    
    { id: 'cl_fc_1', category: 'Cleaning - Floor Care', description: 'Carpet Steam Cleaning', unit: 'room', defaultUnitPrice: 85, isHardCoded: true },
    { id: 'cl_fc_2', category: 'Cleaning - Floor Care', description: 'Tile & Grout Scrubbing', unit: 'sq ft', defaultUnitPrice: 1.25, isHardCoded: true },
    
    { id: 'cl_sc_1', category: 'Cleaning - Surface Cleaning', description: 'Professional Window Cleaning', unit: 'window', defaultUnitPrice: 15, isHardCoded: true },
    { id: 'cl_sc_2', category: 'Cleaning - Surface Cleaning', description: 'Upholstery Steam Clean', unit: 'ea', defaultUnitPrice: 125, isHardCoded: true },
    
    { id: 'cl_ec_1', category: 'Cleaning - Exterior Cleaning', description: 'Power Washing (Siding)', unit: 'sq ft', defaultUnitPrice: 0.45, isHardCoded: true },
    
    { id: 'cl_sn_1', category: 'Cleaning - Sanitation', description: 'Professional Disinfection', unit: 'sq ft', defaultUnitPrice: 0.25, isHardCoded: true },
    
    { id: 'cl_ws_1', category: 'Cleaning - Waste Services', description: 'Debris Removal & Disposal', unit: 'load', defaultUnitPrice: 350, isHardCoded: true },

    // --- PAINTING ---
    { id: 'ip1', category: 'Painting - Interior Painting', description: 'Interior Wall Painting', unit: 'sq ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'ip2', category: 'Painting - Interior Painting', description: 'Ceiling Painting', unit: 'sq ft', defaultUnitPrice: 2.0, isHardCoded: true },
    { id: 'ip3', category: 'Painting - Interior Painting', description: 'Accent Wall Painting', unit: 'wall', defaultUnitPrice: 350, isHardCoded: true },
    { id: 'ip4', category: 'Painting - Interior Painting', description: 'Trim Painting', unit: 'linear ft', defaultUnitPrice: 1.5, isHardCoded: true },
    { id: 'ip5', category: 'Painting - Interior Painting', description: 'Baseboard Painting', unit: 'linear ft', defaultUnitPrice: 1.25, isHardCoded: true },
    { id: 'ip6', category: 'Painting - Interior Painting', description: 'Crown Molding Painting', unit: 'linear ft', defaultUnitPrice: 1.75, isHardCoded: true },
    { id: 'ip7', category: 'Painting - Interior Painting', description: 'Door Painting (Interior)', unit: 'door', defaultUnitPrice: 125, isHardCoded: true },
    { id: 'ip8', category: 'Painting - Interior Painting', description: 'Door Frame Painting', unit: 'frame', defaultUnitPrice: 75, isHardCoded: true },
    { id: 'ip9', category: 'Painting - Interior Painting', description: 'Window Frame Painting', unit: 'window', defaultUnitPrice: 85, isHardCoded: true },
    { id: 'ip10', category: 'Painting - Interior Painting', description: 'Closet Painting', unit: 'closet', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'ip11', category: 'Painting - Interior Painting', description: 'Staircase / Railing Painting', unit: 'set', defaultUnitPrice: 450, isHardCoded: true },

    { id: 'ep1', category: 'Painting - Exterior Painting', description: 'Exterior Wall Painting', unit: 'sq ft', defaultUnitPrice: 3.5, isHardCoded: true },
    { id: 'ep2', category: 'Painting - Exterior Painting', description: 'Stucco Painting', unit: 'sq ft', defaultUnitPrice: 3.75, isHardCoded: true },
    { id: 'ep3', category: 'Painting - Exterior Painting', description: 'Brick Painting', unit: 'sq ft', defaultUnitPrice: 4.25, isHardCoded: true },
    { id: 'ep4', category: 'Painting - Exterior Painting', description: 'Trim / Fascia Painting', unit: 'linear ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'ep5', category: 'Painting - Exterior Painting', description: 'Garage Door Painting', unit: 'door', defaultUnitPrice: 450, isHardCoded: true },
    { id: 'ep6', category: 'Painting - Exterior Painting', description: 'Front Door Painting', unit: 'door', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'ep7', category: 'Painting - Exterior Painting', description: 'Window Frame Painting (Exterior)', unit: 'window', defaultUnitPrice: 95, isHardCoded: true },
    { id: 'ep8', category: 'Painting - Exterior Painting', description: 'Shutter Painting', unit: 'shutter', defaultUnitPrice: 85, isHardCoded: true },
    { id: 'ep9', category: 'Painting - Exterior Painting', description: 'Deck Painting', unit: 'sq ft', defaultUnitPrice: 4.5, isHardCoded: true },
    { id: 'ep10', category: 'Painting - Exterior Painting', description: 'Fence Painting', unit: 'linear ft', defaultUnitPrice: 5.5, isHardCoded: true },

    { id: 'sp1', category: 'Painting - Surface Preparation', description: 'Pressure Washing', unit: 'sq ft', defaultUnitPrice: 0.35, isHardCoded: true },
    { id: 'sp2', category: 'Painting - Surface Preparation', description: 'Paint Scraping', unit: 'sq ft', defaultUnitPrice: 1.5, isHardCoded: true },
    { id: 'sp3', category: 'Painting - Surface Preparation', description: 'Sanding', unit: 'sq ft', defaultUnitPrice: 0.85, isHardCoded: true },
    { id: 'sp4', category: 'Painting - Surface Preparation', description: 'Caulking / Sealing', unit: 'linear ft', defaultUnitPrice: 0.85, isHardCoded: true },
    { id: 'sp5', category: 'Painting - Surface Preparation', description: 'Crack / Hole Patching', unit: 'patch', defaultUnitPrice: 75, isHardCoded: true },
    { id: 'sp6', category: 'Painting - Surface Preparation', description: 'Drywall Repair', unit: 'repair', defaultUnitPrice: 150, isHardCoded: true },
    { id: 'sp7', category: 'Painting - Surface Preparation', description: 'Priming Surfaces', unit: 'sq ft', defaultUnitPrice: 0.5, isHardCoded: true },

    { id: 'sps1', category: 'Painting - Specialty Painting Services', description: 'Cabinet Painting', unit: 'cabinet', defaultUnitPrice: 250, isHardCoded: true },
    { id: 'sps2', category: 'Painting - Specialty Painting Services', description: 'Cabinet Refinishing', unit: 'cabinet', defaultUnitPrice: 350, isHardCoded: true },
    { id: 'sps3', category: 'Painting - Specialty Painting Services', description: 'Wood Staining', unit: 'sq ft', defaultUnitPrice: 4.5, isHardCoded: true },
    { id: 'sps4', category: 'Painting - Specialty Painting Services', description: 'Deck Staining', unit: 'sq ft', defaultUnitPrice: 5.5, isHardCoded: true },
    { id: 'sps5', category: 'Painting - Specialty Painting Services', description: 'Fence Staining', unit: 'sq ft', defaultUnitPrice: 5.0, isHardCoded: true },
    { id: 'sps6', category: 'Painting - Specialty Painting Services', description: 'Varnish / Polyurethane Finish', unit: 'sq ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'sps7', category: 'Painting - Specialty Painting Services', description: 'Epoxy Garage Floor Coating', unit: 'sq ft', defaultUnitPrice: 7.5, isHardCoded: true },
    { id: 'sps8', category: 'Painting - Specialty Painting Services', description: 'Waterproof Coating', unit: 'sq ft', defaultUnitPrice: 3.5, isHardCoded: true },

    { id: 'as1', category: 'Painting - Additional Services', description: 'Wallpaper Removal', unit: 'sq ft', defaultUnitPrice: 2.5, isHardCoded: true },
    { id: 'as2', category: 'Painting - Additional Services', description: 'Popcorn Ceiling Removal', unit: 'sq ft', defaultUnitPrice: 3.5, isHardCoded: true },
    { id: 'as3', category: 'Painting - Additional Services', description: 'Texture Application', unit: 'sq ft', defaultUnitPrice: 1.5, isHardCoded: true },
    { id: 'as4', category: 'Painting - Additional Services', description: 'Touch-Up Painting', unit: 'hr', defaultUnitPrice: 85, isHardCoded: true },

    // --- OTHER ---
    { id: 'ot1', category: 'Other', description: 'General Handyman Labor', unit: 'hr', defaultUnitPrice: 75, isHardCoded: true },
    { id: 'ot2', category: 'Other', description: 'Furniture Assembly', unit: 'hr', defaultUnitPrice: 65, isHardCoded: true }
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
  localStorage.setItem(COMMON_ITEMS_KEY, JSON.stringify(items));
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
