
"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Sparkles, Loader2, Save, Search, BookOpen, Copy, UserPlus, Check, LayoutTemplate, ChevronRight, Undo2, X, Star, DollarSign } from "lucide-react";
import { Client, Quote, QuoteItem, BusinessProfile, CommonItem, QuoteTemplate, SERVICE_CATEGORIES } from "@/lib/types";
import { generateScopeDescription } from "@/ai/flows/ai-assisted-scope-description";
import { useToast } from "@/hooks/use-toast";
import { getCommonItems, getTemplates, saveClients, saveTemplates, getDraftQuote, saveDraftQuote, clearDraftQuote, QuoteDraft } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type QuoteBuilderProps = {
  initialClients: Client[];
  initialProfile: BusinessProfile;
  onSave: (quote: Quote) => void;
  preSelectedClientId?: string;
  duplicateSource?: Quote;
};

const SERVICE_SUBCATEGORIES: Record<string, string[]> = {
  "General Contracting": ["Project Management", "Sitework", "Structural Construction", "Building Envelope", "Interior Construction", "Renovation & Expansion"],
  "Electrical": ["Power Distribution", "Wiring & Devices", "Lighting Systems", "Low Voltage Systems", "Specialized Systems", "Controls & Automation", "Maintenance & Testing"],
  "Plumbing": ["Water Supply Systems", "Drainage Systems", "Fixtures & Appliances", "Water Heating", "Gas Systems", "Specialty Systems", "Maintenance & Repair"],
  "HVAC": ["Heating Systems", "Cooling Systems", "Air Distribution", "Controls", "Refrigeration", "Indoor Air Quality", "Maintenance & Service"],
  "Landscaping": ["Site Development", "Softscape", "Hardscape", "Irrigation", "Outdoor Features", "Maintenance"],
  "Painting": ["Interior Painting", "Exterior Painting", "Surface Preparation", "Specialty Painting Services", "Additional Services"],
  "Roofing": ["Roof Systems", "Components", "Drainage", "Installation & Replacement", "Repair & Maintenance", "Inspection"],
  "Carpentry": ["Rough Carpentry", "Finish Carpentry", "Doors & Windows", "Cabinets & Millwork", "Flooring", "Structural & Specialty", "Exterior Carpentry", "Custom Work", "Repair"],
  "Cleaning": ["General Cleaning", "Deep Cleaning", "Floor Care", "Surface Cleaning", "Exterior Cleaning", "Sanitation", "Air Systems", "Waste Services"]
};

const roundToCent = (val: number | string) => Math.round(Number(val) * 100) / 100;

