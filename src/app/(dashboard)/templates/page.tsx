
"use client";

import { useEffect, useState } from "react";
import { QuoteTemplate, QuoteItem } from "@/lib/types";
import { getTemplates, saveTemplates, getCommonItems, saveCommonItems } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, BookOpen, Copy, Save, LayoutTemplate, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

type CommonItem = {
  id: string;
  description: string;
  defaultUnitPrice: number;
};

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [commonItems, setCommonItems] = useState<CommonItem[]>([]);

  // Template Creation State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTplName, setNewTplName] = useState("");
  const [newTplCategory, setNewTplCategory] = useState("General Contracting");
  const [newTplScope, setNewTplScope] = useState("");
  const [newTplItems, setNewTplItems] = useState<{ description: string; unitPrice: number }[]>([
    { description: "", unitPrice: 0 }
  ]);

  useEffect(() => {
    setTemplates(getTemplates());
    setCommonItems(getCommonItems());
  }, []);

  const handleAddTplItem = () => {
    setNewTplItems([...newTplItems, { description: "", unitPrice: 0 }]);
  };

  const handleRemoveTplItem = (index: number) => {
    setNewTplItems(newTplItems.filter((_, i) => i !== index));
  };

  const handleUpdateTplItem = (index: number, field: "description" | "unitPrice", value: string | number) => {
    const updated = [...newTplItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewTplItems(updated);
  };

  const handleSaveNewTemplate = () => {
    if (!newTplName.trim()) {
      toast({ title: "Error", description: "Template name is required.", variant: "destructive" });
      return;
    }

    const template: QuoteTemplate = {
      id: uuidv4(),
      name: newTplName,
      serviceCategory: newTplCategory,
      scopeDescription: newTplScope,
      items: newTplItems.map(item => ({
        ...item,
        quantity: 1,
        total: item.unitPrice
      }))
    };

    const updated = [...templates, template];
    setTemplates(updated);
    saveTemplates(updated);
    setIsCreateDialogOpen(false);
    resetTemplateForm();
    toast({ title: "Template Created", description: `"${template.name}" added to library.` });
  };

  const resetTemplateForm = () => {
    setNewTplName("");
    setNewTplCategory("General Contracting");
    setNewTplScope("");
    setNewTplItems([{ description: "", unitPrice: 0 }]);
  };

  const handleAddCommonItem = () => {
    const newItem: CommonItem = { id: uuidv4(), description: "", defaultUnitPrice: 0 };
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
    toast({ title: "Common Items Saved", description: "Your item library has been updated." });
  };

  const handleRemoveTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveTemplates(updated);
    toast({ title: "Template Removed" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates & Items</h1>
          <p className="text-muted-foreground">Manage reusable quote templates and standard service descriptions.</p>
        </div>
      </div>

      <Tabs defaultValue="common-items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="common-items" className="gap-2">
            <BookOpen className="w-4 h-4" /> Common Items
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Copy className="w-4 h-4" /> Quote Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="common-items" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Standard Item Library</CardTitle>
                <CardDescription>Commonly used services and parts for quick insertion.</CardDescription>
              </div>
              <Button onClick={handleAddCommonItem} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[1fr_150px_50px] gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div>Description</div>
                <div>Default Price ($)</div>
                <div></div>
              </div>
              
              <div className="space-y-3">
                {commonItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_150px_50px] gap-4 items-center">
                    <Input 
                      value={item.description} 
                      onChange={(e) => handleUpdateCommonItem(item.id, 'description', e.target.value)} 
                      placeholder="e.g. Service Call Fee"
                      className="h-9 text-sm"
                    />
                    <Input 
                      type="number" 
                      value={item.defaultUnitPrice} 
                      onChange={(e) => handleUpdateCommonItem(item.id, 'defaultUnitPrice', Number(e.target.value))} 
                      className="h-9 text-sm"
                    />
                    <Button variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={() => handleRemoveCommonItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {commonItems.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground italic">No common items defined yet.</p>
                )}
              </div>
              
              <div className="pt-6 border-t flex justify-end">
                <Button onClick={handleSaveCommonItems} className="gap-2">
                  <Save className="w-4 h-4" /> Save Library
                </Button>
              </div>
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => handleRemoveTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground line-clamp-2 italic">
                    {template.scopeDescription || "No scope description provided."}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Included Items:</p>
                    <div className="space-y-1">
                      {template.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex justify-between bg-muted/30 px-2 py-1 rounded">
                          <span className="truncate pr-2">{item.description}</span>
                          <span className="font-medium shrink-0">${item.unitPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Card className="border-dashed flex items-center justify-center p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="space-y-2">
                    <Plus className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">Add New Template</p>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Quote Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input 
                        placeholder="e.g. Standard Lighting Install" 
                        value={newTplName}
                        onChange={(e) => setNewTplName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Service Category</Label>
                      <Select value={newTplCategory} onValueChange={setNewTplCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Work Scope</Label>
                    <Textarea 
                      placeholder="Describe the standard work for this template..."
                      value={newTplScope}
                      onChange={(e) => setNewTplScope(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Default Line Items</Label>
                      <Button variant="outline" size="sm" onClick={handleAddTplItem} className="h-8 gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newTplItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input 
                            placeholder="Item description..." 
                            value={item.description}
                            onChange={(e) => handleUpdateTplItem(idx, 'description', e.target.value)}
                            className="flex-1 h-9 text-sm"
                          />
                          <Input 
                            type="number" 
                            placeholder="Price" 
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateTplItem(idx, 'unitPrice', Number(e.target.value))}
                            className="w-24 h-9 text-sm"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-destructive" 
                            onClick={() => handleRemoveTplItem(idx)}
                            disabled={newTplItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveNewTemplate} className="gap-2">
                    <Save className="w-4 h-4" /> Save Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
