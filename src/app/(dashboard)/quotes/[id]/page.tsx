"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Quote, Client, BusinessProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Share2, ChevronLeft, Building2, User, Phone, MapPin, Mail, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function QuoteSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
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
  const { data: profile, isLoading: profileLoading } = useDoc<BusinessProfile>(profileRef);

  const clientRef = useMemoFirebase(() => {
    if (!user || !quote?.clientId) return null;
    return doc(db, "contractorProfiles", user.uid, "clients", quote.clientId);
  }, [db, user, quote?.clientId]);

  const { data: client, isLoading: clientLoading } = useDoc<Client>(clientRef);

  const handleShare = async () => {
    if (!quote || !profile) return;

    const shareData = {
      title: `${profile.businessName} - Professional Quote`,
      text: `Check out the quote for ${quote.serviceCategory} services.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Quote link has been copied to your clipboard.",
        });
      }
    } catch (err) {}
  };

  if (quoteLoading || profileLoading || clientLoading) {
    return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin" /></div>;
  }

  if (!quote || !profile || !client) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">Quote not found or error loading details.</p>
        <Button onClick={() => router.push('/quotes')}>Back to Quotes</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-8 print:p-0 pb-24 sm:pb-8">
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

      <Card className="shadow-2xl border-none bg-white text-black print:shadow-none print:border-none overflow-hidden mx-1 sm:mx-0">
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
                <p className="text-xs opacity-70">License: {profile.licenseNumber}</p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] sm:text-xs tracking-widest border-b sm:border-none pb-1 sm:pb-0">
                <User className="w-3.5 h-3.5" /> Prepared For
              </div>
              <div className="space-y-0.5 sm:space-y-1 text-sm text-gray-600">
                <p className="font-bold text-black text-base">{client.name}</p>
                <p className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5" /> {client.address}</p>
                {client.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {client.phone}</p>}
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {client.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
            <h3 className="font-bold uppercase text-[10px] tracking-widest text-primary">Proposed Scope of Work</h3>
            <div className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-wrap italic sm:not-italic">
              {quote.scopeDescription || "No scope description provided."}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold uppercase text-[10px] tracking-widest text-primary">Service Items</h3>
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader className="bg-gray-50">
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
                        <TableCell className="text-right text-sm">${Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right font-medium text-sm">${Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                    {quote.laborHours > 0 && (
                      <TableRow>
                        <TableCell className="text-sm py-3">Labor Hours</TableCell>
                        <TableCell className="text-xs text-muted-foreground uppercase">hr</TableCell>
                        <TableCell className="text-right text-sm">{quote.laborHours}</TableCell>
                        <TableCell className="text-right text-sm">${Number(quote.laborRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right font-medium text-sm">${(Number(quote.laborHours) * Number(quote.laborRate)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    )}
                    {quote.materialCosts > 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-sm py-3">Materials & Equipment</TableCell>
                        <TableCell className="text-right text-sm">1</TableCell>
                        <TableCell className="text-right text-sm">${Number(quote.materialCosts).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right font-medium text-sm">${Number(quote.materialCosts).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end pt-4 sm:pt-8">
            <div className="w-full sm:w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${quote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({quote.taxRate}%)</span>
                <span className="font-medium">${quote.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-base sm:text-xl font-bold uppercase tracking-tighter">Total Amount</span>
                <span className="text-xl sm:text-3xl font-extrabold text-primary">${quote.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
    </div>
  );
}
