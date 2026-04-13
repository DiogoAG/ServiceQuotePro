"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Quote, Client, BusinessProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Printer, Share2, ChevronLeft, Building2, User, Phone, MapPin, Mail, Loader2, StickyNote, Lock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { formatCurrency } from "@/lib/finance";

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: "My Service Business",
  licenseNumber: "Pending Configuration",
  defaultTaxRate: 0,
  defaultLaborRate: 75,
  offeredServices: ["General Contracting"],
  quoteTerms: "Payment is due within 15 days of completion. All materials guaranteed to be as specified."
};

export default function QuoteSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const quoteRef = useMemoFirebase(() => {
    if (!user || !id) return null;
    return doc(db, "contractorProfiles", user.uid, "quotes", id);
  }, [db, user, id]);

  const profileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, "contractorProfiles", user.uid);
  }, [db, user]);

  const { data: quote, isLoading: quoteLoading } = useDoc<Quote>(quoteRef);
  const { data: profileData, isLoading: profileLoading } = useDoc<BusinessProfile>(profileRef);

  const clientRef = useMemoFirebase(() => {
    if (!user || !quote?.clientId) return null;
    return doc(db, "contractorProfiles", user.uid, "clients", quote.clientId);
  }, [db, user, quote?.clientId]);

  const { data: client, isLoading: clientLoading } = useDoc<Client>(clientRef);

  const profile = profileData || DEFAULT_PROFILE;

  const handleShare = async () => {
    if (!quote || !profile || !user) return;

    const publicUrl = `${window.location.origin}/view/${user.uid}/${quote.id}`;

    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Link Copied",
        description: "A client-viewable link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Share Failed",
        description: "Could not copy the link. Please copy the URL manually.",
        variant: "destructive"
      });
    }
  };

  if (quoteLoading || profileLoading || clientLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Generating professional view...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">Quote not found or error loading details.</p>
        <Button onClick={() => router.push('/quotes')}>Back to Quotes</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-8 print:p-0 print:m-0 pb-24 sm:pb-12 print:pb-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print px-1">
        <Button variant="ghost" className="gap-2 self-start sm:self-center h-9" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none h-11 sm:h-9" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            <span className="hidden xs:inline">Print / PDF</span>
            <span className="xs:hidden">PDF</span>
          </Button>
          <Button 
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 flex-1 sm:flex-none h-11 sm:h-9"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      <Card className="shadow-2xl border-none bg-white text-black print:shadow-none print:border print:border-gray-200 print:rounded-none overflow-hidden mx-1 sm:mx-0">
        <CardContent className="p-4 sm:p-12 space-y-8 sm:space-y-12">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-8 border-b pb-6 sm:pb-8">
            <div className="space-y-4 w-full sm:w-auto">
              <div className="flex items-center gap-4">
                {profile.logoUrl ? (
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border">
                    <img src={profile.logoUrl} alt={profile.businessName} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shrink-0">
                    {profile.businessName.charAt(0)}
                  </div>
                )}
                <div className="sm:hidden min-w-0">
                  <h1 className="text-xl font-bold uppercase tracking-tight truncate">{profile.businessName}</h1>
                  <Badge variant="secondary" className="mt-1 text-[9px] h-4">
                    {quote.serviceCategory}
                  </Badge>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider">{profile.businessName}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                   License: <span className="font-medium">{profile.licenseNumber}</span>
                </p>
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  {quote.serviceCategory}
                </Badge>
              </div>
            </div>
            <div className="text-left sm:text-right space-y-2 w-full sm:w-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-primary/10 tracking-tighter">QUOTE</h2>
              <div className="space-y-1 text-xs sm:text-base">
                <p className="flex justify-between sm:block"><span className="font-semibold sm:mr-2">Date:</span> {new Date(quote.date).toLocaleDateString()}</p>
                <p className="flex justify-between sm:block"><span className="font-semibold sm:mr-2">Quote #:</span> {quote.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] sm:text-xs tracking-widest border-b sm:border-none pb-1 sm:pb-0">
                <Building2 className="w-3.5 h-3.5" /> Contractor Details
              </div>
              <div className="space-y-0.5 sm:space-y-1 text-sm text-gray-600">
                <p className="font-bold text-black text-base">{profile.businessName}</p>
                {profile.address && <p className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5" />{profile.address}</p>}
                {profile.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{profile.phone}</p>}
                {profile.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{profile.email}</p>}
                <p className="text-xs opacity-70">License: {profile.licenseNumber}</p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] sm:text-xs tracking-widest border-b sm:border-none pb-1 sm:pb-0">
                <User className="w-3.5 h-3.5" /> Prepared For
              </div>
              <div className="space-y-0.5 sm:space-y-1 text-sm text-gray-600">
                <p className="font-bold text-black text-base">{client?.name || 'Valued Client'}</p>
                {client?.address && <p className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5" /> {client.address}</p>}
                {client?.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {client.phone}</p>}
                {client?.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {client.email}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100 print:bg-white print:rounded-none">
            <h3 className="font-bold uppercase text-[10px] tracking-widest text-primary">Proposed Scope of Work</h3>
            <div className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-wrap italic sm:not-italic">
              {quote.scopeDescription || "No scope description provided."}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold uppercase text-[10px] tracking-widest text-primary">Service Items</h3>
            <div className="rounded-md border overflow-hidden print:rounded-none">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader className="bg-gray-50 print:bg-white">
                    <TableRow>
                      <TableHead className="min-w-[180px] sm:w-full">Description</TableHead>
                      <TableHead className="min-w-[60px]">Unit</TableHead>
                      <TableHead className="text-right min-w-[60px]">Qty</TableHead>
                      <TableHead className="text-right min-w-[100px]">Price</TableHead>
                      <TableHead className="text-right min-w-[100px]">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm py-3">
                          <div className="font-medium">{item.description}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground uppercase">{item.unit || '-'}</TableCell>
                        <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-medium text-sm">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    {(Number(quote.laborHours) || 0) > 0 && (
                      <TableRow>
                        <TableCell className="text-sm py-3">Labor Hours</TableCell>
                        <TableCell className="text-xs text-muted-foreground uppercase">hr</TableCell>
                        <TableCell className="text-right text-sm">{quote.laborHours}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(quote.laborRate)}</TableCell>
                        <TableCell className="text-right font-medium text-sm">{formatCurrency(Number(quote.laborHours) * Number(quote.laborRate))}</TableCell>
                      </TableRow>
                    )}
                    {(Number(quote.materialCosts) || 0) > 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-sm py-3">Materials & Equipment</TableCell>
                        <TableCell className="text-right text-sm">1</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(quote.materialCosts)}</TableCell>
                        <TableCell className="text-right font-medium text-sm">{formatCurrency(quote.materialCosts)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" className="no-print" />
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end pt-4 sm:pt-8">
            <div className="w-full sm:w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({quote.taxRate}%)</span>
                <span className="font-medium">{formatCurrency(quote.taxTotal)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-base sm:text-xl font-bold uppercase tracking-tighter">Total Amount</span>
                <span className="text-xl sm:text-3xl font-extrabold text-primary">{formatCurrency(quote.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 sm:pt-12 text-center">
            <p className="text-sm font-medium">Thank you for considering {profile.businessName}!</p>
            {profile.quoteTerms && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-4 italic max-w-lg mx-auto whitespace-pre-wrap">
                {profile.quoteTerms}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Internal Notes - Hidden from Print */}
      {quote.notes && (
        <Card className="no-print border-primary/20 bg-primary/5 mx-1 sm:mx-0 shadow-sm mt-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Internal Contractor Notes</CardTitle>
            </div>
            <Badge variant="outline" className="gap-1 bg-white text-[10px] font-bold text-primary border-primary/20">
              <Lock className="w-3 h-3" /> Contractor Only
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap italic">
              {quote.notes}
            </p>
            <p className="text-[10px] text-muted-foreground/50 mt-4 uppercase tracking-widest font-bold">
              These notes are private and will not appear on the shared quote or PDF.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
