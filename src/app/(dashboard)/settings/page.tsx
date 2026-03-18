
"use client";

import { useEffect, useState } from "react";
import { BusinessProfile, SERVICE_CATEGORIES } from "@/lib/types";
import { getBusinessProfile, saveBusinessProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Building, Briefcase, Palette, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Helper to strictly truncate digits beyond 2 decimals as user types
const truncateToTwoDecimals = (value: string) => {
  if (!value) return "";
  const parts = value.split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    return `${parts[0]}.${parts[1].slice(0, 2)}`;
  }
  return value;
};

// Helper for rounding for final calculations
const roundToCent = (val: number | string) => Math.round(Number(val) * 100) / 100;

export default function SettingsPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: "",
    licenseNumber: "",
    logoUrl: "",
    defaultTaxRate: 0,
    defaultLaborRate: 0,
    offeredServices: [],
    quoteTerms: ""
  });

  useEffect(() => {
    setProfile(getBusinessProfile());
  }, []);

  const handleSave = () => {
    const normalizedProfile = {
      ...profile,
      defaultTaxRate: roundToCent(profile.defaultTaxRate),
      defaultLaborRate: roundToCent(profile.defaultLaborRate),
      offeredServices: profile.offeredServices || []
    };
    saveBusinessProfile(normalizedProfile);
    setProfile(normalizedProfile);
    toast({ title: "Profile Saved", description: "Your business settings have been updated." });
  };

  const toggleService = (service: string) => {
    setProfile(prev => {
      const current = prev.offeredServices || [];
      const updated = current.includes(service)
        ? current.filter(s => s !== service)
        : [...current, service];
      return { ...prev, offeredServices: updated };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
        <p className="text-muted-foreground">Configure your business details and professional branding.</p>
      </div>

      <div className="grid gap-8 pb-20">
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
                <Input 
                  id="bizName" 
                  value={profile.businessName} 
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                  placeholder="e.g. Pro Painting LLC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">Contractor License Number</Label>
                <Input 
                  id="license" 
                  value={profile.licenseNumber} 
                  onChange={(e) => setProfile({...profile, licenseNumber: e.target.value})}
                  placeholder="e.g. LIC-12345678"
                />
              </div>
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
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Company Logo URL</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Input 
                  id="logoUrl" 
                  value={profile.logoUrl} 
                  onChange={(e) => setProfile({...profile, logoUrl: e.target.value})}
                  placeholder="https://example.com/logo.png"
                  className="flex-1"
                />
                {profile.logoUrl && (
                  <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    <img src={profile.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">Enter a direct image link (PNG or JPG recommended).</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Standard Quote Terms</CardTitle>
            </div>
            <CardDescription>Default terms that appear at the bottom of every quote.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="quoteTerms">Terms & Conditions</Label>
              <Textarea 
                id="quoteTerms" 
                value={profile.quoteTerms} 
                onChange={(e) => setProfile({...profile, quoteTerms: e.target.value})}
                placeholder="e.g. Valid for 30 days. Payment due upon completion..."
                className="min-h-[120px] text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <CardTitle>Services Offered</CardTitle>
            </div>
            <CardDescription>Select the categories of services your business provides.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICE_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => toggleService(category)}>
                  <Checkbox 
                    id={`service-${category}`} 
                    checked={(profile.offeredServices || []).includes(category)}
                    onCheckedChange={() => toggleService(category)}
                  />
                  <label 
                    htmlFor={`service-${category}`}
                    className="text-sm font-medium leading-none cursor-pointer select-none"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Default Rates & Taxes</CardTitle>
            <CardDescription>Set global defaults to speed up quote creation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                <Input 
                  id="taxRate" 
                  type="number"
                  step="1.0"
                  value={profile.defaultTaxRate} 
                  onChange={(e) => setProfile({...profile, defaultTaxRate: truncateToTwoDecimals(e.target.value) as any})}
                  className="px-3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborRate">Default Labor Rate ($/hour)</Label>
                <Input 
                  id="laborRate" 
                  type="number"
                  step="1.0"
                  value={profile.defaultLaborRate} 
                  onChange={(e) => setProfile({...profile, defaultLaborRate: truncateToTwoDecimals(e.target.value) as any})}
                  className="px-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="gap-2 shadow-md">
            <Save className="w-5 h-5" />
            Save Profile Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
