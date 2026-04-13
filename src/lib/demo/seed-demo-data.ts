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
    { desc: "Interior Wall Painting", unit: "sq ft", price: 2.75 },
    { desc: "Ceiling Painting", unit: "sq ft", price: 2.25 },
    { desc: "Trim & Baseboard Prep", unit: "linear ft", price: 1.50 },
    { desc: "Cabinet Refinishing", unit: "ea", price: 85.00 },
    { desc: "Drywall Patching", unit: "hr", price: 85.00 }
  ],
  "Electrical": [
    { desc: "Outlet/Switch Replacement", unit: "ea", price: 45.00 },
    { desc: "Recessed Lighting Install", unit: "ea", price: 185.00 },
    { desc: "Circuit Breaker Maintenance", unit: "ea", price: 125.00 },
    { desc: "Panel Upgrade Labor", unit: "hr", price: 110.00 },
    { desc: "EV Charger Install", unit: "ea", price: 950.00 }
  ],
  "Plumbing": [
    { desc: "Faucet Installation", unit: "ea", price: 225.00 },
    { desc: "Toilet Rebuild Kit", unit: "ea", price: 150.00 },
    { desc: "Pipe Leak Repair", unit: "hr", price: 125.00 },
    { desc: "Water Heater Flush", unit: "ea", price: 185.00 },
    { desc: "Sump Pump Replacement", unit: "ea", price: 850.00 }
  ],
  "Landscaping": [
    { desc: "Sod Installation", unit: "sq ft", price: 2.50 },
    { desc: "Mulch Delivery & Spread", unit: "cu yd", price: 95.00 },
    { desc: "Retaining Wall Block", unit: "sq ft", price: 45.00 },
    { desc: "Irrigation Zone Repair", unit: "ea", price: 150.00 },
    { desc: "Hedge Trimming", unit: "hr", price: 75.00 }
  ]
};

/**
 * Generates the massive demo dataset
 */
export function generateDemoData(userId: string) {
  const clients: Client[] = [];
  const templates: QuoteTemplate[] = [];
  const quotes: Quote[] = [];

  // 1. Generate 100 Clients
  for (let i = 0; i < 100; i++) {
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `${fName} ${lName}`;
    clients.push({
      id: `c-${i}-${uuidv4().slice(0, 8)}`,
      name,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`,
      phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      address: `${Math.floor(100 + Math.random() * 9000)} ${STREETS[Math.floor(Math.random() * STREETS.length)]}, ${CITIES[Math.floor(Math.random() * CITIES.length)]}`
    });
  }

  // 2. Generate 20+ Templates
  const cats = ["Painting", "Electrical", "Plumbing", "Landscaping"];
  cats.forEach(cat => {
    for (let t = 1; t <= 5; t++) {
      templates.push({
        id: `t-${cat.toLowerCase()}-${t}`,
        name: `${cat} Standard Package ${t}`,
        serviceCategory: cat,
        scopeDescription: `A professional standard scope for ${cat} services, optimized for medium-sized residential projects.`,
        items: ITEM_LIBRARY[cat].slice(0, 3).map(lib => ({
          description: lib.desc,
          unit: lib.unit,
          quantity: 1,
          unitPrice: lib.price,
          total: lib.price
        }))
      });
    }
  });

  // 3. Generate 250 Quotes
  const statuses: Array<"draft" | "sent" | "approved" | "rejected"> = ["approved", "approved", "sent", "sent", "draft", "rejected"];
  const now = new Date();

  for (let q = 0; q < 250; q++) {
    const client = clients[Math.floor(Math.random() * clients.length)];
    const category = cats[Math.floor(Math.random() * cats.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Spread dates over the last 12 months
    const date = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    // Pick 2-5 items from the library
    const libItems = ITEM_LIBRARY[category].sort(() => 0.5 - Math.random()).slice(0, Math.floor(2 + Math.random() * 4));
    const items: QuoteItem[] = libItems.map(lib => {
      const qty = Math.floor(1 + Math.random() * 50);
      return {
        id: uuidv4(),
        description: lib.desc,
        unit: lib.unit,
        quantity: qty,
        unitPrice: lib.price,
        total: Math.round(qty * lib.price * 100) / 100
      };
    });

    const laborHours = Math.floor(2 + Math.random() * 40);
    const laborRate = 85;
    const materialCosts = Math.floor(Math.random() * 1000);
    const taxRate = 8.25;

    const totals = calculateQuoteTotals({
      items,
      laborHours,
      laborRate,
      materialCosts,
      taxRate
    });

    quotes.push({
      id: `q-${q}-${uuidv4().slice(0, 8)}`,
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
      serviceCategory: category,
      items,
      scopeDescription: `Professional ${category.toLowerCase()} work as requested. This scope includes all necessary preparation, materials, and labor to complete the project to industry standards.`,
      laborHours,
      laborRate,
      materialCosts,
      taxRate,
      taxTotal: totals.taxTotal,
      subtotal: totals.subtotal,
      grandTotal: totals.grandTotal,
      notes: q % 5 === 0 ? "Customer requested a specific color match." : ""
    });
  }

  const businessProfile: BusinessProfile = {
    businessName: "Pro Contractor Services (Demo)",
    licenseNumber: "LIC-TX-DEMO-2026",
    email: "pro@demo-contractor.com",
    phone: "555-0100",
    address: "500 Innovation Way, Austin, TX 78701",
    defaultTaxRate: 8.25,
    defaultLaborRate: 85,
    offeredServices: SERVICE_CATEGORIES.slice(0, 6),
    quoteTerms: "Standard 15-day payment terms apply. All workmanship is guaranteed for one year from date of completion."
  };

  return { clients, templates, quotes, businessProfile };
}

/**
 * Seeds a new user's account with the generated demo data.
 */
export async function seedDemoEnvironment(db: Firestore, userId: string) {
  const profileRef = doc(db, "contractorProfiles", userId);
  
  // Check if profile already exists to avoid overwriting
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) return;

  const { clients, templates, quotes, businessProfile } = generateDemoData(userId);
  const batch = writeBatch(db);

  // 1. Business Profile
  batch.set(profileRef, {
    ...businessProfile,
    id: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // 2. Clients
  clients.forEach(client => {
    const clientRef = doc(db, "contractorProfiles", userId, "clients", client.id);
    batch.set(clientRef, {
      ...client,
      contractorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  // 3. Templates
  templates.forEach(template => {
    const templateRef = doc(db, "contractorProfiles", userId, "templates", template.id);
    batch.set(templateRef, template);
  });

  // 4. Quotes
  quotes.forEach(quote => {
    const quoteRef = doc(db, "contractorProfiles", userId, "quotes", quote.id);
    batch.set(quoteRef, {
      ...quote,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  // Firestore Batch limit is 500. We have 100 + 20 + 250 + 1 = 371.
  await batch.commit();
}
