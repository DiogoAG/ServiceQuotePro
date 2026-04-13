"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { QuoteTemplate, CommonItem, SERVICE_CATEGORIES, BusinessProfile } from "@/lib/types";
import { getHardcodedItems, getHardcodedTemplates } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, BookOpen, Copy, Search, ChevronRight, Lock, Undo2, ChevronDown, ChevronUp, Star, X, Loader2, ChevronsDownUp, ChevronsUpDown, RotateCcw, Redo2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ToastAction } from "@/components/ui/toast";

const SERVICE_SUBCATEGORIES: Record<string, string[]> = {
  "General Contracting": ["Project Management", "Sitework", "Structural Construction", "Building Envelope", "Interior Construction", "Renovation & Expansion"],
  "Electrical": ["Power Distribution", "Wiring & Devices", "Lighting Systems", "Low Voltage Systems", "Specialized Systems", "Controls & Automation", "Maintenance & Testing"],
  "Plumbing": ["Water Supply Systems", "Water Heating", "Drainage Systems", "Fixtures & Appliances", "Gas Systems", "Specialty Systems", "Maintenance & Repair"],
  "HVAC": ["Cooling Systems", "Heating Systems", "Air Distribution", "Controls", "Indoor Air Quality", "Maintenance & Service"],
  "Landscaping": ["Site Development", "Softscape", "Hardscape", "Outdoor Features", "Irrigation", "Maintenance"],
  "Painting": ["Interior Painting", "Exterior Painting", "Surface Preparation", "Specialty Painting Services", "Additional Services"],
  "Roofing": ["Roof Systems", "Components", "Drainage", "Installation & Replacement", "Repair & Maintenance"],
  "Carpentry": ["Rough Carpentry", "Finish Carpentry", "Doors & Windows", "Cabinets & Millwork", "Flooring", "Exterior Carpentry", "Repair"],
  "Cleaning": ["General Cleaning", "Deep Cleaning", "Floor Care", "Surface Cleaning", "Exterior Cleaning", "Sanitation", "Waste Services"]
};

type HistoryAction = {
  type: 'item' | 'template';
  data: any;
  path: string;
};

