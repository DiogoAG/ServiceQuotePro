"use client";

import { useEffect, useState } from "react";
import { BusinessProfile, SERVICE_CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Building, Palette, FileText, Upload, X, Phone, MapPin, CheckCircle2, Loader2, ShieldCheck, Mail, Fingerprint } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "contractorProfiles", user.uid);
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<BusinessProfile>(profileRef);

  const [form, setForm] = useState<BusinessProfile>({
    businessName: "",
    licenseNumber: "",
    email: "",
    address: "",
    phone: "",
    logoUrl: "",
    defaultTaxRate: 0,
    defaultLaborRate: 0,
    offeredServices: [],
    quoteTerms: ""
  });

  useEffect(() => {
    if (profile) {
      setForm({
        ...profile,
        offeredServices: profile.offeredServices || [],
        quoteTerms: profile.quoteTerms || ""
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!user) return;
    const docRef = doc(db, "contractorProfiles", user.uid);
    setDocumentNonBlocking(docRef, {
      ...form,
      id: user.uid,
      updatedAt: serverTimestamp(),
      ...(profile ? {} : { createdAt: serverTimestamp() })
    }, { merge: true });
    
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

  const getProviderLabel = () => {
    if (!user) return "N/A";
    const providerId = user.providerData[0]?.providerId;
    if (providerId === 'google.com') return 'Google Account';
    if (providerId === 'password') return 'Email & Password';
    if (user.isAnonymous) return 'Guest Session';
    return 'Standard Account';
  };

  if (isProfileLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your business details and professional branding.</p>
      </div>

      <div className="grid gap-8">
        {/* Account & Security Section */}
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Account & Security</CardTitle>
            </div>
            <CardDescription>Manage your authentication and login status.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Login Email</Label>
              <div className="flex items-center gap-2 px-3 h-10 bg-muted/50 rounded-md border text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {user?.email || "No email associated (Guest)"}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Sign-In Method</Label>
              <div className="flex items-center justify-between px-3 h-10 bg-muted/50 rounded-md border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Fingerprint className="w-4 h-4" />
                  {getProviderLabel()}
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase font-bold h-5">Verified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <CardTitle>Business Information</CardTitle>
            </div>
            <CardDescription>Legal details for your professional documents.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={form.businessName} onChange={(e) => setForm({...form, businessName: e.target.value})} placeholder="e.g. Pro Contractor Services" />
            </div>
            <div className="space-y-2">
              <Label>Business Email (Displayed on Quotes)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="business@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Contractor License</Label>
              <Input value={form.licenseNumber} onChange={(e) => setForm({...form, licenseNumber: e.target.value})} placeholder="e.g. LIC-12345" />
            </div>
            <div className="space-y-2">
              <Label>Business Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="e.g. 555-0100" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Business Address</Label>
              <Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="e.g. 123 Main St, Anytown, ST 12345" />
            </div>
          </CardContent>
        </Card>

        {/* Services Offered */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <CardTitle>Services Offered</CardTitle>
            </div>
            <CardDescription>Select the services you specialize in.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {SERVICE_CATEGORIES.map((service) => (
                <div 
                  key={service} 
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer",
                    form.offeredServices?.includes(service) ? "border-primary bg-primary/5" : "bg-card"
                  )}
                  onClick={() => toggleService(service)}
                >
                  <Checkbox 
                    checked={form.offeredServices?.includes(service)}
                    onCheckedChange={() => toggleService(service)}
                  />
                  <span className="text-xs font-bold leading-none">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle>Branding</CardTitle>
            </div>
            <CardDescription>Visual identity for your professional quotes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Company Logo</Label>
            <div className="flex items-start gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain p-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                {form.logoUrl && (
                  <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setForm({...form, logoUrl: ""})}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUpload" className="cursor-pointer bg-secondary px-4 py-2 rounded-md inline-flex items-center gap-2 text-sm font-medium">
                  <Upload className="w-4 h-4" /> Upload File
                </Label>
                <input id="logoUpload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">Max size: 1MB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Standard Quote Terms */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Standard Quote Terms</CardTitle>
            </div>
            <CardDescription>Default terms and conditions that appear at the bottom of every quote.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={form.quoteTerms} 
              onChange={(e) => setForm({...form, quoteTerms: e.target.value})} 
              placeholder="e.g. Payment is due within 15 days of completion. All materials guaranteed to be as specified." 
              className="min-h-[150px] leading-relaxed"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Save className="w-5 h-5" /> Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
