
import { Client, Quote, QuoteItem, BusinessProfile, QuoteTemplate, CommonItem } from './types';

const DRAFT_QUOTE_KEY = 'service_quote_pro_draft_quote';

// Hardcoded base library items - these are ALWAYS available to all users
export const getHardcodedItems = (): CommonItem[] => [
  // --- PLUMBING ---
  { id: 'h-pl-1', category: 'Plumbing - Water Supply Systems', description: 'Main Water Line Installation', unit: 'ea', defaultUnitPrice: 2500.00, isHardCoded: true },
  { id: 'h-pl-2', category: 'Plumbing - Water Supply Systems', description: 'Whole House Repipe', unit: 'ea', defaultUnitPrice: 8500.00, isHardCoded: true },
  { id: 'h-pl-3', category: 'Plumbing - Drainage Systems', description: 'DWV Stack Installation', unit: 'ea', defaultUnitPrice: 1200.00, isHardCoded: true },
  { id: 'h-pl-4', category: 'Plumbing - Drainage Systems', description: 'Sewer Line Trenching', unit: 'linear ft', defaultUnitPrice: 85.00, isHardCoded: true },
  { id: 'h-pl-20', category: 'Plumbing - Drainage Systems', description: 'Drain Cleaning (Auger)', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },
  { id: 'h-pl-5', category: 'Plumbing - Drainage Systems', description: 'Storm Drainage Basin', unit: 'ea', defaultUnitPrice: 950.00, isHardCoded: true },
  { id: 'h-pl-6', category: 'Plumbing - Fixtures & Appliances', description: 'Toilet Installation (New)', unit: 'ea', defaultUnitPrice: 350.00, isHardCoded: true },
  { id: 'h-pl-7', category: 'Plumbing - Fixtures & Appliances', description: 'Faucet / Sink Installation', unit: 'ea', defaultUnitPrice: 225.00, isHardCoded: true },
  { id: 'h-pl-8', category: 'Plumbing - Fixtures & Appliances', description: 'Shower Valve Replacement', unit: 'ea', defaultUnitPrice: 450.00, isHardCoded: true },
  { id: 'h-pl-21', category: 'Plumbing - Water Heating', description: 'Standard Tank Water Heater', unit: 'ea', defaultUnitPrice: 1450.00, isHardCoded: true },
  { id: 'h-pl-22', category: 'Plumbing - Water Heating', description: 'Tankless Water Heater', unit: 'ea', defaultUnitPrice: 3200.00, isHardCoded: true },
  { id: 'h-pl-9', category: 'Plumbing - Water Heating', description: 'Boiler System Installation', unit: 'ea', defaultUnitPrice: 6500.00, isHardCoded: true },
  { id: 'h-pl-10', category: 'Plumbing - Gas Systems', description: 'Gas Piping Installation', unit: 'linear ft', defaultUnitPrice: 45.00, isHardCoded: true },
  { id: 'h-pl-11', category: 'Plumbing - Gas Systems', description: 'Gas Range / Appliance Hookup', unit: 'ea', defaultUnitPrice: 150.00, isHardCoded: true },
  { id: 'h-pl-12', category: 'Plumbing - Specialty Systems', description: 'Backflow Preventer Device', unit: 'ea', defaultUnitPrice: 550.00, isHardCoded: true },
  { id: 'h-pl-13', category: 'Plumbing - Specialty Systems', description: 'Water Filtration System', unit: 'ea', defaultUnitPrice: 1200.00, isHardCoded: true },
  { id: 'h-pl-14', category: 'Plumbing - Specialty Systems', description: 'Sump Pump Installation', unit: 'ea', defaultUnitPrice: 850.00, isHardCoded: true },
  { id: 'h-pl-15', category: 'Plumbing - Maintenance & Repair', description: 'Plumbing Maintenance & Repair', unit: 'hr', defaultUnitPrice: 95.00, isHardCoded: true },
  { id: 'h-pl-23', category: 'Plumbing - Maintenance & Repair', description: 'Leak Detection & Repair', unit: 'hr', defaultUnitPrice: 125.00, isHardCoded: true },

  // --- GENERAL CONTRACTING ---
  { id: 'h-gc-1', category: 'General Contracting - Project Management', description: 'Project Management & Oversight', unit: 'hr', defaultUnitPrice: 125.00, isHardCoded: true },
  { id: 'h-gc-2', category: 'General Contracting - Project Management', description: 'Subcontractor Coordination', unit: 'hr', defaultUnitPrice: 95.00, isHardCoded: true },
  { id: 'h-gc-3', category: 'General Contracting - Project Management', description: 'Quality Control Inspection', unit: 'ea', defaultUnitPrice: 150.00, isHardCoded: true },
  { id: 'h-gc-4', category: 'General Contracting - Sitework', description: 'Site Preparation & Protection', unit: 'flat', defaultUnitPrice: 500.00, isHardCoded: true },
  { id: 'h-gc-5', category: 'General Contracting - Sitework', description: 'Excavation Service', unit: 'hr', defaultUnitPrice: 175.00, isHardCoded: true },
  { id: 'h-gc-6', category: 'General Contracting - Sitework', description: 'Light Demolition', unit: 'hr', defaultUnitPrice: 85.00, isHardCoded: true },
  { id: 'h-gc-7', category: 'General Contracting - Structural Construction', description: 'Foundation / Footings', unit: 'cu yd', defaultUnitPrice: 450.00, isHardCoded: true },
  { id: 'h-gc-8', category: 'General Contracting - Structural Construction', description: 'Structural Framing', unit: 'sq ft', defaultUnitPrice: 12.00, isHardCoded: true },
  { id: 'h-gc-20', category: 'General Contracting - Structural Construction', description: 'Load-Bearing Wall Mod', unit: 'ea', defaultUnitPrice: 2500.00, isHardCoded: true },
  { id: 'h-gc-21', category: 'General Contracting - Structural Construction', description: 'Exterior Sheathing', unit: 'sq ft', defaultUnitPrice: 4.50, isHardCoded: true },
  { id: 'h-gc-9', category: 'General Contracting - Building Envelope', description: 'Insulation Installation', unit: 'sq ft', defaultUnitPrice: 2.25, isHardCoded: true },
  { id: 'h-gc-10', category: 'General Contracting - Building Envelope', description: 'Waterproofing Membrane', unit: 'sq ft', defaultUnitPrice: 4.50, isHardCoded: true },
  { id: 'h-gc-11', category: 'General Contracting - Interior Construction', description: 'Drywall Hanging & Taping', unit: 'sq ft', defaultUnitPrice: 3.25, isHardCoded: true },
  { id: 'h-gc-12', category: 'General Contracting - Interior Construction', description: 'Flooring Installation', unit: 'sq ft', defaultUnitPrice: 5.50, isHardCoded: true },
  { id: 'h-gc-13', category: 'General Contracting - Interior Construction', description: 'Millwork / Finish Carpentry', unit: 'hr', defaultUnitPrice: 85.00, isHardCoded: true },
  { id: 'h-gc-14', category: 'General Contracting - Renovation & Expansion', description: 'Kitchen Remodel Base', unit: 'ea', defaultUnitPrice: 15000.00, isHardCoded: true },
  { id: 'h-gc-15', category: 'General Contracting - Renovation & Expansion', description: 'Bathroom Remodel Base', unit: 'ea', defaultUnitPrice: 8500.00, isHardCoded: true },
  { id: 'h-gc-16', category: 'General Contracting - Renovation & Expansion', description: 'Tenant Improvement Allowance', unit: 'sq ft', defaultUnitPrice: 45.00, isHardCoded: true },

  // --- ELECTRICAL ---
  { id: 'h-el-1', category: 'Electrical - Power Distribution', description: 'Main Service Panel Installation', unit: 'ea', defaultUnitPrice: 2800.00, isHardCoded: true },
  { id: 'h-el-2', category: 'Electrical - Power Distribution', description: 'Subpanel Installation', unit: 'ea', defaultUnitPrice: 1200.00, isHardCoded: true },
  { id: 'h-el-3', category: 'Electrical - Power Distribution', description: 'Transformer Mounting', unit: 'ea', defaultUnitPrice: 1500.00, isHardCoded: true },
  { id: 'h-el-4', category: 'Electrical - Wiring & Devices', description: 'Rough-In Wiring (per outlet)', unit: 'ea', defaultUnitPrice: 125.00, isHardCoded: true },
  { id: 'h-el-5', category: 'Electrical - Wiring & Devices', description: 'Finish Device (Outlet/Switch)', unit: 'ea', defaultUnitPrice: 45.00, isHardCoded: true },
  { id: 'h-el-6', category: 'Electrical - Wiring & Devices', description: 'Whole House Rewire', unit: 'ea', defaultUnitPrice: 12000.00, isHardCoded: true },
  { id: 'h-el-7', category: 'Electrical - Lighting Systems', description: 'Interior Recessed Lighting', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },
  { id: 'h-el-8', category: 'Electrical - Lighting Systems', description: 'Exterior Flood Lighting', unit: 'ea', defaultUnitPrice: 225.00, isHardCoded: true },
  { id: 'h-el-9', category: 'Electrical - Lighting Systems', description: 'Emergency Lighting Unit', unit: 'ea', defaultUnitPrice: 150.00, isHardCoded: true },
  { id: 'h-el-10', category: 'Electrical - Low Voltage Systems', description: 'Data / Cat6 Cabling Drop', unit: 'ea', defaultUnitPrice: 175.00, isHardCoded: true },
  { id: 'h-el-11', category: 'Electrical - Low Voltage Systems', description: 'Security Camera Installation', unit: 'ea', defaultUnitPrice: 350.00, isHardCoded: true },
  { id: 'h-el-12', category: 'Electrical - Low Voltage Systems', description: 'Fire Alarm Device Installation', unit: 'ea', defaultUnitPrice: 250.00, isHardCoded: true },
  { id: 'h-el-13', category: 'Electrical - Specialized Systems', description: 'Backup Generator Transfer Switch', unit: 'ea', defaultUnitPrice: 1200.00, isHardCoded: true },
  { id: 'h-el-14', category: 'Electrical - Specialized Systems', description: 'EV Charging Station Level 2', unit: 'ea', defaultUnitPrice: 950.00, isHardCoded: true },
  { id: 'h-el-15', category: 'Electrical - Specialized Systems', description: 'Solar PV Module Installation', unit: 'ea', defaultUnitPrice: 850.00, isHardCoded: true },
  { id: 'h-el-16', category: 'Electrical - Controls & Automation', description: 'Smart Home Hub / Controller', unit: 'ea', defaultUnitPrice: 450.00, isHardCoded: true },
  { id: 'h-el-17', category: 'Electrical - Controls & Automation', description: 'Automated Lighting Zone', unit: 'ea', defaultUnitPrice: 650.00, isHardCoded: true },
  { id: 'h-el-18', category: 'Electrical - Maintenance & Testing', description: 'Electrical Troubleshooting', unit: 'hr', defaultUnitPrice: 110.00, isHardCoded: true },
  { id: 'h-el-19', category: 'Electrical - Maintenance & Testing', description: 'Full System Safety Inspection', unit: 'ea', defaultUnitPrice: 250.00, isHardCoded: true },

  // --- HVAC ---
  { id: 'h-hv-1', category: 'HVAC - Cooling Systems', description: 'AC Condenser Unit Installation', unit: 'ea', defaultUnitPrice: 4200.00, isHardCoded: true },
  { id: 'h-hv-2', category: 'HVAC - Cooling Systems', description: 'Chiller Plant Service', unit: 'hr', defaultUnitPrice: 185.00, isHardCoded: true },
  { id: 'h-hv-3', category: 'HVAC - Air Distribution', description: 'Ductwork Fabrication & Installation', unit: 'linear ft', defaultUnitPrice: 45.00, isHardCoded: true },
  { id: 'h-hv-4', category: 'HVAC - Air Distribution', description: 'VAV Box Installation', unit: 'ea', defaultUnitPrice: 950.00, isHardCoded: true },
  { id: 'h-hv-5', category: 'HVAC - Air Distribution', description: 'Ventilation Fan Installation', unit: 'ea', defaultUnitPrice: 350.00, isHardCoded: true },
  { id: 'h-hv-20', category: 'HVAC - Heating Systems', description: 'Gas Furnace Installation', unit: 'ea', defaultUnitPrice: 4500.00, isHardCoded: true },
  { id: 'h-hv-21', category: 'HVAC - Heating Systems', description: 'Heat Pump System (Split)', unit: 'ea', defaultUnitPrice: 7500.00, isHardCoded: true },
  { id: 'h-hv-6', category: 'HVAC - Controls', description: 'Smart Thermostat Installation', unit: 'ea', defaultUnitPrice: 150.00, isHardCoded: true },
  { id: 'h-hv-7', category: 'HVAC - Controls', description: 'Zoning Control System', unit: 'zone', defaultUnitPrice: 850.00, isHardCoded: true },
  { id: 'h-hv-8', category: 'HVAC - Indoor Air Quality', description: 'HEPA Air Filtration System', unit: 'ea', defaultUnitPrice: 1200.00, isHardCoded: true },
  { id: 'h-hv-9', category: 'HVAC - Indoor Air Quality', description: 'Whole House Humidifier', unit: 'ea', defaultUnitPrice: 650.00, isHardCoded: true },
  { id: 'h-hv-10', category: 'HVAC - Maintenance & Service', description: 'Annual System Diagnostic', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },
  { id: 'h-hv-11', category: 'HVAC - Maintenance & Service', description: 'Refrigerant Recharging', unit: 'lb', defaultUnitPrice: 95.00, isHardCoded: true },

  // --- LANDSCAPING ---
  { id: 'h-la-1', category: 'Landscaping - Site Development', description: 'Final Grading & Soil Preparation', unit: 'sq ft', defaultUnitPrice: 1.50, isHardCoded: true },
  { id: 'h-la-2', category: 'Landscaping - Site Development', description: 'French Drain Installation', unit: 'linear ft', defaultUnitPrice: 35.00, isHardCoded: true },
  { id: 'h-la-3', category: 'Landscaping - Softscape', description: 'Premium Sod Installation', unit: 'sq ft', defaultUnitPrice: 2.25, isHardCoded: true },
  { id: 'h-la-4', category: 'Landscaping - Softscape', description: 'Tree Planting (Up to 15gal)', unit: 'ea', defaultUnitPrice: 350.00, isHardCoded: true },
  { id: 'h-la-5', category: 'Landscaping - Softscape', description: 'Shrub / Perennial Planting', unit: 'ea', defaultUnitPrice: 65.00, isHardCoded: true },
  { id: 'h-la-6', category: 'Landscaping - Hardscape', description: 'Paver Patio Construction', unit: 'sq ft', defaultUnitPrice: 25.00, isHardCoded: true },
  { id: 'h-la-7', category: 'Landscaping - Hardscape', description: 'Stone Retaining Wall', unit: 'sq ft', defaultUnitPrice: 45.00, isHardCoded: true },
  { id: 'h-la-8', category: 'Landscaping - Hardscape', description: 'Flagstone Walkway', unit: 'sq ft', defaultUnitPrice: 32.00, isHardCoded: true },
  { id: 'h-la-20', category: 'Landscaping - Outdoor Features', description: 'Landscape Lighting (per fixture)', unit: 'ea', defaultUnitPrice: 150.00, isHardCoded: true },
  { id: 'h-la-9', category: 'Landscaping - Outdoor Features', description: 'Custom Fire Pit (Gas)', unit: 'ea', defaultUnitPrice: 3500.00, isHardCoded: true },
  { id: 'h-la-10', category: 'Landscaping - Irrigation', description: 'Sprinkler System Zone (New)', unit: 'zone', defaultUnitPrice: 850.00, isHardCoded: true },
  { id: 'h-la-11', category: 'Landscaping - Irrigation', description: 'Drip Irrigation Line', unit: 'linear ft', defaultUnitPrice: 8.50, isHardCoded: true },
  { id: 'h-la-12', category: 'Landscaping - Maintenance', description: 'Lawn Maintenance Visit', unit: 'visit', defaultUnitPrice: 75.00, isHardCoded: true },
  { id: 'h-la-21', category: 'Landscaping - Maintenance', description: 'Seasonal Pruning & Cleanup', unit: 'hr', defaultUnitPrice: 85.00, isHardCoded: true },

  // --- PAINTING ---
  { id: 'h-pa-1', category: 'Painting - Interior Painting', description: 'Interior Wall Painting', unit: 'sq ft', defaultUnitPrice: 2.50, isHardCoded: true },
  { id: 'h-pa-2', category: 'Painting - Interior Painting', description: 'Ceiling Painting', unit: 'sq ft', defaultUnitPrice: 2.00, isHardCoded: true },
  { id: 'h-pa-20', category: 'Painting - Interior Painting', description: 'Trim Painting', unit: 'linear ft', defaultUnitPrice: 1.75, isHardCoded: true },
  { id: 'h-pa-3', category: 'Painting - Interior Painting', description: 'Accent Wall Painting', unit: 'flat', defaultUnitPrice: 150.00, isHardCoded: true },
  { id: 'h-pa-4', category: 'Painting - Interior Painting', description: 'Baseboard Painting', unit: 'linear ft', defaultUnitPrice: 1.50, isHardCoded: true },
  { id: 'h-pa-5', category: 'Painting - Interior Painting', description: 'Crown Molding Painting', unit: 'linear ft', defaultUnitPrice: 2.25, isHardCoded: true },
  { id: 'h-pa-6', category: 'Painting - Interior Painting', description: 'Door Painting (Interior)', unit: 'ea', defaultUnitPrice: 85.00, isHardCoded: true },
  { id: 'h-pa-11', category: 'Painting - Exterior Painting', description: 'Exterior Wall Painting', unit: 'sq ft', defaultUnitPrice: 3.75, isHardCoded: true },
  { id: 'h-pa-15', category: 'Painting - Exterior Painting', description: 'Garage Door Painting', unit: 'ea', defaultUnitPrice: 250.00, isHardCoded: true },
  { id: 'h-pa-21', category: 'Painting - Surface Preparation', description: 'Pressure Washing', unit: 'sq ft', defaultUnitPrice: 0.25, isHardCoded: true },
  { id: 'h-pa-22', category: 'Painting - Surface Preparation', description: 'Paint Scraping', unit: 'hr', defaultUnitPrice: 65.00, isHardCoded: true },
  { id: 'h-pa-24', category: 'Painting - Surface Preparation', description: 'Crack / Hole Patching', unit: 'ea', defaultUnitPrice: 15.00, isHardCoded: true },
  { id: 'h-pa-25', category: 'Painting - Surface Preparation', description: 'Drywall Repair', unit: 'hr', defaultUnitPrice: 85.00, isHardCoded: true },
  { id: 'h-pa-40', category: 'Painting - Surface Preparation', description: 'Caulking / Sealing', unit: 'linear ft', defaultUnitPrice: 1.25, isHardCoded: true },
  { id: 'h-pa-26', category: 'Painting - Surface Preparation', description: 'Priming Surfaces', unit: 'sq ft', defaultUnitPrice: 1.25, isHardCoded: true },
  { id: 'h-pa-33', category: 'Painting - Specialty Painting Services', description: 'Epoxy Garage Floor Coating', unit: 'sq ft', defaultUnitPrice: 6.50, isHardCoded: true },

  // --- ROOFING ---
  { id: 'h-ro-1', category: 'Roofing - Roof Systems', description: 'Asphalt Shingle Roof (New)', unit: 'sq', defaultUnitPrice: 475.00, isHardCoded: true },
  { id: 'h-ro-20', category: 'Roofing - Roof Systems', description: 'Standing Seam Metal Roof', unit: 'sq', defaultUnitPrice: 950.00, isHardCoded: true },
  { id: 'h-ro-21', category: 'Roofing - Roof Systems', description: 'Flat Membrane (TPO) Roof', unit: 'sq', defaultUnitPrice: 650.00, isHardCoded: true },
  { id: 'h-ro-2', category: 'Roofing - Components', description: 'Flashing Replacement', unit: 'linear ft', defaultUnitPrice: 15.00, isHardCoded: true },
  { id: 'h-ro-3', category: 'Roofing - Components', description: 'Ridge Vent Installation', unit: 'linear ft', defaultUnitPrice: 18.00, isHardCoded: true },
  { id: 'h-ro-4', category: 'Roofing - Drainage', description: 'Downspout Extension', unit: 'ea', defaultUnitPrice: 45.00, isHardCoded: true },
  { id: 'h-ro-22', category: 'Roofing - Drainage', description: 'Seamless Gutter Install', unit: 'linear ft', defaultUnitPrice: 12.50, isHardCoded: true },
  { id: 'h-ro-23', category: 'Roofing - Installation & Replacement', description: 'Full Roof Tear-Off Fee', unit: 'sq', defaultUnitPrice: 150.00, isHardCoded: true },
  { id: 'h-ro-5', category: 'Roofing - Repair & Maintenance', description: 'Roof Repair & Maintenance', unit: 'hr', defaultUnitPrice: 95.00, isHardCoded: true },
  { id: 'h-ro-6', category: 'Roofing - Repair & Maintenance', description: 'Storm Damage Assessment', unit: 'ea', defaultUnitPrice: 250.00, isHardCoded: true },
  { id: 'h-ro-7', category: 'Roofing - Repair & Maintenance', description: 'Professional Roof Inspection', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },

  // --- CARPENTRY ---
  { id: 'h-ca-1', category: 'Carpentry - Rough Carpentry', description: 'Wall Framing (Standard)', unit: 'sq ft', defaultUnitPrice: 8.50, isHardCoded: true },
  { id: 'h-ca-2', category: 'Carpentry - Rough Carpentry', description: 'Floor Joist Installation', unit: 'sq ft', defaultUnitPrice: 12.00, isHardCoded: true },
  { id: 'h-ca-3', category: 'Carpentry - Finish Carpentry', description: 'Crown Molding Installation', unit: 'linear ft', defaultUnitPrice: 12.50, isHardCoded: true },
  { id: 'h-ca-4', category: 'Carpentry - Finish Carpentry', description: 'Baseboard / Trim Installation', unit: 'linear ft', defaultUnitPrice: 6.50, isHardCoded: true },
  { id: 'h-ca-5', category: 'Carpentry - Doors & Windows', description: 'Interior Door Installation', unit: 'ea', defaultUnitPrice: 185.00, isHardCoded: true },
  { id: 'h-ca-6', category: 'Carpentry - Doors & Windows', description: 'Window Installation (Standard)', unit: 'ea', defaultUnitPrice: 350.00, isHardCoded: true },
  { id: 'h-ca-12', category: 'Carpentry - Repair', description: 'Siding / Trim Wood Repair', unit: 'hr', defaultUnitPrice: 85.00, isHardCoded: true },

  // --- CLEANING ---
  { id: 'h-cl-1', category: 'Cleaning - General Cleaning', description: 'Standard Residential Cleaning', unit: 'visit', defaultUnitPrice: 150.00, isHardCoded: true },
  { id: 'h-cl-2', category: 'Cleaning - General Cleaning', description: 'Commercial Janitorial Visit', unit: 'visit', defaultUnitPrice: 250.00, isHardCoded: true },
  { id: 'h-cl-3', category: 'Cleaning - Deep Cleaning', description: 'Move-In / Move-Out Deep Clean', unit: 'sq ft', defaultUnitPrice: 0.45, isHardCoded: true },
  { id: 'h-cl-4', category: 'Cleaning - Deep Cleaning', description: 'Post-Construction Cleanup', unit: 'sq ft', defaultUnitPrice: 0.65, isHardCoded: true },
  { id: 'h-cl-5', category: 'Cleaning - Floor Care', description: 'Carpet Steam Cleaning', unit: 'room', defaultUnitPrice: 75.00, isHardCoded: true },
  { id: 'h-cl-6', category: 'Cleaning - Floor Care', description: 'Tile & Grout Scrubbing', unit: 'sq ft', defaultUnitPrice: 1.25, isHardCoded: true },
  { id: 'h-cl-7', category: 'Cleaning - Surface Cleaning', description: 'Professional Window Cleaning', unit: 'pane', defaultUnitPrice: 15.00, isHardCoded: true },
  { id: 'h-cl-8', category: 'Cleaning - Surface Cleaning', description: 'Upholstery Steam Clean', unit: 'ea', defaultUnitPrice: 125.00, isHardCoded: true },
  { id: 'h-cl-9', category: 'Cleaning - Exterior Cleaning', description: 'Power Washing (Siding)', unit: 'sq ft', defaultUnitPrice: 0.35, isHardCoded: true },
  { id: 'h-cl-10', category: 'Cleaning - Sanitation', description: 'Professional Disinfection', unit: 'sq ft', defaultUnitPrice: 0.15, isHardCoded: true },
  { id: 'h-cl-11', category: 'Cleaning - Waste Services', description: 'Debris Removal & Disposal', unit: 'load', defaultUnitPrice: 450.00, isHardCoded: true },

  // --- OTHER ---
  { id: 'h-ot-1', category: 'Other', description: 'General Handyman Labor', unit: 'hr', defaultUnitPrice: 75.00, isHardCoded: true },
  { id: 'h-ot-2', category: 'Other', description: 'Furniture Assembly', unit: 'hr', defaultUnitPrice: 65.00, isHardCoded: true }
];

export const getHardcodedTemplates = (): QuoteTemplate[] => [
  {
    id: 't-paint-1',
    name: 'Standard Living Room Refresh',
    serviceCategory: 'Painting',
    isHardCoded: true,
    items: [
      { description: 'Interior Wall Painting', unit: 'sq ft', quantity: 450, unitPrice: 2.5, total: 1125 },
      { description: 'Ceiling Painting', unit: 'sq ft', quantity: 200, unitPrice: 2.0, total: 400 },
      { description: 'Baseboard Painting', unit: 'linear ft', quantity: 60, unitPrice: 1.5, total: 90 },
      { description: 'Drywall Repair', unit: 'hr', quantity: 2, unitPrice: 85, total: 170 }
    ],
    scopeDescription: 'Full preparation and painting of living room walls and ceiling.'
  }
];

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
