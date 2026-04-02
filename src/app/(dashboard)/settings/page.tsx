"use client";

import { useEffect, useState } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Building, Palette, FileText, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "contractorProfiles", user.uid);
  }, [db, user]);

  const { data: profile, isLoading } = useDoc(profileRef);

  const [form, setForm] = useState({
    businessName: "",
    licenseNumber: "",
    logoUrl: "",
    defaultTaxRate: 0,
    defaultLaborRate: 0,
    quoteTerms: ""
  });

  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName || "",
        licenseNumber: profile.licenseNumber || "",
        logoUrl: profile.logoUrl || "",
        defaultTaxRate: profile.defaultTaxRate || 0,
        defaultLaborRate: profile.defaultLaborRate || 0,
        quoteTerms: profile.quoteTerms || ""
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!profileRef || !user) return;

    const data = {
      ...form,
      id: user.uid,
      updatedAt: new Date().toISOString(),
      createdAt: profile?.createdAt || new Date().toISOString()
    };

    setDocumentNonBlocking(profileRef, data, { merge: true });
    toast({ title: "Profile Saved", description: "Your business settings have been updated." });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  value={form.businessName} 
                  onChange={(e) => setForm({...form, businessName: e.target.value})}
                  placeholder="e.g. Pro Painting LLC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">Contractor License Number</Label>
                <Input 
                  id="license" 
                  value={form.licenseNumber} 
                  onChange={(e) => setForm({...form, licenseNumber: e.target.value})}
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
                  value={form.logoUrl} 
                  onChange={(e) => setForm({...form, logoUrl: e.target.value})}
                  placeholder="https://example.com/logo.png"
                  className="flex-1"
                />
                {form.logoUrl && (
                  <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    <img src={form.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
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
                value={form.quoteTerms} 
                onChange={(e) => setForm({...form, quoteTerms: e.target.value})}
                placeholder="e.g. Valid for 30 days. Payment due upon completion..."
                className="min-h-[120px] text-sm"
              />
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
