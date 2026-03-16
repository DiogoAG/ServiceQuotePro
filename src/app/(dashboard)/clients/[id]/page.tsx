
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Client, Quote } from "@/lib/types";
import { getClients, getQuotes } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Plus, FileText, Phone, Mail, MapPin, ExternalLink, History } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ClientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [clientQuotes, setClientQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    const allClients = getClients();
    const found = allClients.find(c => c.id === id);
    if (!found) {
      router.push('/clients');
      return;
    }
    setClient(found);

    const allQuotes = getQuotes();
    setClientQuotes(allQuotes.filter(q => q.clientId === id));
  }, [id, router]);

  if (!client) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/clients">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Clients
          </Button>
        </Link>
        <Link href={`/quotes/new?clientId=${client.id}`}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Quote for {client.name.split(' ')[0]}
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Client Sidebar */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary font-bold text-2xl">
              {client.name.charAt(0)}
            </div>
            <CardTitle className="text-xl">{client.name}</CardTitle>
            <CardDescription>Client since 2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="break-all">{client.email}</div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>{client.phone}</div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>{client.address}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <CardTitle>Quote History</CardTitle>
              </div>
              <Badge variant="outline">{clientQuotes.length} Total</Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientQuotes.length > 0 ? (
                    clientQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="text-xs">
                          {new Date(quote.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {quote.serviceCategory}
                        </TableCell>
                        <TableCell>
                          <Badge variant={quote.status === 'approved' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {quote.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${quote.grandTotal.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Link href={`/quotes/${quote.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 opacity-20" />
                          <p className="text-sm">No quotes found for this client.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
