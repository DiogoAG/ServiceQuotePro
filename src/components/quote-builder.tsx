
"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Sparkles, Loader2, Save } from "lucide-react";
import { Client, Quote, QuoteItem, BusinessProfile } from "@/lib/types";
import { generateScopeDescription } from "@/ai/flows/ai-assisted-scope-description";
import { useToast } from "@/hooks/use-toast";

type QuoteBuilderProps = {
  initialClients: Client[];
  initialProfile: BusinessProfile;
  onSave: (quote: Quote) => void;
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

export function QuoteBuilder({ initialClients, initialProfile, onSave }: QuoteBuilderProps) {
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string>("");
  const [serviceCategory, setServiceCategory] = useState<string>("General Contracting");
  const [items, setItems] = useState<QuoteItem[]>([{ id: uuidv4(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [laborHours, setLaborHours] = useState<number>(0);
  const [laborRate, setLaborRate] = useState<number>(initialProfile.defaultLaborRate);
  const [materialCosts, setMaterialCosts] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(initialProfile.defaultTaxRate);
  const [notes, setNotes] = useState("");
  const [scopeDescription, setScopeDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
    setItems(items.filter(item => item.id !== id));
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

  return (
    <div className="space-y-8 pb-12">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-primary/10">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Client</Label>
                  <Select onValueChange={setClientId} value={clientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {initialClients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service Category</Label>
                  <Select onValueChange={setServiceCategory} value={serviceCategory}>
                    <SelectTrigger>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Scope & Line Items</CardTitle>
              <Button size="sm" variant="outline" onClick={addItem} className="gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-end border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Item Description</Label>
                      <Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="e.g. Parts, Materials, Service Fee" />
                    </div>
                    <div className="w-20 space-y-2">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label className="text-xs">Unit Price</Label>
                      <Input type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                    </div>
                    <div className="w-24 text-right pb-3 font-medium text-sm">
                      ${item.total.toLocaleString()}
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive mb-1" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <Label>Detailed Work Scope (AI Assisted)</Label>
                  <Button variant="ghost" size="sm" className="text-primary gap-2 h-8" onClick={handleGenerateScope} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
                    Generate Professional Scope
                  </Button>
                </div>
                <Textarea 
                  value={scopeDescription} 
                  onChange={(e) => setScopeDescription(e.target.value)} 
                  placeholder={`Describe the ${serviceCategory.toLowerCase()} work in brief points...`}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20 sticky top-8">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg">Pricing & Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Labor Rate ($/hr)</Label>
                  <Input type="number" value={laborRate} onChange={(e) => setLaborRate(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Labor Hours</Label>
                  <Input type="number" value={laborHours} onChange={(e) => setLaborHours(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Additional Material Costs ($)</Label>
                  <Input type="number" value={materialCosts} onChange={(e) => setMaterialCosts(Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items Total</span>
                  <span>${items.reduce((acc, item) => acc + item.total, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labor ({laborHours} hrs)</span>
                  <span>${(laborHours * laborRate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Materials</span>
                  <span>${materialCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                  <span>${totals.taxTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold">Grand Total</span>
                  <span className="text-2xl font-bold text-primary">${totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label>Tax Rate (%)</Label>
                <Input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>

              <Button className="w-full gap-2 shadow-md" size="lg" onClick={handleSave}>
                <Save className="w-5 h-5" />
                Save & Preview Quote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
