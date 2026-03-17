"use client";

import { useEffect, useState } from "react";
import { QuoteTemplate, CommonItem } from "@/lib/types";
import { getTemplates, saveTemplates, getCommonItems, saveCommonItems } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, BookOpen, Copy, Save, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CATEGORIES = [
  "General",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Landscaping",
  "Interior Painting",
  "Exterior Painting",
  "Surface Preparation",
  "Specialty Painting Services",
  "Additional Services",
  "Roofing",
  "Carpentry",
  "Cleaning",
  "Other"
];

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [commonItems, setCommonItems] = useState<CommonItem[]>([]);
  const [searchItem, setSearchItem] = useState("");

  useEffect(() => {
    setTemplates(getTemplates());
    setCommonItems(getCommonItems());
  }, []);

  const handleAddCommonItem = (category: string = "General") => {
    const newItem: CommonItem = { 
      id: uuidv4(), 
      category, 
      description: "", 
      unit: "sq ft",
      defaultUnitPrice: 0 
    };
    setCommonItems([...commonItems, newItem]);
  };

  const handleUpdateCommonItem = (id: string, field: keyof CommonItem, value: any) => {
    setCommonItems(commonItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveCommonItem = (id: string) => {
    setCommonItems(commonItems.filter(i => i.id !== id));
  };

  const handleSaveCommonItems = () => {
    saveCommonItems(commonItems);
    toast({ title: "Common Items Saved" });
  };

  const handleRemoveTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    toast({ title: "Template Removed" });
  };

  const filteredItems = commonItems.filter(i => {
    const desc = (i.description || "").toLowerCase();
    const cat = (i.category || "").toLowerCase();
    const search = searchItem.toLowerCase();
    return desc.includes(search) || cat.includes(search);
  });

  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filteredItems.filter(i => i.category === cat);
    return acc;
  }, {} as Record<string, CommonItem[]>);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates & Items</h1>
        <p className="text-muted-foreground">Manage your item library and quote templates.</p>
      </div>

      <Tabs defaultValue="common-items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="common-items" className="gap-2">
            <BookOpen className="w-4 h-4" /> Item Library
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Copy className="w-4 h-4" /> Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="common-items" className="space-y-6">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Standard Item Library</CardTitle>
                <Button onClick={handleSaveCommonItems} className="gap-2">
                  <Save className="w-4 h-4" /> Save Library
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search standard items..." value={searchItem} onChange={(e) => setSearchItem(e.target.value)} className="pl-9" />
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={CATEGORIES} className="w-full">
                {CATEGORIES.map(category => (
                  <AccordionItem key={category} value={category} className="border rounded-lg px-4 mb-3">
                    <AccordionTrigger className="hover:no-underline font-bold">
                      {category} ({groupedItems[category]?.length || 0})
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2">
                      <div className="space-y-3">
                        <div className="grid grid-cols-[1fr_100px_120px_40px] gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <div>Description</div>
                          <div>Unit</div>
                          <div>Price ($)</div>
                          <div></div>
                        </div>
                        {groupedItems[category]?.map((item) => (
                          <div key={item.id} className="grid grid-cols-[1fr_100px_120px_40px] gap-4 items-center">
                            <Input value={item.description} onChange={(e) => handleUpdateCommonItem(item.id, 'description', e.target.value)} className="h-9 text-sm" />
                            <Input value={item.unit || ""} onChange={(e) => handleUpdateCommonItem(item.id, 'unit', e.target.value)} className="h-9 text-sm" />
                            <Input type="number" value={item.defaultUnitPrice} onChange={(e) => handleUpdateCommonItem(item.id, 'defaultUnitPrice', Number(e.target.value))} className="h-9 text-sm" />
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveCommonItem(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="ghost" size="sm" className="w-full border border-dashed text-muted-foreground" onClick={() => handleAddCommonItem(category)}>
                          <Plus className="w-4 h-4" /> Add to {category}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id} className="relative group hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.serviceCategory}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveTemplate(template.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    {template.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-xs flex justify-between bg-muted/30 px-2 py-1 rounded">
                        <span className="truncate">{item.description}</span>
                        <span className="font-medium shrink-0">${item.unitPrice}/{item.unit || 'ea'}</span>
                      </div>
                    ))}
                    {template.items.length > 3 && <p className="text-[10px] text-muted-foreground">+{template.items.length - 3} more items...</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Link href="/quotes/new">
              <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors h-full">
                <Plus className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Add New Template</p>
                <p className="text-[10px] text-muted-foreground mt-1 opacity-60">Design and save a template in the Quote Builder</p>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
