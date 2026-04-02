"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Quote, Client, BusinessProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Building2, User, Phone, MapPin, Mail, Loader2, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: "Service Business",
  licenseNumber: "Verified Professional",
  defaultTaxRate: 0,
  defaultLaborRate: 75,
  offeredServices: [],
  quoteTerms: "Payment is due within 15 days of completion."
};

export default function PublicQuoteView() {
  const params = useParams();
  const contractorId = params?.contractorId as string;
  const quoteId = params?.quoteId as string;
  const db = useFirestore();

  const quoteRef = useMemoFirebase(() => {
    if (!contractorId || !quoteId) return null;
    return doc(db, "contractorProfiles", contractorId, "quotes", quoteId);
  }, [db, contractorId, quoteId]);

  const profileRef = useMemoFirebase(() => {
    if (!contractorId) return null;
    return doc(db, "contractorProfiles", contractorId);
  }, [db, contractorId]);

  const { data: quote, isLoading: quoteLoading } = useDoc<Quote>(quoteRef);
  const { data: profileData, isLoading: profileLoading } = useDoc<BusinessProfile>(profileRef);

  const clientRef = useMemoFirebase(() => {
    if (!contractorId || !quote?.clientId) return null;
    return doc(db, "contractorProfiles", contractorId, "clients", quote.clientId);
  }, [db, contractorId, quote?.clientId]);

  const { data: client, isLoading: clientLoading } = useDoc<Client>(clientRef);

  const profile = profileData || DEFAULT_PROFILE;

  if (quoteLoading || profileLoading || clientLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-muted/10">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading Professional Quote...</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Quote Not Found</h1>
        <p className="text-muted-foreground max-w-sm mt-2">
          This quote may have been removed or the link is incorrect. Please contact your contractor for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20 print:bg-white print:pb-0">
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 print:p-0">
        <div className="flex justify-between items-center no-print">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
                <FileText className="w-6 h-6" />
             </div>
             <div className="hidden sm:block">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Service Quote</p>
                <p className="font-bold text-sm">ID: {quote.id.slice(0, 8).toUpperCase()}</p>
             </div>
          </div>
          <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            Print / PDF
          </Button>
        </div>

        <Card className="shadow-2xl border-none bg-white text-black print:shadow-none print:border print:border-gray-200 overflow-hidden">
          <CardContent className="p-6 sm:p-12 space-y-10 sm:space-y-16">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b pb-8 sm:pb-12">
              <div className="space-y-4">
                {profile.logoUrl ? (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden border">
                    <img src={profile.logoUrl} alt={profile.businessName} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-3xl shrink-0">
                    {profile.businessName.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider">{profile.businessName}</h1>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    License: <span className="font-medium">{profile.licenseNumber}</span>
                  </p>
                  <Badge variant="secondary" className="mt-2 text-[10px] uppercase tracking-tighter">
                    {quote.serviceCategory}
                  </Badge>
                </div>
              </div>
              <div className="text-left sm:text-right space-y-2">
                <h2 className="text-4xl sm:text-6xl font-black text-primary/10 tracking-tighter">QUOTE</h2>
                <div className="space-y-1 text-sm sm:text-base">
                  <p><span className="font-semibold mr-2">Date:</span> {new Date(quote.date).toLocaleDateString()}</p>
                  <p><span className="font-semibold mr-2">Ref #:</span> {quote.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="text-primary font-bold uppercase text-[10px] tracking-widest border-b pb-1">
                  Contractor Details
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-bold text-black text-base">{profile.businessName}</p>
                  {profile.address && <p className="flex items-start gap-1.5"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />{profile.address}</p>}
                  {profile.phone && <p className="flex items-center gap-1.5"><Phone className="w-4 h-4 shrink-0" />{profile.phone}</p>}
                  {profile.email && <p className="flex items-center gap-1.5"><Mail className="w-4 h-4 shrink-0" />{profile.email}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-primary font-bold uppercase text-[10px] tracking-widest border-b pb-1">
                  Client Information
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-bold text-black text-base">{client?.name || 'Valued Client'}</p>
                  {client?.address && <p className="flex items-start gap-1.5"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {client.address}</p>}
                  {client?.phone && <p className="flex items-center gap-1.5"><Phone className="w-4 h-4 shrink-0" /> {client.phone}</p>}
                  {client?.email && <p className="flex items-center gap-1.5"><Mail className="w-4 h-4 shrink-0" /> {client.email}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 print:bg-white">
              <h3 className="font-bold uppercase text-[10px] tracking-widest text-primary">Proposed Scope of Work</h3>
              <div className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-wrap">
                {quote.scopeDescription || "Professional service quote for " + quote.serviceCategory + "."}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase text-[10px] tracking-widest text-primary">Service Breakdown</h3>
              <div className="rounded-xl border overflow-hidden bg-white">
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader className="bg-gray-50/50 print:bg-white">
                      <TableRow>
                        <TableHead className="min-w-[200px] py-4">Description</TableHead>
                        <TableHead className="min-w-[60px]">Unit</TableHead>
                        <TableHead className="text-right min-w-[60px]">Qty</TableHead>
                        <TableHead className="text-right min-w-[100px]">Rate</TableHead>
                        <TableHead className="text-right min-w-[120px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quote.items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-transparent">
                          <TableCell className="text-sm py-4">
                            <div className="font-medium">{item.description}</div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground uppercase">{item.unit || '-'}</TableCell>
                          <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-right text-sm">${Number(item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-bold text-sm text-primary">${Number(item.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                      {(Number(quote.laborHours) || 0) > 0 && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="text-sm py-4">Professional Labor</TableCell>
                          <TableCell className="text-xs text-muted-foreground uppercase">hr</TableCell>
                          <TableCell className="text-right text-sm">{quote.laborHours}</TableCell>
                          <TableCell className="text-right text-sm">${Number(quote.laborRate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-bold text-sm text-primary">${(Number(quote.laborHours) * Number(quote.laborRate)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      )}
                      {(Number(quote.materialCosts) || 0) > 0 && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={2} className="text-sm py-4">Materials & Equipment</TableCell>
                          <TableCell className="text-right text-sm">1</TableCell>
                          <TableCell className="text-right text-sm">${Number(quote.materialCosts).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right font-bold text-sm text-primary">${Number(quote.materialCosts).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" className="no-print" />
                </ScrollArea>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <div className="w-full sm:w-96 space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">${quote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sales Tax ({quote.taxRate}%)</span>
                  <span className="font-medium text-black">${quote.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center border-t border-primary/20 pt-6">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-tighter text-muted-foreground block">Total Quote Amount</span>
                    <span className="text-3xl sm:text-4xl font-black text-primary tracking-tighter block">${quote.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-12 text-center space-y-6">
              <div className="space-y-2">
                 <p className="text-sm font-bold">Thank you for your business!</p>
                 <p className="text-xs text-muted-foreground">Please review the details above and reach out with any questions.</p>
              </div>
              {profile.quoteTerms && (
                <div className="max-w-xl mx-auto p-6 bg-muted/30 rounded-xl print:bg-white print:border">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Terms & Conditions</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed italic whitespace-pre-wrap">
                    {profile.quoteTerms}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}