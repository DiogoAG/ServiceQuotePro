
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Quote, Client, BusinessProfile } from "@/lib/types";
import { getQuotes, getClients, getBusinessProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Mail, ChevronLeft, Building2, User } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function QuoteSummaryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    const quotes = getQuotes();
    const foundQuote = quotes.find(q => q.id === id);
    if (!foundQuote) {
      router.push('/quotes');
      return;
    }
    setQuote(foundQuote);
    setProfile(getBusinessProfile());
    
    const clients = getClients();
    setClient(clients.find(c => c.id === foundQuote.clientId) || null);
  }, [id, router]);

  if (!quote || !profile || !client) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 print:p-0 pb-20 sm:pb-8">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <Button variant="ghost" className="gap-2 self-start sm:self-center" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            <span className="hidden xs:inline">Print / PDF</span>
            <span className="xs:hidden">PDF</span>
          </Button>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 flex-1 sm:flex-none">
            <Mail className="w-4 h-4" />
            Send to Client
          </Button>
        </div>
      </div>

      <Card className="shadow-2xl border-none bg-white text-black print:shadow-none print:border-none overflow-hidden">
        <CardContent className="p-6 sm:p-12 space-y-8 sm:space-y-12">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b pb-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-3xl">
                {profile.businessName.charAt(0)}
              </div>
              <div>
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
              <h2 className="text-4xl sm:text-5xl font-extrabold text-primary/10">QUOTE</h2>
              <div className="space-y-1 text-sm sm:text-base">
                <p><span className="font-semibold">Date:</span> {new Date(quote.date).toLocaleDateString()}</p>
                <p><span className="font-semibold">Quote #:</span> {quote.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] sm:text-xs tracking-widest">
                <Building2 className="w-4 h-4" /> Contractor Details
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-bold text-black text-base">{profile.businessName}</p>
                <p>License: {profile.licenseNumber}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-[10px] sm:text-xs tracking-widest">
                <User className="w-4 h-4" /> Prepared For
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-bold text-black text-base">{client.name}</p>
                <p>{client.address}</p>
                {client.phone && <p>{client.phone}</p>}
                <p>{client.email}</p>
              </div>
            </div>
          </div>

          {/* Work Scope Section */}
          <div className="space-y-4 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
            <h3 className="font-bold uppercase text-[10px] tracking-widest text-primary">Proposed Scope of Work</h3>
            <div className="text-sm sm:text-base leading-relaxed text-gray-700 whitespace-pre-wrap italic sm:not-italic">
              {quote.scopeDescription || "No scope description provided."}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-4">
            <h3 className="font-bold uppercase text-[10px] tracking-widest text-primary">Service Items</h3>
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="w-full overflow-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="min-w-[200px] sm:w-full">Description</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quote.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">{item.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground uppercase">{item.unit || '-'}</TableCell>
                        <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                        <TableCell className="text-right text-sm">${item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-sm">${item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {quote.laborHours > 0 && (
                      <TableRow>
                        <TableCell className="text-sm">Labor Hours</TableCell>
                        <TableCell className="text-xs text-muted-foreground uppercase">hr</TableCell>
                        <TableCell className="text-right text-sm">{quote.laborHours}</TableCell>
                        <TableCell className="text-right text-sm">${quote.laborRate}</TableCell>
                        <TableCell className="text-right font-medium text-sm">${(quote.laborHours * quote.laborRate).toLocaleString()}</TableCell>
                      </TableRow>
                    )}
                    {quote.materialCosts > 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-sm">Materials & Equipment</TableCell>
                        <TableCell className="text-right text-sm">1</TableCell>
                        <TableCell className="text-right text-sm">${quote.materialCosts.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-sm">${quote.materialCosts.toLocaleString()}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-4 sm:pt-8">
            <div className="w-full sm:w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${quote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({quote.taxRate}%)</span>
                <span>${quote.taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-lg sm:text-xl font-bold uppercase tracking-tighter">Total Amount</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary">${quote.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t pt-8 sm:pt-12 text-center">
            <p className="text-sm font-medium">Thank you for considering {profile.businessName}!</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-4 italic">
              Valid for 30 days. Payment is due upon completion.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
