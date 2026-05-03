import { Firestore, doc, writeBatch, getDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { Client, Quote, QuoteTemplate, BusinessProfile, SERVICE_CATEGORIES, QuoteItem } from "../types";
import { calculateQuoteTotals } from "../quote-engine";

/**
 * Static Data for Random Generation
 */
const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzales", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const STREETS = ["Oak St", "Maple Ave", "Washington Blvd", "Lakeview Dr", "Park Ln", "Main St", "Highland Ct", "Cedar Rd", "Pine Way", "Sunset Dr"];
const CITIES = ["Austin, TX", "Dallas, TX", "Houston, TX", "San Antonio, TX", "Denver, CO", "Phoenix, AZ", "Atlanta, GA"];

const ITEM_LIBRARY: Record<string, Array<{ desc: string; unit: string; price: number }>> = {
  "Painting": [
    { desc: "Interior Wall Painting (2 Coats)", unit: "sq ft", price: 2.75 },
    { desc: "Ceiling Painting (Flat White)", unit: "sq ft", price: 2.25 },
    { desc: "Premium Trim & Baseboard Finish", unit: "linear ft", price: 1.85 },
    { desc: "Cabinet Spray Refinishing", unit: "ea", price: 95.00 },
    { desc: "Drywall Patching & Surface Prep", unit: "hr", price: 85.00 },
    { desc: "Exterior Stucco Elastomeric Coating", unit: "sq ft", price: 4.50 },
    { desc: "Pressure Wash & Mildew Treatment", unit: "sq ft", price: 0.35 }
  ],
  "Electrical": [
    { desc: "Standard Outlet/Switch Upgrade", unit: "ea", price: 45.00 },
    { desc: "LED Recessed Lighting Install", unit: "ea", price: 185.00 },
    { desc: "Dedicated 20A Circuit (Kitchen/Bath)", unit: "ea", price: 350.00 },
    { desc: "Master Panel Upgrade Labor", unit: "hr", price: 110.00 },
    { desc: "Level 2 EV Charger Hookup", unit: "ea", price: 950.00 },
    { desc: "Smart Home Hub & Controller Setup", unit: "ea", price: 450.00 },
    { desc: "Electrical Safety & Code Inspection", unit: "ea", price: 250.00 }
  ],
  "Plumbing": [
    { desc: "Luxury Faucet Installation", unit: "ea", price: 225.00 },
    { desc: "Dual-Flush Toilet Replacement", unit: "ea", price: 450.00 },
    { desc: "Emergency Pipe Leak Repair", unit: "hr", price: 125.00 },
    { desc: "Tankless Water Heater Unit", unit: "ea", price: 3200.00 },
    { desc: "Whole-Home Filtration System", unit: "ea", price: 1200.00 },
    { desc: "Main Sewer Line Camera Scoping", unit: "ea", price: 285.00 },
    { desc: "Sump Pump & Battery Backup", unit: "ea", price: 850.00 }
  ],
  "Landscaping": [
    { desc: "Bermuda Sod Installation", unit: "sq ft", price: 2.50 },
    { desc: "Hardwood Mulch Delivery & Spread", unit: "cu yd", price: 95.00 },
    { desc: "Natural Stone Retaining Wall", unit: "sq ft", price: 55.00 },
    { desc: "Irrigation Zone Valve Repair", unit: "ea", price: 150.00 },
    { desc: "Professional Tree Pruning (Bucket)", unit: "hr", price: 125.00 },
    { desc: "Paver Walkway & Edge Border", unit: "sq ft", price: 35.00 },
    { desc: "Low-Voltage Path Lighting Fixture", unit: "ea", price: 145.00 }
  ]
};

const TEMPLATE_DEFS = [
  // Painting
  { name: "Full Interior Refresh (Standard)", cat: "Painting", items: ["Interior Wall Painting (2 Coats)", "Ceiling Painting (Flat White)", "Drywall Patching & Surface Prep"], scope: "Comprehensive interior repaint including all wall surfaces and ceilings. Includes minor drywall repair and full surface preparation." },
  { name: "Executive Cabinet Refinishing", cat: "Painting", items: ["Cabinet Spray Refinishing", "Premium Trim & Baseboard Finish", "Drywall Patching & Surface Prep"], scope: "High-end kitchen cabinet transformation using HVLP spray equipment. Includes detail work on existing island and surrounding trim." },
  { name: "Exterior Weather Protection", cat: "Painting", items: ["Pressure Wash & Mildew Treatment", "Exterior Stucco Elastomeric Coating", "Drywall Patching & Surface Prep"], scope: "Full exterior maintenance package. Includes thorough pressure washing, crack filling, and application of premium weather-resistant coating." },
  
  // Electrical
  { name: "Modern Kitchen Power Upgrade", cat: "Electrical", items: ["Standard Outlet/Switch Upgrade", "Dedicated 20A Circuit (Kitchen/Bath)", "LED Recessed Lighting Install"], scope: "Upgrade kitchen electrical to modern standards. Includes new GFCI outlets, dedicated circuits for appliances, and updated lighting layout." },
  { name: "Level 2 EV Charging Station Pro", cat: "Electrical", items: ["Level 2 EV Charger Hookup", "Master Panel Upgrade Labor", "Electrical Safety & Code Inspection"], scope: "Professional installation of a Level 2 Electric Vehicle charger. Includes necessary panel modifications and a full safety audit." },
  { name: "Smart Home Foundation Kit", cat: "Electrical", items: ["Smart Home Hub & Controller Setup", "LED Recessed Lighting Install", "Standard Outlet/Switch Upgrade"], scope: "Installation of central smart home infrastructure. Includes hub configuration and integration of primary lighting zones." },
  
  // Plumbing
  { name: "Master Suite Fixture Overhaul", cat: "Plumbing", items: ["Luxury Faucet Installation", "Dual-Flush Toilet Replacement", "Emergency Pipe Leak Repair"], scope: "Replacement of all master bathroom fixtures with premium alternatives. Includes a thorough inspection of existing supply lines." },
  { name: "High-Efficiency Water Heating", cat: "Plumbing", items: ["Tankless Water Heater Unit", "Whole-Home Filtration System", "Electrical Safety & Code Inspection"], scope: "Transition from tank-based to tankless water heating. Includes integrated water filtration for improved system longevity." },
  { name: "Estate Pipe & Drainage Service", cat: "Plumbing", items: ["Main Sewer Line Camera Scoping", "Sump Pump & Battery Backup", "Emergency Pipe Leak Repair"], scope: "Comprehensive diagnostic and preventative maintenance for estate-wide plumbing and drainage systems." },
  
  // Landscaping
  { name: "Modern Curb Appeal Package", cat: "Landscaping", items: ["Bermuda Sod Installation", "Hardwood Mulch Delivery & Spread", "Low-Voltage Path Lighting Fixture"], scope: "Complete front yard transformation. Includes fresh sod, premium mulching, and an elegant night-time lighting scheme." },
  { name: "Hardscape & Patio Expansion", cat: "Landscaping", items: ["Paver Walkway & Edge Border", "Natural Stone Retaining Wall", "Professional Tree Pruning (Bucket)"], scope: "Installation of a new functional hardscape zone. Includes structural retaining walls and surrounding canopy maintenance." },
  { name: "Water Conservation Irrigation", cat: "Landscaping", items: ["Irrigation Zone Valve Repair", "Bermuda Sod Installation", "Hardwood Mulch Delivery & Spread"], scope: "Upgrade to a high-efficiency irrigation system combined with drought-resistant landscaping features." },
  
  // Mix
  { name: "Rental Unit Turn-Around", cat: "Painting", items: ["Interior Wall Painting (2 Coats)", "Drywall Patching & Surface Prep", "Standard Outlet/Switch Upgrade"], scope: "Fast-track preparation for new tenants. Includes wall painting, patch work, and minor electrical updates." },
  { name: "Property Manager Maintenance", cat: "Other", items: ["Drywall Patching & Surface Prep", "Standard Outlet/Switch Upgrade", "Emergency Pipe Leak Repair"], scope: "Bundled maintenance for recurring property management clients covering minor multi-trade repairs." },
  { name: "Premium Commercial Lobby Update", cat: "Painting", items: ["Interior Wall Painting (2 Coats)", "LED Recessed Lighting Install", "Premium Trim & Baseboard Finish"], scope: "Professional aesthetic update for commercial lobbies and common areas." },
  { name: "Deck & Fence Restoration", cat: "Painting", items: ["Pressure Wash & Mildew Treatment", "Premium Trim & Baseboard Finish", "Drywall Patching & Surface Prep"], scope: "Restoration of wooden exterior structures. Includes deep cleaning and application of protective stains/coatings." },
  { name: "HVAC Energy Audit & Seal", cat: "HVAC", items: ["Electrical Safety & Code Inspection", "Drywall Patching & Surface Prep", "Premium Trim & Baseboard Finish"], scope: "Diagnostic review of energy efficiency and sealing of accessible envelope breaches." },
  { name: "Basement Flood Protection", cat: "Plumbing", items: ["Sump Pump & Battery Backup", "Main Sewer Line Camera Scoping", "Dedicated 20A Circuit (Kitchen/Bath)"], scope: "Comprehensive flood prevention including new pump hardware and dedicated power delivery." },
  { name: "Home Sale Preparation", cat: "Other", items: ["Pressure Wash & Mildew Treatment", "Hardwood Mulch Delivery & Spread", "Interior Wall Painting (2 Coats)"], scope: "Visual optimization for home listing. Maximizing curb appeal and interior freshness." },
  { name: "Security & Safety Lighting", cat: "Electrical", items: ["LED Recessed Lighting Install", "Low-Voltage Path Lighting Fixture", "Electrical Safety & Code Inspection"], scope: "Enhancement of property security through strategic lighting placement and safety auditing." }
];

/**
 * Generates the massive demo dataset
 */
export function generateDemoData(userId: string) {
  const clients: Client[] = [];
  const templates: QuoteTemplate[] = [];
  const quotes: Quote[] = [];

  // 1. Generate 100 Clients with stable IDs for overwriting
  for (let i = 0; i < 100; i++) {
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `${fName} ${lName}`;
    clients.push({
      id: `client-${i}`, // Stable ID
      name,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
      phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      address: `${Math.floor(100 + Math.random() * 9000)} ${STREETS[Math.floor(Math.random() * STREETS.length)]}, ${CITIES[Math.floor(Math.random() * CITIES.length)]}`
    });
  }

  // 2. Generate 20+ Real Templates with stable IDs
  TEMPLATE_DEFS.forEach((def, index) => {
    const items = def.items.map(itemName => {
      const libData = Object.values(ITEM_LIBRARY).flat().find(li => li.desc === itemName);
      if (!libData) return null;
      
      const qty = Math.floor(1 + Math.random() * 20);
      const variance = 0.9 + (Math.random() * 0.2); // +/- 10%
      const price = Math.round(libData.price * variance * 100) / 100;

      return {
        description: libData.desc,
        unit: libData.unit,
        quantity: qty,
        unitPrice: price,
        total: Math.round(qty * price * 100) / 100
      };
    }).filter(i => !!i);

    templates.push({
      id: `template-${index}`, // Stable ID
      name: def.name,
      serviceCategory: def.cat,
      scopeDescription: def.scope,
      items: items as any,
      isHardCoded: false
    });
  });

  // 3. Generate 250 Quotes with stable IDs
  const statuses: Array<"draft" | "sent" | "approved" | "rejected"> = ["approved", "approved", "sent", "sent", "draft", "rejected"];
  const now = new Date();

  for (let q = 0; q < 250; q++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const tDef = TEMPLATE_DEFS[Math.floor(Math.random() * TEMPLATE_DEFS.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Spread dates over the last 12 months
    const date = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    const items: QuoteItem[] = tDef.items.map(itemName => {
      const libData = Object.values(ITEM_LIBRARY).flat().find(li => li.desc === itemName);
      const qty = Math.floor(1 + Math.random() * 50);
      const price = libData ? libData.price : 100;
      return {
        id: uuidv4(),
        description: itemName,
        unit: libData?.unit || "ea",
        quantity: qty,
        unitPrice: price,
        total: Math.round(qty * price * 100) / 100
      };
    });

    const laborHours = Math.floor(2 + Math.random() * 40);
    const laborRate = 85;
    const materialCosts = Math.floor(Math.random() * 1500);
    const taxRate = 8.25;

    const totals = calculateQuoteTotals({
      items,
      laborHours,
      laborRate,
      materialCosts,
      taxRate
    });

    quotes.push({
      id: `quote-${q}`, // Stable ID
      clientId: client.id,
      contractorId: userId,
      clientSnapshot: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      },
      date: date.toISOString(),
      status,
      serviceCategory: tDef.cat,
      items,
      scopeDescription: tDef.scope,
      laborHours,
      laborRate,
      materialCosts,
      taxRate,
      taxTotal: totals.taxTotal,
      subtotal: totals.subtotal,
      grandTotal: totals.grandTotal,
      notes: q % 7 === 0 ? "Customer requested specific weekend scheduling." : ""
    });
  }

  // Choose 1-3 random services for the profile
  const numOffered = Math.floor(Math.random() * 3) + 1;
  const offeredServices = [...SERVICE_CATEGORIES]
    .sort(() => 0.5 - Math.random())
    .slice(0, numOffered);

  const businessProfile: BusinessProfile = {
    businessName: "Pro Contractor Services (Demo)",
    licenseNumber: "LIC-TX-DEMO-2026",
    email: "pro@demo-contractor.com",
    phone: "555-0100",
    address: "500 Innovation Way, Austin, TX 78701",
    defaultTaxRate: 8.25,
    defaultLaborRate: 85,
    offeredServices: offeredServices,
    quoteTerms: "Standard 15-day payment terms apply. All workmanship is guaranteed for one year from date of completion."
  };

  return { clients, templates, quotes, businessProfile };
}

/**
 * Seeds a new user's account with the generated demo data.
 */
export async function seedDemoEnvironment(db: Firestore, userId: string, force = false) {
  const profileRef = doc(db, "contractorProfiles", userId);
  
  if (!force) {
    const profileSnap = await getDoc(profileRef);
    if (profileSnap.exists()) return;
  }

  const { clients, templates, quotes, businessProfile } = generateDemoData(userId);
  
  // Use sequential batches because Firestore limit is 500 per batch
  const batch = writeBatch(db);

  batch.set(profileRef, {
    ...businessProfile,
    id: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  clients.forEach(client => {
    const clientRef = doc(db, "contractorProfiles", userId, "clients", client.id);
    batch.set(clientRef, {
      ...client,
      contractorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  templates.forEach(template => {
    const templateRef = doc(db, "contractorProfiles", userId, "templates", template.id);
    batch.set(templateRef, template, { merge: true });
  });

  quotes.forEach(quote => {
    const quoteRef = doc(db, "contractorProfiles", userId, "quotes", quote.id);
    batch.set(quoteRef, {
      ...quote,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();
}
