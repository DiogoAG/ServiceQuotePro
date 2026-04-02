
"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { QuoteTemplate, CommonItem, SERVICE_CATEGORIES, BusinessProfile } from "@/lib/types";
import { getTemplates, saveTemplates, getCommonItems, saveCommonItems, getBusinessProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, BookOpen, Copy, Search, ChevronRight, Lock, Undo2, ChevronDown, ChevronUp, Star, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

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

// Strict 2-decimal truncation helper (no rounding)
const truncateToTwoDecimals = (value: string) => {
  if (!value) return "";
  const parts = value.split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`;
  }
  return value;
};

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [commonItems, setCommonItems] = useState<CommonItem[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [searchItem, setSearchItem] = useState("");
  const [searchTemplate, setSearchTemplate] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const isInitialMount = useRef(true);
  const undoStack = useRef<{ type: 'item' | 'template', data: any }[]>([]);

  useEffect(() => {
    setTemplates(getTemplates());
    setCommonItems(getCommonItems());
    const bizProfile = getBusinessProfile();
    setProfile(bizProfile);
    
    // Auto-expand offered services by default
    if (bizProfile.offeredServices?.length > 0) {
      setExpandedCategories(bizProfile.offeredServices);
    } else {
      setExpandedCategories(SERVICE_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    saveCommonItems(commonItems);
    saveTemplates(templates);
  }, [commonItems, templates]);

  const undoLastAction = useCallback(() => {
    const lastAction = undoStack.current.pop();
    if (!lastAction) return;

    if (lastAction.type === 'item') {
      const item = lastAction.data as CommonItem;
      setCommonItems(prev => [...prev, item]);
      toast({ title: "Restored", description: `"${item.description || 'Custom Item'}" has been restored.` });
    } else if (lastAction.type === 'template') {
      const template = lastAction.data as QuoteTemplate;
      setTemplates(prev => [...prev, template]);
      toast({ title: "Restored", description: `"${template.name}" has been restored.` });
    }
  }, [toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        const activeElement = document.activeElement;
        const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
        if (!isInput) {
          e.preventDefault();
          undoLastAction();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoLastAction]);

  const handleAddCommonItem = (category: string) => {
    const newItem: CommonItem = { 
      id: uuidv4(), 
      category, 
      description: "", 
      unit: "",
      defaultUnitPrice: 0,
      isHardCoded: false
    };
    setCommonItems(prev => [...prev, newItem]);
  };

  const handleUpdateCommonItem = (id: string, field: keyof CommonItem, value: any) => {
    setCommonItems(prev => prev.map(item => {
      if (item.id === id) {
        let finalValue = value;
        if (field === 'defaultUnitPrice') {
          finalValue = truncateToTwoDecimals(value.toString());
        }
        return { ...item, [field]: finalValue };
      }
      return item;
    }));
  };

  const handleRemoveCommonItem = (id: string) => {
    const itemToRemove = commonItems.find(i => i.id === id);
    if (!itemToRemove) return;

    setCommonItems(prev => prev.filter(i => i.id !== id));
    undoStack.current.push({ type: 'item', data: itemToRemove });
    
    toast({ 
      title: "Item Removed", 
      description: `"${itemToRemove.description || 'Custom Item'}" has been deleted.`,
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            undoStack.current = undoStack.current.filter(a => a.type === 'item' && a.data.id !== id);
            setCommonItems(prev => [...prev, itemToRemove]);
            toast({ title: "Restored", description: "The item has been restored." });
          }}
        >
          <Undo2 className="w-4 h-4 mr-2" /> Undo
        </Button>
      )
    });
  };

  const handleRemoveTemplate = (id: string) => {
    const templateToRemove = templates.find(t => t.id === id);
    if (!templateToRemove) return;

    setTemplates(prev => prev.filter(t => t.id !== id));
    undoStack.current.push({ type: 'template', data: templateToRemove });

    toast({ 
      title: "Template Removed", 
      description: `"${templateToRemove.name}" has been deleted.`,
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            undoStack.current = undoStack.current.filter(a => a.type === 'template' && a.data.id !== id);
            setTemplates(prev => [...prev, templateToRemove]);
            toast({ title: "Restored", description: "The template has been restored." });
          }}
        >
          <Undo2 className="w-4 h-4 mr-2" /> Undo
        </Button>
      )
    });
  };

  const filteredItems = useMemo(() => {
    return commonItems.filter(i => {
      const desc = (i.description || "").toLowerCase();
      const cat = (i.category || "").toLowerCase();
      const search = searchItem.toLowerCase();
      return desc.includes(search) || cat.includes(search);
    });
  }, [commonItems, searchItem]);

  const filteredTemplates = useMemo(() => {
    const search = searchTemplate.toLowerCase();
    const offered = profile?.offeredServices || [];
    
    const filtered = templates.filter(t => 
      t.name.toLowerCase().includes(search) || 
      t.serviceCategory.toLowerCase().includes(search) ||
      t.items.some(item => item.description.toLowerCase().includes(search))
    );

    // Pinning logic: sort offered services to the top
    return [...filtered].sort((a, b) => {
      const aIsOffered = offered.includes(a.serviceCategory);
      const bIsOffered = offered.includes(b.serviceCategory);
      if (aIsOffered && !bIsOffered) return -1;
      if (!aIsOffered && bIsOffered) return 1;
      return 0;
    });
  }, [templates, searchTemplate, profile]);

  const getItemsForCategory = useCallback((category: string) => {
    if (SERVICE_SUBCATEGORIES[category]) {
      return SERVICE_SUBCATEGORIES[category].map(sub => ({
        subName: sub,
        items: filteredItems.filter(i => i.category === `${category} - ${sub}`)
      })).filter(g => g.items.length > 0);
    }
    const items = filteredItems.filter(i => i.category === category);
    return items.length > 0 ? [{ subName: null, items }] : [];
  }, [filteredItems]);

  const toggleAllCategories = (expand: boolean) => {
    if (expand) {
      setExpandedCategories(SERVICE_CATEGORIES);
    } else {
      setExpandedCategories([]);
    }
  };

  // Sort categories so offered services are at the top
  const sortedCategories = useMemo(() => {
    const offered = profile?.offeredServices || [];
    return [...SERVICE_CATEGORIES].sort((a, b) => {
      const aIsOffered = offered.includes(a);
      const bIsOffered = offered.includes(b);
      if (aIsOffered && !bIsOffered) return -1;
      if (!aIsOffered && bIsOffered) return 1;
      return 0;
    });
  }, [profile]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates & Items</h1>
          <p className="text-muted-foreground text-sm">
            Manage your professional service library.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/quotes/new">
            <Button variant="outline" className="gap-2 shadow-sm w-full md:w-auto">
              <Plus className="w-4 h-4" /> New Quote / Template
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="common-items" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto h-auto">
          <TabsTrigger value="common-items" className="gap-2 px-6 rounded-lg data-[state=active]:shadow-sm flex-1 sm:flex-none py-2">
            <BookOpen className="w-4 h-4" /> Item Library
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 px-6 rounded-lg data-[state=active]:shadow-sm flex-1 sm:flex-none py-2">
            <Copy className="w-4 h-4" /> Saved Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="common-items" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <div className="flex flex-col gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search standard items..." 
                    value={searchItem} 
                    onChange={(e) => setSearchItem(e.target.value)} 
                    className="pl-10 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-1" 
                  />
                  {searchItem && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-2 h-7 w-7 text-muted-foreground"
                      onClick={() => setSearchItem("")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 w-full justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-xs h-8"
                    onClick={() => toggleAllCategories(true)}
                  >
                    <ChevronDown className="w-3.5 h-3.5" /> Expand All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-xs h-8"
                    onClick={() => toggleAllCategories(false)}
                  >
                    <ChevronUp className="w-3.5 h-3.5" /> Collapse All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Accordion 
                type="multiple" 
                value={expandedCategories} 
                onValueChange={setExpandedCategories}
                className="space-y-4"
              >
                {sortedCategories.map(category => {
                  const groups = getItemsForCategory(category);
                  const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
                  const isOffered = profile?.offeredServices?.includes(category);
                  
                  if (totalItems === 0) return null;

                  return (
                    <AccordionItem key={category} value={category} className={cn(
                      "border rounded-xl overflow-hidden px-3 sm:px-4",
                      isOffered ? "border-primary/20 bg-primary/5" : ""
                    )}>
                      <AccordionTrigger className="hover:no-underline py-4 text-left">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="font-bold text-sm sm:text-base">{category}</span>
                          {isOffered && (
                            <Badge variant="secondary" className="gap-1 text-[8px] sm:text-[9px] bg-primary/10 text-primary border-none uppercase tracking-tighter">
                              <Star className="w-2.5 h-2.5 fill-primary" /> Offered
                            </Badge>
                          )}
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">
                            {totalItems} Items
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="space-y-8">
                          {groups.map((group, gIdx) => (
                            <div key={group.subName || gIdx} className="space-y-4">
                              {group.subName && (
                                <div className="flex items-center gap-2 mb-1">
                                  <ChevronRight className="w-3 h-3 text-primary" />
                                  <h4 className="text-sm font-bold tracking-tight text-foreground">{group.subName}</h4>
                                </div>
                              )}
                              
                              <div className="hidden md:grid grid-cols-[1fr_100px_120px_40px] gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                <div>Service Description</div>
                                <div className="pl-2">Unit</div>
                                <div className="pl-2">Standard Price</div>
                                <div></div>
                              </div>
                              
                              <div className="space-y-4 md:space-y-2">
                                {group.items.map((item) => (
                                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_40px] gap-3 md:gap-4 items-start md:items-center group relative border p-4 rounded-lg md:border-none md:p-0 bg-background/30 md:bg-transparent">
                                    <div className="md:hidden flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Item Detail</span>
                                      {!item.isHardCoded && (
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="text-destructive h-8 w-8" 
                                          onClick={() => handleRemoveCommonItem(item.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </div>

                                    <div className="relative">
                                      <Input 
                                        value={item.description} 
                                        onChange={(e) => handleUpdateCommonItem(item.id, 'description', e.target.value)} 
                                        className={cn(
                                          "h-9 text-sm bg-background/50 border-none focus-visible:ring-1 pr-8",
                                          item.isHardCoded && "opacity-80 font-medium cursor-not-allowed"
                                        )}
                                        readOnly={item.isHardCoded}
                                        placeholder="New item description..."
                                      />
                                      {item.isHardCoded && (
                                        <Lock className="w-3 h-3 absolute right-3 top-3 text-muted-foreground/50" />
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 md:contents gap-3">
                                      <div className="space-y-1 md:space-y-0">
                                        <Label className="md:hidden text-[9px] uppercase text-muted-foreground">Unit</Label>
                                        <Input 
                                          value={item.unit || ""} 
                                          onChange={(e) => handleUpdateCommonItem(item.id, 'unit', e.target.value)} 
                                          className="h-9 text-sm bg-background/50 border-none focus-visible:ring-1" 
                                          placeholder="unit"
                                        />
                                      </div>
                                      <div className="space-y-1 md:space-y-0">
                                        <Label className="md:hidden text-[9px] uppercase text-muted-foreground">Price</Label>
                                        <Input 
                                          type="number" 
                                          step="1.0"
                                          value={item.defaultUnitPrice} 
                                          onChange={(e) => handleUpdateCommonItem(item.id, 'defaultUnitPrice', e.target.value)}
                                          className="h-9 text-sm bg-background/50 border-none focus-visible:ring-1 px-2" 
                                          placeholder="0.00"
                                        />
                                      </div>
                                    </div>

                                    <div className="hidden md:flex justify-center">
                                      {!item.isHardCoded ? (
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="text-destructive h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                                          onClick={() => handleRemoveCommonItem(item.id)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      ) : (
                                        <div className="w-8 h-8" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full border border-dashed text-muted-foreground h-12 md:h-10 hover:bg-background/80 hover:text-primary transition-colors mt-2" 
                                onClick={() => handleAddCommonItem(group.subName ? `${category} - ${group.subName}` : category)}
                              >
                                <Plus className="w-4 h-4 mr-2" /> Add Custom Item
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="space-y-6 px-4 sm:px-0">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search templates and items..." 
                value={searchTemplate} 
                onChange={(e) => setSearchTemplate(e.target.value)} 
                className="pl-10 h-11 bg-card shadow-sm border-none focus-visible:ring-1" 
              />
              {searchTemplate && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2 h-7 w-7 text-muted-foreground"
                  onClick={() => setSearchTemplate("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {filteredTemplates.map((template) => {
                const isOffered = profile?.offeredServices?.includes(template.serviceCategory);
                return (
                  <Card key={template.id} className={cn(
                    "relative group border-none shadow-sm hover:shadow-md transition-all",
                    isOffered ? "bg-primary/5 ring-1 ring-primary/20" : ""
                  )}>
                    <CardHeader className="p-5 pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg truncate">{template.name}</h3>
                            {isOffered && (
                              <Badge variant="secondary" className="gap-1 text-[8px] bg-primary text-primary-foreground border-none uppercase tracking-tighter">
                                <Star className="w-2.5 h-2.5 fill-primary-foreground" /> Offered
                              </Badge>
                            )}
                          </div>
                          <p className="flex items-center gap-2 mt-1">
                            <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase truncate">{template.serviceCategory}</span>
                          </p>
                        </div>
                        {!template.isHardCoded && (
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 shrink-0" onClick={() => handleRemoveTemplate(template.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-4 space-y-4">
                      <div className="space-y-2">
                        {template.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="text-xs flex justify-between bg-muted/40 p-2.5 rounded-md">
                            <span className="truncate font-medium">{item.description}</span>
                            <span className="text-muted-foreground shrink-0 ml-4 font-mono">${Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                        {template.items.length > 3 && <p className="text-[10px] text-center text-muted-foreground pt-1">+{template.items.length - 3} more line items</p>}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Link href={`/quotes/new?duplicateId=${template.id}`} className="flex-1">
                          <Button className="w-full text-xs h-10 bg-primary/10 text-primary hover:bg-primary/20 border-none">Use Template</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
