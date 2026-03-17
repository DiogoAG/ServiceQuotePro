
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Sparkles, Loader2, Save, Search, BookOpen, Copy, UserPlus, Check, ChevronsUpDown, LayoutTemplate } from "lucide-react";
import { Client, Quote, QuoteItem, BusinessProfile, CommonItem, QuoteTemplate } from "@/lib/types";
import { generateScopeDescription } from "@/ai/flows/ai-assisted-scope-description";
import { useToast } from "@/hooks/use-toast";
import { getCommonItems, getTemplates, saveClients, saveTemplates } from "@/lib/store";
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
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientId, setClientId] = useState<string>(preSelectedClientId || duplicateSource?.clientId || "");
  const [serviceCategory, setServiceCategory] = useState<string>(duplicateSource?.serviceCategory || "General Contracting");
  const [items, setItems] = useState<QuoteItem[]>(duplicateSource?.items.map(i => ({...i, id: uuidv4()})) || [{ id: uuidv4(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [laborHours, setLaborHours] = useState<number>(duplicateSource?.laborHours || 0);
  const [laborRate, setLaborRate] = useState<number>(duplicateSource?.laborRate || initialProfile.defaultLaborRate);
  const [materialCosts, setMaterialCosts] = useState<number>(duplicateSource?.materialCosts || 0);
  const [taxRate, setTaxRate] = useState<number>(duplicateSource?.taxRate || initialProfile.defaultTaxRate);
  const [notes, setNotes] = useState(duplicateSource?.notes || "");
  const [scopeDescription, setScopeDescription] = useState(duplicateSource?.scopeDescription || "");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Template Creation State
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  // Client Search/Select State
  const [isClientPopoverOpen, setIsClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const [commonItems, setCommonItems] = useState<CommonItem[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);

  useEffect(() => {
    setCommonItems(getCommonItems());
    setTemplates(getTemplates());
  }, []);

  // Auto-fill template based on category
  useEffect(() => {
    const isEmpty = items.length <= 1 && !items[0].description && !scopeDescription;
    if (isEmpty && !duplicateSource) {
      const matchingTemplate = templates.find(t => t.serviceCategory === serviceCategory);
      if (matchingTemplate) {
        applyTemplate(matchingTemplate);
        toast({ 
          title: "Template Auto-Applied", 
          description: `Loaded ${matchingTemplate.name} for ${serviceCategory} category.` 
        });
      }
    }
  }, [serviceCategory, templates]);

  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId]);

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch]);

  const calculateTotals = useCallback(() => {
    const itemsTotal = items.reduce((acc, item) => acc + item.total, 0);
    const laborTotal = laborHours * laborRate;
    const subtotal = itemsTotal + laborTotal + materialCosts;
    const taxTotal = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  }, [items, laborHours, laborRate, materialCosts, taxRate]);

  const addItem = () => {
    setItems([...items, { id: uuidv4(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      setItems([{ id: uuidv4(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    } else {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }
      return item;
    }));
  };

  const selectCommonItem = (id: string, item: CommonItem) => {
    setItems(items.map(i => {
        if (i.id === id) {
            return {
                ...i,
                description: item.description,
                unitPrice: item.defaultUnitPrice,
                total: i.quantity * item.defaultUnitPrice
            };
        }
        return i;
    }));
  };

  const applyTemplate = (template: QuoteTemplate) => {
    setServiceCategory(template.serviceCategory);
    setScopeDescription(template.scopeDescription);
    setItems(template.items.map(i => ({ ...i, id: uuidv4() })));
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

  const handleQuickAddClient = () => {
    if (!clientSearch) return;
    const newClient: Client = {
      id: uuidv4(),
      name: clientSearch,
      email: `${clientSearch.toLowerCase().replace(/\s/g, '.')}@example.com`,
      phone: "",
      address: ""
    };
    const updated = [...clients, newClient];
    saveClients(updated);
    setClients(updated);
    setClientId(newClient.id);
    setIsClientPopoverOpen(false);
    setClientSearch("");
    toast({ title: "Client Created", description: `Added ${newClient.name} to directory.` });
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
      toast({ title: "Scope Generated", description: "The professional scope description is ready." });
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
    const newQuote: Quote = {
      id: uuidv4(),
      clientId,
      date: new Date().toISOString(),
      status: 'draft',
      serviceCategory,
      items,
      scopeDescription,
      laborHours,
      laborRate,
      materialCosts,
      taxRate,
      taxTotal: totals.taxTotal,
      subtotal: totals.subtotal,
      grandTotal: totals.grandTotal,
      notes,
    };
    onSave(newQuote);
  };

  const commonItemsByCategory = useMemo(() => {
    return commonItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, CommonItem[]>);
  }, [commonItems]);

  return (
    <div className="space-y-8 pb-12">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-xl">Quote Configuration</CardTitle>
              <div className="flex gap-2">
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-secondary/30">
                      <LayoutTemplate className="w-4 h-4" /> Save as Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save as Template</DialogTitle>
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
                      <p className="text-xs text-muted-foreground">
                        This will save the current items, category, and scope description for reuse.
                      </p>
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
                      <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-tight">Templates</p>
                      <ScrollArea className="h-64">
                        {templates.map(t => (
                          <Button key={t.id} variant="ghost" className="w-full justify-start text-sm py-2 h-auto" onClick={() => {
                            applyTemplate(t);
                            toast({ title: "Template Applied", description: t.name });
                          }}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label>Client Selection</Label>
                  <Popover open={isClientPopoverOpen} onOpenChange={setIsClientPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isClientPopoverOpen}
                        className="w-full justify-between h-10 font-normal px-3"
                      >
                        {selectedClient ? (
                          <div className="flex flex-col items-start truncate text-left">
                            <span className="text-sm font-medium">{selectedClient.name}</span>
                            <span className="text-[10px] opacity-60 truncate">{selectedClient.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Search or select client...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Type name or email..."
                            className="pl-8 h-9 border-none shadow-none focus-visible:ring-0"
                            value={clientSearch}
                            onChange={(e) => setClientSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[300px]">
                        {filteredClients.map((c) => (
                          <Button
                            key={c.id}
                            variant="ghost"
                            className="w-full justify-start rounded-none px-4 py-2.5 h-auto"
                            onClick={() => {
                              setClientId(c.id);
                              setIsClientPopoverOpen(false);
                              setClientSearch("");
                            }}
                          >
                            <div className="flex flex-col items-start w-full">
                              <div className="flex items-center justify-between w-full">
                                <span className="font-medium text-sm">{c.name}</span>
                                {clientId === c.id && <Check className="h-3.5 w-3.5 text-primary" />}
                              </div>
                              <span className="text-[10px] text-muted-foreground">{c.email}</span>
                            </div>
                          </Button>
                        ))}
                        {filteredClients.length === 0 && clientSearch && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-primary rounded-none px-4 py-3 h-auto gap-2"
                            onClick={handleQuickAddClient}
                          >
                            <UserPlus className="h-4 w-4" />
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-semibold">Create "{clientSearch}"</span>
                              <span className="text-[10px] opacity-70">Add this new client to directory</span>
                            </div>
                          </Button>
                        )}
                        {filteredClients.length === 0 && !clientSearch && (
                          <p className="text-xs text-center py-6 text-muted-foreground">No clients found.</p>
                        )}
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select onValueChange={setServiceCategory} value={serviceCategory}>
                    <SelectTrigger className="h-10">
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

          <Card className="shadow-sm border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 py-4">
              <CardTitle className="text-xl">Work Scope & Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-2">
                  <div>Item Description</div>
                  <div>Qty</div>
                  <div>Price ($)</div>
                  <div className="text-right">Total</div>
                  <div></div>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-4 items-center group">
                      <div className="relative">
                        <Input 
                          value={item.description} 
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)} 
                          placeholder="Description..." 
                          className="pr-8 h-9 text-sm"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-primary">
                              <BookOpen className="w-3.5 h-3.5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-2" align="start">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 uppercase tracking-tight">Standard Item Library</p>
                              <ScrollArea className="h-64">
                                {Object.entries(commonItemsByCategory).map(([category, items]) => (
                                  <div key={category} className="mb-4 last:mb-0">
                                    <p className="text-[9px] font-black uppercase text-primary/50 px-2 mb-1 tracking-widest">{category}</p>
                                    <div className="space-y-0.5">
                                      {items.map(ci => (
                                        <Button 
                                          key={ci.id} 
                                          variant="ghost" 
                                          className="w-full justify-start text-xs py-1.5 h-auto px-2 hover:bg-primary/5" 
                                          onClick={() => selectCommonItem(item.id, ci)}
                                        >
                                          <div className="text-left w-full flex justify-between items-center gap-2">
                                            <span className="font-medium truncate">{ci.description}</span>
                                            <span className="text-[10px] font-mono shrink-0">${ci.defaultUnitPrice}</span>
                                          </div>
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </ScrollArea>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Input type="number" className="h-9 text-sm" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} />
                      </div>
                      <div>
                        <Input type="number" className="h-9 text-sm" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                      </div>
                      <div className="text-right font-medium text-sm">
                        ${item.total.toLocaleString()}
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 flex justify-start">
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary gap-2 h-8 px-2 hover:bg-primary/5">
                    <Plus className="w-4 h-4" /> Add Another Item
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Detailed Work Scope (AI Assisted)</Label>
                  <Button variant="ghost" size="sm" className="text-primary gap-2 h-8 px-2 hover:bg-primary/5" onClick={handleGenerateScope} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
                    Generate Professional Scope
                  </Button>
                </div>
                <Textarea 
                  value={scopeDescription} 
                  onChange={(e) => setScopeDescription(e.target.value)} 
                  placeholder={`Briefly describe the ${serviceCategory.toLowerCase()} work to be performed...`}
                  className="min-h-[150px] text-sm leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20 sticky top-8 overflow-hidden">
            <CardHeader className="bg-primary/5 py-4">
              <CardTitle className="text-lg">Pricing & Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Labor Rate ($/hr)</Label>
                  <Input type="number" className="h-10" value={laborRate} onChange={(e) => setLaborRate(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Estimated Labor Hours</Label>
                  <Input type="number" className="h-10" value={laborHours} onChange={(e) => setLaborHours(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Material/Equipment Costs ($)</Label>
                  <Input type="number" className="h-10" value={materialCosts} onChange={(e) => setMaterialCosts(Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items Total</span>
                  <span className="font-medium">${items.reduce((acc, item) => acc + item.total, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labor ({laborHours} hrs)</span>
                  <span className="font-medium">${(laborHours * laborRate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Materials</span>
                  <span className="font-medium">${materialCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-muted-foreground font-semibold">Subtotal</span>
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
                Preview & Save
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
