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
import { Save, Building, Palette, FileText, Loader2, Upload, X } from "lucide-react";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64 storage
        toast({
          title: "File too large",
          description: "Please upload a logo smaller than 1MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setForm({ ...form, logoUrl: "" });
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
            <div className="space-y-4">
              <Label>Company Logo</Label>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 flex items-center justify-center overflow-hidden transition-colors hover:border-primary/50">
                    {form.logoUrl ? (
                      <img 
                        src={form.logoUrl} 
                        alt="Logo Preview" 
                        className="max-w-full max-h-full object-contain p-2" 
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <Upload className="w-8 h-8" />
                        <span className="text-[10px] font-medium">No Logo</span>
                      </div>
                    )}
                  </div>
                  {form.logoUrl && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="logoUpload" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors text-sm font-medium cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Logo File
                    </Label>
                    <input 
                      id="logoUpload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <p className="text-[10px] text-muted-foreground">Supports JPG, PNG, or SVG. Max file size: 1MB.</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-tighter">
                      <span className="bg-background px-2 text-muted-foreground/60">OR</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-xs text-muted-foreground">Logo URL</Label>
                    <Input 
                      id="logoUrl" 
                      value={form.logoUrl.startsWith('data:') ? "" : form.logoUrl} 
                      onChange={(e) => setForm({...form, logoUrl: e.target.value})}
                      placeholder="https://example.com/logo.png"
                      className="text-xs h-9"
                    />
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
