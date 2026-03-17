"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Sparkles, Loader2, Save, Search, BookOpen, Copy, UserPlus, Check, LayoutTemplate, ChevronRight, Undo2, X } from "lucide-react";
import { Client, Quote, QuoteItem, BusinessProfile, CommonItem, QuoteTemplate } from "@/lib/types";
import { generateScopeDescription } from "@/ai/flows/ai-assisted-scope-description";
import { useToast } from "@/hooks/use-toast";
import { getCommonItems, getTemplates, saveClients, saveTemplates, getDraftQuote, saveDraftQuote, clearDraftQuote, QuoteDraft } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type QuoteBuilderProps = {
  initialClients: Client[];
  initialProfile: BusinessProfile;
  onSave: (quote: Quote) => void;
  preSelectedClientId?: string;
  duplicateSource?: Quote;
};

const SERVICE_CATEGORIES = [
  "General Contracting",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Landscaping",
  "Painting",
  "Roofing",
  "Carpentry",
  "Cleaning",
  "Other"
];

export function QuoteBuilder({ initialClients, initialProfile, onSave, preSelectedClientId, duplicateSource }: QuoteBuilderProps) {
  const { toast } = useToast();
  const isInitialMount = useRef(true);
  const deletedStack = useRef<QuoteItem[]>([]);
  
  const getInitialState = useCallback(() => {
    const draft = getDraftQuote();
    
    if (duplicateSource) {
      return {
        clientId: preSelectedClientId || duplicateSource.clientId || "",
        serviceCategory: duplicateSource.serviceCategory || "General Contracting",
        items: duplicateSource.items.map(i => ({ ...i, id: uuidv4() })),
        laborHours: duplicateSource.laborHours || 0,
        laborRate: duplicateSource.laborRate || initialProfile.defaultLaborRate,
        materialCosts: duplicateSource.materialCosts || 0,
        taxRate: duplicateSource.taxRate || initialProfile.defaultTaxRate,
        notes: duplicateSource.notes || "",
        scopeDescription: duplicateSource.scopeDescription || ""
      };
    }
    
    if (draft) {
      return {
        ...draft,
        clientId: preSelectedClientId || draft.clientId || "",
        items: draft.items.map(i => ({ ...i, id: i.id || uuidv4() }))
      };
    }
    
    return {
      clientId: preSelectedClientId || "",
      serviceCategory: "General Contracting",
      items: [{ id: uuidv4(), description: "", unit: "", quantity: 1, unitPrice: 0, total: 0 }],
      laborHours: 0,
      laborRate: initialProfile.defaultLaborRate,
      materialCosts: 0,
      taxRate: initialProfile.defaultTaxRate,
      notes: "",
      scopeDescription: ""
    };
  }, [duplicateSource, initialProfile, preSelectedClientId]);

  const initialState = useMemo(() => getInitialState(), [getInitialState]);

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientId, setClientId] = useState<string>(initialState.clientId);
  const [serviceCategory, setServiceCategory] = useState<string>(initialState.serviceCategory);
  const [items, setItems] = useState<QuoteItem[]>(initialState.items);
  const [laborHours, setLaborHours] = useState<number>(initialState.laborHours);
  const [laborRate, setLaborRate] = useState<number>(initialState.laborRate);
  const [materialCosts, setMaterialCosts] = useState<number>(initialState.materialCosts);
  const [taxRate, setTaxRate] = useState<number>(initialState.taxRate);
  const [notes, setNotes] = useState(initialState.notes);
  const [scopeDescription, setScopeDescription] = useState(initialState.scopeDescription);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [commonItems, setCommonItems] = useState<CommonItem[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);

  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");

  useEffect(() => {
    setCommonItems(getCommonItems());
    setTemplates(getTemplates());
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const draft: QuoteDraft = {
      clientId,
      serviceCategory,
      items,
      laborHours,
      laborRate,
      materialCosts,
      taxRate,
      notes,
      scopeDescription
    };
    saveDraftQuote(draft);
  }, [clientId, serviceCategory, items, laborHours, laborRate, materialCosts, taxRate, notes, scopeDescription]);

  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return [];
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch]);

  const calculateTotals = useCallback(() => {
    const itemsTotal = items.reduce((acc, item) => acc + (item.total || 0), 0);
    const laborTotal = (laborHours || 0) * (laborRate || 0);
    const subtotal = itemsTotal + laborTotal + (materialCosts || 0);
    const taxTotal = (subtotal * (taxRate || 0)) / 100;
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  }, [items, laborHours, laborRate, materialCosts, taxRate]);

  const addItem = () => {
    setItems([...items, { id: uuidv4(), description: "", unit: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const restoreItem = useCallback((item: QuoteItem) => {
    setItems(prev => {
      if (prev.length === 1 && !prev[0].description.trim() && !prev[0].unit?.trim() && (!prev[0].unitPrice || prev[0].unitPrice === 0)) {
        return [item];
      }
      return [...prev, item];
    });
    deletedStack.current = deletedStack.current.filter(i => i.id !== item.id);
  }, []);

  const undoLastDelete = useCallback(() => {
    const lastItem = deletedStack.current.pop();
    if (lastItem) {
      restoreItem(lastItem);
      toast({ 
        title: "Restored", 
        description: `"${lastItem.description || 'Service Item'}" has been restored.` 
      });
    }
  }, [restoreItem, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        const activeElement = document.activeElement;
        const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        if (!isInput) {
          e.preventDefault();
          undoLastDelete();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoLastDelete]);

  const removeItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (!itemToRemove) return;

    const isEmpty = !itemToRemove.description.trim() && !itemToRemove.unit?.trim() && (!itemToRemove.unitPrice || itemToRemove.unitPrice === 0);

    if (items.length === 1) {
      setItems([{ id: uuidv4(), description: "", unit: "", quantity: 1, unitPrice: 0, total: 0 }]);
    } else {
      setItems(items.filter(item => item.id !== id));
    }

    if (!isEmpty) {
      deletedStack.current.push(itemToRemove);
      toast({
        title: "Item Removed",
        description: `"${itemToRemove.description || 'Service Item'}" has been removed.`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              restoreItem(itemToRemove);
              toast({ title: "Restored", description: "The item has been restored." });
            }}
          >
            <Undo2 className="w-4 h-4 mr-2" /> Undo
          </Button>
        )
      });
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const selectCommonItem = (id: string, item: CommonItem) => {
    setItems(items.map(i => {
        if (i.id === id) {
            const up = item.defaultUnitPrice || 0;
            const q = i.quantity || 1;
            return {
                ...i,
                description: item.description,
                unit: item.unit || "",
                unitPrice: up,
                total: q * up,
                isHardCoded: true
            };
        }
        return i;
    }));
  };

  const applyTemplate = (template: QuoteTemplate) => {
    setServiceCategory(template.serviceCategory);
    setScopeDescription(template.scopeDescription);
    setItems(template.items.map(i => ({ ...i, id: uuidv4(), isHardCoded: false })));
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({ title: "Name Required", description: "Please give your template a name.", variant: "destructive" });
      return;
    }
    const newTemplate: QuoteTemplate = {
      id: uuidv4(),
      name: newTemplateName,
      serviceCategory,
      items: items.map(({ id, ...rest }) => rest),
      scopeDescription
    };
    const updated = [...templates, newTemplate];
    saveTemplates(updated);
    setTemplates(updated);
    setIsTemplateDialogOpen(false);
    setNewTemplateName("");
    toast({ title: "Template Saved", description: `"${newTemplate.name}" is now in your library.` });
  };

  const handleOpenNewClientDialog = () => {
    setNewClientName(clientSearch);
    setIsNewClientDialogOpen(true);
    setIsClientPopoverOpen(false);
  };

  const handleSaveNewClient = () => {
    if (!newClientName || !newClientEmail) {
      toast({ title: "Required Fields", description: "Name and Email are required.", variant: "destructive" });
      return;
    }

    const newClient: Client = {
      id: uuidv4(),
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      address: newClientAddress
    };

    const updated = [...clients, newClient];
    saveClients(updated);
    setClients(updated);
    setClientId(newClient.id);
    setIsNewClientDialogOpen(false);
    setClientSearch("");
    
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientAddress("");

    toast({ title: "Client Added", description: `${newClient.name} is now in your directory.` });
  };

  const handleGenerateScope = async () => {
    if (!scopeDescription.trim()) {
      toast({ title: "Input Required", description: "Please enter some basic bullet points first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateScopeDescription({
        briefInput: scopeDescription,
        serviceType: serviceCategory,
        businessName: initialProfile.businessName
      });
      setScopeDescription(result.generatedDescription);
      toast({ title: "Scope Generated" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate AI description.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const totals = calculateTotals();

  const handleSave = () => {
    if (!clientId) {
      toast({ title: "Client Required", description: "Please select a client for this quote.", variant: "destructive" });
      return;
    }

    const filteredItems = items.filter(item => {
      if (item.isHardCoded) return true;
      const isEmpty = !item.description.trim() && !item.unit?.trim() && (!item.unitPrice || item.unitPrice === 0);
      return !isEmpty;
    });

    for (const item of filteredItems) {
      if (!item.description.trim()) {
        toast({ title: "Description Required", description: "All service items must have a description.", variant: "destructive" });
        return;
      }
      if (!item.isHardCoded && (!item.unitPrice || item.unitPrice < 0)) {
        toast({ title: "Price Error", description: `"${item.description}" requires a valid price.`, variant: "destructive" });
        return;
      }
    }

    if (filteredItems.length === 0) {
      toast({ title: "No Items", description: "Please add at least one valid service item.", variant: "destructive" });
      return;
    }

    const newQuote: Quote = {
      id: uuidv4(),
      clientId,
      date: new Date().toISOString(),
      status: 'draft',
      serviceCategory,
      items: filteredItems,
      scopeDescription,
      laborHours: laborHours || 0,
      laborRate: laborRate || 0,
      materialCosts: materialCosts || 0,
      taxRate: taxRate || 0,
      taxTotal: totals.taxTotal,
      subtotal: totals.subtotal,
      grandTotal: totals.grandTotal,
      notes,
    };
    
    clearDraftQuote();
    onSave(newQuote);
  };

  const commonItemsByCategory = useMemo(() => {
    const categories: Record<string, CommonItem[]> = {};
    commonItems.forEach(item => {
      const cat = item.category || "General";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });
    return categories;
  }, [commonItems]);

  const PAINTING_SUBCATEGORIES = [
    "Painting - Interior Painting",
    "Painting - Exterior Painting",
    "Painting - Surface Preparation",
    "Painting - Specialty Painting Services",
    "Painting - Additional Services"
  ];

  const organizedCommonItems = useMemo(() => {
    const mainCategories = SERVICE_CATEGORIES.filter(c => c !== "Painting");
    const result: { category: string; items: CommonItem[] }[] = [];

    mainCategories.forEach(cat => {
      if (commonItemsByCategory[cat]) {
        result.push({ category: cat, items: commonItemsByCategory[cat] });
      }
    });

    PAINTING_SUBCATEGORIES.forEach(sub => {
      if (commonItemsByCategory[sub]) {
        result.push({ category: sub, items: commonItemsByCategory[sub] });
      }
    });

    return result;
  }, [commonItemsByCategory]);

  return (
    <div className="space-y-8 pb-12">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-primary/10 overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl">Quote Configuration</CardTitle>
              <div className="flex gap-2">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-secondary/30">
                      <LayoutTemplate className="w-4 h-4" /> Save Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save as Reusable Template</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input 
                          placeholder="e.g. Standard 3-Room Interior Paint" 
                          value={newTemplateName} 
                          onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveAsTemplate}>Save Template</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-secondary/30">
                      <Copy className="w-4 h-4" /> Load Template
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-tight">Saved Templates</p>
                      <ScrollArea className="h-64">
                        {templates.map(t => (
                          <Button key={t.id} variant="ghost" className="w-full justify-start text-sm py-2 h-auto" onClick={() => applyTemplate(t)}>
                            <div className="text-left">
                              <div className="font-medium">{t.name}</div>
                              <div className="text-[10px] opacity-60">{t.serviceCategory}</div>
                            </div>
                          </Button>
                        ))}
                      </ScrollArea>
                      {templates.length === 0 && <p className="text-xs text-center py-4 text-muted-foreground">No templates found.</p>}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end overflow-visible">
                <div className="space-y-2 relative">
                  <Label>Client Search & Selection</Label>
                  <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
                    <div className="relative group">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                      <Input
                        placeholder="Search clients..."
                        className="pl-9 h-11 border-primary/20 bg-muted/20 focus:bg-background transition-all"
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          if (e.target.value.trim().length > 0) {
                            setIsClientPopoverOpen(true);
                          }
                        }}
                        onFocus={() => {
                          if (clientSearch.trim().length > 0) {
                            setIsClientPopoverOpen(true);
                          }
                        }}
                      />
                      {selectedClient && (
                        <div className="absolute right-3 top-2.5 flex items-center gap-2 bg-primary/10 px-2 py-1 rounded text-xs font-medium text-primary">
                          <span className="truncate max-w-[120px]">{selectedClient.name}</span>
                          <X className="w-3 h-3 cursor-pointer hover:text-primary/70" onClick={() => { setClientId(""); setClientSearch(""); }} />
                        </div>
                      )}
                    </div>
                    <PopoverTrigger className="hidden" />
                    <PopoverContent 
                      className="w-[var(--radix-popover-trigger-width)] p-0" 
                      align="start"
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <ScrollArea className="max-h-[300px]">
                        <div className="p-2 border-b bg-muted/30">
                          <p className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-widest">Results</p>
                        </div>
                        {filteredClients.map((c) => (
                          <Button
                            key={c.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start rounded-none px-4 py-3 h-auto border-b last:border-0",
                              clientId === c.id && "bg-primary/5"
                            )}
                            onClick={() => {
                              setClientId(c.id);
                              setClientSearch("");
                              setIsClientPopoverOpen(false);
                            }}
                          >
                            <div className="flex flex-col items-start w-full gap-0.5">
                              <div className="flex items-center justify-between w-full">
                                <span className="font-semibold text-sm">{c.name}</span>
                                {clientId === c.id && <Check className="h-4 w-4 text-primary" />}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium">{c.email}</span>
                            </div>
                          </Button>
                        ))}
                        <div className="p-2">
                          <Button variant="ghost" className="w-full justify-start text-primary h-auto py-2 px-2 text-xs gap-2" onClick={handleOpenNewClientDialog}>
                            <UserPlus className="h-3.5 w-3.5" /> 
                            {filteredClients.length === 0 ? "No results. Create new client" : "Not seeing them? Create new"}
                          </Button>
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select onValueChange={setServiceCategory} value={serviceCategory}>
                    <SelectTrigger className="h-11 border-primary/20">
                      <SelectValue placeholder="Select service type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Full Name *</Label>
                  <Input id="new-name" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email Address *</Label>
                  <Input id="new-email" type="email" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="e.g. john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-phone">Phone Number</Label>
                  <Input id="new-phone" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="e.g. 555-0101" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-address">Address</Label>
                  <Input id="new-address" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} placeholder="e.g. 123 Main St" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveNewClient}>Save & Select Client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card className="shadow-sm border-primary/10">
            <CardHeader className="border-b bg-muted/20 py-4">
              <CardTitle className="text-xl">Work Scope & Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_80px_80px_120px_100px_40px] gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">
                  <div>Item Description</div>
                  <div>Unit</div>
                  <div>Qty</div>
                  <div>Price ($)</div>
                  <div className="text-right">Total</div>
                  <div></div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_80px_80px_120px_100px_40px] gap-4 items-center group">
                      <div className="relative">
                        <Input 
                          value={item.description || ""} 
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                          placeholder="New item..." 
                          className="pr-8 h-9 text-sm"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-primary">
                              <BookOpen className="w-3.5 h-3.5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-2" align="start">
                            <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase border-b mb-1">Service Library</p>
                            <ScrollArea className="h-72">
                              {organizedCommonItems.map(({ category, items: libItems }) => (
                                <div key={category} className="mb-4 last:mb-0 px-1">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <ChevronRight className="w-2.5 h-2.5 text-primary/40" />
                                    <p className="text-[9px] font-black uppercase text-primary/70">{category}</p>
                                  </div>
                                  <div className="space-y-0.5">
                                    {libItems.map(ci => (
                                      <Button 
                                        key={ci.id} 
                                        variant="ghost" 
                                        className="w-full justify-start text-xs py-1.5 h-auto px-2 hover:bg-muted" 
                                        onClick={() => selectCommonItem(item.id, ci)}
                                      >
                                        <div className="text-left w-full flex justify-between items-center gap-2">
                                          <span className="font-medium truncate">{ci.description}</span>
                                          <span className="text-[10px] font-mono shrink-0 opacity-60">${ci.defaultUnitPrice}</span>
                                        </div>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Input value={item.unit || ""} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} placeholder="unit" className="h-9 text-sm" />
                      </div>
                      <div>
                        <Input type="number" className="h-9 text-sm" value={item.quantity || ""} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} />
                      </div>
                      <div>
                        <Input type="number" className="h-9 text-sm" value={item.unitPrice || ""} onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                      </div>
                      <div className="text-right font-medium text-sm">
                        ${(item.total || 0).toLocaleString()}
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 flex justify-start border-t">
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary gap-2 h-8 px-2 font-bold hover:bg-primary/5">
                    <Plus className="w-4 h-4" /> Add Another Item
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Detailed Work Scope (AI Assisted)</Label>
                  <Button variant="ghost" size="sm" className="text-primary gap-2 h-8 px-2" onClick={handleGenerateScope} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
                    Generate Professional Scope
                  </Button>
                </div>
                <Textarea 
                  value={scopeDescription} 
                  onChange={(e) => setScopeDescription(e.target.value)} 
                  placeholder={`Briefly describe the ${serviceCategory.toLowerCase()} work...`}
                  className="min-h-[150px] text-sm leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20 sticky top-8">
            <CardHeader className="bg-primary/5 py-4">
              <CardTitle className="text-lg">Pricing & Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Labor Rate ($/hr)</Label>
                  <Input type="number" className="h-10" value={laborRate || ""} onChange={(e) => setLaborRate(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Estimated Labor Hours</Label>
                  <Input type="number" className="h-10" value={laborHours || ""} onChange={(e) => setLaborHours(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Material/Equipment Costs ($)</Label>
                  <Input type="number" className="h-10" value={materialCosts || ""} onChange={(e) => setMaterialCosts(Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">${totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tax ({taxRate}%)</span>
                  <span>${totals.taxTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20">
                  <span className="text-sm font-black uppercase tracking-widest text-primary">Grand Total</span>
                  <span className="text-3xl font-black text-primary">${totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Button className="w-full gap-2 shadow-xl h-14 text-lg font-bold" size="lg" onClick={handleSave}>
                <Save className="w-5 h-5" />
                Preview & Save Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}