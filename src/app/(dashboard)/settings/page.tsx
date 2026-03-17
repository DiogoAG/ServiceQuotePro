
"use client";

import { useEffect, useState } from "react";
import { BusinessProfile } from "@/lib/types";
import { getBusinessProfile, saveBusinessProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Building } from "lucide-react";

// Helper to truncate string to 2 decimals as user types
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
    defaultTaxRate: 0,
    defaultLaborRate: 0
  });

  useEffect(() => {
    setProfile(getBusinessProfile());
  }, []);

  const handleSave = () => {
    const normalizedProfile = {
      ...profile,
      defaultTaxRate: roundToCent(profile.defaultTaxRate),
      defaultLaborRate: roundToCent(profile.defaultLaborRate)
    };
    saveBusinessProfile(normalizedProfile);
    setProfile(normalizedProfile);
    toast({ title: "Profile Saved", description: "Your business settings have been updated." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
        <p className="text-muted-foreground">Configure your business details and default pricing rules.</p>
      </div>

      <div className="grid gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <CardTitle>Business Information</CardTitle>
            </div>
            <CardDescription>This information will appear on all your generated quotes.</CardDescription>
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