export default function TemplatesPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "contractorProfiles", user.uid);
  }, [db, user]);

  const customItemsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "contractorProfiles", user.uid, "customItems");
  }, [db, user]);

  const templatesRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, "contractorProfiles", user.uid, "templates");
  }, [db, user]);

  const { data: profile } = useDoc<BusinessProfile>(profileRef);
  const { data: customItems, isLoading: itemsLoading } = useCollection<CommonItem>(customItemsRef);
  const { data: userTemplates, isLoading: templatesLoading } = useCollection<QuoteTemplate>(templatesRef);

  const [searchItem, setSearchItem] = useState("");
  const [searchTemplate, setSearchTemplate] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Undo/Redo System State
  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);

  // Inline Add Item State
  const [activeAddingCategory, setActiveAddingCategory] = useState<string | null>(null);
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("ea");
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  const hardcodedItems = getHardcodedItems();

  const allItems = useMemo(() => {
    const customMap = new Map((customItems || []).map(i => [i.id, i]));
    const mergedHardcoded = hardcodedItems.map(h => {
      const custom = customMap.get(h.id);
      return custom ? { ...h, ...custom, isHardCoded: false, isOverride: true } : h;
    });
    const hardcodedIds = new Set(hardcodedItems.map(h => h.id));
    const newCustom = (customItems || []).filter(c => !hardcodedIds.has(c.id));
    return [...mergedHardcoded, ...newCustom];
  }, [customItems]);

  useEffect(() => {
    if (profile?.offeredServices?.length > 0) {
      setExpandedCategories(profile.offeredServices);
    } else {
      setExpandedCategories(SERVICE_CATEGORIES);
    }
  }, [profile]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !user) return;
    
    const action = undoStack[undoStack.length - 1];
    const docRef = doc(db, action.path);
    
    setDocumentNonBlocking(docRef, action.data, { merge: true });
    
    setRedoStack(prev => [...prev, action]);
    setUndoStack(prev => prev.slice(0, -1));
    
    toast({ title: "Restored", description: "Deletion has been undone." });
  }, [undoStack, user, db, toast]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !user) return;
    
    const action = redoStack[redoStack.length - 1];
    const docRef = doc(db, action.path);
    
    deleteDocumentNonBlocking(docRef);
    
    setUndoStack(prev => [...prev, action]);
    setRedoStack(prev => prev.slice(0, -1));
    
    toast({ title: "Action Redone", description: "Item removed again." });
  }, [redoStack, user, db, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleConfirmAddItem = () => {
    if (!user || !activeAddingCategory) return;
    
    if (!newItemDescription.trim()) {
      setActiveAddingCategory(null);
      setNewItemDescription("");
      return;
    }

    const id = uuidv4();
    const newItem: CommonItem = { 
      id, 
      category: activeAddingCategory, 
      description: newItemDescription.trim(), 
      unit: newItemUnit,
      defaultUnitPrice: newItemPrice,
      isHardCoded: false
    };

    const docRef = doc(db, "contractorProfiles", user.uid, "customItems", id);
    setDocumentNonBlocking(docRef, newItem, { merge: true });
    
    setActiveAddingCategory(null);
    setNewItemDescription("");
    setNewItemUnit("ea");
    setNewItemPrice(0);
    toast({ title: "Item Added", description: `Added to library.` });
  };

  const handleUpdateCommonItem = (item: CommonItem, field: keyof CommonItem, value: any) => {
    if (!user) return;

    if (field === 'description' && (!value || value.trim() === "")) {
      toast({ 
        title: "Required Field", 
        description: "Service description cannot be empty.", 
        variant: "destructive" 
      });
      return;
    }

    const docRef = doc(db, "contractorProfiles", user.uid, "customItems", item.id);
    const isEditingOriginalHardcoded = item.id.startsWith('h-') && !customItems?.find(ci => ci.id === item.id);
    
    if (isEditingOriginalHardcoded) {
      const fullData = { ...item, [field]: value, isHardCoded: false };
      setDocumentNonBlocking(docRef, fullData, { merge: true });
    } else {
      setDocumentNonBlocking(docRef, { [field]: value }, { merge: true });
    }
  };

  const handleRemoveCommonItem = (item: CommonItem) => {
    if (!user) return;
    const path = `contractorProfiles/${user.uid}/customItems/${item.id}`;
    
    const action: HistoryAction = { type: 'item', data: item, path };
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]); 
    
    const docRef = doc(db, path);
    deleteDocumentNonBlocking(docRef);
    
    toast({ 
      title: item.id.startsWith('h-') ? "Reset to Default" : "Item Removed", 
      description: "Undo with Ctrl+Z",
      action: <ToastAction altText="Undo" onClick={handleUndo}>Undo</ToastAction>
    });
  };

  const handleRemoveTemplate = (template: QuoteTemplate) => {
    if (!user) return;
    const path = `contractorProfiles/${user.uid}/templates/${template.id}`;
    
    const action: HistoryAction = { type: 'template', data: template, path };
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]); 
    
    const docRef = doc(db, path);
    deleteDocumentNonBlocking(docRef);
    
    toast({ 
      title: "Template Removed", 
      description: "Undo with Ctrl+Z",
      action: <ToastAction altText="Undo" onClick={handleUndo}>Undo</ToastAction>
    });
  };

  const filteredItems = useMemo(() => {
    return allItems.filter(i => {
      const desc = (i.description || "").toLowerCase();
      const cat = (i.category || "").toLowerCase();
      const search = searchItem.toLowerCase();
      return desc.includes(search) || cat.includes(search);
    });
  }, [allItems, searchItem]);

  const filteredTemplates = useMemo(() => {
    const search = searchTemplate.toLowerCase();
    const offered = profile?.offeredServices || [];
    const all = [...getHardcodedTemplates(), ...(userTemplates || [])];
    const filtered = all.filter(t => {
      const matchesName = t.name.toLowerCase().includes(search);
      const matchesCategory = t.serviceCategory.toLowerCase().includes(search);
      const matchesScope = (t.scopeDescription || "").toLowerCase().includes(search);
      const matchesItems = t.items.some(item => (item.description || "").toLowerCase().includes(search));
      return matchesName || matchesCategory || matchesScope || matchesItems;
    });
    return [...filtered].sort((a, b) => {
      const aIsOffered = offered.includes(a.serviceCategory);
      const bIsOffered = offered.includes(b.serviceCategory);
      if (aIsOffered && !bIsOffered) return -1;
      if (!aIsOffered && bIsOffered) return 1;
      
      const idxA = SERVICE_CATEGORIES.indexOf(a.serviceCategory);
      const idxB = SERVICE_CATEGORIES.indexOf(b.serviceCategory);
      if (idxA !== idxB) return idxA - idxB;
      
      return a.name.localeCompare(b.name);
    });
  }, [userTemplates, searchTemplate, profile]);

  const getItemsForCategory = useCallback((category: string) => {
    const isSearching = searchItem.trim().length > 0;
    if (SERVICE_SUBCATEGORIES[category]) {
      return SERVICE_SUBCATEGORIES[category].map(sub => ({
        subName: sub,
        items: filteredItems.filter(i => i.category === `${category} - ${sub}`)
      })).filter(g => {
        if (isSearching) return g.items.length > 0;
        return true;
      });
    }
    const items = filteredItems.filter(i => i.category === category);
    if (isSearching) {
      return items.length > 0 ? [{ subName: null, items }] : [];
    }
    return [{ subName: null, items }];
  }, [filteredItems, searchItem]);

  const sortedCategories = useMemo(() => {
    const offered = profile?.offeredServices || [];
    const starred = SERVICE_CATEGORIES.filter(c => offered.includes(c));
    const others = SERVICE_CATEGORIES.filter(c => !offered.includes(c));
    return [...starred, ...others];
  }, [profile]);

  const handleExpandAll = () => setExpandedCategories([...SERVICE_CATEGORIES]);
  const handleCollapseAll = () => setExpandedCategories([]);

  if (itemsLoading || templatesLoading) return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 z-20 bg-background/95 backdrop-blur py-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates & Items</h1>
          <p className="text-muted-foreground text-sm">Manage your professional service library.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleUndo} disabled={undoStack.length === 0} className="hidden sm:flex gap-2">
            <Undo2 className="w-4 h-4" /> Undo
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRedo} disabled={redoStack.length === 0} className="hidden sm:flex gap-2">
            <Redo2 className="w-4 h-4" /> Redo
          </Button>
          <Link href="/quotes/new">
            <Button variant="outline" className="gap-2 shadow-sm w-full md:w-auto">
              <Plus className="w-4 h-4" /> New Quote
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="common-items" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto h-auto">
          <TabsTrigger value="common-items" className="gap-2 px-6 rounded-lg py-2">
            <BookOpen className="w-4 h-4" /> Item Library
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 px-6 rounded-lg py-2">
            <Copy className="w-4 h-4" /> Saved Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="common-items" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search standard items..." 
                    value={searchItem} 
                    onChange={(e) => setSearchItem(e.target.value)} 
                    className="pl-10 h-11 bg-muted/30 border-none" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs gap-2" onClick={handleExpandAll}>
                    <ChevronsUpDown className="w-3.5 h-3.5" /> Expand All
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-2" onClick={handleCollapseAll}>
                    <ChevronsDownUp className="w-3.5 h-3.5" /> Collapse All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Accordion type="multiple" value={expandedCategories} onValueChange={setExpandedCategories} className="space-y-4">
                {sortedCategories.map(category => {
                  const groups = getItemsForCategory(category);
                  const isOffered = profile?.offeredServices?.includes(category);
                  const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
                  if (totalItems === 0 && searchItem.trim().length > 0) return null;
                  return (
                    <AccordionItem key={category} value={category} className={cn("border rounded-xl overflow-hidden px-3 sm:px-4", isOffered ? "border-primary/20 bg-primary/5" : "")}>
                      <AccordionTrigger className="hover:no-underline py-4 text-left">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="font-bold text-sm sm:text-base">{category}</span>
                          {isOffered && <Star className="w-2.5 h-2.5 fill-primary" title="Offered Service" />}
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">{totalItems} Items</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="space-y-8">
                          {groups.map((group, gIdx) => {
                            const groupKey = group.subName ? `${category} - ${group.subName}` : category;
                            return (
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
                                      <div className="relative">
                                        <Input 
                                          value={item.description} 
                                          onChange={(e) => handleUpdateCommonItem(item, 'description', e.target.value)} 
                                          className={cn("h-9 text-sm bg-background/50 border-none focus-visible:ring-1", item.isHardCoded && "opacity-80 font-medium cursor-not-allowed")}
                                          readOnly={item.isHardCoded}
                                          placeholder="Item description (required)..."
                                        />
                                        {item.isHardCoded && <Lock className="w-3 h-3 absolute right-3 top-3 text-muted-foreground/50" />}
                                      </div>
                                      <div className="grid grid-cols-2 md:contents gap-3">
                                        <div className="space-y-1 md:space-y-0">
                                          <Label className="md:hidden text-[9px] uppercase text-muted-foreground">Unit</Label>
                                          <Input value={item.unit || ""} onChange={(e) => handleUpdateCommonItem(item, 'unit', e.target.value)} className="h-9 text-sm bg-background/50 border-none focus-visible:ring-1" placeholder="unit" />
                                        </div>
                                        <div className="space-y-1 md:space-y-0">
                                          <Label className="md:hidden text-[9px] uppercase text-muted-foreground">Price</Label>
                                          <Input type="number" step="0.01" value={item.defaultUnitPrice} onChange={(e) => handleUpdateCommonItem(item, 'defaultUnitPrice', Number(e.target.value))} className="h-9 text-sm bg-background/50 border-none focus-visible:ring-1 px-2" placeholder="0.00" />
                                        </div>
                                      </div>
                                      <div className="flex justify-center md:justify-end">
                                        {item.id.startsWith('h-') ? (
                                          customItems?.find(ci => ci.id === item.id) ? (
                                            <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8 hover:bg-muted" title="Reset to standard price" onClick={() => handleRemoveCommonItem(item)}>
                                              <RotateCcw className="w-4 h-4" />
                                            </Button>
                                          ) : <div className="w-8 h-8"></div>
                                        ) : (
                                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 hover:bg-destructive/10" onClick={() => handleRemoveCommonItem(item)}>
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {/* Inline Add Item Row */}
                                  {activeAddingCategory === groupKey ? (
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_40px] gap-3 md:gap-4 items-start md:items-center border p-4 rounded-lg md:border-none md:p-0 bg-primary/5">
                                      <Input 
                                        autoFocus
                                        value={newItemDescription}
                                        onChange={(e) => setNewItemDescription(e.target.value)}
                                        onBlur={handleConfirmAddItem}
                                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddItem()}
                                        className="h-9 text-sm border-primary/30"
                                        placeholder="Enter service description..."
                                      />
                                      <div className="grid grid-cols-2 md:contents gap-3">
                                        <Input value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} className="h-9 text-sm" placeholder="unit" />
                                        <Input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(Number(e.target.value))} className="h-9 text-sm" placeholder="0.00" />
                                      </div>
                                      <div className="flex justify-center md:justify-end">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveAddingCategory(null)}>
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="w-full border border-dashed text-muted-foreground h-12 md:h-10 hover:bg-background/80 hover:text-primary transition-colors mt-2" 
                                      onClick={() => {
                                        setActiveAddingCategory(groupKey);
                                        setNewItemDescription("");
                                        setNewItemUnit("ea");
                                        setNewItemPrice(0);
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" /> Add Custom Item
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
          <Card className="border-none shadow-sm mb-6">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search templates..." value={searchTemplate} onChange={(e) => setSearchTemplate(e.target.value)} className="pl-10 h-11 bg-muted/30 border-none" />
              </div>
            </CardHeader>
          </Card>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {filteredTemplates.map((template) => {
              const isOffered = profile?.offeredServices?.includes(template.serviceCategory);
              return (
                <Card key={template.id} className={cn("relative group overflow-hidden transition-all shadow-sm hover:shadow-md", isOffered ? "border-primary/20 hover:border-primary/40" : "border-primary/10 hover:border-primary/30")}>
                  <CardHeader className={cn("p-5 pb-2", isOffered ? "bg-primary/5" : "bg-muted/20")}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{template.name}</h3>
                          {isOffered && <Star className="w-3.5 h-3.5 fill-primary text-primary" />}
                        </div>
                        <Badge variant="outline" className={cn("text-[9px] uppercase tracking-tighter bg-background gap-1", isOffered && "border-primary/30 text-primary font-bold")}>{template.serviceCategory}</Badge>
                      </div>
                      {!template.isHardCoded && (
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 hover:bg-destructive/10" onClick={() => handleRemoveTemplate(template)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-4 space-y-4">
                    <div className="space-y-2">
                      {template.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="text-xs flex justify-between items-center py-1 border-b border-muted last:border-0">
                          <span className="truncate pr-4 text-muted-foreground">{item.description}</span>
                          <span className="font-bold shrink-0">${item.unitPrice.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={`/quotes/new?duplicateId=${template.id}`} className="block">
                      <Button className={cn("w-full shadow-sm", isOffered ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")} variant={isOffered ? "default" : "secondary"}>Use This Template</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
