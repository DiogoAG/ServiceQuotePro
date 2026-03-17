
"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { QuoteTemplate, CommonItem } from "@/lib/types";
import { getTemplates, saveTemplates, getCommonItems, saveCommonItems } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, BookOpen, Copy, Search, ChevronRight, Lock, Undo2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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

const PAINTING_SUBCATEGORIES = [
  "Interior Painting",
  "Exterior Painting",
  "Surface Preparation",
  "Specialty Painting Services",
  "Additional Services"
];

// Helper to truncate string to 2 decimals as user types
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
  const [searchItem, setSearchItem] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(SERVICE_CATEGORIES);
  const isInitialMount = useRef(true);
  const undoStack = useRef<{ type: 'item' | 'template', data: any }[]>([]);

  useEffect(() => {
    setTemplates(getTemplates());
    setCommonItems(getCommonItems());
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const validItems = commonItems.filter(item => {
      if (item.isHardCoded) return true;
      return item.description && item.description.trim().length > 0;
    });

    saveCommonItems(validItems);
  }, [commonItems]);

  const undoLastAction = useCallback(() => {
    const lastAction = undoStack.current.pop();
    if (!lastAction) return;

    if (lastAction.type === 'item') {
      const item = lastAction.data as CommonItem;
      setCommonItems(prev => [...prev, item]);
      toast({ title: "Restored", description: `"${item.description || 'Custom Item'}" has been restored.` });
    } else if (lastAction.type === 'template') {
      const template = lastAction.data as QuoteTemplate;
      setTemplates(prev => {
        const updated = [...prev, template];
        saveTemplates(updated);
        return updated;
      });
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

    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
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
            setTemplates(prev => {
              const restored = [...prev, templateToRemove];
              saveTemplates(restored);
              return restored;
            });
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

  const getItemsForCategory = useCallback((category: string) => {
    if (category === "Painting") {
      return PAINTING_SUBCATEGORIES.map(sub => ({
        subName: sub,
        items: filteredItems.filter(i => i.category === `Painting - ${sub}`)
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
            <Button variant="outline" className="gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> New Quote / Template
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="common-items" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="common-items" className="gap-2 px-6 rounded-lg data-[state=active]:shadow-sm">
            <BookOpen className="w-4 h-4" /> Item Library
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 px-6 rounded-lg data-[state=active]:shadow-sm">
            <Copy className="w-4 h-4" /> Saved Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="common-items" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search standard items..." 
                    value={searchItem} 
                    onChange={(e) => setSearchItem(e.target.value)} 
                    className="pl-10 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-1" 
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-xs"
                    onClick={() => toggleAllCategories(true)}
                  >
                    <ChevronDown className="w-3.5 h-3.5" /> Expand All
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-xs"
                    onClick={() => toggleAllCategories(false)}
                  >
                    <ChevronUp className="w-3.5 h-3.5" /> Collapse All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion 
                type="multiple" 
                value={expandedCategories} 
                onValueChange={setExpandedCategories}
                className="space-y-4"
              >
                {SERVICE_CATEGORIES.map(category => {
                  const groups = getItemsForCategory(category);
                  const totalItems = groups.reduce((acc, g) => acc + g.items.length, 0);
                  
                  if (totalItems === 0) return null;

                  return (
                    <AccordionItem key={category} value={category} className="border rounded-xl overflow-hidden px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-base">{category}</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {totalItems} Items
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="space-y-8">
                          {groups.map((group, gIdx) => (
                            <div key={group.subName || gIdx} className="space-y-4">
                              {group.subName && (
                                <div className="flex items-center gap-2 mb-2">
                                  <ChevronRight className="w-3 h-3 text-primary" />
                                  <h4 className="text-sm font-bold tracking-tight text-foreground">{group.subName}</h4>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-[1fr_80px_100px_120px_40px] gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                <div>Service Description</div>
                                <div>Unit</div>
                                <div className="pl-2">Standard Price</div>
                                <div></div>
                              </div>
                              
                              <div className="space-y-2">
                                {group.items.map((item) => (
                                  <div key={item.id} className="grid grid-cols-[1fr_80px_100px_120px_40px] gap-4 items-center group">
                                    <div className="relative">
                                      <Input 
                                        value={item.description} 
                                        onChange={(e) => handleUpdateCommonItem(item.id, 'description', e.target.value)} 
                                        className={cn(
                                          "h-9 text-sm bg-muted/20 border-none focus-visible:ring-1 pr-8",
                                          item.isHardCoded && "opacity-80 font-medium cursor-not-allowed"
                                        )}
                                        readOnly={item.isHardCoded}
                                        placeholder="New item description..."
                                      />
                                      {item.isHardCoded && (
                                        <Lock className="w-3 h-3 absolute right-3 top-3 text-muted-foreground/50" />
                                      )}
                                    </div>
                                    <Input 
                                      value={item.unit || ""} 
                                      onChange={(e) => handleUpdateCommonItem(item.id, 'unit', e.target.value)} 
                                      className="h-9 text-sm bg-muted/20 border-none focus-visible:ring-1" 
                                      placeholder="unit"
                                    />
                                    <Input 
                                      type="number" 
                                      step="1.0"
                                      value={item.defaultUnitPrice} 
                                      onChange={(e) => handleUpdateCommonItem(item.id, 'defaultUnitPrice', e.target.value)}
                                      className="h-9 text-sm bg-muted/20 border-none focus-visible:ring-1 px-2" 
                                      placeholder="0.00"
                                    />
                                    <div className="flex justify-center">
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
                                className="w-full border border-dashed text-muted-foreground h-10 hover:bg-muted/50 hover:text-primary transition-colors" 
                                onClick={() => handleAddCommonItem(group.subName ? `Painting - ${group.subName}` : category)}
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
          <div className="grid gap-6 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="relative group border-none shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      <p className="flex items-center gap-2 mt-1">
                        <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase">{template.serviceCategory}</span>
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleRemoveTemplate(template.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {template.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-xs flex justify-between bg-muted/40 p-2 rounded-md">
                        <span className="truncate font-medium">{item.description}</span>
                        <span className="text-muted-foreground shrink-0 ml-4">${item.unitPrice}/{item.unit || 'ea'}</span>
                      </div>
                    ))}
                    {template.items.length > 3 && <p className="text-[10px] text-center text-muted-foreground pt-1">+{template.items.length - 3} more line items</p>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href={`/quotes/new?duplicateId=${template.id}`} className="flex-1">
                      <Button className="w-full text-xs h-9 bg-primary/10 text-primary hover:bg-primary/20 border-none">Use Template</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Link href="/quotes/new">
              <Card className="border-2 border-dashed flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-muted/30 transition-all h-full min-h-[250px] group">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-muted-foreground">Create New Template</h3>
                <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-[200px]">Design a reusable scope and items list in the Quote Builder</p>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
