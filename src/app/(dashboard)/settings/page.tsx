
"use client";

import { useEffect, useState } from "react";
import { BusinessProfile, SERVICE_CATEGORIES } from "@/lib/types";
import { getBusinessProfile, saveBusinessProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Building, Palette, FileText, Upload, X, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<BusinessProfile>({
    businessName: "",
    licenseNumber: "",
    address: "",
    phone: "",
    logoUrl: "",
    defaultTaxRate: 0,
    defaultLaborRate: 0,
    offeredServices: [],
    quoteTerms: ""
  });

  useEffect(() => {
    setForm(getBusinessProfile());
  }, []);

  const handleSave = () => {
    saveBusinessProfile(form);
    toast({ title: "Settings Saved", description: "Your professional profile has been updated." });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload a logo smaller than 1MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const toggleService = (service: string) => {
    const current = form.offeredServices || [];
    const updated = current.includes(service) 
      ? current.filter(s => s !== service)
      : [...current, service];
    setForm({ ...form, offeredServices: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
        <p className="text-muted-foreground">Configure your business details and professional branding.</p>
      </div>

      <div className="grid gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <CardTitle>Business Information</CardTitle>
            </div>
            <CardDescription>Legal details for your professional documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bizName">Business Name</Label>
                <Input id="bizName" value={form.businessName} onChange={(e) => setForm({...form, businessName: e.target.value})} placeholder="e.g. Pro Painting LLC" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">Contractor License Number</Label>
                <Input id="license" value={form.licenseNumber} onChange={(e) => setForm({...form, licenseNumber: e.target.value})} placeholder="e.g. LIC-12345678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Business Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="e.g. 555-0100" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="e.g. 123 Main St" className="pl-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <CardTitle>Services Offered</CardTitle>
            </div>
            <CardDescription>Select the services you specialize in to prioritize your library.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {SERVICE_CATEGORIES.map((service) => (
                <div 
                  key={service} 
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
                    form.offeredServices?.includes(service) ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
                  )}
                  onClick={() => toggleService(service)}
                >
                  <Checkbox 
                    id={`service-${service}`} 
                    checked={form.offeredServices?.includes(service)}
                    onCheckedChange={() => toggleService(service)}
                  />
                  <label htmlFor={`service-${service}`} className="text-xs font-bold leading-none cursor-pointer">
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle>Branding</CardTitle>
            </div>
            <CardDescription>Customize how your business appears to clients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Company Logo</Label>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center overflow-hidden transition-colors hover:border-primary/50">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain p-2" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <Upload className="w-8 h-8" />
                        <span className="text-[10px] font-medium">No Logo</span>
                      </div>
                    )}
                  </div>
                  {form.logoUrl && (
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setForm({...form, logoUrl: ""})}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="logoUpload" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors text-sm font-medium cursor-pointer">
                      <Upload className="w-4 h-4" /> Upload Logo File
                    </Label>
                    <input id="logoUpload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <p className="text-[10px] text-muted-foreground">Supports JPG, PNG, or SVG. Max file size: 1MB.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Quote Customization</CardTitle>
            </div>
            <CardDescription>Set defaults to save time on every quote.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax">Default Tax Rate (%)</Label>
                <Input id="tax" type="number" value={form.defaultTaxRate} onChange={(e) => setForm({...form, defaultTaxRate: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labor">Default Labor Rate ($/hr)</Label>
                <Input id="labor" type="number" value={form.defaultLaborRate} onChange={(e) => setForm({...form, defaultLaborRate: Number(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Standard Terms & Conditions</Label>
              <Textarea id="terms" value={form.quoteTerms} onChange={(e) => setForm({...form, quoteTerms: e.target.value})} className="min-h-[120px]" placeholder="e.g. Valid for 30 days..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="gap-2 shadow-md">
            <Save className="w-5 h-5" /> Save Profile Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
