
"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Save, Search, BookOpen, Copy, UserPlus, Check, LayoutTemplate, ChevronRight, Undo2, X, Star, DollarSign, Loader2 } from "lucide-react";
import { Client, Quote, QuoteItem, BusinessProfile, CommonItem, QuoteTemplate, SERVICE_CATEGORIES } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getHardcodedItems, getDraftQuote, saveDraftQuote, clearDraftQuote, QuoteDraft } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type QuoteBuilderProps = {
  initialClients: Client[];
  initialProfile: BusinessProfile;
  onSave: (quote: Quote) => void;
  preSelectedClientId?: string;
  duplicateSource?: Quote | QuoteTemplate;
};

const roundToCent = (val: number | string) => Math.round(Number(val) * 100) / 100;

export function QuoteBuilder({ initialClients, initialProfile, onSave, preSelectedClientId, duplicateSource }: QuoteBuilderProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();
  const isInitialMount = useRef(true);

  // Firestore Data for Item Library and Templates
  const customItemsRef = useMemoFirebase(() => user ? collection(db, "contractorProfiles", user.uid, "customItems") : null, [db, user]);
  const templatesRef = useMemoFirebase(() => user ? collection(db, "contractorProfiles", user.uid, "templates") : null, [db, user]);
  
  const { data: customItems } = useCollection<CommonItem>(customItemsRef);
  const { data: userTemplates } = useCollection<QuoteTemplate>(templatesRef);

  const allLibraryItems = useMemo(() => {
    return [...getHardcodedItems(), ...(customItems || [])];
  }, [customItems]);

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientId, setClientId] = useState<string>(preSelectedClientId || "");
  const [serviceCategory, setServiceCategory] = useState<string>(initialProfile.offeredServices?.[0] || "General Contracting");
  const [items, setItems] = useState<QuoteItem[]>(duplicateSource?.items.map(i => ({ ...i, id: uuidv4() })) as QuoteItem[] || [{ id: uuidv4(), description: "", unit: "", quantity: 1, length: "", width: "", unitPrice: 0, total: 0 }]);
  const [laborHours, setLaborHours] = useState<number | string>(duplicateSource && 'laborHours' in duplicateSource ? (duplicateSource as Quote).laborHours : 0);
  const [laborRate, setLaborRate] = useState<number | string>(initialProfile.defaultLaborRate);
  const [materialCosts, setMaterialCosts] = useState<number | string>(duplicateSource && 'materialCosts' in duplicateSource ? (duplicateSource as Quote).materialCosts : 0);
  const [taxRate, setTaxRate] = useState<number | string>(initialProfile.defaultTaxRate);
  const [notes, setNotes] = useState(duplicateSource && 'notes' in duplicateSource ? (duplicateSource as Quote).notes : "");
  const [scopeDescription, setScopeDescription] = useState(duplicateSource?.scopeDescription || "");
  
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");

  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

  const calculateTotals = useCallback(() => {
    const itemsTotal = items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
    const lh = Number(laborHours) || 0;
    const lr = Number(laborRate) || 0;
    const mc = Number(materialCosts) || 0;
    const subtotal = roundToCent(itemsTotal + (lh * lr) + mc);
    const taxTotal = roundToCent(subtotal * ((Number(taxRate) || 0) / 100));
    const grandTotal = roundToCent(subtotal + taxTotal);
    return { subtotal, taxTotal, grandTotal };
  }, [items, laborHours, laborRate, materialCosts, taxRate]);

  const totals = calculateTotals();

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'length' || field === 'width') {
          const l = parseFloat(String(updated.length));
          const w = parseFloat(String(updated.width));
          if (!isNaN(l) && !isNaN(w)) updated.quantity = roundToCent(l * w);
        }
        updated.total = roundToCent((Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0));
        return updated;
      }
      return item;
    }));
  };

  const applyTemplate = (template: QuoteTemplate) => {
    setServiceCategory(template.serviceCategory);
    setScopeDescription(template.scopeDescription);
    setItems(template.items.map(i => ({ ...i, id: uuidv4(), total: roundToCent((Number(i.quantity) || 1) * (Number(i.unitPrice) || 0)) })) as QuoteItem[]);
  };

  const handleSaveAsTemplate = () => {
    if (!user || !newTemplateName.trim()) return;
    const id = uuidv4();
    const newTemplate: QuoteTemplate = {
      id,
      name: newTemplateName,
      serviceCategory,
      items: items.map(({ id, ...rest }) => rest),
      scopeDescription
    };
    const docRef = doc(db, "contractorProfiles", user.uid, "templates", id);
    setDocumentNonBlocking(docRef, newTemplate, { merge: true });
    setIsTemplateDialogOpen(false);
    toast({ title: "Template Saved" });
  };

  const handleSaveQuote = () => {
    if (!clientId) {
      toast({ title: "Client Required", variant: "destructive" });
      return;
    }
    const finalQuote: Quote = {
      id: uuidv4(),
      clientId,
      date: new Date().toISOString(),
      status: 'draft',
      serviceCategory,
      items,
      scopeDescription,
      laborHours: Number(laborHours),
      laborRate: Number(laborRate),
      materialCosts: Number(materialCosts),
      taxRate: Number(taxRate),
      taxTotal: totals.taxTotal,
      subtotal: totals.subtotal,
      grandTotal: totals.grandTotal,
      notes
    };
    onSave(finalQuote);
  };

  const organizedLibrary = useMemo(() => {
    const offered = initialProfile.offeredServices || [];
    const grouped: Record<string, CommonItem[]> = {};
    allLibraryItems.forEach(i => {
      if (!grouped[i.category]) grouped[i.category] = [];
      grouped[i.category].push(i);
    });
    return Object.entries(grouped).sort(([catA], [catB]) => {
      const aOffered = offered.some(o => catA.startsWith(o));
      const bOffered = offered.some(o => catB.startsWith(o));
      if (aOffered && !bOffered) return -1;
      if (!aOffered && bOffered) return 1;
      return 0;
    });
  }, [allLibraryItems, initialProfile]);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Configuration</CardTitle>
              <div className="flex gap-2">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild><Button variant="outline" size="sm" className="gap-2"><LayoutTemplate className="w-4 h-4" /> Save Template</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Save Template</DialogTitle></DialogHeader>
                    <div className="py-4"><Input placeholder="Template Name" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} /></div>
                    <DialogFooter><Button onClick={handleSaveAsTemplate}>Save</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline" size="sm" className="gap-2"><Copy className="w-4 h-4" /> Load Template</Button></PopoverTrigger>
                  <PopoverContent className="w-64 p-0">
                    <ScrollArea className="h-64 p-2">
                      {userTemplates?.map(t => (
                        <Button key={t.id} variant="ghost" className="w-full justify-start text-xs" onClick={() => applyTemplate(t)}>{t.name}</Button>
                      ))}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Client</Label>
                {selectedClient ? (
                  <div className="flex items-center justify-between p-2 border rounded-lg bg-primary/5">
                    <div className="truncate"><p className="font-bold text-sm">{selectedClient.name}</p></div>
                    <Button variant="ghost" size="sm" onClick={() => setClientId("")}><X className="w-3 h-3" /></Button>
                  </div>
                ) : (
                  <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
                    <PopoverTrigger asChild><Input placeholder="Search client..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} /></PopoverTrigger>
                    <PopoverContent className="p-0 w-full" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                      <ScrollArea className="max-h-48">
                        {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                          <Button key={c.id} variant="ghost" className="w-full justify-start" onClick={() => { setClientId(c.id); setIsClientPopoverOpen(false); }}>{c.name}</Button>
                        ))}
                        <Button variant="ghost" className="w-full text-primary justify-start gap-2" onClick={() => setIsNewClientDialogOpen(true)}><UserPlus className="w-4 h-4" /> Add New</Button>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select value={serviceCategory} onValueChange={setServiceCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SERVICE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30"><CardTitle className="text-lg">Scope & Items</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="hidden md:grid grid-cols-[1fr_60px_50px_50px_60px_80px_90px_40px] gap-2 px-2 text-[10px] font-bold uppercase text-muted-foreground border-b pb-2">
                  <div>Description</div><div>Unit</div><div>L</div><div>W</div><div>Qty</div><div>Price</div><div className="text-right">Total</div><div></div>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_60px_50px_50px_60px_80px_90px_40px] gap-2 items-center group">
                      <div className="relative">
                        <Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="h-8 text-xs pr-8" placeholder="Description..." />
                        <Popover>
                          <PopoverTrigger asChild><Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8 text-muted-foreground"><BookOpen className="w-3 h-3" /></Button></PopoverTrigger>
                          <PopoverContent className="w-80 p-0"><ScrollArea className="h-72 p-2">
                            {organizedLibrary.map(([cat, libItems]) => (
                              <div key={cat} className="mb-4">
                                <p className="text-[10px] font-bold uppercase text-primary/60 px-2">{cat}</p>
                                {libItems.map(li => (
                                  <Button key={li.id} variant="ghost" className="w-full justify-between text-xs h-auto py-1.5" onClick={() => {
                                    updateItem(item.id, 'description', li.description);
                                    updateItem(item.id, 'unit', li.unit || "");
                                    updateItem(item.id, 'unitPrice', li.defaultUnitPrice);
                                  }}><span>{li.description}</span><span className="opacity-50">${li.defaultUnitPrice}</span></Button>
                                ))}
                              </div>
                            ))}
                          </ScrollArea></PopoverContent>
                        </Popover>
                      </div>
                      <Input value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} className="h-8 text-xs text-center" placeholder="Unit" />
                      <Input type="number" value={item.length} onChange={(e) => updateItem(item.id, 'length', e.target.value)} className="h-8 text-xs text-center" placeholder="L" />
                      <Input type="number" value={item.width} onChange={(e) => updateItem(item.id, 'width', e.target.value)} className="h-8 text-xs text-center" placeholder="W" />
                      <Input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className="h-8 text-xs text-center" />
                      <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} className="h-8 text-xs text-center" />
                      <div className="text-right text-xs font-bold">${item.total.toLocaleString()}</div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => setItems(items.filter(i => i.id !== item.id))}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full border-dashed border h-10 gap-2" onClick={() => setItems([...items, { id: uuidv4(), description: "", unit: "", quantity: 1, length: "", width: "", unitPrice: 0, total: 0 }])}><Plus className="w-4 h-4" /> Add Line Item</Button>
              </div>
              <div className="space-y-2">
                <Label>Detailed Work Scope</Label>
                <Textarea value={scopeDescription} onChange={(e) => setScopeDescription(e.target.value)} className="min-h-[150px]" placeholder="Outline project details..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-8 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5"><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Pricing & Totals</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-muted-foreground">Labor Rate ($/hr)</Label><Input type="number" value={laborRate} onChange={(e) => setLaborRate(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-muted-foreground">Labor Hours</Label><Input type="number" value={laborHours} onChange={(e) => setLaborHours(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-muted-foreground">Materials ($)</Label><Input type="number" value={materialCosts} onChange={(e) => setMaterialCosts(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-[10px] uppercase font-bold text-muted-foreground">Tax Rate (%)</Label><Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} /></div>
              </div>
              <div className="space-y-2 pt-4 border-t border-dashed">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>${totals.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center pt-2 border-t font-black text-primary"><span>Grand Total</span><span className="text-2xl">${totals.grandTotal.toLocaleString()}</span></div>
              </div>
              <Button size="lg" className="w-full h-12 text-lg font-bold gap-2" onClick={handleSaveQuote}><Save className="w-5 h-5" /> Save Quote</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Client</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name</Label><Input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={() => {
            const id = uuidv4();
            const newClient = { id, name: newClientName, email: newClientEmail, phone: "", address: "" };
            setClients([...clients, newClient]);
            setClientId(id);
            setIsNewClientDialogOpen(false);
          }}>Add & Select</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