const truncateToTwoDecimals = (value: string) => {
  if (!value) return "";
  const parts = value.split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`;
  }
  return value;
};

export function QuoteBuilder({ initialClients, initialProfile, onSave, preSelectedClientId, duplicateSource }: QuoteBuilderProps) {
  const { toast } = useToast();
  const isInitialMount = useRef(true);
  const deletedStack = useRef<QuoteItem[]>([]);
  
  const getInitialState = useCallback(() => {
    const draft = getDraftQuote();
    const currentTaxRate = initialProfile.defaultTaxRate;
    const currentLaborRate = initialProfile.defaultLaborRate;
    const defaultCategory = initialProfile.offeredServices?.[0] || "General Contracting";

    if (duplicateSource) {
      return {
        clientId: preSelectedClientId || duplicateSource.clientId || "",
        serviceCategory: duplicateSource.serviceCategory || defaultCategory,
        items: duplicateSource.items.map(i => ({ ...i, id: uuidv4() })),
        laborHours: duplicateSource.laborHours || 0,
        laborRate: currentLaborRate,
        materialCosts: duplicateSource.materialCosts || 0,
        taxRate: currentTaxRate,
        notes: duplicateSource.notes || "",
        scopeDescription: duplicateSource.scopeDescription || ""
      };
    }
    
    return {
      clientId: preSelectedClientId || draft?.clientId || "",
      serviceCategory: draft?.serviceCategory || defaultCategory,
      items: draft?.items.map(i => ({ ...i, id: i.id || uuidv4() })) || [{ id: uuidv4(), description: "", unit: "", quantity: 1, unitPrice: 0, total: 0 }],
      laborHours: draft?.laborHours ?? 0,
      laborRate: currentLaborRate,
      materialCosts: draft?.materialCosts ?? 0,
      taxRate: currentTaxRate,
      notes: draft?.notes || "",
      scopeDescription: draft?.scopeDescription || ""
    };
  }, [duplicateSource, initialProfile, preSelectedClientId]);

  const initialState = useMemo(() => getInitialState(), [getInitialState]);

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientId, setClientId] = useState<string>(initialState.clientId);
  const [serviceCategory, setServiceCategory] = useState<string>(initialState.serviceCategory);
  const [items, setItems] = useState<QuoteItem[]>(initialState.items);
  const [laborHours, setLaborHours] = useState<number | string>(initialState.laborHours);
  const [laborRate, setLaborRate] = useState<number | string>(initialState.laborRate);
  const [materialCosts, setMaterialCosts] = useState<number | string>(initialState.materialCosts);
  const [taxRate, setTaxRate] = useState<number | string>(initialState.taxRate);
  const [notes, setNotes] = useState(initialState.notes);
  const [scopeDescription, setScopeDescription] = useState(initialState.scopeDescription);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [commonItems, setCommonItems] = useState<CommonItem[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");

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
      laborHours: Number(laborHours),
      laborRate: Number(laborRate),
      materialCosts: Number(materialCosts),
      taxRate: Number(taxRate),
      notes,
      scopeDescription
    };
    saveDraftQuote(draft);
  }, [clientId, serviceCategory, items, laborHours, laborRate, materialCosts, taxRate, notes, scopeDescription]);

  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return [];
    const term = clientSearch.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  }, [clients, clientSearch]);

  const calculateTotals = useCallback(() => {
    const itemsTotal = items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
    const lh = Number(laborHours) || 0;
    const lr = Number(laborRate) || 0;
    const laborTotal = lh * lr;
    const mc = Number(materialCosts) || 0;
    
    const subtotal = roundToCent(itemsTotal + laborTotal + mc);
    const tr = Number(taxRate) || 0;
    const taxTotal = roundToCent(subtotal * (tr / 100));
    const grandTotal = roundToCent(subtotal + taxTotal);
    
    return { subtotal, taxTotal, grandTotal };
  }, [items, laborHours, laborRate, materialCosts, taxRate]);

  const addItem = () => {
    setItems([...items, { id: uuidv4(), description: "", unit: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const restoreItem = useCallback((item: QuoteItem) => {
    setItems(prev => {
      const isEmptyDefault = prev.length === 1 && !prev[0].description.trim() && !prev[0].unit?.trim() && (!prev[0].unitPrice || prev[0].unitPrice === 0);
      if (isEmptyDefault) return [item];
      return [...prev, item];
    });
  }, []);

  const undoLastDelete = useCallback(() => {
    const lastItem = deletedStack.current.pop();
    if (lastItem) {
      restoreItem(lastItem);
      toast({ title: "Restored", description: `"${lastItem.description || 'Service Item'}" has been restored.` });
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
          <Button variant="outline" size="sm" onClick={() => { restoreItem(itemToRemove); toast({ title: "Restored" }); }}>
            <Undo2 className="w-4 h-4 mr-2" /> Undo
          </Button>
        )
      });
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let finalValue = value;
        if (field === 'quantity' || field === 'unitPrice') {
          finalValue = truncateToTwoDecimals(value.toString());
        }
        const updated = { ...item, [field]: finalValue };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = Number(updated.quantity) || 0;
          const p = Number(updated.unitPrice) || 0;
          updated.total = roundToCent(q * p);
        }
        return updated;
      }
      return item;
    }));
  };

  const selectCommonItem = (id: string, item: CommonItem) => {
    setItems(items.map(i => {
      if (i.id === id) {
        const up = roundToCent(item.defaultUnitPrice || 0);
        const q = Number(i.quantity) || 1;
        return { ...i, description: item.description, unit: item.unit || "", unitPrice: up, total: roundToCent(q * up) };
      }
      return i;
    }));
  };

  const applyTemplate = (template: QuoteTemplate) => {
    setServiceCategory(template.serviceCategory);
    setScopeDescription(template.scopeDescription);
    setItems(template.items.map(i => ({ 
      ...i, 
      id: uuidv4(), 
      total: roundToCent((Number(i.quantity) || 1) * (Number(i.unitPrice) || 0))
    })));
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({ title: "Name Required", description: "Please give your template a name.", variant: "destructive" });
      return;
    }
    const validItems = items.filter(item => item.description.trim() !== "");
    if (validItems.length === 0) {
      toast({ title: "Template Required Items", description: "A template must have at least one line item with a description.", variant: "destructive" });
      return;
    }
    const newTemplate: QuoteTemplate = {
      id: uuidv4(),
      name: newTemplateName,
      serviceCategory,
      items: validItems.map(({ id, ...rest }) => ({
        ...rest,
        quantity: roundToCent(rest.quantity),
        unitPrice: roundToCent(rest.unitPrice),
        total: roundToCent(Number(rest.quantity) * Number(rest.unitPrice))
      })),
      scopeDescription
    };
    const updated = [...templates, newTemplate];
    saveTemplates(updated);
    setTemplates(updated);
    setIsTemplateDialogOpen(false);
    setNewTemplateName("");
    toast({ title: "Template Saved" });
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
    const newClient: Client = { id: uuidv4(), name: newClientName, email: newClientEmail, phone: newClientPhone, address: newClientAddress };
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
    toast({ title: "Client Added" });
  };

  const handleGenerateScope = async () => {
    const activeItems = items.filter(i => i.description.trim() !== "");
    
    if (!scopeDescription.trim() && activeItems.length === 0) {
      toast({ 
        title: "Information Needed", 
        description: "Please add some line items or a brief context first so the AI knows what to generate.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateScopeDescription({ 
        briefInput: scopeDescription, 
        serviceType: serviceCategory, 
        businessName: initialProfile.businessName,
        lineItems: activeItems.map(i => `${i.description}${i.unit ? ` (${i.unit})` : ""}`)
      });
      setScopeDescription(result.generatedDescription);
      toast({ title: "Scope Generated", description: "Professional work scope has been created." });
    } catch (err) {
      toast({ title: "Generation Failed", description: "Could not connect to the AI service. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const totals = calculateTotals();

  const handleSave = () => {
    if (!clientId) {
      toast({ title: "Client Required", description: "Please select a client before saving.", variant: "destructive" });
      return;
    }
    const finalItems = items.filter(item => !(!item.description.trim() && !item.unit?.trim() && (!item.unitPrice || Number(item.unitPrice) === 0)))
      .map(item => ({ ...item, quantity: roundToCent(item.quantity), unitPrice: roundToCent(item.unitPrice), total: roundToCent(Number(item.quantity) * Number(item.unitPrice)) }));
    
    for (const item of finalItems) {
      if (!item.description.trim()) {
        toast({ title: "Description Required", description: "All line items must have a description.", variant: "destructive" });
        return;
      }
    }
    if (finalItems.length === 0) {
      toast({ title: "No Items", description: "Please add at least one line item.", variant: "destructive" });
      return;
    }
    const newQuote: Quote = {
      id: uuidv4(), clientId, date: new Date().toISOString(), status: 'draft', serviceCategory, items: finalItems,
      scopeDescription, laborHours: roundToCent(laborHours), laborRate: roundToCent(laborRate), materialCosts: roundToCent(materialCosts),
      taxRate: Number(taxRate) || 0, taxTotal: totals.taxTotal, subtotal: totals.subtotal, grandTotal: totals.grandTotal, notes,
    };
    clearDraftQuote();
    onSave(newQuote);
  };

  const filteredTemplates = useMemo(() => {
    const search = templateSearch.toLowerCase();
    return templates.filter(t => 
      t.name.toLowerCase().includes(search) || 
      t.serviceCategory.toLowerCase().includes(search) ||
      t.items.some(item => item.description.toLowerCase().includes(search))
    );
  }, [templates, templateSearch]);

  const organizedCommonItems = useMemo(() => {
    const categories: Record<string, CommonItem[]> = {};
    commonItems.forEach(item => {
      const cat = item.category || "General";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });

    const result: { category: string; items: CommonItem[]; isOffered: boolean }[] = [];
    const offered = initialProfile?.offeredServices || [];
    const sortedCategories = [...SERVICE_CATEGORIES].sort((a, b) => {
      const aIsOffered = offered.includes(a);
      const bIsOffered = offered.includes(b);
      if (aIsOffered && !bIsOffered) return -1;
      if (!aIsOffered && bIsOffered) return 1;
      return 0;
    });

    sortedCategories.forEach(mainCat => {
      const isOffered = offered.includes(mainCat);
      if (SERVICE_SUBCATEGORIES[mainCat]) {
        SERVICE_SUBCATEGORIES[mainCat].forEach(sub => {
          const fullCatName = `${mainCat} - ${sub}`;
          if (categories[fullCatName]) {
            result.push({ category: fullCatName, items: categories[fullCatName], isOffered });
          }
        });
      } else {
        if (categories[mainCat]) {
          result.push({ category: mainCat, items: categories[mainCat], isOffered });
        }
      }
    });

    return result;
  }, [commonItems, initialProfile]);

  const sortedCategories = useMemo(() => {
    const offered = initialProfile?.offeredServices || [];
    return [...SERVICE_CATEGORIES].sort((a, b) => {
      const aIsOffered = offered.includes(a);
      const bIsOffered = offered.includes(b);
      if (aIsOffered && !bIsOffered) return -1;
      if (!aIsOffered && bIsOffered) return 1;
      return 0;
    });
  }, [initialProfile]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-primary/10 overflow-visible">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 px-4 sm:px-6">
              <CardTitle className="text-xl">Quote Configuration</CardTitle>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-secondary/30 flex-1 sm:flex-none h-10 sm:h-9">
                      <LayoutTemplate className="w-4 h-4" /> <span className="hidden xs:inline">Save Template</span><span className="xs:hidden">Save</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
                    <DialogHeader><DialogTitle>Save as Reusable Template</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input placeholder="e.g. Standard 3-Room Interior Paint" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveAsTemplate}>Save Template</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Popover onOpenChange={(open) => !open && setTemplateSearch("")}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-secondary/30 flex-1 sm:flex-none h-10 sm:h-9">
                      <Copy className="w-4 h-4" /> <span className="hidden xs:inline">Load Template</span><span className="xs:hidden">Load</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0" align="end">
                    <div className="flex flex-col">
                      <div className="p-3 border-b bg-muted/20">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input 
                            placeholder="Search name, category, or items..." 
                            className="pl-8 h-8 text-xs bg-background" 
                            value={templateSearch} 
                            onChange={(e) => setTemplateSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-64">
                        <div className="p-2 space-y-1">
                          {filteredTemplates.map(t => (
                            <Button key={t.id} variant="ghost" className="w-full justify-start text-sm py-2 h-auto rounded-md" onClick={() => applyTemplate(t)}>
                              <div className="text-left overflow-hidden">
                                <div className="font-medium truncate">{t.name}</div>
                                <div className="text-[10px] opacity-60 uppercase font-bold tracking-tight">{t.serviceCategory}</div>
                              </div>
                            </Button>
                          ))}
                          {filteredTemplates.length === 0 && (
                            <p className="text-xs text-center py-8 text-muted-foreground">
                              {templates.length === 0 ? "No templates saved." : "No matches found."}
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end overflow-visible">
                <div className="space-y-2 relative">
                  <Label>Client Selection</Label>
                  {selectedClient ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5 min-h-[44px]">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {selectedClient.name.charAt(0)}
                        </div>
                        <div className="flex flex-col leading-tight overflow-hidden">
                          <span className="text-sm font-semibold truncate">{selectedClient.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{selectedClient.email}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:text-destructive shrink-0 ml-2"
                        onClick={() => setClientId("")}
                      >
                        <X className="w-3 h-3 mr-1" /> Change
                      </Button>
                    </div>
                  ) : (
                    <Popover open={isClientPopoverOpen && (filteredClients.length > 0 || clientSearch.length > 0)} onOpenChange={setIsClientPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative group w-full">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                          <Input 
                            placeholder="Search by name, email..." 
                            className="pl-9 h-11 border-primary/20 bg-muted/20 focus:bg-background transition-all" 
                            value={clientSearch} 
                            onChange={(e) => { 
                              setClientSearch(e.target.value); 
                              if (!isClientPopoverOpen) setIsClientPopoverOpen(true); 
                            }} 
                            onFocus={() => { 
                              if (!isClientPopoverOpen) setIsClientPopoverOpen(true); 
                            }} 
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 border shadow-xl bg-popover" align="start" sideOffset={4} style={{ width: 'var(--radix-popover-trigger-width)' }} onOpenAutoFocus={(e) => e.preventDefault()}>
                        <ScrollArea className="max-h-[300px]">
                          <div className="p-2 border-b bg-muted/30"><p className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-widest">Client Results</p></div>
                          {filteredClients.length > 0 ? (
                            filteredClients.map((c) => (
                              <Button key={c.id} variant="ghost" className={cn("w-full justify-start rounded-none px-4 py-3 h-auto border-b last:border-0", clientId === c.id && "bg-primary/5")} onClick={() => { setClientId(c.id); setClientSearch(""); setIsClientPopoverOpen(false); }}>
                                <div className="flex flex-col items-start w-full gap-0.5">
                                  <div className="flex items-center justify-between w-full text-left">
                                    <span className="font-semibold text-sm">{c.name}</span>
                                    {clientId === c.id && <Check className="h-4 w-4 text-primary" />}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground font-medium">{c.email}</span>
                                </div>
                              </Button>
                            ))
                          ) : null}
                          <div className="p-2">
                            <Button variant="ghost" className="w-full justify-start text-primary h-auto py-2 px-2 text-xs gap-2" onClick={handleOpenNewClientDialog}>
                              <UserPlus className="h-3.5 w-3.5" /> {filteredClients.length === 0 && clientSearch ? `Add "${clientSearch}" as new client` : "Create new client"}
                            </Button>
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select onValueChange={setServiceCategory} value={serviceCategory}>
                    <SelectTrigger className="h-11 border-primary/20"><SelectValue placeholder="Select service type..." /></SelectTrigger>
                    <SelectContent>
                      {sortedCategories.map(cat => {
                        const isOffered = initialProfile?.offeredServices?.includes(cat);
                        return (
                          <SelectItem key={cat} value={cat}>
                            <div className="flex items-center gap-2">
                              {cat}
                              {isOffered && <Star className="w-3 h-3 fill-primary text-primary" />}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
            <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl">
              <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
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

          <Card className="shadow-sm border-primary/10 overflow-hidden">
            <CardHeader className="border-b bg-muted/20 py-4 px-4 sm:px-6"><CardTitle className="text-xl">Work Scope & Line Items</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 sm:px-6">
              <div className="space-y-4">
                {/* Header for Tablet/Desktop */}
                <div className="hidden md:grid grid-cols-[1fr_80px_90px_100px_100px_40px] gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">
                  <div>Item Description</div><div>Unit</div><div className="pl-2">Qty</div><div className="pl-2">Price ($)</div><div className="text-right">Total</div><div></div>
                </div>
                
                <div className="space-y-4 md:space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_80px_90px_100px_100px_40px] gap-3 md:gap-4 items-start md:items-center group relative border p-4 rounded-xl md:border-none md:p-0 bg-muted/5 md:bg-transparent shadow-sm md:shadow-none">
                      {/* Mobile Labels (Hidden on MD) */}
                      <div className="md:hidden flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Line Item</span>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>

                      {/* Description Field */}
                      <div className="relative">
                        <Input value={item.description || ""} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Item description..." className="pr-10 h-10 md:h-9 text-sm rounded-lg" />
                        <Popover>
                          <PopoverTrigger asChild><Button variant="ghost" size="icon" className="absolute right-1 top-1.5 md:top-1 h-7 w-7 text-muted-foreground hover:text-primary"><BookOpen className="w-3.5 h-3.5" /></Button></PopoverTrigger>
                          <PopoverContent className="w-80 p-2" align="start">
                            <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase border-b mb-1">Service Library</p>
                            <ScrollArea className="h-72">
                              {organizedCommonItems.map(({ category, items: libItems, isOffered }) => (
                                <div key={category} className="mb-4 last:mb-0 px-1">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <ChevronRight className="w-2.5 h-2.5 text-primary/40" />
                                    <p className="text-[9px] font-black uppercase text-primary/70">{category}</p>
                                    {isOffered && <Badge variant="secondary" className="px-1 py-0 h-3 text-[7px] bg-primary/10 text-primary border-none"><Star className="w-2 h-2 fill-primary mr-0.5" /> PINNED</Badge>}
                                  </div>
                                  <div className="space-y-0.5">
                                    {libItems.map(ci => (
                                      <Button key={ci.id} variant="ghost" className="w-full justify-start text-xs py-1.5 h-auto px-2 hover:bg-muted" onClick={() => selectCommonItem(item.id, ci)}>
                                        <div className="text-left w-full flex justify-between items-center gap-2"><span className="font-medium truncate">{ci.description}</span><span className="text-[10px] font-mono shrink-0 opacity-60">${ci.defaultUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Numeric Fields (Stacked on Mobile) */}
                      <div className="grid grid-cols-2 md:contents gap-4 md:gap-4">
                        <div className="space-y-1.5 md:space-y-0">
                          <Label className="md:hidden text-[9px] uppercase font-bold text-muted-foreground">Unit</Label>
                          <Input value={item.unit || ""} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} placeholder="unit" className="h-10 md:h-9 text-sm rounded-lg" />
                        </div>
                        <div className="space-y-1.5 md:space-y-0">
                          <Label className="md:hidden text-[9px] uppercase font-bold text-muted-foreground">Qty</Label>
                          <Input type="number" step="1.0" className="h-10 md:h-9 text-sm px-2 rounded-lg" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                        </div>
                        <div className="space-y-1.5 md:space-y-0">
                          <Label className="md:hidden text-[9px] uppercase font-bold text-muted-foreground">Price ($)</Label>
                          <Input type="number" step="1.0" className="h-10 md:h-9 text-sm px-2 rounded-lg" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} />
                        </div>
                        <div className="flex flex-col md:block items-end justify-center bg-primary/5 md:bg-transparent p-2 md:p-0 rounded-lg">
                          <Label className="md:hidden text-[9px] uppercase font-bold text-primary mb-1">Total</Label>
                          <div className="text-right font-black md:font-medium text-sm text-primary md:text-foreground overflow-hidden text-ellipsis">${(Number(item.total) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      </div>

                      <Button variant="ghost" size="icon" className="hidden md:flex text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex justify-start border-t">
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary gap-2 h-12 sm:h-10 px-4 font-bold hover:bg-primary/5 w-full md:w-auto rounded-xl sm:rounded-md"><Plus className="w-5 h-5 sm:w-4 sm:h-4" /> Add Another Item</Button>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Detailed Work Scope (AI Assisted)</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary gap-2 h-10 sm:h-8 px-3 w-full sm:w-auto justify-center bg-primary/5 sm:bg-transparent rounded-xl sm:rounded-md" 
                    onClick={handleGenerateScope} 
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />} 
                    Generate Professional Scope
                  </Button>
                </div>
                <Textarea value={scopeDescription} onChange={(e) => setScopeDescription(e.target.value)} placeholder={`Briefly describe the ${serviceCategory.toLowerCase()} work, or leave blank to generate from line items...`} className="min-h-[180px] text-sm leading-relaxed rounded-xl p-4" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20 sticky top-4 sm:top-8 overflow-hidden rounded-2xl">
            <CardHeader className="bg-primary/5 py-4 px-4 sm:px-6"><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Pricing & Totals</CardTitle></CardHeader>
            <CardContent className="space-y-6 pt-6 px-4 sm:px-6">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Labor Rate ($/hr)</Label><Input type="number" step="1.0" className="h-10 px-3 rounded-lg" value={laborRate} onChange={(e) => setLaborRate(truncateToTwoDecimals(e.target.value))} /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Labor Hours</Label><Input type="number" step="1.0" className="h-10 px-3 rounded-lg" value={laborHours} onChange={(e) => setLaborHours(truncateToTwoDecimals(e.target.value))} /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Materials ($)</Label><Input type="number" step="1.0" className="h-10 px-3 rounded-lg" value={materialCosts} onChange={(e) => setMaterialCosts(truncateToTwoDecimals(e.target.value))} /></div>
                <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Tax Rate (%)</Label><Input type="number" step="1.0" className="h-10 px-3 rounded-lg" value={taxRate} onChange={(e) => setTaxRate(truncateToTwoDecimals(e.target.value))} /></div>
              </div>
              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-bold">${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20"><span className="text-sm font-black uppercase tracking-widest text-primary">Grand Total</span><span className="text-2xl sm:text-3xl font-black text-primary overflow-hidden text-ellipsis">${totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              </div>
              <Button className="w-full gap-2 shadow-xl h-14 sm:h-12 text-lg sm:text-base font-black rounded-xl sm:rounded-lg" size="lg" onClick={handleSave}><Save className="w-5 h-5" /> Save Quote</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
