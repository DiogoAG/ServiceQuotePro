import { Firestore, doc, collection, setDoc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { SERVICE_CATEGORIES } from "../types";

/**
 * Seeds a new user's account with realistic contractor data.
 */
export async function seedDemoEnvironment(db: Firestore, userId: string) {
  const profileRef = doc(db, "contractorProfiles", userId);
  
  // Check if profile already exists to avoid overwriting
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) return;

  const batch = writeBatch(db);

  // 1. Create Business Profile
  const profileData = {
    id: userId,
    businessName: "Demo Contractor Pro",
    licenseNumber: "LIC-DEMO-9988",
    email: "demo@servicepro.com",
    phone: "555-0123",
    address: "789 Professional Way, Suite 100, Austin, TX",
    defaultTaxRate: 8.25,
    defaultLaborRate: 85,
    offeredServices: ["General Contracting", "Electrical", "Painting", "Carpentry"],
    quoteTerms: "This is a demo quote. Payment is typically due within 15 days of project completion. All labor and materials are guaranteed for 12 months.",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  batch.set(profileRef, profileData);

  // 2. Create Clients
  const clients = [
    { id: uuidv4(), name: "Sarah Miller", email: "sarah.m@example.com", phone: "555-0444", address: "123 Oak Lane, Austin, TX" },
    { id: uuidv4(), name: "Urban Lofts LLC", email: "maintenance@urbanlofts.com", phone: "555-9000", address: "456 Downtown Ave, Austin, TX" },
    { id: uuidv4(), name: "David Henderson", email: "d.henderson@example.com", phone: "555-2233", address: "890 Maple Drive, Austin, TX" }
  ];

  clients.forEach(client => {
    const clientRef = doc(db, "contractorProfiles", userId, "clients", client.id);
    batch.set(clientRef, {
      ...client,
      contractorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  // 3. Create Templates
  const templates = [
    {
      id: uuidv4(),
      name: "Standard Bathroom Refresh",
      serviceCategory: "General Contracting",
      scopeDescription: "Complete removal of existing fixtures, installation of new vanity, toilet, and floor tiling.",
      items: [
        { description: "Demolition & Disposal", unit: "hr", quantity: 8, unitPrice: 75, total: 600 },
        { description: "Floor Tile Installation", unit: "sq ft", quantity: 45, unitPrice: 12, total: 540 },
        { description: "Plumbing Fixture Hookup", unit: "ea", quantity: 2, unitPrice: 150, total: 300 }
      ]
    },
    {
      id: uuidv4(),
      name: "Kitchen Lighting Upgrade",
      serviceCategory: "Electrical",
      scopeDescription: "Installation of 6 recessed LED lights and under-cabinet accent lighting with dimmer control.",
      items: [
        { description: "6-inch LED Recessed Light", unit: "ea", quantity: 6, unitPrice: 185, total: 1110 },
        { description: "Under-cabinet LED Strip", unit: "linear ft", quantity: 12, unitPrice: 45, total: 540 },
        { description: "Dimmer Switch Installation", unit: "ea", quantity: 1, unitPrice: 125, total: 125 }
      ]
    }
  ];

  templates.forEach(template => {
    const templateRef = doc(db, "contractorProfiles", userId, "templates", template.id);
    batch.set(templateRef, template);
  });

  // 4. Create Quotes
  const quotes = [
    {
      id: uuidv4(),
      clientId: clients[0].id,
      clientSnapshot: { name: clients[0].name, email: clients[0].email, phone: clients[0].phone, address: clients[0].address },
      serviceCategory: "Painting",
      status: "approved",
      date: new Date().toISOString(),
      scopeDescription: "Full interior painting of master bedroom and ensuite bathroom including ceiling and trim.",
      laborHours: 16,
      laborRate: 85,
      materialCosts: 240,
      taxRate: 8.25,
      subtotal: 1600,
      taxTotal: 132,
      grandTotal: 1732,
      notes: "Client chose 'Naval Blue' for the accent wall.",
      items: [
        { id: uuidv4(), description: "Master Bedroom Walls", unit: "sq ft", quantity: 400, unitPrice: 2.5, total: 1000 },
        { id: uuidv4(), description: "Trim & Door Painting", unit: "linear ft", quantity: 120, unitPrice: 1.5, total: 180 }
      ]
    },
    {
      id: uuidv4(),
      clientId: clients[1].id,
      clientSnapshot: { name: clients[1].name, email: clients[1].email, phone: clients[1].phone, address: clients[1].address },
      serviceCategory: "Electrical",
      status: "draft",
      date: new Date().toISOString(),
      scopeDescription: "Safety audit and panel maintenance for commercial unit #402.",
      laborHours: 4,
      laborRate: 85,
      materialCosts: 0,
      taxRate: 8.25,
      subtotal: 340,
      taxTotal: 28.05,
      grandTotal: 368.05,
      notes: "Tenant reported flickering lights in the breakroom.",
      items: [
        { id: uuidv4(), description: "Electrical Troubleshooting", unit: "hr", quantity: 4, unitPrice: 85, total: 340 }
      ]
    }
  ];

  quotes.forEach(quote => {
    const quoteRef = doc(db, "contractorProfiles", userId, "quotes", quote.id);
    batch.set(quoteRef, {
      ...quote,
      contractorId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
}
