"use client";

import { useEffect, useState } from "react";
import { Quote, Client } from "@/lib/types";
import { getQuotes, getClients } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, DollarSign, Clock, ArrowUpRight, History } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setQuotes(getQuotes());
    setClients(getClients());
  }, []);

  const recentQuotes = [...quotes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  
  const totalValue = quotes.reduce((acc, q) => acc + q.grandTotal, 0);
  const pendingQuotes = quotes.filter(q => q.status === 'draft' || q.status === 'sent').length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your quoting business.</p>
        </div>
        <Link href="/quotes/new" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Create Quote
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total projected</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{pendingQuotes}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Require follow-up</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{clients.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Active directory</p>
          </CardContent>
        </Card>
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{quotes.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total created</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-primary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <CardTitle>Recent Quotes</CardTitle>
            </div>
            <CardDescription>Quick access to your latest projects.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="rounded-md border-none sm:border">
              <Table>
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQuotes.length > 0 ? (
                    recentQuotes.map((quote) => {
                      const client = clients.find(c => c.id === quote.clientId);
                      return (
                        <TableRow key={quote.id} className="cursor-pointer group hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium p-3 sm:p-4">
                            <Link href={`/quotes/${quote.id}`} className="block">
                              <p className="text-sm font-bold sm:font-medium group-hover:text-primary transition-colors">{client?.name || 'Unknown Client'}</p>
                              <p className="text-[10px] text-muted-foreground sm:hidden">{quote.serviceCategory}</p>
                            </Link>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Link href={`/quotes/${quote.id}`}>
                              <Badge 
                                variant={quote.status === 'approved' ? 'default' : quote.status === 'rejected' ? 'destructive' : 'secondary'}
                                className="text-[10px]"
                              >
                                {quote.status}
                              </Badge>
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-bold sm:font-medium p-3 sm:p-4">
                            <Link href={`/quotes/${quote.id}`}>
                              ${quote.grandTotal.toLocaleString()}
                              <div className="sm:hidden mt-1">
                                <Badge variant="secondary" className="text-[8px] h-4 px-1">{quote.status}</Badge>
                              </div>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        No quotes found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {recentQuotes.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Link href="/quotes" className="w-full sm:w-auto">
                  <Button variant="ghost" className="gap-2 text-primary w-full sm:w-auto text-sm">
                    View all quotes <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-primary/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle>Recent Clients</CardTitle>
            </div>
            <CardDescription>Quick view of your client directory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              {clients.slice(0, 5).map((client) => (
                <Link 
                  key={client.id} 
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-4 border-b pb-3 pt-3 first:pt-0 last:border-0 last:pb-0 group hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors truncate">{client.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{client.email}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-primary opacity-30 group-hover:opacity-100 transition-all shrink-0" />
                </Link>
              ))}
              {clients.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No clients added yet.</p>
              )}
            </div>
            <Link href="/clients" className="block w-full pt-2">
              <Button variant="outline" className="w-full text-sm">Manage Directory</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}