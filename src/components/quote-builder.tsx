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
import { getHardcodedItems, getHardcodedTemplates, QuoteDraft } from "@/lib/store";
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

  // Firestore Data for Item Library and Templates
  const customItemsRef = useMemoFirebase(() => user ? collection(db, "contractorProfiles", user.uid, "customItems") : null, [db, user]);
  const templatesRef = useMemoFirebase(() => user ? collection(db, "contractorProfiles", user.uid, "templates") : null, [db, user]);
  
  const { data: customItems } = useCollection<CommonItem>(customItemsRef);
  const { data: userTemplates } = useCollection<QuoteTemplate>(templatesRef);

  const allLibraryItems = useMemo(() => {
    return [...getHardcodedItems(), ...(customItems || [])];
  }, [customItems]);

  const allAvailableTemplates = useMemo(() => {
    return [...getHardcodedTemplates(), ...(userTemplates || [])];
  }, [userTemplates]);

  const [clients, setClients] = useState<Client[]>(initialClients);
  
  // Initial State derived from profile or duplicate source
  const [clientId, setClientId] = useState<string>(
    preSelectedClientId || 
    (duplicateSource && 'clientId' in duplicateSource ? (duplicateSource as Quote).clientId : "")
  );
  
  const [serviceCategory, setServiceCategory] = useState<string>(
    duplicateSource?.serviceCategory || initialProfile.offeredServices?.[0] || "General Contracting"
  );
  
  const [items, setItems] = useState<QuoteItem[]>(
    duplicateSource?.items.map(i => ({ 
      ...i, 
      id: uuidv4(),
      total: roundToCent((Number(i.quantity) || 1) * (Number(i.unitPrice) || 0))
    })) as QuoteItem[] || 
    [{ id: uuidv4(), description: "", unit: "", quantity: 1, length: "", width: "", unitPrice: 0, total: 0 }]
  );

  const [laborHours, setLaborHours] = useState<number | string>(
    duplicateSource && 'laborHours' in duplicateSource ? (duplicateSource as Quote).laborHours : 0
  );
  
  const [laborRate, setLaborRate] = useState<number | string>(
    duplicateSource && 'laborRate' in duplicateSource ? (duplicateSource as Quote).laborRate : initialProfile.defaultLaborRate
  );
  
  const [materialCosts, setMaterialCosts] = useState<number | string>(
    duplicateSource && 'materialCosts' in duplicateSource ? (duplicateSource as Quote).materialCosts : 0
  );
  
  const [taxRate, setTaxRate] = useState<number | string>(
    duplicateSource && 'taxRate' in duplicateSource ? (duplicateSource as Quote).taxRate : initialProfile.defaultTaxRate
  );
  
  const [notes, setNotes] = useState(duplicateSource && 'notes' in duplicateSource ? (duplicateSource as Quote).notes : "");
  const [scopeDescription, setScopeDescription] = useState(duplicateSource?.scopeDescription || "");
  
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  // Track which row's library popover is open
  const [openLibraryId, setOpenLibraryId] = useState<string | null>(null);

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
    setItems(prev => prev.map(item => {
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

  const applyLibraryItem = (rowId: string, libItem: CommonItem) => {
    setItems(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          description: libItem.description,
          unit: libItem.unit || "",
          unitPrice: libItem.defaultUnitPrice,
          total: roundToCent((Number(item.quantity) || 1) * libItem.defaultUnitPrice)
        };
      }
      return item;
    }));
    setOpenLibraryId(null);
  };

  const applyTemplate = (template: QuoteTemplate) => {
    setServiceCategory(template.serviceCategory);
    setScopeDescription(template.scopeDescription);
    setItems(template.items.map(i => ({ 
      ...i, 
      id: uuidv4(), 
      total: roundToCent((Number(i.quantity) || 1) * (Number(i.unitPrice) || 0)) 
    })) as QuoteItem[]);
    toast({ title: "Template Applied", description: `Loaded scope for ${template.name}` });
  };

  const handleSaveAsTemplate = () => {
    if (!user || !newTemplateName.trim()) return;
    const id = uuidv4();
    const newTemplate: QuoteTemplate = {
      id,
      name: newTemplateName,
      serviceCategory,
      items: items.map(({ id, total, ...rest }) => rest),
      scopeDescription
    };
    const docRef = doc(db, "contractorProfiles", user.uid, "templates", id);
    setDocumentNonBlocking(docRef, newTemplate, { merge: true });
    setIsTemplateDialogOpen(false);
    toast({ title: "Template Saved" });
  };

  const handleSaveQuote = () => {
    if (!clientId) {
      toast({ title: "Client Required", description: "Please select or add a client first.", variant: "destructive" });
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
          <Card className="border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Configuration</CardTitle>
              <div className="flex gap-2">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                      <LayoutTemplate className="w-3.5 h-3.5" /> Save Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Save Current Scope as Template</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-2">
                      <Label>Template Name</Label>
                      <Input placeholder="e.g. Standard Bathroom Refresh" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />
                    </div>
                    <DialogFooter><Button onClick={handleSaveAsTemplate}>Save Template</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                      <Copy className="w-3.5 h-3.5" /> Load Template
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="end">
                    <div className="p-3 border-b bg-muted/30">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Available Templates</p>
                    </div>
                    <ScrollArea className="h-72">
                      <div className="p-1">
                        {allAvailableTemplates.map(t => (
                          <Button 
                            key={t.id} 
                            variant="ghost" 
                            className="w-full justify-start text-xs h-auto py-2.5 px-3 flex flex-col items-start gap-0.5" 
                            onClick={() => applyTemplate(t)}
                          >
                            <span className="font-bold">{t.name}</span>
                            <span className="text-[9px] opacity-60 uppercase">{t.serviceCategory} {t.isHardCoded ? '(Standard)' : '(Custom)'}</span>
                          </Button>
                        ))}
                        {allAvailableTemplates.length === 0 && (
                          <div className="p-8 text-center text-muted-foreground text-xs">No templates found.</div>
                        )}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Client</Label>
                {selectedClient ? (
                  <div className="flex items-center justify-between p-2 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="truncate">
                      <p className="font-bold text-sm leading-tight">{selectedClient.name}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedClient.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setClientId("")}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                ) : (
                  <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search or select client..." className="pl-9" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-full" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                      <ScrollArea className="max-h-64">
                        <div className="p-1">
                          {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                            <Button key={c.id} variant="ghost" className="w-full justify-start text-sm" onClick={() => { setClientId(c.id); setIsClientPopoverOpen(false); }}>{c.name}</Button>
                          ))}
                          <Button variant="ghost" className="w-full text-primary font-bold justify-start gap-2 border-t mt-1 rounded-none" onClick={() => setIsNewClientDialogOpen(true)}>
                            <UserPlus className="w-4 h-4" /> Add New Client
                          </Button>
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="space-y-2">
                <Label>Service Category</Label>
                <Select value={serviceCategory} onValueChange={setServiceCategory}>
                  <SelectTrigger className="flex items-center gap-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>
                        <div className="flex items-center gap-2">
                          {c}
                          {initialProfile.offeredServices?.includes(c) && (
                            <Star className="w-3 h-3 fill-primary text-primary" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-muted/30 py-3"><CardTitle className="text-sm font-bold uppercase tracking-wider">Scope & Line Items</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="hidden md:grid grid-cols-[1fr_60px_50px_50px_60px_80px_90px_40px] gap-2 px-2 text-[10px] font-bold uppercase text-muted-foreground border-b pb-2">
                  <div>Description</div><div>Unit</div><div>L</div><div>W</div><div>Qty</div><div>Price</div><div className="text-right">Total</div><div></div>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_60px_50px_50px_60px_80px_90px_40px] gap-2 items-center group">
                      <div className="relative">
                        <Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="h-8 text-xs pr-8" placeholder="Service description..." />
                        <Popover open={openLibraryId === item.id} onOpenChange={(open) => setOpenLibraryId(open ? item.id : null)}>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8 text-muted-foreground hover:text-primary">
                              <BookOpen className="w-3.5 h-3.5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0 shadow-xl border-primary/20" side="bottom">
                            <div className="p-2 border-b bg-muted/50"><p className="text-[10px] font-bold uppercase tracking-widest">Item Library</p></div>
                            <ScrollArea className="h-80">
                              <div className="p-1">
                                {organizedLibrary.map(([cat, libItems]) => (
                                  <div key={cat} className="mb-3">
                                    <p className="text-[9px] font-black uppercase text-primary/60 px-2 py-1 bg-primary/5 rounded mb-1">{cat}</p>
                                    {libItems.map(li => (
                                      <Button key={li.id} variant="ghost" className="w-full justify-between text-[11px] h-auto py-1.5 px-2 hover:bg-primary/10" onClick={() => applyLibraryItem(item.id, li)}>
                                        <span className="truncate pr-2">{li.description}</span>
                                        <span className="font-bold shrink-0 opacity-70">${li.defaultUnitPrice}</span>
                                      </Button>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Input value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} className="h-8 text-xs text-center px-1" placeholder="unit" />
                      <Input type="number" value={item.length} onChange={(e) => updateItem(item.id, 'length', e.target.value)} className="h-8 text-xs text-center px-1" placeholder="L" />
                      <Input type="number" value={item.width} onChange={(e) => updateItem(item.id, 'width', e.target.value)} className="h-8 text-xs text-center px-1" placeholder="W" />
                      <Input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} className="h-8 text-xs text-center px-1 font-medium" />
                      <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} className="h-8 text-xs text-center px-1" />
                      <div className="text-right text-xs font-bold px-1">${item.total.toLocaleString()}</div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setItems(items.length > 1 ? items.filter(i => i.id !== item.id) : items)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full border-dashed border-2 h-10 gap-2 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all" onClick={() => setItems([...items, { id: uuidv4(), description: "", unit: "", quantity: 1, length: "", width: "", unitPrice: 0, total: 0 }])}>
                  <Plus className="w-4 h-4" /> Add Line Item
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Work Scope</Label>
                <Textarea value={scopeDescription} onChange={(e) => setScopeDescription(e.target.value)} className="min-h-[180px] text-sm leading-relaxed" placeholder="Describe the project objectives, specific tasks, and any exclusions..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-8 border-primary/30 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Pricing & Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Labor Rate ($/hr)</Label>
                  <Input type="number" value={laborRate} onChange={(e) => setLaborRate(e.target.value)} className="font-bold text-primary" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Labor Hours</Label>
                  <Input type="number" value={laborHours} onChange={(e) => setLaborHours(e.target.value)} className="font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Materials ($)</Label>
                  <Input type="number" value={materialCosts} onChange={(e) => setMaterialCosts(e.target.value)} className="font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Tax Rate (%)</Label>
                  <Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="font-bold" />
                </div>
              </div>
              
              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items & Services</span>
                  <span className="font-medium">${items.reduce((acc, i) => acc + i.total, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labor Subtotal</span>
                  <span className="font-medium">${(Number(laborHours) * Number(laborRate)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                  <span className="font-medium">${totals.taxTotal.toLocaleString()}</span>
                </div>
                
                <div className="pt-4 border-t-2 border-primary/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Total Quote Amount</span>
                    <span className="text-2xl font-black text-primary tracking-tighter">${totals.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full h-14 text-lg font-black gap-2 shadow-lg hover:scale-[1.02] transition-transform active:scale-95" onClick={handleSaveQuote}>
                <Save className="w-5 h-5" /> Save Final Quote
              </Button>
              
              <div className="pt-4 space-y-3">
                <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Internal Notes</Label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Private notes for your business..." 
                  className="text-xs min-h-[80px] bg-muted/20 border-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold">New Client Profile</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="e.g. Jane Smith" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" placeholder="jane@example.com" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!newClientName || !newClientEmail) return;
              const id = uuidv4();
              const newClient = { id, name: newClientName, email: newClientEmail, phone: "", address: "" };
              setClients([...clients, newClient]);
              setClientId(id);
              setIsNewClientDialogOpen(false);
              toast({ title: "Client Pre-selected" });
            }}>Create & Pre-select</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
